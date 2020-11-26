import {
    Entity,
    Process,
    Rate,
    Expression,
    Pointer,
    ComponentType,
    InteractionAffordance,
    RuntimeEvent
} from "../index";


export class Trigger extends Entity {
    
    private runtimeEvent: RuntimeEvent = undefined;
    private interactionAffordance: string = undefined;
    private rate: Rate = undefined;
    private condition: Expression = undefined;
    private wait: boolean = true;
    
    public constructor(name: string, parent: Process, jsonObj: any){
        super(name, parent);
        
        if(jsonObj.rate){
            this.rate = new Rate("rate", this, jsonObj.rate, true);
        }else{
            this.runtimeEvent = jsonObj.runtimeEvent;
            this.interactionAffordance = jsonObj.interactionAffordance;
        }
        if(jsonObj.condition){
            this.condition = new Expression("condition", this, jsonObj.condition);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;
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

            switch(this.runtimeEvent){
                case RuntimeEvent.readProperty:
                case RuntimeEvent.writeProperty:
                    component = ComponentType.Property;
                    break;
                case RuntimeEvent.invokeAction:
                    component = ComponentType.Action;
                    break;
                case RuntimeEvent.fireEvent:
                    component = ComponentType.Event;
                    break;
                case RuntimeEvent.startup:
                    this.getModel().setOnStartupTrigger(this);
                    return;
                case RuntimeEvent.shutdown:
                    this.getModel().setOnShutdownTrigger(this);
                    return;
                default:
                    return;
            }

            let intAffComponent = new Pointer("intAfforPtr", this,
                                            "/" + component + "/" + this.interactionAffordance,
                                            [InteractionAffordance]).readValue();
            intAffComponent.registerTrigger(this.runtimeEvent, this);
        }
    }

    public async invoke(){
        if(!this.condition || this.condition.evaluate()){
            if(this.wait){
                await this.getProcess().invoke();
            }else{
                this.getProcess().invoke();
            }
        }
    }
}
