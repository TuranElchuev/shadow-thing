import * as jsonPointer from 'json-pointer';

import {
    Entity,
    ComponentOwner,
    DataHolder,
    ReadableData,
    WritableData,
    ReadOp,
    WriteOp,
    DateTime,
    InteractionAffordance,
    Action,
    Process,
    Property,
    u
} from "../index";


export enum Primitive {
    undefined,
    boolean,
    number,
    integer,
    string,
    object,
    property,
    action,
    event,

}

export class PathResolver extends Entity {

    private readonly innerPtrRegex: RegExp = /(\$\{)([^${}]+)(\})/g;
    private readonly ptrObjectRegex: RegExp = /(\s*\{\s*"pointer"\s*:\s*")([^${}]+)("\s*\})/g;

    public constructor(name: string, parent: Entity){        
        super(name, parent);
    }

    public isComposite(ptrStr: string): boolean {
        if(ptrStr){
            return ptrStr.match(this.innerPtrRegex) != undefined
                    || ptrStr.match(this.ptrObjectRegex) != undefined;
        }else{
            return false;
        }
    }

    private resolvePaths(pathStr: string, ptrRegexp: RegExp, replace: string, validate: boolean = false): string {

        let ptrPath = undefined;
        let ptrVal = undefined;
        let ptrs = pathStr.match(ptrRegexp);

        while(ptrs){
            for (const ptr of ptrs){
                ptrPath = ptr.replace(ptrRegexp, replace);
                ptrVal = new Pointer("innerPtr", this, ptrPath, undefined, validate).readValueAsStr();
                if(ptrVal === undefined){
                    u.error(`Could not resolve inner pointer "${ptrPath}".`, this.getPath());
                }                
                pathStr = pathStr.replace(ptr, ptrVal);
            }
            ptrs = pathStr.match(ptrRegexp);
        }
        return pathStr;
    }

    public resolvePointers(pathStr: string): string {
        let innerResolved = this.resolvePaths(pathStr, this.innerPtrRegex, "$2");
        return this.resolvePaths(innerResolved, this.ptrObjectRegex, "$2");        
    }
}

export class Pointer extends Entity {

    //#region Properties and constructors
    private expectedTypes: any[] = undefined;
    
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetComponent: any = undefined;
    private relativePath: string = "";

    private resolvedOnce: boolean = false;

    private pathResolver: PathResolver = undefined;
    
    
    public constructor(name: string, parent: Entity, jsonObj: string, expectedTypes: any[], validate: boolean = true){
        super(name, parent);
        
        this.expectedTypes = expectedTypes;
        this.unresolvedPath = jsonObj.replace(/\s/g, "");
        if(!this.unresolvedPath.startsWith("/")){
            this.unresolvedPath = "/" + this.unresolvedPath;
        }

        let pathResolver = new PathResolver("pathResolver", this);
        if(pathResolver.isComposite(jsonObj)){
            this.pathResolver = pathResolver;
        }

        if(validate){
            this.getModel().registerPointerForValidation(this);
        }
    }
    //#endregion

    //#region Resolution

    private update() {       
        if(!this.pathResolver && this.resolvedOnce){
            return;
        }
        if(this.pathResolver){
            try{
                this.resolvedPath = this.pathResolver.resolvePointers(this.unresolvedPath);
            }catch(err){
                this.error(err.message)
            }
        }else{
            this.resolvedPath = this.unresolvedPath;
        }
        this.resolveComponent();
        this.resolvedOnce = true;
    }

    private resolveComponent(){
        
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(!tokens || tokens.length < 2){
            this.error();
        }
       
        if(tokens[0] == DateTime.pathToken){
            this.targetComponent = new DateTime(this);
            this.relativePath = tokens[1];
            return;
        }

        this.targetComponent = this.getModel().getChildComponent(tokens[0], tokens[1]);

        if(tokens.length > 2){
            if(this.targetComponent instanceof ComponentOwner){                
                this.targetComponent = this.targetComponent.getChildComponent(tokens[2], tokens[3]);
                if(tokens.length > 4){
                    if(this.targetComponent instanceof ComponentOwner){                
                        this.targetComponent = this.targetComponent.getChildComponent(tokens[4], tokens[5]);                              
                        if(!(this.targetComponent instanceof DataHolder)){
                            this.error();
                        }
                        this.resolveRelativePath(tokens, 6);
                    }else if(this.targetComponent instanceof DataHolder){        
                        this.resolveRelativePath(tokens, 4);
                    }else{
                        this.error();
                    }
                }
            }else if(this.targetComponent instanceof DataHolder){
                this.resolveRelativePath(tokens, 2);
            }else{
                this.error();
            }
        }
    }

    private resolveRelativePath(tokens: string[], startIndex: number) {
        if(!tokens
            || tokens.length == 0
            || startIndex < 0
            || tokens.length < startIndex - 1){
                
            this.relativePath = "";
        }else{
            this.relativePath = jsonPointer.compile(tokens.slice(startIndex, tokens.length));
        }        
    }
    
    private getComponent(update: boolean = true): any {
        this.update();
        return this.targetComponent;
    }

    private getRelativePath(): string {
        this.update();
        return this.relativePath;
    }
    //#endregion

    //#region Access
    public readValue(operation: ReadOp = ReadOp.get): any {
        this.update();

        if(this.targetComponent instanceof DateTime){
            return this.targetComponent.get(this.relativePath);
        }else if(this.targetComponent instanceof ReadableData){
            return this.targetComponent.read(operation, this.relativePath);
        }else{
            return this.getComponent(false);
        }
    }

    public readValueAsStr(operation: ReadOp = ReadOp.get): string {
        return u.toJsonStr(this.readValue(operation));
    }

    public writeValue(value: any, operation: WriteOp = WriteOp.set){
        this.update();

        if(this.targetComponent instanceof WritableData){
            this.targetComponent.write(operation, value, this.relativePath);   
        }else{
            this.error('Can\'t write value: target component is not a "writable data".');
        }
    }
    //#endregion

    //#region Validation and messages

    public validate(){

        if(this.pathResolver){
            this.warning("Can't validate a pointer that contains other pointers");
        }else if(!this.expectedTypes || this.expectedTypes.length == 0){
            this.warning("No expected types are specified.");
        }else{
            
            this.update();
            
            let validated = true;

            for(const type of this.expectedTypes){
                switch(type){
                    case Property:
                    case Action:
                    case Process:
                    case InteractionAffordance:
                        validated = validated && u.testType(this.getComponent(), type);
                        break;
                    case ReadableData:
                    case WritableData:
                        validated = validated && u.testType(this.getComponent(), type)
                            && (this.getComponent() as DataHolder).hasEntry(this.getRelativePath());
                        break;
                    case Number:
                        validated = u.testType(this.getComponent(), DataHolder)
                            && (this.getComponent() as DataHolder).hasEntry(this.getRelativePath(), type);
                        break;                                        
                }

                if(!this.validate){
                    break;
                }
            }

            if(validated){
                this.info("Validation succeeded.")
            }else{
                this.error("Validation failed.")
            }
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
                + "\ntarget component: " + u.getTypeNameFromValue(this.targetComponent);
                + "\nrelative path: " + this.relativePath;
        }else{
            info += "\nresolved: false";
        }
        return info;
    }

    private error(message: string = "Invalid pointer."){
        let mes = "Pointer error: " + message + "\n" + this.getInfo();
        u.fatal(mes, this.getPath());
    }
    
    private warning(message: string){
        let mes = "Pointer warning: " + message + "\n" + this.getInfo();
        u.warning(mes, this.getPath());
    }
    
    private info(message: string){
        let mes = "Pointer info: " + message + "\n" + this.getInfo();
        u.info(mes, this.getPath());
    }

    //#endregion
}
