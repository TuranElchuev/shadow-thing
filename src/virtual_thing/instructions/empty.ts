import {
    Instruction,
    VTMNode,
    IVtdInstruction
} from "../common/index";


/**
 * Class that represents an empty instruction.
 * With a specified 'delay', can be used as a plain delay instruction.
 */
export class Empty extends Instruction {

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
    }

    protected executeBody() {
        
    }
}