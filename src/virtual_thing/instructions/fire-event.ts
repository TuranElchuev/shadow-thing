import {
    Instruction,
    Instructions,
    ValueSource,
    IVtdInstruction,
    ComponentType,
    Event,
    u
} from "../index";


export class FireEvent extends Instruction {

    private eventName: string = undefined;
    private data: ValueSource = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let fireEventObj = jsonObj.fireEvent;

        this.eventName = fireEventObj.name;
        if(fireEventObj.data){
            this.data = new ValueSource("data", this, fireEventObj.data);
        }        
    }

    protected async executeBody(){
        try{            
            let event = this.getModel().getChildComponent(ComponentType.Event, this.eventName) as Event;
            if(this.data){
                await event.fire(this.data.get());
            }else{
                await event.fire();
            }            
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }    
    }
}