import {
    Process,
    Readable,
    Writable
} from "../index";
import * as pointer from 'json-pointer';

export class Data implements Readable, Writable {

    protected data: any = undefined;
    protected dataSchema: object = undefined;

    public constructor(jsonObj: any) {
        // retreive schema
        // create data instance according to schema and with default values
    }

    public write(value: any, path: string){
        if(this.data[path] != undefined)
            this.data[path] = value;        
    }

    public read(path: string): any {
        return this.data[path];
    }
}

export class CompoundData {
 
    private process: Process = undefined;
    
    public constructor(process: Process, jsonObj: any) {
        this.process = process;
    }
}

export class DataMap {
    
    protected map: Map<string, Data> = new Map();

    public constructor(jsonObj: any) {
        if(jsonObj instanceof Object)
            for (const [key, value] of Object.entries(jsonObj))
                this.map.set(key, new Data(value));
    }

    public get(name: string): Data {
        return this.map.get(name);
    }
}

export class DataSchema implements Readable {
    
    private schema: object = {};

    public constructor(jsonObj: any) {
        this.schema = jsonObj;
    }

    public read(path: string): any {
        return this.schema[path];
    }
}