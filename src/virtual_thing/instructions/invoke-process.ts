import {
    Instruction,
    Instructions,
    Process,
    Pointer
} from "../index";


export class InvokeProcess extends Instruction {

    private processPtr: Pointer = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        if(jsonObj.invokeProcess){
            this.processPtr = new Pointer("process", this, jsonObj.invokeProcess, [Process]);
        }        
    }

    protected async executeBody() {
        if(this.processPtr){
            await (this.processPtr.readValue() as Process).invoke();
        }
    }
}
