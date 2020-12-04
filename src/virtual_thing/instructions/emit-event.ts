import {
    Instruction,
    Instructions,
    ValueSource,
    IVtdInstruction,
    ComponentType,
    Event,
    ParamStringResolver,
    u
} from "../index";


export class EmitEvent extends Instruction {

    private eventName: string = undefined;
    private data: ValueSource = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let emitEventObj = jsonObj.emitEvent;

        this.eventName = ParamStringResolver.join(emitEventObj.name);
        if(emitEventObj.data){
            this.data = new ValueSource("data", this, emitEventObj.data);
        }        
    }

    protected async executeBody(){
        try{            
            let event = this.getModel().getChildComponent(ComponentType.Event, this.eventName) as Event;
            if(this.data){
                await event.emit(this.data.get());
            }else{
                await event.emit();
            }            
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }    
    }
}