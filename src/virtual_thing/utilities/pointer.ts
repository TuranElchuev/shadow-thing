import * as jsonPointer from 'json-pointer';

import {
    EntityOwner,
    DataHolder,
    ReadableData,
    WritableData,
    DateTime,
    Messages
} from "../index";

export class Pointer {

    private parent: EntityOwner = undefined;
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private targetEntity: any = undefined;
    private relativePath: string = undefined;

    private fixed: boolean = false;

    private readonly leafPointerRegexp = /(\$\{)([^${}]+)(\})/g;
    

    public constructor(path: string, parent: EntityOwner){
        this.parent = parent;
        this.unresolvedPath = new String(path).toString();
        if(!this.unresolvedPath.startsWith("/")){
            this.unresolvedPath = "/" + this.unresolvedPath;
        }
        parent.getModel().registerPointer(this);
    }

    private update() {                
        if(!this.fixed){
            this.fixed = true; 
            this.resolvePath()           
            this.resolveEntity();
        }
    }

    private resolvePath() {

        let resolvedPath = this.unresolvedPath.replace(/\s/g, "");

        let leafPtrPath = undefined;
        let leafPtrVal = undefined;
        let leafPtrs = resolvedPath.match(this.leafPointerRegexp);

        while(leafPtrs != undefined){

            this.fixed = false;

            for (const leafPtr of leafPtrs){
                leafPtrPath = leafPtr.replace(this.leafPointerRegexp, "$2");
                leafPtrVal = new Pointer(leafPtrPath, this.parent).readValueAsStr();
                if(leafPtrVal == undefined){
                    this.reportError(`Could not resolve inner pointer "${leafPtrPath}".`);
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
            this.reportError();
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
                            this.reportError();
                        }

                        this.resolveRelativePath(tokens, 6);

                    }else if(this.targetEntity instanceof DataHolder){        

                        this.resolveRelativePath(tokens, 4);

                    }else{
                        this.reportError();
                    }
                }

            }else if(this.targetEntity instanceof DataHolder){

                this.resolveRelativePath(tokens, 2);

            }else{
                this.reportError();
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

    private reportError(message: string = "Invalid pointer."){
        let mes = message                
                + "\n\toriginal path: " + this.unresolvedPath
                + "\n\tresolved path: " + this.resolvedPath;

        Messages.exception(mes, this.parent.getGlobalPath());
    }
      
    public getEntity(): any {
        this.update();
        return this.targetEntity;
    }

    public getRelativePath(): string {
        this.update();
        return this.relativePath;
    }

    public readValue(): any {
        this.update();

        if(this.targetEntity instanceof DateTime){
            return this.targetEntity.get(this.relativePath);
        }else if(this.targetEntity instanceof ReadableData){
            return this.targetEntity.read(this.relativePath);
        }else{
            this.reportError('Can\'t read value: target entity is not a "readable data".');
        }
    }

    public readValueAsStr(): string {
        let val = this.readValue();
        if(val == undefined){
            return undefined;
        }else{
            return new String(val).toString();
        }        
    }

    public writeValue(value: any){
        this.update();

        if(this.targetEntity instanceof WritableData){
            this.targetEntity.write(value, this.relativePath);   
        }else{
            this.reportError('Can\'t write value: target entity is not a "writable data".');
        }
    }

    public validate(){
        let entity = this.getEntity();
        // TODO check against what should be
    }
}
