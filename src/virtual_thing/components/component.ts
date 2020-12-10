import {
    Entity,
    IVtdBehavior,
    ComponentFactory,
    u
} from "../common/index";


export enum ComponentType {
    Model = "",
    Property = "p",
    Action = "a",
    Event = "e",
    Sensor = "sen",
    Actuator = "act",
    Data = "dmap",
    Process = "proc",
    UriVariable = "uv",
    Input = "i",
    Output = "o"
}

export abstract class Component extends Entity {    
}

export abstract class ComponentOwner extends Component {
    
    abstract getChildComponent(name: string): Component;

    protected errChildDoesNotExist(name: string){
        u.fatal(`Child component does not exist: "${name}"`, this.getFullPath());
    }
}

export abstract class Behavior extends ComponentOwner {

    protected dataMap: ComponentMap = undefined;
    protected processes: ComponentMap = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdBehavior){
        super(name, parent);

        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.Data,
                "dataMap", this, jsonObj.dataMap);
        }            
        
        if(jsonObj.processes){
            this.processes = ComponentFactory.parseComponentMap(ComponentType.Process,
                "processes", this, jsonObj.processes);
        }            
    }
}

export abstract class Hardware extends Behavior {

    public getChildComponent(name: string): Component {

        let component = undefined;
        
        switch(name){
            case ComponentType.Process:
                component = this.processes;
                break;
            case ComponentType.Data:
                component = this.dataMap;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(name);
        }
        return component;
    }
}

export class ComponentMap extends ComponentOwner {

    private map: Map<string, Component> = new Map();

    public constructor(name: string, parent: Entity, map: Map<string, Component>){
        super(name, parent);
        if(map){
            this.map = map;
        }
    }

    public getChildComponent(name: string): Component {
        let component = this.map.get(name);
        if(component === undefined){
            this.errChildDoesNotExist(name);
        }
        return component;
    }

    public getKeys(): string[] {
        return Array.from(this.map.keys());
    }
}