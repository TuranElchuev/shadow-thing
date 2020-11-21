import * as jsonPointer from 'json-pointer';

import {
    EntityOwner,
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

export class Pointer {

    //#region Properties and constructors
    private expectedTypes: any[] = undefined;
    
    private parent: EntityOwner = undefined;
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetEntity: any = undefined;
    private relativePath: string = "";

    private composite: boolean = false;
    private resolved: boolean = false;

    private readonly leafPointerRegexp = /(\$\{)([^${}]+)(\})/g;
    
    public constructor(path: string, parent: EntityOwner, expectedTypes: any[], validate: boolean = true){        
        this.parent = parent;
        this.unresolvedPath = new String(path).toString();
        if(!this.unresolvedPath.startsWith("/")){
            this.unresolvedPath = "/" + this.unresolvedPath;
        }

        this.composite = (this.unresolvedPath.match(this.leafPointerRegexp) != undefined);

        if(validate){
            parent.getModel().registerPointerForValidation(this);
        }        
    }
    //#endregion

    //#region Resolution

    private update() {                
        if(this.composite || !this.resolved){
            this.resolvePath()           
            this.resolveEntity();
            this.resolved = true;
        }
    }

    private resolvePath() {

        let resolvedPath = this.unresolvedPath.replace(/\s/g, "");

        let leafPtrPath = undefined;
        let leafPtrVal = undefined;
        let leafPtrs = resolvedPath.match(this.leafPointerRegexp);

        while(leafPtrs != undefined){

            for (const leafPtr of leafPtrs){
                leafPtrPath = leafPtr.replace(this.leafPointerRegexp, "$2");
                leafPtrVal = new Pointer(leafPtrPath, this.parent, undefined, false).readValueAsStr();
                if(leafPtrVal == undefined){
                    this.error(`Could not resolve inner pointer "${leafPtrPath}".`);
                }
                resolvedPath = resolvedPath.replace(leafPtr, leafPtrVal);
            }

            leafPtrs = resolvedPath.match(this.leafPointerRegexp);
        }

        this.resolvedPath = resolvedPath;
    }

    private resolveEntity(){
        
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(tokens == undefined || tokens.length < 2){
            this.error();
        }
       
        if(tokens[0] == DateTime.pathToken){
            this.targetEntity = new DateTime(this.parent);
            this.relativePath = tokens[1];
            return;
        }

        this.targetEntity = this.parent.getModel().getChildEntity(tokens[0], tokens[1]);

        if(tokens.length > 2){

            if(this.targetEntity instanceof EntityOwner){                

                this.targetEntity = this.targetEntity.getChildEntity(tokens[2], tokens[3]);

                if(tokens.length > 4){

                    if(this.targetEntity instanceof EntityOwner){                

                        this.targetEntity = this.targetEntity.getChildEntity(tokens[4], tokens[5]);      
                        
                        if(!(this.targetEntity instanceof DataHolder)){
                            this.error();
                        }

                        this.resolveRelativePath(tokens, 6);

                    }else if(this.targetEntity instanceof DataHolder){        

                        this.resolveRelativePath(tokens, 4);

                    }else{
                        this.error();
                    }
                }

            }else if(this.targetEntity instanceof DataHolder){

                this.resolveRelativePath(tokens, 2);

            }else{
                this.error();
            }
        }
    }

    private resolveRelativePath(tokens: string[], startIndex: number) {
        if(tokens == undefined
            || tokens.length == 0
            || startIndex < 0
            || tokens.length < startIndex - 1){
                
            this.relativePath = "";
        }else{
            this.relativePath = jsonPointer.compile(tokens.slice(startIndex, tokens.length - 1));
        }        
    }
    
    private getEntity(update: boolean = true): any {
        this.update();
        return this.targetEntity;
    }

    private getRelativePath(): string {
        this.update();
        return this.relativePath;
    }
    //#endregion

    //#region Access
    public readValue(operation: ReadOp = ReadOp.get): any {
        this.update();

        if(this.targetEntity instanceof DateTime){
            return this.targetEntity.get(this.relativePath);
        }else if(this.targetEntity instanceof ReadableData){
            return this.targetEntity.read(operation, this.relativePath);
        }else{
            return this.getEntity(false);
        }
    }

    public readValueAsStr(operation: ReadOp = ReadOp.get): string {
        let val = this.readValue(operation);
        if(val == undefined){
            return undefined;
        }else{
            return JSON.stringify(val);
        }        
    }

    public writeValue(value: any, operation: WriteOp = WriteOp.set){
        this.update();

        if(this.targetEntity instanceof WritableData){
            this.targetEntity.write(operation, value, this.relativePath);   
        }else{
            this.error('Can\'t write value: target entity is not a "writable data".');
        }
    }
    //#endregion

    //#region Validation and messages

    public validate(){

        if(this.composite){
            this.warning("Can't validate a composite pointer");
        }else if(this.expectedTypes == undefined || this.expectedTypes.length == 0){
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
                        validated &&= u.testType(this.getEntity(), type);
                        break;
                    case ReadableData:
                    case WritableData:
                        validated &&= u.testType(this.getEntity(), type)
                            && (this.getEntity() as DataHolder).hasEntry(this.getRelativePath());
                        break;
                    case Number:
                        validated = u.testType(this.getEntity(), DataHolder)
                            && (this.getEntity() as DataHolder).hasEntry(this.getRelativePath(), type);
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
        if(this.expectedTypes == undefined || this.expectedTypes.length == 0){
            info += "unknown";
        }else{
            for(const type of this.expectedTypes){
                info += u.getTypeName(type) + " ";
            }
        }
        if(this.resolved){
            info = info
                + "\ntarget entity: " + (typeof this.targetEntity)
                + "\nrelative path: " + this.relativePath;
        }else{
            info += "\nresolved: false";
        }
        return info;
    }

    private error(message: string = "Invalid pointer."){
        let mes = "Pointer error: " + message + "\n" + this.getInfo();
        u.fatal(mes, this.parent.getGlobalPath());
    }
    
    private warning(message: string = "Invalid pointer."){
        let mes = "Pointer warning: " + message + "\n" + this.getInfo();
        u.warn(mes, this.parent.getGlobalPath());
    }
    
    private info(message: string = "Invalid pointer."){
        let mes = "Pointer info: " + message + "\n" + this.getInfo();
        u.warn(mes, this.parent.getGlobalPath());
    }

    //#endregion
}
