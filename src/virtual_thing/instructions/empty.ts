import {
    Instruction,
    Instructions,
    IVtdInstruction
} from "../index";


export class Empty extends Instruction {

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
    }

    protected executeBody() {
        
    }
}