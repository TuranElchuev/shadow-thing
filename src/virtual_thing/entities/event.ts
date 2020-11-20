import {
    InteractionAffordance,
    EntityFactory,
    EntityOwner,
    EntityType,
    Data
} from "../index";

export class Event extends InteractionAffordance {

    private output: Data = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Event, name, parent);

        if(jsonObj?.data != undefined){
            this.output = EntityFactory.makeEntity(EntityType.Input, "output", jsonObj.data, this) as Data;
        } 
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
            case EntityType.UriVariable:
                entity = this.uriVariables?.get(name);
                break;
            case EntityType.Output:
                entity = this.output;
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