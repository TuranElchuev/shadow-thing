import {
    EntityType,
    EntityOwner,
    Hardware
} from "../index";

export class Sensor extends Hardware {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Sensor, name, parent);
    }

    public getChildEntity(type: string, name: string) {

        let entity = undefined;
        
        switch(type){
            case EntityType.Process:
                entity = this.processes?.get(name);
                break;
            case EntityType.Data:
                entity = this.dataMap?.get(name);
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(entity == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return entity;
    }
}