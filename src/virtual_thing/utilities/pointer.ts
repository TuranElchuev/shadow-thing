import * as jsonPointer from 'json-pointer';

import {
    Entity,
    ComponentOwner,
    DataHolder,
    Data,
    Input,
    Output,
    ReadableData,
    WritableData,
    ReadOp,
    WriteOp,
    DateTime,
    ParamStringResolver,
    IVtdPointer,
    Try,
    u,
    UriVariable,
    ConstData
} from "../common/index";


export class Pointer extends Entity {

    //#region Properties and constructors
    private expectedTypes: any[] = undefined;
    
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetEntity: Entity = undefined;
    private targetRelativePath: string = "";

    private resolvedOnce: boolean = false;
    private strResolver: ParamStringResolver = undefined;

    private readonly processTocken = ".";
    private readonly processParentTocken = "..";
    
    
    public constructor(name: string, parent: Entity, jsonObj: IVtdPointer, expectedTypes: any[], validate: boolean = true){
        super(name, parent);
        
        this.expectedTypes = expectedTypes;
        this.unresolvedPath = ParamStringResolver.join(jsonObj).replace(/\s/g, "");

        let strResolver = new ParamStringResolver(undefined, this);
        if(strResolver.hasParams(this.unresolvedPath)){
            this.strResolver = strResolver;
        }

        if(validate){
            this.getModel().registerPointer(this);
        }
    }
    //#endregion

    //#region Resolution

    public init(){
        try{
            this.resolve(true);
        }catch(err){
            this.fatal(err.message);
        }        
    }

    private resolve(compileTime: boolean = false) {
        if(!this.strResolver && this.resolvedOnce){
            return;
        }
        try{
            this.resolvePath();
            this.retrieveComponent();
            this.resolvedOnce = true;
            this.validate(compileTime);
        }catch(err){
            u.fatal(err.message);
        }        
    }
    
    private resolvePath(){
        if(this.strResolver){
            this.resolvedPath = this.strResolver.resolveParams(this.unresolvedPath);
        }else{
            this.resolvedPath = this.unresolvedPath;
        }
        if(!this.resolvedPath.startsWith("/")){
            this.resolvedPath = "/" + this.resolvedPath;
        }
    }

    private retrieveComponent(){
        
        if(DateTime.isDTExpr(this.resolvedPath)){    
            if(!DateTime.isValidDTExpr(this.resolvedPath)){
                u.fatal("Invalid DateTime format: " + this.resolvedPath);
            }        
            this.targetEntity = new DateTime(this);
            this.targetRelativePath = this.resolvedPath;
            return;
        }

        if(Try.isErrorMessageExpr(this.resolvedPath)){
            this.targetEntity = this.getParentTry();
            if(!this.targetEntity){
                u.fatal("No parent \"Try\" instruction found");
            }
            return;
        }
      
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(!tokens || tokens.length == 0){
            u.fatal("Invalid pointer.");
        }

        let bias = -1;
        if(tokens[0] == this.processTocken){
            this.targetEntity = this.getProcess();
        }else if(tokens[0] == this.processParentTocken){
            this.targetEntity = this.getProcess().getParent();
        }else{
            this.targetEntity = this.getModel().getChildComponent(tokens[0], tokens[1]);
            bias++;
        }
        
        while(bias < tokens.length){
            if(this.targetEntity instanceof ComponentOwner){                                
                bias += 2;
                if(bias < tokens.length){
                    this.targetEntity = this.targetEntity.getChildComponent(tokens[bias], tokens[bias+1])                
                }                
            }else if(this.targetEntity instanceof Input || this.targetEntity instanceof Output){
                bias++;
                break;
            }else if(this.targetEntity instanceof DataHolder){
                bias += 2;
                break;
            }
        }
        this.resolveRelativePath(tokens, bias);
    }

    private resolveRelativePath(tokens: string[], startIndex: number) {
        if(!tokens
            || tokens.length == 0
            || startIndex < 0
            || tokens.length < startIndex - 1){
                
            this.targetRelativePath = "";
        }else{
            this.targetRelativePath = jsonPointer.compile(tokens.slice(startIndex, tokens.length));
        }        
    }

    private getTargetEntity(resolve: boolean): any {
        if(resolve){
            this.resolve();
        }        
        return this.targetEntity;
    }
    
    private getTargetsRelativePath(resolve: boolean): string {
        if(resolve){
            this.resolve();
        }
        return this.targetRelativePath;
    }
    //#endregion

    //#region Access
    public readValue(operation: ReadOp = ReadOp.get): any {
        try{
            this.resolve();

            if(this.targetEntity instanceof DateTime){
                return this.targetEntity.get(this.targetRelativePath);
            }else if(this.targetEntity instanceof Try){
                return this.targetEntity.getErrorMessage();
            }else if(this.targetEntity instanceof ReadableData){
                return this.targetEntity.read(operation, this.targetRelativePath);
            }else{
                return this.getTargetEntity(false);
            }
        }catch(err){
            this.fatal("Couldn't read value:\n" + err.message);
        }
    }

    public fakeValue(){
        try{
            this.resolve();

            if(this.targetEntity instanceof WritableData){
                this.targetEntity.fake();
            }else{
                u.fatal('Target component is not a "writable data".');
            }
        }catch(err){
            this.fatal("Couldn't write value:\n" + err.message);
        }
    }

    public writeValue(value: any, operation: WriteOp = WriteOp.set){
        try{
            this.resolve();

            if(this.targetEntity instanceof WritableData){
                this.targetEntity.write(operation, value, this.targetRelativePath);   
            }else{
                u.fatal('Target component is not a "writable data".');
            }
        }catch(err){
            this.fatal("Couldn't write value:\n" + err.message);
        }        
    }
    //#endregion

    //#region Validation and messages

    private validate(compileTime: boolean = true){
        
        if(!this.expectedTypes || this.expectedTypes.length == 0){
            return;
        }

        if(compileTime && this.strResolver){
            this.warning("Can't validate in compile time a pointer that contains dynamic arguments");
            return;
        }
        
        try{
            let validated = true;
            let reason = undefined;

            for(const type of this.expectedTypes){
                switch(type){
                    case ReadableData:
                    case WritableData:
                    case Data:
                    case Input:
                    case Output:
                    case UriVariable:
                    case ConstData:
                        if(!u.testType(this.getTargetEntity(false), type)){
                            validated = false;
                            reason = "wrong data type";
                        }else if(!(this.getTargetEntity(false) as DataHolder).hasEntry(this.getTargetsRelativePath(false))){
                            validated = false;
                            reason = "no such entry: \"" + this.getTargetsRelativePath(false) + "\"";
                        }
                        break;
                    case Number:
                    case Boolean:
                    case String:
                    case Array:
                        if(!u.testType(this.getTargetEntity(false), DataHolder)){
                            validated = false;
                            reason = "wrong data type"
                        }else if(!(this.getTargetEntity(false) as DataHolder).hasEntry(this.getTargetsRelativePath(false), type)){
                            validated = false;
                            reason = "no entry \"" + this.getTargetsRelativePath(false) + "\" with type \"" + u.getTypeName(type) + "\"";
                        }
                        break;
                    default:
                        if(!u.testType(this.getTargetEntity(false), type)){
                            validated = false;
                            reason = "wrong data type";
                        }
                }

                if(!validated){
                    break;
                }
            }

            if(!validated){
                u.fatal("Validation failed: " + reason);
            }  
        }catch(err){
            u.fatal(err.message);
        }
    }
   
    private getInfo(): string {
        let info = "original path: " + this.unresolvedPath
                    + "\nresolved path: " + this.resolvedPath
                    + "\nexpected types: ";
        if(!this.expectedTypes || this.expectedTypes.length == 0){
            info += "unknown";
        }else{
            for(const type of this.expectedTypes){
                info += u.getTypeName(type) + " ";
            }
        }
        if(this.resolvedOnce){
            info = info
                + "\nactual component type: " + u.getTypeNameFromValue(this.targetEntity);
                + "\nrelative path: " + this.targetRelativePath;
        }else{
            info += "\nresolved: false";
        }
        return info;
    }

    private fatal(message: string = "Invalid pointer."){
        let mes = message + "\n" + this.getInfo();
        u.fatal(mes, this.getFullPath());
    }
    
    private warning(message: string){
        let mes = message + "\n" + this.getInfo();
        u.warn(mes, this.getFullPath());
    }
        
    //#endregion
}
