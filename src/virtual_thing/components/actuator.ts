import {
    IActuator,
    ComponentOwner,
    Hardware,
    Component,
    ComponentType
} from "../common/index";


/** Class that represents an Actuator in Virtual Thing Description. */
export class Actuator extends Hardware {

    public constructor(name: string, parent: ComponentOwner, jsonObj: IActuator){        
        super(name, parent, jsonObj);
    }

    public getChildComponent(type: ComponentType): Component {

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