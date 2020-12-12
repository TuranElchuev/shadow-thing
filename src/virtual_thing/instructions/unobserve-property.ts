import {
    Entity,
    ThingInteractionInstruction,
    IVtdInstruction,
    u
} from "../common/index";


export class UnobserveProperty extends ThingInteractionInstruction {

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.unobserveProperty);        
    }

    protected async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string) {
        try{
            await thing.unobserveProperty(name);
        }catch(err){
            u.fatal("Unobserve property failed:\n" + err.message);
        }         
    }
}