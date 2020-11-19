import {
    EntityOwner,
    EntityType,
    Invokable
} from "../index";

export class Property extends Invokable {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Property, name, parent);
    }

    public getChildEntity(container: string, name: string) {

    }
}