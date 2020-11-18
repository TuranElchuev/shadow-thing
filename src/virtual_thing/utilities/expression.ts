import { Process } from "../index";

export class Expression {
 
    private process: Process = undefined;

    private expression: string = undefined;
    
    public constructor(process: Process, jsonObj: any) {
        this.process = process;
        this.expression = jsonObj;
    }

    public evaluate(): number {
        if(this.expression == undefined)
            return 0;

        return 0;
    }
}