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

        let invokeProcessObj = jsonObj.invokeProcess;

        if(invokeProcessObj.process){
            this.processPtr = new Pointer("process", this, invokeProcessObj.process, [Process]);
        }        
    }

    protected async executeBody() {
        if(this.processPtr){
            await (this.processPtr.readValue() as Process).invoke();
        }
    }
}
