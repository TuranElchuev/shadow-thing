import {
    Entity,
    ValueSource,
    ValueTarget,
    IVtdInstruction,
    ThingInteractionInstruction,
    u
} from "../common/index";


export class InvokeAction extends ThingInteractionInstruction {

    private input: ValueSource = undefined;
    private output: ValueTarget = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.invokeAction);
        
        if(jsonObj.invokeAction.input){
            this.input = new ValueSource("input", this, jsonObj.invokeAction.input);
        }
        if(jsonObj.invokeAction.output){
            this.output = new ValueTarget("output", this, jsonObj.invokeAction.output);
        }
    }

    protected async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string) {
        try{
            let input = this.input ? await this.input.get() : undefined;
            let result = await thing.invokeAction(name, input, await this.getOptions());     
            if(this.output){
                this.output.set(result);
            }
        }catch(err){
            u.fatal("Invoke action failed:\n" + err.message);
        }         
    }
}