import {
    Instruction,
    Instructions,
    Process,
    Pointer,
    InstructionType
} from "../index";


export class InvokeProcess extends Instruction {

    private processPtr: Pointer = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions, index: number){
        super(InstructionType.invokeProcess, instrObj, parentInstrBlock, index);

        let invokeProcessObj = instrObj.invokeProcess;

        if(invokeProcessObj.process){
            this.processPtr = new Pointer(invokeProcessObj.process,
                                            this.getProcess().getModel(),
                                            [Process],
                                            this.getGlobalPath() + "/process");      
        }        
    }

    // TODO
    public async execute(){
        await super.execute();
        
        if(this.processPtr){
            (this.processPtr.readValue() as Process).invoke();
        }        
    }
}
