import {
    EntityFactory,
    VirtualThingModel,
    Process,
    Data,
    u
} from "../index";

export enum EntityType {
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

export abstract class Entity {

    private path: string = undefined;
    private name: string = undefined;
    private parent: EntityOwner = undefined;
    private type: EntityType = undefined;

    public constructor(type: EntityType, name: string, parent: EntityOwner = undefined){

        this.type = type;
        this.name = name;
        this.parent = parent;

        if(!parent){
            if(this instanceof VirtualThingModel){
                this.path = "";
            }else{
                u.fatal(`Entity "${name}" must be either of type VirtualThingModel or have a parent`, this.getGlobalPath());
            }
        }else{
            this.path = parent.getPath() + this.getRelativePath();
        }
    }

    private getRelativePath(): string {
        switch(this.getType()){
            case EntityType.Property:
            case EntityType.Action:
            case EntityType.Event:
            case EntityType.Sensor:
            case EntityType.Actuator:
            case EntityType.Data:
            case EntityType.Process:
            case EntityType.UriVariable:
                return "/" + this.getType() + "/" + this.getName();
            case EntityType.Input:
            case EntityType.Output:
                return "/" + this.getType();
            default:
                return "";
        }
    }

    public getModel() : VirtualThingModel {
        if(this instanceof VirtualThingModel){
            return this;
        }else{
            let root = this.getParent();
            while(root.getParent() != undefined){
                root = root.getParent();
            }
            if(root instanceof VirtualThingModel){
                return root;
            }else{
                u.fatal(`Entity "${root.getPath()}" must be either of type VirtualThingModel or have a parent`, this.getGlobalPath());
            }            
        }
        return undefined;
    }

    public getParent(): EntityOwner {
        return this.parent;
    }

    public getPath(): string {
        return this.path;
    }

    public getName(): string {
        return this.name;
    }

    public getGlobalPath(): string {
        return this.getModel().getName() + this.getPath();
    }

    public getType(): EntityType {
        return this.type;
    }
}

export abstract class EntityOwner extends Entity {
    
    abstract getChildEntity(container: string, name: string);

    protected errInvalidChildType(type: string){
        u.fatal(`This entity can't have child entities of type: "${type}"`, this.getGlobalPath());
    }

    protected errChildDoesNotExist(type: string, name: string){
        u.fatal(`Child entity does not exist: "/${type}/${name}"`, this.getGlobalPath());
    }
}

export abstract class Behavior extends EntityOwner {

    protected dataMap: Map<string, Data> = undefined;
    protected processes: Map<string, Process> = undefined;

    public constructor(jsonObj: any, type: EntityType, name: string, parent: EntityOwner){
        super(type, name, parent);

        if(jsonObj.dataMap){
            this.dataMap = EntityFactory.parseEntityMap(jsonObj.dataMap, EntityType.Data, this) as Map<string, Data>;
        }            
        
        if(jsonObj.processes){
            this.processes = EntityFactory.parseEntityMap(jsonObj.processes, EntityType.Process, this) as Map<string, Process>;
        }            
    }
}

export abstract class Hardware extends Behavior {

}