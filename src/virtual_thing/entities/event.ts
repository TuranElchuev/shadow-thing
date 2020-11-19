import {
    EntityOwner,
    EntityType
} from "../index";

export class Event extends EntityOwner {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Event, name, parent);

    }

    public getChildEntity(container: string, name: string) {

    }
}