import {
    Process,
    Rate,
    Expression,
    Pointer,
    EntityType,
    InteractionAffordance,
    InteractionEvent
} from "../index";


export class Trigger {

    private process: Process = undefined;
    
    private interactionEvent: InteractionEvent = undefined;
    private interactionAffordanceName: string = undefined;
    private rate: Rate = undefined;
    private condition: Expression = undefined;
    
    public constructor(jsonObj: any, process: Process){
        this.process = process;
        
        if(jsonObj.rate){
            this.rate = new Rate(this.process, jsonObj.rate, true);
        }else{
            this.interactionEvent = jsonObj.interactionEvent;
            this.interactionAffordanceName = jsonObj.interactionAffordanceName;
        }
        if(jsonObj.condition){
            this.condition = new Expression(this.process, jsonObj.condition);
        }        

        this.setup();
    }

    private setup(){

        if(this.rate){

            this.rate.addTrigger(this);

        }else{
            
            let entityType: EntityType = undefined;

            switch(this.interactionEvent){
                case InteractionEvent.readProperty:
                case InteractionEvent.writeProperty:
                    entityType = EntityType.Property;
                    break;
                case InteractionEvent.invokeAction:
                    entityType = EntityType.Action;
                    break;
                case InteractionEvent.fireEvent:
                    entityType = EntityType.Event;
                    break;
                default:
                    return;
            }

            let iaEntity = new Pointer("/" + entityType + "/" + this.interactionAffordanceName,
                                        this.process,
                                        [InteractionAffordance]).readValue();
            iaEntity.registerTrigger(this.interactionEvent, this);
        }
    }

    public invoke(){
        if(!this.condition || this.condition.evaluate()){
            this.process.invoke();
        }        
    }
}
