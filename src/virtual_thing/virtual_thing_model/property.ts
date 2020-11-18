import {
    VirtualThingModel,
    VTModelComponent,
    Readable,
    Writable,
    HasUriVariables,
    DataMap
} from "../index";

export class Property extends VTModelComponent implements Readable, Writable, HasUriVariables {

    public constructor(model: VirtualThingModel, jsonObj: any){
        super(jsonObj, model);
    }

    public async read(path: string = undefined){
        return undefined;   
    }

    public async write(value: any, path: string = undefined){

    }

    public getUriVariables(): DataMap {
        return undefined;
    }
}