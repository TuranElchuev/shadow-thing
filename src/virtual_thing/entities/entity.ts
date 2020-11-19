import { VirtualThingModel } from "./virtual-thing-model";

export enum EntityType {
    Model,
    Property,
    Action,
    Event,
    Sensor,
    Actuator,
    Data,
    Process,
    UriVariable,
    Input,
    Output
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

        if(parent == undefined){
            if(this instanceof VirtualThingModel){
                this.path = "/";
            }else{
                throw new Error(`Entity "${name}" must be either of type VirtualThingModel or have a parent`); // TODO
            }
        }else{
            this.path = parent.getPath() + this.getRelativePath();
        }
    }

    private getRelativePath(): string {
        switch(this.getType()){
            case EntityType.Property:
                return "/p/" + this.getName();
            case EntityType.Action:
                return "/a/" + this.getName();
            case EntityType.Event:
                return "/e/" + this.getName();
            case EntityType.Sensor:
                return "/sen/" + this.getName();
            case EntityType.Actuator:
                return "/act/" + this.getName();
            case EntityType.Data:
                return "/dmap/" + this.getName();
            case EntityType.Process:
                return "/proc/" + this.getName();
            case EntityType.UriVariable:
                return "/uv/" + this.getName();;
            case EntityType.Input:
                return "/i";
            case EntityType.Output:
                return "/o";
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
            if(!(root instanceof VirtualThingModel)){
                throw new Error(`Entity "${root.getPath()}" must be either of type VirtualThingModel or have a parent`); // TODO
            }
            return root;
        }
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

    public getType(): EntityType {
        return this.type;
    }
}

export abstract class EntityOwner extends Entity {
    public abstract getChildEntity(container: string, name: string);
}

export abstract class DataHolder extends Entity {
    public abstract getSchema(): object;
}

export abstract class ReadableData extends DataHolder {
    public abstract read(path: string);
}

export abstract class WritableData extends ReadableData {
    public abstract write(path: string, value: any);
}