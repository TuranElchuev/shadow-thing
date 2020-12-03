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
    private urivariables: Map<string, ValueSource> = new Map();
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
                this.urivariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, invokeActionObj.uriVariables[key]));
            } 
        }

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    // TODO
    protected async executeBody(){
        try{       
            if(!this.actionName || !this.webUri){
                return;
            }
            
            this.strResolver.resolveParams(this.webUri);
            this.strResolver.resolveParams(this.actionName);

            if(this.input){
                // invoke action with this input
            }

            if(this.output){
                // wait for action results and store in output
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }
}