import * as jsonPointer from 'json-pointer';

import {
    EntityOwner,
    EntityType,
    WritableData,
    Process,
    Pointer
} from "../index";

export class Data extends WritableData {

    protected data: any = undefined;
    protected dataSchema: object = undefined;

    public constructor(name: string, schema: object, parent: EntityOwner, initialValue: any = undefined) {
        super(EntityType.Data, name, parent);
        // retreive schema
        // create data instance according to schema and with default values if there is no initial value
        // if there is no schema, expect input { "default": any }        
    }

    public read(path: string = "/"){

    }

    public write(value: any, path: string = "/"){
        // check against schema
    }


    public getSchema(): object {
        return this.dataSchema;
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
