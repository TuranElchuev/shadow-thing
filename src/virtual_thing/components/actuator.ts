import {
    IVtdActuator,
    ComponentOwner,
    Hardware,
    Component,
    ComponentType
} from "../common/index";


export class Actuator extends Hardware {

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdActuator){        
        super(name, parent, jsonObj);
    }

    public getChildComponent(type: string): Component {

        let component = undefined;
        
        switch(type){
            case ComponentType.Processes:
                component = this.processes;
                break;
            case ComponentType.DataMap:
                component = this.dataMap;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(type);
        }
        return component;
    }
}