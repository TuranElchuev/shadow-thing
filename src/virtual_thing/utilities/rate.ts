import {
    Process,
    Trigger
} from "../index";

export class Rate {

    private process: Process = undefined;
    
    private trigger: Trigger = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;
        process.getModel().registerRate(this);
    }

    public attachTrigger(trigger: Trigger){
        this.trigger = trigger;
    }

    public async nextTick(){

    }

    public start(){

    }
}