import {
    InteractionAffordance,
    InteractionEvent,
    EntityFactory,
    EntityOwner,
    EntityType,
    Data,
    Pointer
} from "../index";

export class Property extends InteractionAffordance {

    private dataBinding: Pointer = undefined;
    private input: Data = undefined;
    private output: Data = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(jsonObj, EntityType.Property, name, parent);

        if(jsonObj?.dataBinding != undefined)
            this.dataBinding = new Pointer(jsonObj.dataBinding, this);

        if(jsonObj != undefined){
            this.input = EntityFactory.makeEntity(EntityType.Input, "input", jsonObj, this) as Data;
            this.output = EntityFactory.makeEntity(EntityType.Output, "output", jsonObj, this) as Data;
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

    public async read(uriVars: object) {

        this.parseUriVariables(uriVars);
                
        this.onInteractionEvent(InteractionEvent.readProperty);

        this.output.write(this.dataBinding?.readValue());
    }

    public async write(uriVars: object, input: any) {
        
        this.parseUriVariables(uriVars);
        this.input.write(input);
        
        this.onInteractionEvent(InteractionEvent.writeProperty);
    }
}