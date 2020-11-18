export class LogicalExpression {
 
    private process: Process = undefined;

    private expression: string = undefined;
    
    public constructor(process: Process, jsonObj: any) {
        this.process = process;
        this.expression = jsonObj;
    }

    public evaluate(): boolean {
        if(this.expression == undefined)
            return false;

        return false;
    }
}