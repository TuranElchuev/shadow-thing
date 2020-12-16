import {
    VirtualThingModel,
    Component,
    ComponentOwner,
    ComponentType,
    ComponentMap,
    Property,
    Action,
    Event,
    Sensor,
    Actuator,
    Process,
    u,
    DataHolder,
    Data
} from "../common/index"


export class ComponentFactory {

    public static parseComponentMap(componentType: ComponentType,
                                    name: string,
                                    parent: ComponentOwner,
                                    jsonObj: object): ComponentMap {
        let componentMap = new ComponentMap(name, parent);        
        if(jsonObj){
            for (let key in jsonObj){
                componentMap.addComponent(this.makeComponent(componentType, key, componentMap, jsonObj[key]));
            }            
        }    
        return componentMap;
    }

    public static makeComponent(comonentType: ComponentType,
                                name: string,
                                parent: ComponentOwner,
                                jsonObj: any): Component {

        if(jsonObj == undefined){
            return undefined;
        }
        
        switch(comonentType){
            case ComponentType.Properties:
                return new Property(name, parent, jsonObj);
            case ComponentType.Actions:
                return new Action(name, parent, jsonObj);
            case ComponentType.Events:
                return new Event(name, parent, jsonObj);
            case ComponentType.Sensors:
                return new Sensor(name, parent, jsonObj);
            case ComponentType.Actuators:
                return new Actuator(name, parent, jsonObj);
            case ComponentType.Processes:
                return new Process(name, parent, jsonObj);
            case ComponentType.DataMap:
                return DataHolder.getInstance(name, parent, jsonObj);
            case ComponentType.UriVariables:
            case ComponentType.Input:
            case ComponentType.Output:
                return new Data(name, parent, jsonObj);
            case ComponentType.Model:
                return new VirtualThingModel(name, jsonObj);
            default:
                u.fatal(`Can't make a component of type: ${comonentType}`, "Component factory");
        }

        return undefined;
    }
}
