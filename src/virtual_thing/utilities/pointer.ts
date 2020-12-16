import * as jsonPointer from 'json-pointer';

import {
    VTMNode,
    ComponentOwner,
    DataHolder,
    Data,
    ReadableData,
    WritableData,
    ReadOp,
    WriteOp,
    DateTime,
    ParamStringResolver,
    IVtdPointer,
    ComponentType,
    Try,
    u,
    ConstData
} from "../common/index";


export class Pointer extends VTMNode {

    //#region Properties and constructors
    private expectedTypes: any[] = undefined;
    
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetNode: VTMNode = undefined;
    private targetRelativePath: string = "";

    private resolvedOnce: boolean = false;
    private strResolver: ParamStringResolver = undefined;

    private readonly processTocken = ".";
    private readonly behaviorTocken = "..";
    private readonly pathTocken: string = "path";
    
    
    public constructor(name: string, parent: VTMNode, jsonObj: IVtdPointer, expectedTypes: any[], validate: boolean = true){
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
        if(compileTime && this.strResolver){
            this.warning("Can't resolve in compile time a pointer that contains dynamic arguments");
            return;
        }
        try{
            this.resolvePath();
            this.retrieveTargetNode();
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

    private retrieveTargetNode(){
        
        if(DateTime.isDTExpr(this.resolvedPath)){    
            if(!DateTime.isValidDTExpr(this.resolvedPath)){
                u.fatal("Invalid DateTime format: " + this.resolvedPath);
            }        
            this.targetNode = new DateTime(this);
            this.targetRelativePath = this.resolvedPath;
            return;
        }

        if(Try.isErrorMessageExpr(this.resolvedPath)){
            this.targetNode = this.getParentTry();
            if(!this.targetNode){
                u.fatal("No parent \"Try\" instruction found");
            }
            return;
        }

      
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(!tokens || tokens.length == 0){
            u.fatal("Invalid pointer.");
        }

        if(tokens[0] == this.pathTocken){
            this.targetNode = this;
            this.targetRelativePath = tokens[0];
            return;
        }

        let relativePathStartIndex = 1;
        if(tokens[0] == this.processTocken){
            this.targetNode = this.getProcess();
        }else if(tokens[0] == this.behaviorTocken){
            this.targetNode = this.getBehavior();
        }else{
            this.targetNode = this.getModel().getChildComponent(tokens[0] as ComponentType);
        }
        
        while(relativePathStartIndex < tokens.length){
            if(this.targetNode instanceof ComponentOwner){
                this.targetNode = this.targetNode.getChildComponent(tokens[relativePathStartIndex] as ComponentType);
            }else if(this.targetNode instanceof DataHolder){
                break;
            }
            relativePathStartIndex++;
        }
        this.retrieveRelativePath(tokens, relativePathStartIndex);
    }

    private retrieveRelativePath(tokens: string[], startIndex: number) {
        if(!tokens
            || tokens.length == 0
            || startIndex < 0
            || tokens.length < startIndex - 1){
                
            this.targetRelativePath = "";
        }else{
            this.targetRelativePath = jsonPointer.compile(tokens.slice(startIndex, tokens.length));
        }        
    }

    private getTargetNode(resolve: boolean): any {
        if(resolve){
            this.resolve();
        }        
        return this.targetNode;
    }
    
    private getTargetsRelativePath(resolve: boolean): string {
        if(resolve){
            this.resolve();
        }
        return this.targetRelativePath;
    }

    private getOwnProperty(type: string){
        if(type == this.pathTocken){
            return this.getFullPath();
        }else{
            return undefined;
        }
    }
    //#endregion

    //#region Access
    public readValue(operation: ReadOp = ReadOp.get): any {
        try{
            this.resolve();
            if(this.targetNode === this){
                return this.getOwnProperty(this.targetRelativePath);        
            }else if(this.targetNode instanceof DateTime){
                return this.targetNode.get(this.targetRelativePath);
            }else if(this.targetNode instanceof Try){
                return this.targetNode.getErrorMessage();
            }else if(this.targetNode instanceof ReadableData){
                return this.targetNode.read(operation, this.targetRelativePath);
            }else{
                return this.getTargetNode(false);
            }
        }catch(err){
            this.fatal("Couldn't read value:\n" + err.message);
        }
    }

    public fakeValue(){
        try{
            this.resolve();

            if(this.targetNode instanceof WritableData){
                this.targetNode.fake();
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

            if(this.targetNode instanceof WritableData){
                this.targetNode.write(operation, value, this.targetRelativePath);   
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

        try{
            let validated = true;
            let reason = undefined;

            for(const type of this.expectedTypes){
                switch(type){
                    case DataHolder:
                    case ReadableData:
                    case WritableData:
                    case Data:
                    case ConstData:
                        if(!u.instanceOf(this.getTargetNode(false), type)){
                            validated = false;
                            reason = "wrong data type";
                        }else if(!(this.getTargetNode(false) as DataHolder).hasEntry(this.getTargetsRelativePath(false))){
                            validated = false;
                            reason = "no such entry: \"" + this.getTargetsRelativePath(false) + "\"";
                        }
                        break;
                    case null:
                    case Number:
                    case Boolean:
                    case String:
                    case Array:
                        if(!u.instanceOf(this.getTargetNode(false), DataHolder)){
                            validated = false;
                            reason = "wrong data type"
                        }else if(!(this.getTargetNode(false) as DataHolder).hasEntry(this.getTargetsRelativePath(false), type)){
                            validated = false;
                            reason = "no entry \"" + this.getTargetsRelativePath(false) + "\" with type \"" + u.getTypeNameFromType(type) + "\"";
                        }
                        break;
                    default:
                        if(!u.instanceOf(this.getTargetNode(false), type)){
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
                info += u.getTypeNameFromType(type) + " ";
            }
        }
        if(this.resolvedOnce){
            info = info
                + "\nactual component type: " + u.getTypeNameFromValue(this.targetNode);
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
