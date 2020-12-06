import * as jsonPointer from 'json-pointer';
import * as jsonInstantiator from 'json-schema-instantiator';

import {
    IVtdDataSchema,
    ComponentOwner,
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
    pushCopy = "pushCopy",
    concat = "concat"
}

export abstract class DataHolder extends Component {

    protected data: any = undefined;
    private readonly schema: IVtdDataSchema = undefined;

    public constructor(name: string, parent: ComponentOwner, schema: IVtdDataSchema){        
        super(name, parent);

        this.schema = schema;

        this.getModel().getValidator().addSchema(this.schema, this.getFullPath());

        this.reset();        
    }

    public reset(){
        if(this.schema.type){
            this.data = jsonInstantiator.instantiate(this.schema);        
        }else{
            this.data = this.schema.default;
        }        
    }
    
    public hasEntry(path: string, expectedType: any = undefined, withError: boolean = false, opDescr: string = undefined): boolean {
        if(!jsonPointer.has(this.data, path)){
            if(withError){
                u.fatal("No such entry."
                        + (opDescr ? "\n" + opDescr : "")
                        + "\nData: \n"
                        + JSON.stringify(this.data, null, 4),
                        this.getFullPath());
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
                        this.getFullPath());
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
        if(this.getModel().getValidator().validate(this.getFullPath(), value)){
            return true;
        }else if(withError){
            u.fatal("Validation failed: " + (opDescr ? "\n" + opDescr : "")
                + "\n" + this.getModel().getValidator().errorsText(),
                this.getFullPath());
        }
        return false;
    }

    protected getOperationString(operation: string, path: string, value: any = undefined){
        return "Operation: " + operation
                + (value !== undefined ? "\nValue: " + JSON.stringify(value, null, 4) : "")
                + "\nPath: " + (path === '' ? "root" : path);
    }
}

export abstract class ReadableData extends DataHolder {

    public read(operation: ReadOp, path: string = ""){  
        
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
        u.fatal("Invalid operation.\n" + opStr, this.getFullPath());
    }

    protected copy(value: any){
        if(value === undefined){
            return undefined;
        }else{
            return JSON.parse(JSON.stringify(value));
        }        
    }
}

export abstract class WritableData extends ReadableData {
   
    private isRootPath(path: string): boolean {
        return !path || path.trim().length == 0;
    }

    public write(operation: WriteOp, value: any, path: string = ""){

        // TODO Make property level validation rather than making a bulk copy and validating it entirely
        let copy: any = undefined;
        let opStr = this.getOperationString(operation, path, value);

        switch(operation){
            case WriteOp.set:
                if(this.hasEntry(path, undefined, true, opStr)){
                    copy = this.copy(this.data);
                    if(this.isRootPath(path)){
                        copy = value;                        
                    }else{
                        jsonPointer.set(copy, path, value);
                    }                    
                    if(this.validate(copy, true, opStr)){
                        if(this.isRootPath(path)){                            
                            this.data = value;
                        }else{
                            jsonPointer.set(this.data, path, value);                            
                        }
                    }
                }    
                break;
            case WriteOp.copy:
                if(this.hasEntry(path, undefined, true, opStr)){
                    copy = this.copy(this.data);
                    if(this.isRootPath(path)){
                        copy = value;
                    }else{
                        jsonPointer.set(copy, path, value);
                    }
                    if(this.validate(copy, true, opStr)){
                        if(this.isRootPath(path)){                            
                            this.data = this.copy(value);
                        }else{
                            jsonPointer.set(this.data, path, this.copy(value));
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
            case WriteOp.concat:
                if(this.hasEntry(path, String, true, opStr)){
                    copy = this.copy(this.data);
                    let targetValue = jsonPointer.get(copy, path) + value;
                    if(this.isRootPath(path)){
                        copy = targetValue;
                    }else{
                        jsonPointer.set(copy, path, targetValue);
                    }
                    if(this.validate(copy, true, opStr)){
                        if(this.isRootPath(path)){                        
                            this.data = targetValue;
                        }else{    
                            jsonPointer.set(this.data, path, targetValue);
                        }
                    }
                }    
                break;
            default:
                u.fatal("Invalid operation.\n" + opStr, this.getFullPath());
                break;
        }        
    }
}

export class Data extends WritableData {
    public constructor(name: string, parent: ComponentOwner, schema: IVtdDataSchema){        
        super(name, parent, schema);        
    }
}

export class Input extends WritableData {    
    public constructor(parent: ComponentOwner, schema: IVtdDataSchema){        
        super("input", parent, schema);        
    }
}

export class Output extends WritableData {     
    public constructor(parent: ComponentOwner, schema: IVtdDataSchema){        
        super("output", parent, schema);        
    }
}

export class UriVariable extends WritableData {    
    public constructor(name: string, parent: ComponentOwner, schema: IVtdDataSchema){        
        super(name, parent, schema);        
    }
}
