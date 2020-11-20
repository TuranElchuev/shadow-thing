import {
    InteractionAffordance,
    InteractionEvent,
    EntityFactory,
    EntityOwner,
    EntityType,
    Data
} from "../index";

export class Event extends InteractionAffordance {

    private data: Data = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Event, name, parent);

        if(jsonObj?.data != undefined){
            this.data = EntityFactory.makeEntity(EntityType.Input, "data", jsonObj.data, this) as Data;
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
            default:
                this.errInvalidChildType(type);
        }
        if(entity == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return entity;
    }

    public invoke(data: any){
        if(this.data != undefined && data != undefined){
            this.data.write(data);
        }
        // TODO fire TD event with this.data

        this.onInteractionEvent(InteractionEvent.fireEvent);
    }
}