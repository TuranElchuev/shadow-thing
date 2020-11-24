import {
    InteractionAffordance,
    InteractionEvent,
    EntityFactory,
    EntityOwner,
    EntityType,
    Input,
    Output
} from "../index";

export class Property extends InteractionAffordance {

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Property, name, parent);

        this.input = EntityFactory.makeEntity(EntityType.Input, "input", jsonObj, this) as Input;
        this.output = EntityFactory.makeEntity(EntityType.Output, "output", jsonObj, this) as Output;
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

    public read(uriVars: object) {
        this.parseUriVariables(uriVars);                
        this.onInteractionEvent(InteractionEvent.readProperty);
    }

    public write(uriVars: object, input: any) {        
        this.parseUriVariables(uriVars);        
        this.onInteractionEvent(InteractionEvent.writeProperty);
    }
}