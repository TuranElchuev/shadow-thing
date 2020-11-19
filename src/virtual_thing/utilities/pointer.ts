import * as jsonPointer from 'json-pointer';
import { type } from 'os';
import { Process } from '../entities/process';

import {
    VirtualThingModel,
    EntityOwner,
    DataHolder,
    ReadableData,
    WritableData,
    DateTime
} from "../index";

export class Pointer {

    private model: VirtualThingModel = undefined;
    private unresolvedPath: string = undefined;
    private resolvedPath: string = undefined;

    private target: any = undefined;
    private relativePath: string = undefined;

    private fixed: boolean = false;

    public constructor(ptrStr: string, model: VirtualThingModel){
        if(ptrStr == undefined){
            throw new Error("No pointer"); // TODO
        }
        this.model = model;
        this.unresolvedPath = new String(ptrStr).toString();
    }

    private update() {                
        if(!this.fixed){
            this.fixed = true; 
            this.resolvePath()           
            this.resolveEntity();
        }
    }

    private resolvePath() {

        const leafPointerRegexp = /\$\([^${}]+\)/g;
        const extractPathRegexp = /(\$\()(.+)(\))/g;

        let resolvedPath = this.unresolvedPath.replace(/\s/g, "");

        let leafPtrPath = undefined;
        let leafPtrVal = undefined;
        let leafPtrs = resolvedPath.match(leafPointerRegexp);

        while(leafPtrs != undefined){

            this.fixed = false;

            for (const leafPtr of leafPtrs){
                leafPtrPath = leafPtr.replace(extractPathRegexp, "$2");
                leafPtrVal = new Pointer(leafPtrPath, this.model).getAsStr();
                if(leafPtrVal == undefined){
                    this.reportError(`Could not resolve inner pointer "${leafPtrPath}".`);
                }
                resolvedPath = resolvedPath.replace(leafPtr, leafPtrVal);
            }

            leafPtrs = resolvedPath.match(leafPointerRegexp);
        }

        this.resolvedPath = resolvedPath;
    }

    private resolveEntity(){
        
        const tokens: string[] = jsonPointer.parse(this.resolvedPath);

        if(tokens == undefined || tokens.length < 2){
            this.reportError();
        }
       
        if(tokens[0] == "dt"){
            this.target = new DateTime();
            this.relativePath = tokens[1];
            return;
        }

        this.target = this.model.getChildEntity(tokens[0], tokens[1]);

        if(tokens.length > 2){

            if(this.target instanceof EntityOwner){                

                this.target = this.target.getChildEntity(tokens[2], tokens[3]);

                if(tokens.length > 4){

                    if(this.target instanceof EntityOwner){                

                        this.target = this.target.getChildEntity(tokens[4], tokens[5]);      
                        
                        if(!(this.target instanceof DataHolder)){
                            this.reportError();
                        }

                        this.resolveRelativePath(tokens, 6);

                    }else if(this.target instanceof DataHolder){        

                        this.resolveRelativePath(tokens, 4);

                    }else{
                        this.reportError();
                    }
                }

            }else if(this.target instanceof DataHolder){

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
        throw new Error(message
                + "\n\toriginal path: " + this.unresolvedPath
                + "\n\tresolved path: " + this.resolvedPath);
    }
  
    public getTarget(): any {
        this.update();
        return this.target;
    }

    public getRelativePath(): string {
        this.update();
        return this.relativePath;
    }

    public get(): any {
        this.update();

        if(this.target instanceof DateTime){
            return this.target.get(this.relativePath);
        }else if(this.target instanceof ReadableData){
            return this.target.read(this.relativePath);
        }else{
            return this.getTarget();
        }
    }

    public getAsStr(): string {
        let val = this.get();
        if(val == undefined){
            return undefined;
        }else{
            return new String(val).toString();
        }        
    }

    public set(value: any){
        this.update();

        if(this.target instanceof WritableData){
            this.target.write(this.relativePath, value);   
        }else{
            this.reportError("Cannot set value: target is not writable.")
        }
    }
}
