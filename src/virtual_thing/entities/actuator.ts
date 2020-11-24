import {
    EntityType,
    EntityOwner,
    Hardware
} from "../index";

export class Actuator extends Hardware {

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Actuator, name, parent);
    }

    public getChildEntity(type: string, name: string) {

        let entity = undefined;
        
        switch(type){
            case EntityType.Process:
                entity = this.processes ? this.processes.get(name) : undefined;
                break;
            case EntityType.Data:
                entity = this.dataMap ? this.dataMap.get(name) : undefined;
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(!entity){
            this.errChildDoesNotExist(type, name);
        }
        return entity;
    }
}