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
    ConstData,
    Input,
    Output,
    UriVariable,
    Process,
    u
} from "../index"


export class ComponentFactory {

    public static parseComponentMap(componentType: ComponentType,
                                    name: string,
                                    parent: ComponentOwner,
                                    jsonObj: object): Map<string, Component> {

        let map: Map<string, Component> = new Map();
        if(jsonObj){
            for (let key in jsonObj){
                map.set(key, this.makeComponent(componentType, name + "/" + key, parent, jsonObj[key]));
            }            
        }    
        return map;
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
                if(jsonObj.const === undefined){
                    return new Data(name, parent, jsonObj)
                }else{
                    return new ConstData(name, parent, jsonObj)
                }                
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
