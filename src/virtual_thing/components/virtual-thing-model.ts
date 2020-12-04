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
    Property,
    Action,
    Event,
    u
} from "../index";

const Servient = require('@node-wot/core').Servient;
const Helpers = require('@node-wot/core').Helpers;
const HttpClientFactory = require('@node-wot/binding-http').HttpClientFactory;

const Ajv = require('ajv');

export interface ModelStateListener {
    onModelFailed(message: string): void;
    onModelStartIssued(): void;
    onModelStopIssued(): void;
}

export class VirtualThingModel extends ComponentOwner {

    private ajv = new Ajv();

    private consumedThings: Map<string, WoT.ExposedThing> = new Map();

    private stateListeners: ModelStateListener[] = [];
    private pointersToValidate: Pointer[] = [];
    private periodicTriggerIntervals: Interval[] = [];    
    private onStartupTriggers: Trigger[] = [];   
    private onShutdownTriggers: Trigger[] = [];
    private registeredProcesses: Process[] = [];
    private registeredTriggers: Trigger[] = [];
        
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
    }
    
    public bindToThing(thing: WoT.ExposedThing){        
        try{
            for (let propName in thing.getThingDescription().properties) {
                const property = this.getChildComponent(ComponentType.Property, propName) as Property;
                if (thing.getThingDescription().properties[propName].writeOnly !== true) {
                    thing.setPropertyReadHandler(propName, 
                        (options?) => property.onRead(options));
                }
                if (thing.getThingDescription().properties[propName].readOnly !== true) { 
                    thing.setPropertyWriteHandler(propName, 
                        (value, options?) => property.onWrite(value, options));
                }
            }
            for (let actionName in thing.getThingDescription().actions) {
                const action = this.getChildComponent(ComponentType.Action, actionName) as Action;
                thing.setActionHandler(actionName,
                    (params, options?) => action.onInvoke(params, options));
            }
            for (let eventName in thing.getThingDescription().events) {
                const event = this.getChildComponent(ComponentType.Event, eventName) as Event;
                event.setThing(thing);
            }
        }catch(err){
            u.fatal("Failed to bind Thing: " + err.message, this.getFullPath());
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

    public addModelStateListener(listener: ModelStateListener){
        if(!this.stateListeners.includes(listener)){
            this.stateListeners.push(listener);
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

    public registerTrigger(trigger: Trigger){
        if(!this.registeredTriggers.includes(trigger)){
            this.registeredTriggers.push(trigger);
        }
    }

    public registerPointerForValidation(pointer: Pointer){
        if(!this.pointersToValidate.includes(pointer)){
            this.pointersToValidate.push(pointer);
        }
    }

    public async start(){        
        try{
            for(let listener of this.stateListeners){
                listener.onModelStartIssued();
            }
            for(const pointer of this.pointersToValidate){
                pointer.validate();
            }
            for(let process of this.registeredProcesses){
                process.setup();
            }  
            for(let trigger of this.registeredTriggers){
                trigger.setup();
            }
            for(let interval of this.periodicTriggerIntervals){
                interval.start();
            }
            for(let trigger of this.onStartupTriggers){
                trigger.invoke();
            }
        }catch(err){
            u.modelFailure(err.message, this);
        }
    }

    public async stop(){
        try{ 
            for(let listener of this.stateListeners){
                listener.onModelStopIssued();
            } 
            for(let interval of this.periodicTriggerIntervals){
                interval.stop();
            }
            for(let trigger of this.onShutdownTriggers){
                await trigger.invoke();
            }
            for(let proc of this.registeredProcesses){
                proc.abort();
            }           
        }catch(err){
            u.error(err.message, this.getFullPath());
        }       
    }

    public failure(reason: string){
        for(let listener of this.stateListeners){
            listener.onModelFailed(reason);
        }
        this.stop();
    } 

    public async getConsumedThing(uri: string): Promise<WoT.ConsumedThing> {
        if(!this.consumedThings.has(uri)){
            try{
                let servient = new Servient();
                servient.addClientFactory(new HttpClientFactory(null));
                let wotHelper = new Helpers(servient);
    
                let TD = await wotHelper.fetch(uri);
                let WoT = await servient.start();                
                let consumedThing = await WoT.consume(TD);

                this.consumedThings.set(uri, consumedThing);
            }catch(err){
                u.fatal("Failed to consume thing: " + uri, this.getRelativePath());
            }
        }
        return this.consumedThings.get(uri);
    }
}