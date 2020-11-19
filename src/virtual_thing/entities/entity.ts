import { VirtualThingModel } from "./virtual-thing-model";

export enum EntityType {
    Model,
    Property,
    Action,
    Event,
    Sensor,
    Actuator,
    Data,
    DataSchema,
    Process
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
                this.path = "/" + name;
            }else{
                throw new Error(`Entity "${name}" must be either of type VirtualThingModel or have a parent`); // TODO
            }
        }else{
            this.path = parent.getPath() + "/" + name;
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
}

export abstract class ReadableData extends DataHolder {
    public abstract read(path: string);
}

export abstract class WritableData extends ReadableData {
    public abstract write(path: string, value: any);
}

export abstract class Invokable extends EntityOwner {
}