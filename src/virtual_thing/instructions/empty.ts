import {
    Instruction,
    VTMNode,
    IVtdInstruction
} from "../common/index";


export class Empty extends Instruction {

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
    }

    protected executeBody() {
        
    }
}