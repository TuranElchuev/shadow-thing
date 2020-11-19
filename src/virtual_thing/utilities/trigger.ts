import {
    Process,
    Pointer,
    Rate,
    Expression,
    CompoundData,
    InvokationPolicy
} from "../index";

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
    private condition: Expression = undefined;
    private input: CompoundData = undefined;
    private invokationPolicy: InvokationPolicy = InvokationPolicy.wait;
    
    public constructor(jsonObj: any, process: Process){
        this.process = process;
        
        if(jsonObj?.triggerType != undefined)
            this.triggerType = jsonObj.triggerType;

        if(jsonObj?.invokationPolicy != undefined)
            this.invokationPolicy = jsonObj.invokationPolicy;

        this.pointer = new Pointer(jsonObj?.pointer, this.process.getRoot());
        this.rate = new Rate(this.process, jsonObj?.rate);
        this.condition = new Expression(this.process, jsonObj?.condition);
        this.input = new CompoundData(this.process, jsonObj?.input);            

        this.setup();
    }

    private setup(){

    }
}
