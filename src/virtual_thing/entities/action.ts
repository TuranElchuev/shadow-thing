import {
    EntityOwner,
    EntityType,
    Invokable
} from "../index";

export class Action extends Invokable {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Action, name, parent);

    }

    public getChildEntity(container: string, name: string) {

    }
}