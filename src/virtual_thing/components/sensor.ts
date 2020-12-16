import {
    ComponentOwner,
    Hardware,
    IVtdSensor,
    Component,
    ComponentType
} from "../common/index";


/** Class that represents a Sensor in Virtual Thing Description. */
export class Sensor extends Hardware {

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdSensor){
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