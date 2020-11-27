import * as jsonPointer from 'json-pointer';
import * as jsonInstantiator from 'json-schema-instantiator';

import {
    Entity,
    ComponentOwner,
    PathResolver,
    Component,
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

export abstract class DataHolder extends Component {

    protected data: any = null;
    private readonly schema: object = undefined;

    public constructor(name: string, parent: ComponentOwner, schema: any){        
        super(name, parent);

        if(!schema.type){
            u.fatal("Type is required.", this.getPath());
        }
        
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
                        + JSON.stringify(this.data, null, 4),
                        this.getPath());
            }
            return false;
        }else if(expectedType !== undefined){
            let value = jsonPointer.get(this.data, path);
            if(!u.testType(value, expectedType)){
                if(withError){
                    u.fatal("Incorrect type."
                        + (opDescr ? "\n" + opDescr : "")
                        + "\nExpected type: "
                        + u.getTypeName(expectedType)
                        + "\nActual type: "
                        + u.getTypeNameFromValue(value),
                        this.getPath());
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
        if(this.getModel().getValidator().validate(this.getPath(), value)){
            return true;
        }else if(withError){
            u.fatal("Validation failed."
                    + (opDescr ? "\n" + opDescr : "")
                    + "\nValidated value: " 
                    + JSON.stringify(value, null, 4)
                    + "\nValidation schema: "
                    + JSON.stringify(this.schema, null, 4),
                    this.getPath());
        }
        return false;
    }

    protected getOperationString(operation: string, path: string, value: any = undefined){
        return "Operation: " + operation
                + (value !== undefined ? "\nValue: " + JSON.stringify(value, null, 4) : "")
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
        u.fatal("Invalid operation.\n" + opStr, this.getPath());
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
                    }else{
                        copy = value;
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
                    }else{
                        copy = value;
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
                u.fatal("Invalid operation.\n" + opStr, this.getPath());
                break;
        }        
    }
}

export class Data extends WritableData {
    public constructor(name: string, parent: ComponentOwner, schema: any){        
        super(name, parent, schema);        
    }
}

export class Input extends WritableData {    
    public constructor(parent: ComponentOwner, schema: any){        
        super("input", parent, schema);        
    }
}

export class Output extends WritableData {     
    public constructor(parent: ComponentOwner, schema: any){        
        super("output", parent, schema);        
    }
}

export class UriVariable extends WritableData {    
    public constructor(name: string, parent: ComponentOwner, schema: any){        
        super(name, parent, schema);        
    }
}

export class CompoundData extends Entity {
 
    private originalDataStr: string = undefined;
    private resolvedData: any = undefined;    
    
    private resolvedOnce: boolean = false;

    private pathResolver: PathResolver = undefined;

    public constructor(name: string, parent: Entity, jsonObj: any){    
        super(name, parent);  

        this.originalDataStr = JSON.stringify(jsonObj);

        let pathResolver = new PathResolver("pathResolver", this);
        if(pathResolver.isComposite(this.originalDataStr)){
            this.pathResolver = pathResolver;
        }
    }

    private resolve(){
        if(!this.pathResolver && this.resolvedOnce){
            return;
        }
        if(this.pathResolver){
            try{
                this.resolvedData = JSON.parse(this.pathResolver.resolvePointers(this.originalDataStr));
            }catch(err){
                u.fatal("Could not resolve compound data: " + err.message, this.getPath());
            }
        }else{
            this.resolvedData = JSON.parse(this.originalDataStr);
        }
        this.resolvedOnce = true;
    }

    public getValue(): any {
        this.resolve();
        return this.resolvedData;
    }
}
