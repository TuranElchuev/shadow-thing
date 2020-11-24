import {
    EntityFactory,
    InteractionAffordance,
    InteractionEvent,
    EntityOwner,
    EntityType,
    Input,
    Output,
    WriteOp
} from "../index";


export class Action extends InteractionAffordance {

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Action, name, parent);

        if(jsonObj.input){
            this.input = EntityFactory.makeEntity(EntityType.Input, "input", jsonObj.input, this) as Input;
        }            

        if(jsonObj.output){
            this.output = EntityFactory.makeEntity(EntityType.Output, "output", jsonObj.output, this) as Output;
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

    public invoke(uriVars: object, input: any) {

        this.parseUriVariables(uriVars);        

        if(this.input && input != undefined){
            this.input.write(WriteOp.copy, input);
        }
                
        this.onInteractionEvent(InteractionEvent.invokeAction);
    }
}