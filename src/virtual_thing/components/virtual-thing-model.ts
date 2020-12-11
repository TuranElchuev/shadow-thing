import {
    IVirtualThingDescription,
    ComponentFactory,
    Component,
    ComponentOwner,
    ComponentType,
    ComponentMap,
    Interval,
    Pointer,
    Trigger,
    Process,
    Property,
    Action,
    u
} from "../common/index";

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

    private exposedThing: WoT.ExposedThing = undefined;
    private consumedThings: Map<string, WoT.ConsumedThing> = new Map();

    private stateListeners: ModelStateListener[] = [];
    private pointers: Pointer[] = [];
    private periodicTriggerIntervals: Interval[] = [];    
    private onStartupTriggers: Trigger[] = [];   
    private onShutdownTriggers: Trigger[] = [];
    private registeredProcesses: Process[] = [];
    private registeredTriggers: Trigger[] = [];
        
    private properties: ComponentMap = undefined;
    private actions: ComponentMap = undefined;
    private events: ComponentMap = undefined;
    private sensors: ComponentMap = undefined;
    private actuators: ComponentMap = undefined;
    private dataMap: ComponentMap = undefined;
    private processes: ComponentMap = undefined;

    public constructor(name: string, jsonObj: IVirtualThingDescription) {

        super(name, undefined);

        if(jsonObj.properties){
            this.properties = ComponentFactory.parseComponentMap(ComponentType.Properties, "properties", this, jsonObj.properties);
        }
        if(jsonObj.actions){
            this.actions = ComponentFactory.parseComponentMap(ComponentType.Actions, "actions", this, jsonObj.actions);
        }
        if(jsonObj.events){
            this.events = ComponentFactory.parseComponentMap(ComponentType.Events, "events", this, jsonObj.events);
        }
        if(jsonObj.sensors){
            this.sensors = ComponentFactory.parseComponentMap(ComponentType.Sensors, "sensors", this, jsonObj.sensors);
        }
        if(jsonObj.actuators){
            this.actuators = ComponentFactory.parseComponentMap(ComponentType.Actuators, "actuators", this, jsonObj.actuators);
        }
        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.DataMap, "dataMap", this, jsonObj.dataMap);
        }
        if(jsonObj.processes){
            this.processes = ComponentFactory.parseComponentMap(ComponentType.Processes, "processes", this, jsonObj.processes);
        }                
    }
    
    public bindToThing(thing: WoT.ExposedThing){
        this.exposedThing = thing;
        try{
            for (let propName in thing.getThingDescription().properties) {
                const property = this.properties.getChildComponent(propName) as Property;
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
                const action = this.actions.getChildComponent(actionName) as Action;
                thing.setActionHandler(actionName,
                    (params, options?) => action.onInvoke(params, options));
            }
        }catch(err){
            u.fatal("Failed to bind Thing:\n" + err.message, this.getFullPath());
        }
    }

    public getExposedThing(): WoT.ExposedThing {
        return this.exposedThing;
    }

    public getChildComponent(name: string): Component {
        let component = undefined;
        switch(name){
            case ComponentType.Properties:
                component = this.properties;
                break;
            case ComponentType.Actions:
                component = this.actions;
                break;
            case ComponentType.Events:
                component = this.events;
                break;
            case ComponentType.Sensors:
                component = this.sensors;
                break;
            case ComponentType.Actuators:
                component = this.actuators;
                break;
            case ComponentType.Processes:
                component = this.processes;
                break;
            case ComponentType.DataMap:
                component = this.dataMap;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(name);
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

    public registerPointer(pointer: Pointer){
        if(!this.pointers.includes(pointer)){
            this.pointers.push(pointer);
        }
    }

    public async start(){        
        try{
            for(let listener of this.stateListeners){
                listener.onModelStartIssued();
            }
            for(const pointer of this.pointers){
                pointer.init();
            }
            for(let process of this.registeredProcesses){
                process.setup();
            }  
            for(let trigger of this.registeredTriggers){
                trigger.setup();
            }
            for(let trigger of this.onStartupTriggers){
                trigger.invoke();
            }
            for(let interval of this.periodicTriggerIntervals){
                interval.start();
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