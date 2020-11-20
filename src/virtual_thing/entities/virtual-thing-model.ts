import {
    EntityFactory,
    Entity,
    EntityOwner,
    EntityType
} from "../index";

export class VirtualThingModel extends EntityOwner {
        
    private properties: Map<string, Entity> = new Map();
    private actions: Map<string, Entity> = new Map();
    private events: Map<string, Entity> = new Map();
    private sensors: Map<string, Entity> = new Map();
    private actuators: Map<string, Entity> = new Map();
    private dataMap: Map<string, Entity> = new Map();
    private processes: Map<string, Entity> = new Map();

    public constructor(name: string, jsonObj: any) {

        super(EntityType.Model, name);

        this.properties = EntityFactory.parseEntityMap(jsonObj?.properties, EntityType.Property, this);
        this.actions = EntityFactory.parseEntityMap(jsonObj?.actions, EntityType.Action, this);
        this.events = EntityFactory.parseEntityMap(jsonObj?.events, EntityType.Event, this);
        this.sensors = EntityFactory.parseEntityMap(jsonObj?.sensors, EntityType.Sensor, this);
        this.actuators = EntityFactory.parseEntityMap(jsonObj?.actuators, EntityType.Actuator, this);
        this.dataMap = EntityFactory.parseEntityMap(jsonObj?.dataMap, EntityType.Data, this);
        this.processes = EntityFactory.parseEntityMap(jsonObj?.processes, EntityType.Process, this);        
    }
        
    public getChildEntity(type: string, name: string): any {
        let entity = undefined;
        switch(type){
            case EntityType.Property:
                entity = this.properties.get(name);
                break;
            case EntityType.Action:
                entity = this.actions.get(name);
                break;
            case EntityType.Event:
                entity = this.events.get(name);
                break;
            case EntityType.Sensor:
                entity = this.sensors.get(name);
                break;
            case EntityType.Actuator:
                entity = this.actuators.get(name);
                break;
            case EntityType.Process:
                entity = this.processes.get(name);
                break;
            case EntityType.Data:
                entity = this.dataMap.get(name);
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(entity == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return entity;
    }
}