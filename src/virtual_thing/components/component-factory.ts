import {
    VirtualThingModel,
    Component,
    ComponentOwner,
    ComponentType,
    Property,
    Action,
    Event,
    Sensor,
    Actuator,  
    Data,
    Input,
    Output,
    UriVariable,
    Process,
    u
} from "../index"

export class ComponentFactory {

    public static parseComponentMap(jsonObj: object, componentType: ComponentType, owner: ComponentOwner): Map<string, Component> {
        let map: Map<string, Component> = new Map();
        if(jsonObj){
            for (const [key, value] of Object.entries(jsonObj)){
                map.set(key, this.makeComponent(componentType, key, value, owner));
            }            
        }    
        return map;
    }

    public static makeComponent(comonentType: ComponentType, name: string, jsonObj: any, owner: ComponentOwner): Component {
        if(jsonObj == undefined){
            return undefined;
        }
        
        switch(comonentType){
            case ComponentType.Property:
                return new Property(name, jsonObj, owner);
            case ComponentType.Action:
                return new Action(name, jsonObj, owner);
            case ComponentType.Event:
                return new Event(name, jsonObj, owner);
            case ComponentType.Sensor:
                return new Sensor(name, jsonObj, owner);
            case ComponentType.Actuator:
                return new Actuator(name, jsonObj, owner);
            case ComponentType.Process:
                return new Process(name, jsonObj, owner);
            case ComponentType.Data:
                return new Data(name, jsonObj, owner);
            case ComponentType.Input:
                return new Input(jsonObj, owner);
            case ComponentType.Output:
                return new Output(jsonObj, owner);
            case ComponentType.UriVariable:
                return new UriVariable(name, jsonObj, owner);
            case ComponentType.Model:
                return new VirtualThingModel(name, jsonObj);
            default:
                u.fatal(`Can't make a component of type: ${comonentType}`);
        }

        return undefined;
    }
}
