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
    u
} from "../index";


export class Pointer extends Entity {

    //#region Properties and constructors
    private expectedTypes: any[] = undefined;
    
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetComponent: any = undefined;
    private targetsRelativePath: string = "";

    private resolvedOnce: boolean = false;

    private strResolver: ParamStringResolver = undefined;
    
    
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
            this.targetComponent = new DateTime(this);
            this.targetsRelativePath = this.resolvedPath;
            return;
        }
      
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(!tokens || tokens.length < 2){
            this.fatal();
        }
      
        this.targetComponent = this.getModel().getChildComponent(tokens[0], tokens[1]);

        if(tokens.length > 2){
            if(this.targetComponent instanceof ComponentOwner){                
                this.targetComponent = this.targetComponent.getChildComponent(tokens[2], tokens[3]);
                if(tokens.length > 3 &&
                    (this.targetComponent instanceof Input || this.targetComponent instanceof Output)){
                    this.resolveRelativePath(tokens, 3);    
                }else if(tokens.length > 4){
                    if(this.targetComponent instanceof ComponentOwner){                
                        this.targetComponent = this.targetComponent.getChildComponent(tokens[4], tokens[5]);  
                        if(tokens.length > 5
                            && (this.targetComponent instanceof Input || this.targetComponent instanceof Output)){
                            this.resolveRelativePath(tokens, 5);
                        }else if(this.targetComponent instanceof DataHolder){                            
                            this.resolveRelativePath(tokens, 6);
                        }else{
                            this.fatal();
                        }                        
                    }else if(this.targetComponent instanceof DataHolder){        
                        this.resolveRelativePath(tokens, 4);
                    }else{
                        this.fatal();
                    }
                }
            }else if(this.targetComponent instanceof DataHolder){
                this.resolveRelativePath(tokens, 2);
            }else{
                this.fatal();
            }
        }
    }

    private resolveRelativePath(tokens: string[], startIndex: number) {
        if(!tokens
            || tokens.length == 0
            || startIndex < 0
            || tokens.length < startIndex - 1){
                
            this.targetsRelativePath = "";
        }else{
            this.targetsRelativePath = jsonPointer.compile(tokens.slice(startIndex, tokens.length));
        }        
    }
    
    private getComponent(update: boolean = true): any {
        this.update();
        return this.targetComponent;
    }

    private getTargetsRelativePath(): string {
        this.update();
        return this.targetsRelativePath;
    }
    //#endregion

    //#region Access
    public readValue(operation: ReadOp = ReadOp.get): any {
        try{
            this.update();

            if(this.targetComponent instanceof DateTime){
                return this.targetComponent.get(this.targetsRelativePath);
            }else if(this.targetComponent instanceof ReadableData){
                return this.targetComponent.read(operation, this.targetsRelativePath);
            }else{
                return this.getComponent(false);
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }
    }

    public writeValue(value: any, operation: WriteOp = WriteOp.set){        
        try{
            if(value === undefined){
                u.fatal('Value is undefined.');
            }

            this.update();

            if(this.targetComponent instanceof WritableData){
                this.targetComponent.write(operation, value, this.targetsRelativePath);   
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
                + "\nactual component type: " + u.getTypeNameFromValue(this.targetComponent);
                + "\nrelative path: " + this.targetsRelativePath;
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
