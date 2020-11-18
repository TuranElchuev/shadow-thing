import {
    Sensor,
    Actuator,
    Property,
    Action,
    Event,
    DataMap,
    Processes,
    HasDataMap,
    HasProcesses
} from "../index";

export class VTModelComponent implements HasDataMap, HasProcesses {

    protected model: VirtualThingModel = undefined;
    
    protected dataMap: DataMap = undefined;
    protected processes: Processes = undefined;
    
    public constructor(jsonObj: any, model:VirtualThingModel = undefined){

        this.model = model;

        if(jsonObj?.dataMap != undefined)
            this.dataMap = new DataMap(jsonObj.dataMap);

        if(jsonObj?.processes != undefined)
            this.processes = new Processes(jsonObj.processes, this);
    }

    public getModel() {
        return this.model;
    }

    public getDataMap() {
        return this.dataMap;
    }

    public getProcesses() {
        return this.processes;
    }
}

export class VirtualThingModel extends VTModelComponent {

    private dataSchemas: Map<string, Object> = new Map();
    private properties: Map<string, Property> = new Map();
    private actions: Map<string, Action> = new Map();
    private events: Map<string, Event> = new Map();
    private sensors: Map<string, Sensor> = new Map();
    private actuators: Map<string, Actuator> = new Map();

    public constructor(jsonObj: any) {

        super(jsonObj);

        this.model = this;

        if(jsonObj?.dataSchemas != undefined)
            for (const [key, value] of Object.entries(jsonObj.dataSchemas))
                this.dataSchemas.set(key, value);
        
        if(jsonObj?.properties != undefined)
            for (const [key, value] of Object.entries(jsonObj.properties))
                this.properties.set(key, new Property(this, value));
        
        if(jsonObj?.actions != undefined)
            for (const [key, value] of Object.entries(jsonObj.actions))
                this.actions.set(key, new Action(this, value));
        
        if(jsonObj?.events != undefined)
            for (const [key, value] of Object.entries(jsonObj.events))
                this.events.set(key, new Event(this, value));
        
        if(jsonObj?.sensors != undefined)
            for (const [key, value] of Object.entries(jsonObj.sensors))
                this.sensors.set(key, new Sensor(this, value));
        
        if(jsonObj?.actuators != undefined)
            for (const [key, value] of Object.entries(jsonObj.actuators))
                this.actuators.set(key, new Actuator(this, value));
    }
    
    public getProperty(name: string): Property {
        return this.properties.get(name);
    }
    
    public getAction(name: string): Action {
        return this.actions.get(name);
    }
    
    public getEvent(name: string): Event {
        return this.events.get(name);
    }
    
    public getSensor(name: string): Sensor {
        return this.sensors.get(name);
    }
    
    public getActuator(name: string): Actuator {
        return this.actuators.get(name);
    }
}