import {
    VTMNode,
    ThingInteractionInstruction,
    IVtdInstruction,
    u
} from "../common/index";


/** Class that represents the 'unobserveProperty' instruction. */
export class UnobserveProperty extends ThingInteractionInstruction {

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.unobserveProperty);        
    }

    protected async interactWithThing(thing: WoT.ConsumedThing, name: string) {
        try{
            await thing.unobserveProperty(name);
        }catch(err){
            u.fatal("Unobserve property failed:\n" + err.message);
        }         
    }
}