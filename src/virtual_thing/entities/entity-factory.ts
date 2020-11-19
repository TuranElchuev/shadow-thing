import {
    VirtualThingModel,
    Entity,
    EntityOwner,
    EntityType,
    Property,
    Action,
    Event,
    Sensor,
    Actuator,    
    DataSchema,
    Data,
    Process

} from "../index"

export class EntityFactory {

    public static parseEntityMap(jsonObj: object, entityType: EntityType, parent: EntityOwner): Map<string, Entity> {
        let map: Map<string, Entity> = new Map();
        if(jsonObj != undefined){
            for (const [key, value] of Object.entries(jsonObj)){
                map.set(key, this.makeEntity(entityType, key, value, parent));
            }            
        }    
        return map;
    }

    public static makeEntity(entityType: EntityType, name: string, jsonObj: object, parent: EntityOwner): Entity {
        switch(entityType){
            case EntityType.Property:
                return new Property(name, jsonObj, parent);
            case EntityType.Action:
                return new Action(name, jsonObj, parent);
            case EntityType.Event:
                return new Event(name, jsonObj, parent);
            case EntityType.Sensor:
                return new Sensor(name, jsonObj, parent);
            case EntityType.Actuator:
                return new Actuator(name, jsonObj, parent);
            case EntityType.Process:
                return new Process(name, jsonObj, parent);
            case EntityType.Data:
                return new Data(name, jsonObj, parent);
            case EntityType.DataSchema:
                return new DataSchema(name, jsonObj, parent);
            case EntityType.Model:
                return new VirtualThingModel(name, jsonObj);
            default:
                throw new Error(`Can't make an entity of type: ${entityType}`);
        }
    }
}
