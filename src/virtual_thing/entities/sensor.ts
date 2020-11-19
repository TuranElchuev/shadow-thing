import {
    EntityType,
    EntityOwner
} from "../index";

export class Sensor extends EntityOwner {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Sensor, name, parent);
    }

    public getChildEntity(container: string, name: string) {

    }
}