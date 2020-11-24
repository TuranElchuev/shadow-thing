import * as jsonPointer from 'json-pointer';
import * as jsonInstantiator from 'json-schema-instantiator';

import {
    EntityOwner,
    EntityType,
    Process,
    PathResolver,
    Entity,
    u
} from "../index";

export enum ReadOp {
    get = "get",
    pop = "pop",
    copy = "copy",
    length = "length"
}

export enum WriteOp {
    set = "set",
    push = "push",
    copy = "copy",
    pushCopy = "pushCopy"
}

export abstract class DataHolder extends Entity {

    protected data: any = undefined;
    private readonly schema: object = undefined;

    public constructor(type: EntityType, name: string, parent: EntityOwner, schema: object) {
        super(type, name, parent);

        this.schema = schema;        
        if(schema){
            this.data = jsonInstantiator.instantiate(this.schema);
            this.getModel().getValidator().addSchema(schema, this.getPath());
        }
    }
    
    public hasEntry(path: string, expectedType: any = undefined, withError: boolean = false, opDescr: string = undefined): boolean {
        if(!jsonPointer.has(this.data, path)){
            if(withError){
                u.fatal("No such entry."
                        + (opDescr ? "\n" + opDescr : "")
                        + "\nData: \n"
                        + JSON.stringify(this.data, null, 4));
            }
            return false;
        }else if(expectedType != undefined){
            let value = jsonPointer.get(this.data, path);
            if(!u.testType(value, expectedType)){
                if(withError){
                    u.fatal("Incorrect type."
                        + (opDescr ? "\n" + opDescr : "")
                        + "\nExpected type: "
                        + u.getTypeName(expectedType)
                        + "\nActual type: "
                        + u.getTypeNameFromValue(value));
                }
                return false;
            }            
        }
        return true;
    }

    protected getSchema(): object {
        return this.schema;
    }

    protected validate(value: any, withError: boolean = false, opDescr: string = undefined): boolean {
        if(this.schema == undefined){
            return true;
        }

        if(this.getModel().getValidator().validate(this.getPath(), value)){
            return true;
        }else if(withError){
            u.fatal("Validation failed."
                    + (opDescr ? "\n" + opDescr : "")
                    + "\nValidated value: \n" 
                    + JSON.stringify(value, null, 4)
                    + "\nValidation schema: \n"
                    + JSON.stringify(this.schema, null, 4), this.getGlobalPath());
        }

        return false;
    }

    protected getOperationString(operation: string, path: string, value: any = undefined){
        return "Operation: " + operation
                + (value ? "\nValue: \n" + JSON.stringify(value, null, 4) : "")
                + "\nPath: " + path;
    }
}

export abstract class ReadableData extends DataHolder {

    public read(operation: ReadOp, path: string){  
        
        let opStr = this.getOperationString(operation, path);

        switch(operation){
            case ReadOp.get:
                if(this.hasEntry(path, undefined, true, opStr)){
                    return jsonPointer.get(this.data, path);
                }                
            case ReadOp.copy:
                if(this.hasEntry(path, undefined, true, opStr)){
                    return this.copy(jsonPointer.get(this.data, path));
                }                
            case ReadOp.pop:
                if(this.hasEntry(path, Array, true, opStr)){
                    let copy = this.copy(this.data);
                    jsonPointer.get(copy, path).pop();
                    if(this.validate(copy, true, opStr)){
                        return jsonPointer.get(this.data, path).pop();
                    }                    
                }
            case ReadOp.length:
                if(this.hasEntry(path, Array, true, opStr)){
                    return jsonPointer.get(this.data, path).length;
                }
        }
        u.fatal("Invalid operation.\n" + opStr);
    }

    protected copy(value: any){
        return JSON.parse(JSON.stringify(value));
    }
}

export abstract class WritableData extends ReadableData {
   
    public write(operation: WriteOp, value: any, path: string = ""){

        // TODO Make property level validation rather than a bulk copy
        let copy: any = undefined;
        let opStr = this.getOperationString(operation, path, value);

        switch(operation){
            case WriteOp.set:
                if(this.hasEntry(path, undefined, true, opStr)){
                    copy = this.copy(this.data);
                    if(path && path.trim().length > 0){
                        jsonPointer.set(copy, path, value);
                    }                    
                    if(this.validate(copy, true, opStr)){
                        if(path && path.trim().length > 0){                            
                            jsonPointer.set(this.data, path, value);
                        }else{
                            this.data = value;
                        }
                    }
                }    
                break;
            case WriteOp.copy:
                if(this.hasEntry(path, undefined, true, opStr)){
                    copy = this.copy(this.data);
                    if(path && path.trim().length > 0){
                        jsonPointer.set(copy, path, value);
                    }
                    if(this.validate(copy, true, opStr)){
                        if(path && path.trim().length > 0){                            
                            jsonPointer.set(this.data, path, this.copy(value));
                        }else{
                            this.data = this.copy(value);
                        }                        
                    }
                }    
                break;
            case WriteOp.push:
                if(this.hasEntry(path, Array, true, opStr)){
                    copy = this.copy(this.data);
                    jsonPointer.get(copy, path).push(value);
                    if(this.validate(copy, true, opStr)){
                        jsonPointer.get(this.data, path).push(value);
                    }
                }
                break;
            case WriteOp.pushCopy:
                if(this.hasEntry(path, Array, true, opStr)){
                    copy = this.copy(this.data);
                    jsonPointer.get(copy, path).push(value);
                    if(this.validate(copy, true, opStr)){
                        jsonPointer.get(this.data, path).push(this.copy(value));
                    }
                }    
                break;
            default:
                u.fatal("Invalid operation.\n" + opStr);
                break;
        }        
    }
}

export class Data extends WritableData {    
    public constructor(name: string, schema: object, parent: EntityOwner, ) {
        super(EntityType.Data, name, parent, schema);
    }
}

export class Input extends WritableData {    
    public constructor(name: string, schema: object, parent: EntityOwner, ) {
        super(EntityType.Input, name, parent, schema);
    }
}

export class Output extends WritableData {    
    public constructor(name: string, schema: object, parent: EntityOwner, ) {
        super(EntityType.Output, name, parent, schema);
    }
}

export class UriVariable extends WritableData {    
    public constructor(name: string, schema: object, parent: EntityOwner, ) {
        super(EntityType.UriVariable, name, parent, schema);
    }
}

export class CompoundData {
 
    private process: Process = undefined;

    private originalDataStr: string = undefined;
    private resolvedData: any = undefined;    
    
    private resolvedOnce: boolean = false;

    private pathResolver: PathResolver = undefined;

    public constructor(process: Process, jsonObj: any) {
        this.process = process;
        
        this.originalDataStr = JSON.stringify(jsonObj);

        let pathResolver = new PathResolver(process);
        if(pathResolver.isComposite(this.originalDataStr)){
            this.pathResolver = pathResolver;
        }

        this.resolve();
    }

    private resolve(){
        if(this.pathResolver || !this.resolvedOnce){
            try{
                this.resolvedData = JSON.parse(this.pathResolver.resolvePaths(this.originalDataStr));
            }catch(err){
                u.fatal("Could not resolve compound data: " + err.message, this.process.getGlobalPath());
            }            
            this.resolvedOnce = true;            
        }
    }

    public getValue(): any {
        this.resolve();
        return this.resolvedData;
    }
}
