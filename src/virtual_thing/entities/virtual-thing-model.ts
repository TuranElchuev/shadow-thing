import {
    EntityFactory,
    Entity,
    EntityOwner,
    EntityType,
    DateTime
} from "../index";

export class VirtualThingModel extends EntityOwner {

    private dateTime: DateTime = undefined;
        
    private properties: Map<string, Entity> = new Map();
    private actions: Map<string, Entity> = new Map();
    private events: Map<string, Entity> = new Map();
    private sensors: Map<string, Entity> = new Map();
    private actuators: Map<string, Entity> = new Map();
    private dataSchemas: Map<string, Entity> = new Map();
    private dataMap: Map<string, Entity> = new Map();
    private processes: Map<string, Entity> = new Map();

    public constructor(name: string, jsonObj: any) {

        super(EntityType.Model, name);

        this.dateTime = new DateTime();

        this.properties = EntityFactory.parseEntityMap(jsonObj?.properties, EntityType.Property, this);
        this.actions = EntityFactory.parseEntityMap(jsonObj?.actions, EntityType.Action, this);
        this.events = EntityFactory.parseEntityMap(jsonObj?.events, EntityType.Event, this);
        this.sensors = EntityFactory.parseEntityMap(jsonObj?.sensors, EntityType.Sensor, this);
        this.actuators = EntityFactory.parseEntityMap(jsonObj?.actuators, EntityType.Actuator, this);
        this.dataMap = EntityFactory.parseEntityMap(jsonObj?.dataMap, EntityType.Data, this);
        this.dataSchemas = EntityFactory.parseEntityMap(jsonObj?.dataSchemas, EntityType.DataSchema, this);
        this.processes = EntityFactory.parseEntityMap(jsonObj?.processes, EntityType.Process, this);        
    }
        
    public getChildEntity(container: string, name: string): any {
        let entity = undefined;
        switch(container){
            case "p":
                entity = this.properties.get(name);
                break;
            case "a":
                entity = this.actions.get(name);
                break;
            case "e":
                entity = this.events.get(name);
                break;
            case "sen":
                entity = this.sensors.get(name);
                break;
            case "act":
                entity = this.actuators.get(name);
                break;
            case "proc":
                entity = this.processes.get(name);
                break;
            case "dmap":
                entity = this.dataMap.get(name);
                break;
            case "dsch":
                entity = this.dataSchemas.get(name);
                break;
            case "dt":
                entity = this.dateTime;
                break;
            default:
                throw new Error(`Unknown entity type: ${container}`); // TODO                    
        }
        if(entity == undefined){
            throw new Error(`Entity does not exist: /${container}/${name}`); // TODO                    
        }
        return entity;
    }
}