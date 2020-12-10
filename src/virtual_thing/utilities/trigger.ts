import {
    Entity,
    Interval,
    Math,
    Pointer,
    ComponentType,
    InteractionAffordance,
    RuntimeEvent,
    IVtdTrigger,
    u
} from "../common/index";


export class Trigger extends Entity {
    
    private runtimeEvent: RuntimeEvent = undefined;
    private interactionAffordanceName: string = undefined;
    private interval: Interval = undefined;
    private condition: Math = undefined;
    private wait: boolean = true;
    
    public constructor(name: string, parent: Entity, jsonObj: IVtdTrigger){
        super(name, parent);
        
        if(jsonObj.interval){
            this.interval = new Interval("interval", this, jsonObj.interval, true);
        }else{
            this.runtimeEvent = jsonObj.runtimeEvent;
            this.interactionAffordanceName = jsonObj.interactionAffordance;
        }
        if(jsonObj.condition){
            this.condition = new Math("condition", this, jsonObj.condition);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;
        }
        this.getModel().registerTrigger(this);           
    }

    public setup(){

        if(this.interval){

            this.interval.setTrigger(this);

        }else{
            
            let component: ComponentType = undefined;

            switch(this.runtimeEvent){
                case RuntimeEvent.readProperty:
                case RuntimeEvent.writeProperty:
                    component = ComponentType.Properties;
                    break;
                case RuntimeEvent.invokeAction:
                    component = ComponentType.Actions;
                    break;
                case RuntimeEvent.emitEvent:
                    component = ComponentType.Events;
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
            
            try{
                let intAffComponent = new Pointer("interactionAffordancePointer", this,
                                                [ "/" + component + "/" + this.interactionAffordanceName ],
                                                [InteractionAffordance]).readValue() as InteractionAffordance;
                intAffComponent.registerTrigger(this.runtimeEvent, this);
            }catch(err){
                u.fatal(err.message, this.getFullPath())
            }
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
            u.modelFailure(err.message, this);
        }        
    }
}
