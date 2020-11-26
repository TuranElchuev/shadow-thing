import {
    Instruction,
    Instructions,
    Action,
    Pointer,
    CompoundData,
    InstructionType
} from "../index";

export class InvokeAction extends Instruction {

    private webUri: string = undefined;
    private action: string = undefined;
    private input: CompoundData = undefined;
    private output: Pointer = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(InstructionType.invokeAction, instrObj, parentInstrBlock);
        
        let invokeActionObj = instrObj.invokeAction;

        this.action = invokeActionObj.action;
        if(invokeActionObj.webUri){
            this.webUri = invokeActionObj.webUri;
        }      
        if(invokeActionObj.input){
            this.input = new CompoundData(this.getProcess(), invokeActionObj.input);
        }
        if(invokeActionObj.output){
            this.output = new Pointer(invokeActionObj.output, this.getProcess(), [Action]);
        }
    }

    // TODO
    public async execute(){
        await super.execute();
        
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
    }
}