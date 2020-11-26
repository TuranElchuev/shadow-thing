import {
    HasGlobalPath,
    ComponentFactory,
    VirtualThingModel,
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

export abstract class Component extends HasGlobalPath {

    private owner: ComponentOwner = undefined;

    public constructor(globalPath: string, owner: ComponentOwner = undefined){        
        super(globalPath);
        this.owner = owner;
    }

    public getModel() : VirtualThingModel {
        if(this instanceof VirtualThingModel){
            return this;
        }else{
            let root = this.getOwner();
            while(root.getOwner() != undefined){
                root = root.getOwner();
            }
            if(root instanceof VirtualThingModel){
                return root;
            }else{
                u.fatal(`Component "${root.getGlobalPath()}" must be either of type VirtualThingModel or have an owner`, this.getGlobalPath());
            }            
        }
        return undefined;
    }

    public getOwner(): ComponentOwner {
        return this.owner;
    }
}

export abstract class ComponentOwner extends Component {
    
    abstract getChildComponent(container: string, name: string);

    protected errInvalidChildType(type: string){
        u.fatal(`This component can't have child components of type: "${type}"`, this.getGlobalPath());
    }

    protected errChildDoesNotExist(type: string, name: string){
        u.fatal(`Child component does not exist: "/${type}/${name}"`, this.getGlobalPath());
    }
}

export abstract class Behavior extends ComponentOwner {

    protected dataMap: Map<string, Data> = undefined;
    protected processes: Map<string, Process> = undefined;

    public constructor(jsonObj: any, globalPath: string, owner: ComponentOwner){
        super(globalPath, owner);

        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(jsonObj.dataMap, ComponentType.Data, this) as Map<string, Data>;
        }            
        
        if(jsonObj.processes){
            this.processes = ComponentFactory.parseComponentMap(jsonObj.processes, ComponentType.Process, this) as Map<string, Process>;
        }            
    }
}

export abstract class Hardware extends Behavior {

}