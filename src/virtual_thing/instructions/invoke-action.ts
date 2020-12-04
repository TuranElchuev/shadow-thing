import {
    Instruction,
    Instructions,
    ValueSource,
    ValueTarget,
    ParameterizedStringResolver,
    IVtdInstruction,
    u
} from "../index";


export class InvokeAction extends Instruction {

    private webUri: string = undefined;
    private actionName: string = undefined;
    private uriVariables: Map<string, ValueSource> = new Map();
    private input: ValueSource = undefined;
    private output: ValueTarget = undefined;

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
        
        let invokeActionObj = jsonObj.invokeAction;

        this.actionName = invokeActionObj.name;
        this.webUri = invokeActionObj.webUri;
        
        if(invokeActionObj.input){
            this.input = new ValueSource("input", this, invokeActionObj.input);
        }
        if(invokeActionObj.output){
            this.output = new ValueTarget("output", this, invokeActionObj.output);
        }
        if(invokeActionObj.uriVariables){
            for (let key in invokeActionObj.uriVariables){
                this.uriVariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, invokeActionObj.uriVariables[key]));
            } 
        }

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    private getOptions(): WoT.InteractionOptions {
        let options: WoT.InteractionOptions = { uriVariables: {} };
        for(let key of Array.from(this.uriVariables.keys())){
            options.uriVariables[key] = this.uriVariables.get(key).get();
        }
        return options;
    }

    protected async executeBody(){
        try{
            let uri = this.strResolver.resolveParams(this.webUri);
            let action = this.strResolver.resolveParams(this.actionName);
            let thing = await this.getModel().getExposedThing(uri);
            let options = this.getOptions();
            let input = this.input ? this.input.get() : undefined;
            let result = await thing.invokeAction(action, input, options);     
            if(this.output){
                this.output.set(result);
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }
}