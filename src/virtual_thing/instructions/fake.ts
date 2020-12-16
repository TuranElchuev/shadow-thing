import {
    Instruction,
    VTMNode,
    Pointer,
    IVtdInstruction,
    u,
    WritableData
} from "../common/index";


/** Class that represents the 'fake' instruction. */
export class Fake extends Instruction {

    private dataPtr: Pointer = undefined;

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        if(jsonObj.fake){
            this.dataPtr = new Pointer("pointer", this, jsonObj.fake, [WritableData]);
        }        
    }

    protected async executeBody() {
        try{
            if(this.dataPtr){
                this.dataPtr.fakeValue()
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }
}
