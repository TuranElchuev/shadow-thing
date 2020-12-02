import {
    Instruction,
    Instructions,
    Process,
    Pointer,
    IVtdInstruction,
    u
} from "../index";


export class InvokeProcess extends Instruction {

    private processPtr: Pointer = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        if(jsonObj.invokeProcess){
            this.processPtr = new Pointer("process", this, jsonObj.invokeProcess, [Process]);
        }        
    }

    protected async executeBody() {
        try{
            if(this.processPtr){
                await (this.processPtr.readValue() as Process).invoke();
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}
