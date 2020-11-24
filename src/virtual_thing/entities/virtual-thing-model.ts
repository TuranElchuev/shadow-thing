import {
    EntityFactory,
    Entity,
    EntityOwner,
    EntityType,
    Rate,
    Pointer
} from "../index";

const Ajv = require('ajv');

export class VirtualThingModel extends EntityOwner {

    private ajv = new Ajv();

    private autonomousRates: Rate[] = [];
    private pointersToValidate: Pointer[] = [];
        
    private properties: Map<string, Entity> = new Map();
    private actions: Map<string, Entity> = new Map();
    private events: Map<string, Entity> = new Map();
    private sensors: Map<string, Entity> = new Map();
    private actuators: Map<string, Entity> = new Map();
    private dataMap: Map<string, Entity> = new Map();
    private processes: Map<string, Entity> = new Map();

    public constructor(name: string, jsonObj: any) {

        super(EntityType.Model, name);

        if(jsonObj.properties){
            this.properties = EntityFactory.parseEntityMap(jsonObj.properties, EntityType.Property, this);
        }
        if(jsonObj.actions){
            this.actions = EntityFactory.parseEntityMap(jsonObj.actions, EntityType.Action, this);
        }
        if(jsonObj.events){
            this.events = EntityFactory.parseEntityMap(jsonObj.events, EntityType.Event, this);
        }
        if(jsonObj.sensors){
            this.sensors = EntityFactory.parseEntityMap(jsonObj.sensors, EntityType.Sensor, this);
        }
        if(jsonObj.actuators){
            this.actuators = EntityFactory.parseEntityMap(jsonObj.actuators, EntityType.Actuator, this);
        }
        if(jsonObj.dataMap){
            this.dataMap = EntityFactory.parseEntityMap(jsonObj.dataMap, EntityType.Data, this);
        }
        if(jsonObj.processes){
            this.processes = EntityFactory.parseEntityMap(jsonObj.processes, EntityType.Process, this);      
        }        
        
        this.validatePointers();
    }
        
    public getChildEntity(type: string, name: string): any {
        let entity = undefined;
        switch(type){
            case EntityType.Property:
                entity = this.properties ? this.properties.get(name) : undefined;
                break;
            case EntityType.Action:
                entity = this.actions ? this.actions.get(name) : undefined;
                break;
            case EntityType.Event:
                entity = this.events ? this.events.get(name) : undefined;
                break;
            case EntityType.Sensor:
                entity = this.sensors ? this.sensors.get(name) : undefined;
                break;
            case EntityType.Actuator:
                entity = this.actuators ? this.actuators.get(name) : undefined;
                break;
            case EntityType.Process:
                entity = this.processes ? this.processes.get(name) : undefined;
                break;
            case EntityType.Data:
                entity = this.dataMap ? this.dataMap.get(name) : undefined;
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(entity == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return entity;
    }

    private validatePointers(){
        for(const pointer of this.pointersToValidate){
            pointer.validate();
        }
    }

    public getValidator(){
        return this.ajv;
    }

    public registerAutonomousRate(rate: Rate){
        if(!this.autonomousRates.includes(rate)){
            this.autonomousRates.push(rate);
        }
    }

    public registerPointerForValidation(pointer: Pointer){
        if(!this.pointersToValidate.includes(pointer)){
            this.pointersToValidate.push(pointer);
        }
    }

    public start(){
        for(const rate of this.autonomousRates){
            rate.start();
        }
    }

    public stop(){
        for(const rate of this.autonomousRates){
            rate.stop();
        }
    }
}