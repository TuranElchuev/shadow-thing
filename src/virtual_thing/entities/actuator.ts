import {
    EntityType,
    EntityOwner
} from "../index";

export class Actuator extends EntityOwner {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Actuator, name, parent);

    }

    public getChildEntity(container: string, name: string) {

    }
}