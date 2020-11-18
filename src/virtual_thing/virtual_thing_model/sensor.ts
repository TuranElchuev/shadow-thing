import { VirtualThingModel, VTModelComponent } from "../index";

export class Sensor extends VTModelComponent {

    public constructor(model: VirtualThingModel, jsonObj: any){
        super(jsonObj, model);
    }
}