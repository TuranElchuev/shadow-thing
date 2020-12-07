import {
    Instruction,
    Entity,
    IVtdInstruction
} from "../common/index";


export class Empty extends Instruction {

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
    }

    protected executeBody() {
        
    }
}