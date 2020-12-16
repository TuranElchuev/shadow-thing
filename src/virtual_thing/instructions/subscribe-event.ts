import {
    Entity,
    Instructions,
    ThingInteractionInstruction,
    IVtdInstruction,
    ValueTarget,
    u
} from "../common/index";


export class SubscribeEvent extends ThingInteractionInstruction {

    private onEmit: Instructions = undefined;
    private data: ValueTarget = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.subscribeEvent);
        
        if(jsonObj.subscribeEvent.onEmit){
            this.onEmit = new Instructions("onEmit", this, jsonObj.subscribeEvent.onEmit);
        }  

        if(jsonObj.subscribeEvent.data){
            this.data = new ValueTarget("data", this, jsonObj.subscribeEvent.data);
        }
    }

    private async onEventEmitted(data: any){
        try{
            if(this.data){
                await this.data.set(data);
            }
            await this.onEmit.execute();
        }catch(err){
            u.fatal("Event handler failed:\n" + err.message, this.getFullPath());
        }
    }

    protected async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string) {
        try{
            await thing.subscribeEvent(name, data => this.onEventEmitted(data), await this.getOptions());
        }catch(err){
            u.fatal("Subscribe event failed:\n" + err.message);
        }         
    }
}