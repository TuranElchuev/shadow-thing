import {
    Entity,
    Process,
    Rate,
    Expression,
    Pointer,
    ComponentType,
    InteractionAffordance,
    InteractionEvent
} from "../index";


export class Trigger extends Entity {
    
    private interactionEvent: InteractionEvent = undefined;
    private interactionAffordanceName: string = undefined;
    private rate: Rate = undefined;
    private condition: Expression = undefined;
    
    public constructor(name: string, parent: Process, jsonObj: any){
        super(name, parent);
        
        if(jsonObj.rate){
            this.rate = new Rate("rate", this, jsonObj.rate, true);
        }else{
            this.interactionEvent = jsonObj.interactionEvent;
            this.interactionAffordanceName = jsonObj.interactionAffordanceName;
        }
        if(jsonObj.condition){
            this.condition = new Expression("condition", this, jsonObj.condition);
        }        

        this.setup();
    }

    private getProcess(){
        return this.getParent() as Process;
    }

    private setup(){

        if(this.rate){

            this.rate.addTrigger(this);

        }else{
            
            let component: ComponentType = undefined;

            switch(this.interactionEvent){
                case InteractionEvent.readProperty:
                case InteractionEvent.writeProperty:
                    component = ComponentType.Property;
                    break;
                case InteractionEvent.invokeAction:
                    component = ComponentType.Action;
                    break;
                case InteractionEvent.fireEvent:
                    component = ComponentType.Event;
                    break;
                default:
                    return;
            }

            let intAffComponent = new Pointer("intAfforPtr", this,
                                            "/" + component + "/" + this.interactionAffordanceName,
                                            [InteractionAffordance]).readValue();
            intAffComponent.registerTrigger(this.interactionEvent, this);
        }
    }

    public invoke(){
        if(!this.condition || this.condition.evaluate()){
            this.getProcess().invoke();
        }        
    }
}
