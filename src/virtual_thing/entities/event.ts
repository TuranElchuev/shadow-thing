import {
    EntityOwner,
    EntityType,
    Invokable
} from "../index";

export class Event extends Invokable {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Event, name, parent);

    }

    public getChildEntity(container: string, name: string) {

    }
}