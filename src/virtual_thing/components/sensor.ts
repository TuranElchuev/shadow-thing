import {
    ComponentOwner,
    Hardware,
    IVtdSensor,
    Component,
    ComponentType
} from "../common/index";


export class Sensor extends Hardware {

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdSensor){
        super(name, parent, jsonObj);
    }

    public getChildComponent(name: string): Component {

        let component = undefined;
        
        switch(name){
            case ComponentType.Processes:
                component = this.processes;
                break;
            case ComponentType.DataMap:
                component = this.dataMap;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(name);
        }
        return component;
    }
}