import * as jsonPointer from 'json-pointer';
import * as jsonInstantiator from 'json-schema-instantiator';

import {
    EntityOwner,
    EntityType,
    Process,
    Pointer,
    Entity,
    u
} from "../index";

export enum ReadOp {
    get,
    pop,
    copy,
    length
}

export enum WriteOp {
    set,
    push,
    copy,
    pushCopy
}

export abstract class DataHolder extends Entity {

    protected data: any = undefined;
    private readonly schema: object = undefined;

    public constructor(type: EntityType, name: string, parent: EntityOwner, schema: object) {
        super(type, name, parent);

        this.schema = schema;        
        if(schema != undefined){
            this.data = jsonInstantiator.instantiate(this.schema);
            this.getModel().getValidator().addSchema(schema, this.getPath());
        }
    }

    public getSchema(): object {
        return this.schema;
    }

    public hasEntry(path: string, type: any = undefined): boolean {
        return jsonPointer.has(this.data, path)
            && (type == undefined || u.testType(jsonPointer.get(this.data, path), type));
    }

    public validate(value: any, vital: boolean = false): boolean {
        if(this.schema == undefined){
            return true;
        }

        if(this.getModel().getValidator().validate(this.getPath(), value)){
            return true;
        }else if(vital){
            u.fatal("Validation failed."
                    + "\nValue: " 
                    + JSON.stringify(value)
                    + "\nSchema: "
                    + JSON.stringify(this.schema), this.getGlobalPath());
        }

        return false;
    }
}

export abstract class ReadableData extends DataHolder {

    public read(operation: ReadOp, path: string){        
        switch(operation){
            case ReadOp.get:
                if(this.hasEntry(path)){
                    return jsonPointer.get(this.data, path);
                }                
            case ReadOp.copy:
                if(this.hasEntry(path)){
                    return this.copy(jsonPointer.get(this.data, path));
                }                
            case ReadOp.pop:
                if(this.hasEntry(path, Array)){
                    return jsonPointer.get(this.data, path).pop();
                }
            case ReadOp.length:
                if(this.hasEntry(path, Array)){
                    return jsonPointer.get(this.data, path).pop();
                }
        }
        u.fatal(`Invalid operation "${operation}" : on data "${path}.`, this.getGlobalPath())
    }

    protected copy(value: any){
        return JSON.parse(JSON.stringify(value));
    }
}

export abstract class WritableData extends ReadableData {

    public write(operation: WriteOp, value: any, path: string){

        // TODO Make property level validation rather than a bulk copy
        let copy: any = undefined;

        switch(operation){
            case WriteOp.set:
                if(this.hasEntry(path)){
                    copy = this.copy(this.data);
                    jsonPointer.set(copy, path, value);
                    if(this.validate(copy, true)){
                        jsonPointer.set(this.data, path, value);
                    }
                }    
                break;
            case WriteOp.copy:
                if(this.hasEntry(path)){
                    copy = this.copy(this.data);
                    jsonPointer.set(copy, path, value);
                    if(this.validate(copy, true)){
                        jsonPointer.set(this.data, path, this.copy(value));
                    }
                }    
                break;
            case WriteOp.push:
                if(this.hasEntry(path, Array)){
                    copy = this.copy(this.data);
                    jsonPointer.get(copy, path).push(value);
                    if(this.validate(copy, true)){
                        jsonPointer.get(this.data, path).push(value);
                    }
                }    
            case WriteOp.pushCopy:
                if(this.hasEntry(path, Array)){
                    copy = this.copy(this.data);
                    jsonPointer.get(copy, path).push(value);
                    if(this.validate(copy, true)){
                        jsonPointer.get(this.data, path).push(this.copy(value));
                    }
                }    
                break;
        }
        u.fatal(`Invalid operation "${operation}" : on data "${path}.`, this.getGlobalPath())
    }
}

export class Data extends WritableData {    
    public constructor(name: string, schema: object, parent: EntityOwner) {
        super(EntityType.Data, name, parent, schema);
    }
}

export class CompoundData {
 
    private process: Process = undefined;

    private originalData: any = undefined;
    private resolvedData: any = undefined;    
    
    private pointers: Map<string, Pointer> = undefined;

    public constructor(process: Process, jsonObj: any) {
        this.process = process;
        this.originalData = jsonObj;

        this.parse();
    }

    private parse(){
        // replace all pointer strings values by pointers in original data, store all paths containig pointers in the "pointers" map        
    }

    private update(){
        // set values of pointers using paths (keys of map) to "resolvedObject"
    }

    public getValue() {
        this.update();        
        return this.resolvedData;
    }
}
