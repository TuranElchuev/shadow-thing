import * as jsonPointer from 'json-pointer';

import {
    Entity,
    ComponentOwner,
    DataHolder,
    Input,
    Output,
    ReadableData,
    WritableData,
    ReadOp,
    WriteOp,
    DateTime,
    InteractionAffordance,
    Action,
    Process,
    Property,
    ParamStringResolver,
    IVtdPointer,
    Try,
    u
} from "../index";


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
            this.getModel().registerPointerForValidation(this);
        }
    }
    //#endregion

    //#region Resolution

    private update() {
        if(!this.strResolver && this.resolvedOnce){
            return;
        }
        this.resolvePath();
        this.retrieveComponent();
        this.resolvedOnce = true;
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
                this.fatal("Invalid DateTime format: " + this.resolvedPath);
            }        
            this.targetEntity = new DateTime(this);
            this.targetRelativePath = this.resolvedPath;
            return;
        }

        if(Try.isErrorMessageExpr(this.resolvedPath)){
            this.targetEntity = this.getParentTry();
            if(!this.targetEntity){
                u.fatal("No parent \"Try\" instruction found", this.getFullPath());
            }
            return;
        }
      
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(!tokens || tokens.length == 0){
            this.fatal();
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
    
    private getComponent(update: boolean = true): any {
        this.update();
        return this.targetEntity;
    }

    private getTargetsRelativePath(): string {
        this.update();
        return this.targetRelativePath;
    }
    //#endregion

    //#region Access
    public readValue(operation: ReadOp = ReadOp.get): any {
        try{
            this.update();

            if(this.targetEntity instanceof DateTime){
                return this.targetEntity.get(this.targetRelativePath);
            }else if(this.targetEntity instanceof Try){
                return this.targetEntity.getErrorMessage();
            }else if(this.targetEntity instanceof ReadableData){
                return this.targetEntity.read(operation, this.targetRelativePath);
            }else{
                return this.getComponent(false);
            }
        }catch(err){
            u.fatal("Couldn't read value: " + err.message, this.getFullPath());
        }
    }

    public writeValue(value: any, operation: WriteOp = WriteOp.set){        
        try{
            this.update();

            if(this.targetEntity instanceof WritableData){
                this.targetEntity.write(operation, value, this.targetRelativePath);   
            }else{
                this.fatal('Target component is not a "writable data".');
            }
        }catch(err){
            u.fatal("Couldn't write value: " + err.message, this.getFullPath());
        }
        
    }
    //#endregion

    //#region Validation and messages

    public validate(){

        try{
            if(this.strResolver){
                this.warning("Can't validate a pointer that contains dynamic arguments");
            }else if(!this.expectedTypes || this.expectedTypes.length == 0){
                this.warning("No expected types are specified.");
            }else{
                
                this.update();
                
                let validated = true;
                let reason = undefined;
    
                for(const type of this.expectedTypes){
                    switch(type){
                        case Property:
                        case Action:
                        case Process:
                        case InteractionAffordance:
                            if(!u.testType(this.getComponent(), type)){
                                validated = false;
                                reason = "wrong data type";
                            }
                            break;
                        case ReadableData:
                        case WritableData:
                            if(!u.testType(this.getComponent(), type)){
                                validated = false;
                                reason = "wrong data type";
                            }else if(!(this.getComponent() as DataHolder).hasEntry(this.getTargetsRelativePath())){
                                validated = false;
                                reason = "no such entry: \"" + this.getTargetsRelativePath() + "\"";
                            }
                            break;
                        case Number:
                            if(!u.testType(this.getComponent(), DataHolder)){
                                validated = false;
                                reason = "wrong data type"
                            }else if(!(this.getComponent() as DataHolder).hasEntry(this.getTargetsRelativePath(), type)){
                                validated = false;
                                reason = "no entry \"" + this.getTargetsRelativePath() + "\" with type \"" + u.getTypeName(type) + "\"";
                            }
                            break;                                        
                    }
    
                    if(!validated){
                        break;
                    }
                }
    
                if(!validated){
                    this.fatal("Validation failed: " + reason);
                }
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
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

    private fatal(message: string = "Invalid pointer.", path: string = undefined){
        let mes = "Pointer error: " + message + "\n" + this.getInfo();
        u.fatal(mes, path);
    }
    
    private warning(message: string, path: string = undefined){
        let mes = "Pointer warning: " + message + "\n" + this.getInfo();
        u.warning(mes, path);
    }
        
    //#endregion
}
