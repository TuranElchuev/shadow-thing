export enum TriggerType {
    invoke,
    continuous,
    periodic,
    change,    
    read,
    write
}

export class Trigger {

    private process: Process = undefined;

    private triggerType: TriggerType = TriggerType.invoke;
    private pointer: Pointer = undefined;
    private rate: Rate = undefined;
    private condition: Condition = undefined;
    private input: CompoundData = undefined;
    private invokationPolicy: InvokationPolicy = InvokationPolicy.wait;
    
    public constructor(jsonObj: any, process: Process){
        this.process = process;
        
        if(jsonObj?.triggerType != undefined)
            this.triggerType = jsonObj.triggerType;

        if(jsonObj?.invokationPolicy != undefined)
            this.invokationPolicy = jsonObj.invokationPolicy;

        this.pointer = new Pointer(jsonObj?.pointer, this.process.getOwner(), this.process);
        this.rate = new Rate(this.process, jsonObj?.rate);
        this.condition = new Condition(this.process, jsonObj?.condition);
        this.input = new CompoundData(this.process, jsonObj?.input);            

        this.setup();
    }

    private setup(){

    }
}
