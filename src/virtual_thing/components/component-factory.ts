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
    Input,
    Output,
    UriVariable,
    Process,
    u,
    DataHolder
} from "../common/index"


export class ComponentFactory {

    public static parseComponentMap(componentType: ComponentType,
                                    name: string,
                                    parent: ComponentOwner,
                                    jsonObj: object): ComponentMap {

        let map: Map<string, Component> = new Map();
        let componentMap = new ComponentMap(name, parent, map);
        
        if(jsonObj){
            for (let key in jsonObj){
                map.set(key, this.makeComponent(componentType, key, componentMap, jsonObj[key]));
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
            case ComponentType.Property:
                return new Property(name, parent, jsonObj);
            case ComponentType.Action:
                return new Action(name, parent, jsonObj)
            case ComponentType.Event:
                return new Event(name, parent, jsonObj)
            case ComponentType.Sensor:
                return new Sensor(name, parent, jsonObj)
            case ComponentType.Actuator:
                return new Actuator(name, parent, jsonObj)
            case ComponentType.Process:
                return new Process(name, parent, jsonObj)
            case ComponentType.Data:
                return DataHolder.getInstance(name, parent, jsonObj);
            case ComponentType.Input:
                return new Input(parent, jsonObj);
            case ComponentType.Output:
                return new Output(parent, jsonObj);
            case ComponentType.UriVariable:
                return new UriVariable(name, parent, jsonObj)
            case ComponentType.Model:
                return new VirtualThingModel(name, jsonObj);
            default:
                u.fatal(`Can't make a component of type: ${comonentType}`, "Component factory");
        }

        return undefined;
    }
}
