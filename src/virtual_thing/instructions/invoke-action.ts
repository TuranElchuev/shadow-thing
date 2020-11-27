import {
    Instruction,
    Instructions,
    Action,
    Pointer,
    CompoundData,
    u
} from "../index";


export class InvokeAction extends Instruction {

    private webUri: string = undefined;
    private action: string = undefined;
    private input: CompoundData = undefined;
    private output: Pointer = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);
        
        let invokeActionObj = jsonObj.invokeAction;

        this.action = invokeActionObj.action;
        if(invokeActionObj.webUri){
            this.webUri = invokeActionObj.webUri;
        }      
        if(invokeActionObj.input){
            this.input = new CompoundData("input", this, invokeActionObj.input);
        }
        if(invokeActionObj.output){
            this.output = new Pointer("output", this, invokeActionObj.output, [Action]);
        }
    }

    // TODO
    protected async executeBody(){
        try{        
            if(!this.action){
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