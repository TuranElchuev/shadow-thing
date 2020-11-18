export enum InvocationType {
    invoke,
    read,
    write
}

export enum InvokationPolicy {
    wait,
    interrupt
}

export class Invoke implements InstructionBody {

    private process: Process = undefined;

    private operation: InvocationType = InvocationType.invoke;
    private pointer: Pointer = undefined;    
    private input: CompoundData = undefined;
    private output: Pointer = undefined;
    private invokationPolicy: InvokationPolicy = InvokationPolicy.wait;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        if(jsonObj?.operation != undefined)
            this.operation = jsonObj.operation;

        if(jsonObj?.invokationPolicy != undefined)
            this.invokationPolicy = jsonObj.invokationPolicy;


        this.pointer = new Pointer(jsonObj?.pointer, this.process.getOwner(), this.process);
        this.input = new CompoundData(this.process, jsonObj?.input);
        this.output = new Pointer(jsonObj?.output, this.process.getOwner(), this.process);
    }

    execute(){
        
    }
}