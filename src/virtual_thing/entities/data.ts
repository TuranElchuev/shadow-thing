import * as jsonPointer from 'json-pointer';

import {
    EntityOwner,
    EntityType,
    WritableData,
    ReadableData,
    Process
} from "../index";

export class Data extends WritableData {

    protected data: any = undefined;
    protected dataSchema: object = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner) {
        super(EntityType.Data, name, parent);
        // retreive schema
        // create data instance according to schema and with default values
        // if there is no schema, expect input { "default": any }        
    }

    public read(path: string = "/"){

    }

    public write(path: string, value: any){
        // check against schema
    }

    public getSchema(): object {
        return this.dataSchema;
    }
}

export class CompoundData {
 
    private process: Process = undefined;
    
    public constructor(process: Process, jsonObj: any) {
        this.process = process;
    }
}
