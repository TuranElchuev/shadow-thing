import {
    Instruction,
    Instructions,
    ValueSource,
    ValueTarget,
    u
} from "../index";


export class InvokeAction extends Instruction {

    private webUri: string = undefined;
    private actionName: string = undefined;
    private input: ValueSource = undefined;
    private output: ValueTarget = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);
        
        let invokeActionObj = jsonObj.invokeAction;

        this.actionName = invokeActionObj.name;
        if(invokeActionObj.webUri){
            this.webUri = invokeActionObj.webUri;
        }      
        if(invokeActionObj.input){
            this.input = new ValueSource("input", this, invokeActionObj.input);
        }
        if(invokeActionObj.output){
            this.output = new ValueTarget("output", this, invokeActionObj.output);
        }
    }

    // TODO
    protected async executeBody(){
        try{        
            if(!this.actionName){
                return;
            }
            
            if(this.webUri){

            }

            if(this.input){
                // invoke action with this input
            }

            if(this.output){
                // wait for action results and store in output
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}