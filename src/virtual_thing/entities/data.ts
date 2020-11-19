import * as jsonPointer from 'json-pointer';

import {
    EntityOwner,
    EntityType,
    ReadOnlyData,
    ReadWriteData,
    Process
} from "../index";

export class Data extends ReadWriteData {

    protected data: any = undefined;
    protected dataSchema: object = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner) {
        super(EntityType.Data, name, parent);
        // retreive schema
        // create data instance according to schema and with default values
    }

    public read(path: string){

    }

    public write(path: string, value: any){

    }
}

export class DataSchema extends ReadOnlyData {

    public constructor(name: string, jsonObj: any, parent: EntityOwner) {
        super(EntityType.DataSchema, name, parent);
    }

    public read(path: string){

    }
}

export class CompoundData {
 
    private process: Process = undefined;
    
    public constructor(process: Process, jsonObj: any) {
        this.process = process;
    }
}
