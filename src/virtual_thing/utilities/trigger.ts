import {
    Process,
    Rate,
    Expression,
    Pointer,
    ComponentType,
    InteractionAffordance,
    InteractionEvent,
    u
} from "../index";


export class Trigger {

    private process: Process = undefined;
    private globalPath: string = undefined;
    
    private interactionEvent: InteractionEvent = undefined;
    private interactionAffordanceName: string = undefined;
    private rate: Rate = undefined;
    private condition: Expression = undefined;
    
    public constructor(jsonObj: any, process: Process, globalPath: string){
        this.process = process;
        this.globalPath = globalPath;
        
        if(jsonObj.rate){
            this.rate = new Rate(this.process.getModel(), jsonObj.rate, this.globalPath + "/rate", true);
        }else{
            this.interactionEvent = jsonObj.interactionEvent;
            this.interactionAffordanceName = jsonObj.interactionAffordanceName;
        }
        if(jsonObj.condition){
            this.condition = new Expression(this.process.getModel(), jsonObj.condition, this.globalPath + "/condition");
        }        

        this.setup();
        u.debug("", this.globalPath);  
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

            let iaComponent = new Pointer("/" + component + "/" + this.interactionAffordanceName,
                                        this.process.getModel(),
                                        [InteractionAffordance],
                                        this.globalPath).readValue();
            iaComponent.registerTrigger(this.interactionEvent, this);
        }
    }

    public invoke(){
        if(!this.condition || this.condition.evaluate()){
            this.process.invoke();
        }        
    }
}
