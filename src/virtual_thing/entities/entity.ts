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

    private name: string = undefined;
    private parent: EntityOwner = undefined;
    private type: EntityType = undefined;

    public constructor(type: EntityType, name: string, parent: EntityOwner = undefined){
        this.type = type;
        this.name = name;
        this.parent = parent;
    }

    public getRoot() : VirtualThingModel {
        if(this.getParent() == undefined){
            if(this instanceof VirtualThingModel){
                return this;
            }else{
                throw new Error("Entity must be either of type VirtualThingModel or have a parent"); // TODO
            }
        }else{
            let root = this.getParent();
            while(root.getParent() != undefined){
                root = root.getParent();
            }
            if(!(root instanceof VirtualThingModel)){
                throw new Error("Entity must be either of type VirtualThingModel or have a parent"); // TODO
            }
            return root;
        }
    }

    public getParent(): EntityOwner {
        return this.parent;
    }
}

export abstract class EntityOwner extends Entity {
    public abstract getChildEntity(container: string, name: string);
}

export abstract class ReadWriteData extends Entity {
    public abstract read(path: string);
    public abstract write(path: string, value: any);
}

export abstract class ReadOnlyData extends Entity {
    public abstract read(path: string);
}

export abstract class Invokable extends EntityOwner {
}