import {
    InteractionAffordance,
    InteractionEvent,
    EntityFactory,
    EntityOwner,
    EntityType,
    Data
} from "../index";
import { WriteOp } from "./data";

export class Event extends InteractionAffordance {

    private data: Data = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Event, name, parent);

        if(jsonObj.data){
            this.data = EntityFactory.makeEntity(EntityType.Input, "data", jsonObj.data, this) as Data;
        } 
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
            case EntityType.UriVariable:
                entity = this.uriVariables ? this.uriVariables.get(name) : undefined;
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
        if(this.data && data !== undefined){
            this.data.write(WriteOp.copy, data);
        }

        this.onInteractionEvent(InteractionEvent.fireEvent);
    }
}