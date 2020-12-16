import {
    Instruction,
    VTMNode,
    ValueSource,
    ParamStringResolver,
    IVtdInstructionThingInteraction,
    IVtdInstruction,
    u
} from "../common/index";


/**
 * Base class for the instances of 'Instruction' that represent
 * interactions with Things via interaction affordances.
 */
export abstract class ThingInteractionInstruction extends Instruction {

    private webUri: string = undefined;
    private interAffName: string = undefined;
    private uriVariables: Map<string, ValueSource> = new Map();

    private strResolver: ParamStringResolver = undefined;

    public constructor(name: string, parent: VTMNode, instrObj: IVtdInstruction,
        consumInstrObj: IVtdInstructionThingInteraction){

        super(name, parent, instrObj);

        this.interAffName = ParamStringResolver.join(consumInstrObj.name);

        if(consumInstrObj.webUri){
            this.webUri = ParamStringResolver.join(consumInstrObj.webUri);
        }        
        
        if(consumInstrObj.uriVariables){
            for (let key in consumInstrObj.uriVariables){
                this.uriVariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, consumInstrObj.uriVariables[key]));
            } 
        }

        this.strResolver = new ParamStringResolver(undefined, this);
    }

    /**
     * Creates and returns a WoT.InteractionOptions instance
     * that contains uriVariables parsed from the instruction.
     */
    protected async makeOptions(): Promise<WoT.InteractionOptions> {
        let options: WoT.InteractionOptions = { uriVariables: {} };
        for(let key of Array.from(this.uriVariables.keys())){
            options.uriVariables[key] = await this.uriVariables.get(key).get();
        }
        return options;
    }

    /**
     * Retrieves the ConsumedThing, then invokes interaction.  
     * The ConsumedThing is:
     * - obtained using 'webUri' - if provided
     * - the ExposedThing of the Virtual Thing Model - otherwise
     */
    protected async executeBody() {
        try{
            let consumedThing: WoT.ConsumedThing = undefined;
            if(this.webUri){
                let resolvedWebUri = this.strResolver.resolveParams(this.webUri);
                consumedThing = await this.getModel().getConsumedThing(resolvedWebUri);
            }else{
                consumedThing = this.getModel().getExposedThing();
            }
            await this.interactWithThing(consumedThing, 
                this.strResolver.resolveParams(this.interAffName));
        }catch(err){
            u.error(err.message, this.getFullPath());
        } 
    }

    /**
     * Performs interaction with the ConsumedThing.
     * 
     * @param thing ConsumedThing.
     * @param name Name of the interaction affordance.
     */
    protected abstract interactWithThing(thing: WoT.ConsumedThing, name: string);
}