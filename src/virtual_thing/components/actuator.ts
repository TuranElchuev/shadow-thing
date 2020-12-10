import {
    IVtdActuator,
    ComponentOwner,
    Hardware
} from "../common/index";


export class Actuator extends Hardware {

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdActuator){        
        super(name, parent, jsonObj);
    }
}