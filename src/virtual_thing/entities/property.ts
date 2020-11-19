import {
    EntityOwner,
    EntityType
} from "../index";

export class Property extends EntityOwner {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Property, name, parent);
    }

    public getChildEntity(container: string, name: string) {

    }
}