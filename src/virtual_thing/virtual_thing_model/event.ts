import {
    VirtualThingModel,
    VTModelComponent,
    Invokeable,
    HasUriVariables,
    CompoundData,
    Pointer,
    DataMap
} from "../index";

export class Event extends VTModelComponent implements Invokeable, HasUriVariables {

    public constructor(model: VirtualThingModel, jsonObj: any){
        super(jsonObj, model);
    }

    public async invoke(input: CompoundData, output: Pointer = undefined){
    }

    public getUriVariables(): DataMap {
        return undefined;
    }
}