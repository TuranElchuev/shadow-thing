import {
    IVirtualThingDescription,
    ComponentFactory,
    Component,
    ComponentOwner,
    ComponentType,
    Interval,
    Pointer,
    Trigger,
    Process,
    u
} from "../index";

const Ajv = require('ajv');

export interface ModelStateListener {
    onModelFailed(message: string): void;
    onModelStarted(): void;
    onModelStopped(): void;
}

export class VirtualThingModel extends ComponentOwner {

    private ajv = new Ajv();

    private stateListeners: ModelStateListener[] = [];
    private pointersToValidate: Pointer[] = [];
    private periodicTriggerIntervals: Interval[] = [];    
    private onStartupTriggers: Trigger[] = [];   
    private onShutdownTriggers: Trigger[] = [];
    private registeredProcesses: Process[] = [];
        
    private properties: Map<string, Component> = new Map();
    private actions: Map<string, Component> = new Map();
    private events: Map<string, Component> = new Map();
    private sensors: Map<string, Component> = new Map();
    private actuators: Map<string, Component> = new Map();
    private dataMap: Map<string, Component> = new Map();
    private processes: Map<string, Component> = new Map();

    public constructor(name: string, jsonObj: IVirtualThingDescription) {

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

    private validatePointers(){
        for(const pointer of this.pointersToValidate){
            pointer.validate();
        }
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

    public addModelStateListener(callback: ModelStateListener){
        if(!this.stateListeners.includes(callback)){
            this.stateListeners.push(callback);
        }
    }

    public getValidator(){
        return this.ajv;
    }

    public addOnStartupTrigger(trigger: Trigger){
        if(!this.onStartupTriggers.includes(trigger)){
            this.onStartupTriggers.push(trigger);
        }
    }

    public addOnShutdownTrigger(trigger: Trigger){
        if(!this.onShutdownTriggers.includes(trigger)){
            this.onShutdownTriggers.push(trigger);
        }
    }

    public registerProcess(process: Process){
        if(!this.registeredProcesses.includes(process)){
            this.registeredProcesses.push(process);
        }
    }

    public registerPeriodicTriggerInterval(interval: Interval){
        if(!this.periodicTriggerIntervals.includes(interval)){
            this.periodicTriggerIntervals.push(interval);
        }
    }

    public registerPointerForValidation(pointer: Pointer){
        if(!this.pointersToValidate.includes(pointer)){
            this.pointersToValidate.push(pointer);
        }
    }

    public async start(){        
        try{
            for(const interval of this.periodicTriggerIntervals){
                interval.start();
            }
            for(const listener of this.stateListeners){
                listener.onModelStarted();
            }
            for(const trigger of this.onStartupTriggers){
                trigger.invoke();
            }
        }catch(err){
            u.failure(err.message, this);
        }
    }

    public async stop(){
        try{
            for(const interval of this.periodicTriggerIntervals){
                interval.stop();
            }
            for(const trigger of this.onShutdownTriggers){
                await trigger.invoke();
            }
            for(const process of this.registeredProcesses){
                process.abort();
            } 
            for(const listener of this.stateListeners){
                listener.onModelStopped();
            }            
        }catch(err){
            u.error(err.message, this.getPath());
        }       
    }

    public failure(reason: string){
        for(const listener of this.stateListeners){
            listener.onModelFailed(reason);
        }   
    }
}