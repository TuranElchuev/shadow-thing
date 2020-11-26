import {
    Instruction,
    Instructions
} from "../index";


export class Empty extends Instruction {

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);
    }

    protected executeBody() {
        
    }
}