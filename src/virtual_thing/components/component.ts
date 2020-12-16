import {
    Entity,
    IVtdBehavior,
    ComponentFactory,
    u
} from "../common/index";


export enum ComponentType {
    Model = "",
    Properties = "p",
    Actions = "a",
    Events = "e",
    Sensors = "sen",
    Actuators = "act",
    DataMap = "dmap",
    Processes = "proc",
    UriVariables = "uv",
    Input = "i",
    Output = "o",
    Data = "d",
    Subscription = "s",
    Cancellation = "c"
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
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.DataMap,
                "dataMap", this, jsonObj.dataMap);
        }            
        
        if(jsonObj.processes){
            this.processes = ComponentFactory.parseComponentMap(ComponentType.Processes,
                "processes", this, jsonObj.processes);
        }            
    }
}

export abstract class Hardware extends Behavior {    
}

export class ComponentMap extends ComponentOwner {

    // Entries of this map are the child nodes of this node in the "Entity tree"
    private map: Map<string, Component> = new Map();

    public constructor(name: string, parent: Entity){
        super(name, parent);
    }

    public addComponent(component: Component){
        if(component instanceof Component){
            this.map.set(component.getName(), component);
        }else{
            u.fatal("A child component must be of type 'Component'.");
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