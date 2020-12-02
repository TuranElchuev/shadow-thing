import {
    Entity,
    IVtdBehavior,
    ComponentFactory,
    Process,
    Data,
    u
} from "../index";


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
    
    abstract getChildComponent(container: string, name: string);

    protected errInvalidChildType(type: string){
        u.fatal(`This component can't have child components of type: "${type}"`, this.getPath());
    }

    protected errChildDoesNotExist(type: string, name: string){
        u.fatal(`Child component does not exist: "/${type}/${name}"`, this.getPath());
    }
}

export abstract class Behavior extends ComponentOwner {

    protected dataMap: Map<string, Data> = undefined;
    protected processes: Map<string, Process> = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdBehavior){
        super(name, parent);

        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.Data,
                "dataMap", this, jsonObj.dataMap) as Map<string, Data>;
        }            
        
        if(jsonObj.processes){
            this.processes = ComponentFactory.parseComponentMap(ComponentType.Process,
                "processes", this, jsonObj.processes) as Map<string, Process>;
        }            
    }
}

export abstract class Hardware extends Behavior {

}