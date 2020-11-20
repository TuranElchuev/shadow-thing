import {
    EntityFactory,
    InteractionAffordance,
    InteractionEvent,
    EntityOwner,
    EntityType,
    Data
} from "../index";


export class Action extends InteractionAffordance {

    private input: Data = undefined;
    private output: Data = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Action, name, parent);

        if(jsonObj?.input != undefined){
            this.input = EntityFactory.makeEntity(EntityType.Input, "input", jsonObj.input, this) as Data;
        }            

        if(jsonObj?.output != undefined){
            this.output = EntityFactory.makeEntity(EntityType.Output, "output", jsonObj.output, this) as Data;
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
            case EntityType.Input:
                entity = this.input;
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

    public async invoke(uriVars: object, input: any) {

        this.parseUriVariables(uriVars);        

        if(this.input != undefined){
            this.input.write(input);
        }
                
        this.onInteractionEvent(InteractionEvent.invokeAction);
    }
}