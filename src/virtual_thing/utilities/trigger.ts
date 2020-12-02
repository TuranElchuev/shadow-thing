import {
    Entity,
    Process,
    Interval,
    Expression,
    Pointer,
    ComponentType,
    InteractionAffordance,
    RuntimeEvent,
    IVtdTrigger,
    u
} from "../index";


export class Trigger extends Entity {
    
    private runtimeEvent: RuntimeEvent = undefined;
    private interactionAffordance: string = undefined;
    private interval: Interval = undefined;
    private condition: Expression = undefined;
    private wait: boolean = true;
    
    public constructor(name: string, parent: Process, jsonObj: IVtdTrigger){
        super(name, parent);
        
        if(jsonObj.interval){
            this.interval = new Interval("interval", this, jsonObj.interval, true);
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

        if(this.interval){

            this.interval.setTrigger(this);

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
                    this.getModel().addOnStartupTrigger(this);
                    return;
                case RuntimeEvent.shutdown:
                    this.getModel().addOnShutdownTrigger(this);
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
        try{
            if(!this.condition || this.condition.evaluate()){
                if(this.wait){
                    await this.getProcess().invoke();
                }else{
                    this.getProcess().invoke();
                }
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }        
    }
}
