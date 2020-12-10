import {
    ComponentOwner,
    Hardware,
    IVtdSensor
} from "../common/index";


export class Sensor extends Hardware {

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdSensor){
        super(name, parent, jsonObj);
    }
}