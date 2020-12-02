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
    ParameterizedStringResolver,
    IVtdPointer,
    u
} from "../index";


export class Pointer extends Entity {

    //#region Properties and constructors
    private expectedTypes: any[] = undefined;
    
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetComponent: any = undefined;
    private relativePath: string = "";

    private resolvedOnce: boolean = false;

    private strResolver: ParameterizedStringResolver = undefined;
    
    
    public constructor(name: string, parent: Entity, jsonObj: IVtdPointer, expectedTypes: any[], validate: boolean = true){
        super(name, parent);
        
        this.expectedTypes = expectedTypes;
        this.unresolvedPath = jsonObj.replace(/\s/g, "");
        if(!this.unresolvedPath.startsWith("/")){
            this.unresolvedPath = "/" + this.unresolvedPath;
        }

        let strResolver = new ParameterizedStringResolver(undefined, this);
        if(strResolver.hasParams(jsonObj)){
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
            try{
                this.resolvedPath = this.strResolver.resolveParams(this.unresolvedPath);
            }catch(err){
                this.fatal(err.message)
            }
        }else{
            this.resolvedPath = this.unresolvedPath;
        }
    }

    private retrieveComponent(){
        
        if(DateTime.isDTExpr(this.resolvedPath)){    
            if(!DateTime.isValidDTExpr(this.resolvedPath)){
                u.fatal("Invalid DateTime format: " + this.resolvedPath, this.getPath());
            }        
            this.targetComponent = new DateTime(this);
            this.relativePath = this.resolvedPath;
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
                if(tokens.length > 4){
                    if(this.targetComponent instanceof ComponentOwner){                
                        this.targetComponent = this.targetComponent.getChildComponent(tokens[4], tokens[5]);                              
                        if(!(this.targetComponent instanceof DataHolder)){
                            this.fatal();
                        }
                        this.resolveRelativePath(tokens, 6);
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

    public writeValue(value: any, operation: WriteOp = WriteOp.set){
        if(value === undefined){
            this.fatal('Can\'t write value: value is undefined.');
        }
        
        this.update();

        if(this.targetComponent instanceof WritableData){
            this.targetComponent.write(operation, value, this.relativePath);   
        }else{
            this.fatal('Can\'t write value: target component is not a "writable data".');
        }
    }
    //#endregion

    //#region Validation and messages

    public validate(){

        if(this.strResolver){
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

            if(!validated){
                this.fatal("Validation failed.")
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

    private fatal(message: string = "Invalid pointer."){
        let mes = "Pointer error: " + message + "\n" + this.getInfo();
        u.fatal(mes, this.getPath());
    }
    
    private warning(message: string){
        let mes = "Pointer warning: " + message + "\n" + this.getInfo();
        u.warning(mes, this.getPath());
    }
        
    //#endregion
}
