import {
    ComponentFactory,
    Component,
    ComponentOwner,
    ComponentType,
    Rate,
    Pointer
} from "../index";

const Ajv = require('ajv');


export class VirtualThingModel extends ComponentOwner {

    private ajv = new Ajv();

    private autonomousRates: Rate[] = [];
    private pointersToValidate: Pointer[] = [];
        
    private properties: Map<string, Component> = new Map();
    private actions: Map<string, Component> = new Map();
    private events: Map<string, Component> = new Map();
    private sensors: Map<string, Component> = new Map();
    private actuators: Map<string, Component> = new Map();
    private dataMap: Map<string, Component> = new Map();
    private processes: Map<string, Component> = new Map();

    public constructor(name: string, jsonObj: any) {

        super(name, undefined);

        if(jsonObj.properties){
            this.properties = ComponentFactory.parseComponentMap(ComponentType.Property, "properties", this, jsonObj.properties);
        }
        if(jsonObj.actions){
            this.actions = ComponentFactory.parseComponentMap(ComponentType.Action, "actions", this, jsonObj.actions);
        }
        if(jsonObj.events){
            this.events = ComponentFactory.parseComponentMap(ComponentType.Event, "events", this, jsonObj.events);
        }
        if(jsonObj.sensors){
            this.sensors = ComponentFactory.parseComponentMap(ComponentType.Sensor, "sensors", this, jsonObj.sensors);
        }
        if(jsonObj.actuators){
            this.actuators = ComponentFactory.parseComponentMap(ComponentType.Actuator, "actuators", this, jsonObj.actuators);
        }
        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.Data, "dataMap", this, jsonObj.dataMap);
        }
        if(jsonObj.processes){
            this.processes = ComponentFactory.parseComponentMap(ComponentType.Process, "processes", this, jsonObj.processes);
        }        
        
        this.validatePointers();
    }
        
    public getChildComponent(type: string, name: string): any {
        let component = undefined;
        switch(type){
            case ComponentType.Property:
                component = this.properties ? this.properties.get(name) : undefined;
                break;
            case ComponentType.Action:
                component = this.actions ? this.actions.get(name) : undefined;
                break;
            case ComponentType.Event:
                component = this.events ? this.events.get(name) : undefined;
                break;
            case ComponentType.Sensor:
                component = this.sensors ? this.sensors.get(name) : undefined;
                break;
            case ComponentType.Actuator:
                component = this.actuators ? this.actuators.get(name) : undefined;
                break;
            case ComponentType.Process:
                component = this.processes ? this.processes.get(name) : undefined;
                break;
            case ComponentType.Data:
                component = this.dataMap ? this.dataMap.get(name) : undefined;
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(component == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return component;
    }

    private validatePointers(){
        for(const pointer of this.pointersToValidate){
            pointer.validate();
        }
    }

    public getValidator(){
        return this.ajv;
    }

    public registerPeriodicTriggerRate(rate: Rate){
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