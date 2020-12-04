import {
    Instruction,
    Instructions,
    ValueSource,
    ParameterizedStringResolver,
    IVtdInstructionConsumerInteraction,
    IVtdInstruction,
    u
} from "../index";


export abstract class ConsumerInteractionInstruction extends Instruction {

    private webUri: string = undefined;
    private name: string = undefined;
    private uriVariables: Map<string, ValueSource> = new Map();

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, instrObj: IVtdInstruction,
        consumInstrObj: IVtdInstructionConsumerInteraction){

        super(name, parent, instrObj);

        this.name = consumInstrObj.name;
        this.webUri = consumInstrObj.webUri;
        
        if(consumInstrObj.uriVariables){
            for (let key in consumInstrObj.uriVariables){
                this.uriVariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, consumInstrObj.uriVariables[key]));
            } 
        }

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    protected getOptions(): WoT.InteractionOptions {
        let options: WoT.InteractionOptions = { uriVariables: {} };
        for(let key of Array.from(this.uriVariables.keys())){
            options.uriVariables[key] = this.uriVariables.get(key).get();
        }
        return options;
    }

    protected async executeBody() {
        try{
            let resolvedWebUri = this.strResolver.resolveParams(this.webUri);
            let consumedThing = await this.getModel().getConsumedThing(resolvedWebUri);
            await this.executeConsumerInstruction(consumedThing, 
                this.strResolver.resolveParams(this.name));
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        } 
    }

    protected abstract async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string);
}