import {
    VTMNode,
    ThingInteractionInstruction,
    IVtdInstruction,
    u
} from "../common/index";


export class UnsubscribeEvent extends ThingInteractionInstruction {

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.unsubscribeEvent);        
    }

    protected async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string) {
        try{
            await thing.unsubscribeEvent(name);
        }catch(err){
            u.fatal("Unubscribe event failed:\n" + err.message);
        }         
    }
}