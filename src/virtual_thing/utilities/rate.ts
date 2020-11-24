import {
    Process,
    Expression,
    u
} from "../index";
import { Trigger } from "./trigger";

export class Rate {

    private process: Process = undefined;

    private perdiodicTriggerMode: boolean = false;
    private triggers: Array<Trigger> = [];
    
    private expression: Expression = undefined;

    private started: boolean = false;
    private startMillis: number = 0;
    public tick: number = 0;


    public constructor(process: Process, expression: any, perdiodicTriggerMode: boolean = false){
        this.process = process;
        this.perdiodicTriggerMode = perdiodicTriggerMode;

        this.expression = new Expression(this.process, expression);        
        if(this.perdiodicTriggerMode){
            this.process.getModel().registerAutonomousRate(this);
        }        
    }

    private async runPeriodicTriggers(rate: Rate){
        if(!rate.started){
            return;
        }
        await rate.nextTick();
        for(const trigger of rate.triggers){
            await trigger.invoke();
        }
        setImmediate(rate.runPeriodicTriggers, rate);
    }

    private async nextTick() {        
        
        let goalRate = this.expression.evaluate();
        if(!goalRate || goalRate < 0){
            u.fatal(`Invalid rate: ${goalRate}.`, this.process.getGlobalPath());
        }
        
        let goalDelay = (this.tick + 1) * (1000 / goalRate) + this.startMillis - Date.now();

        if(goalDelay > 0){
            await new Promise(resolve => {
                setTimeout(() => {
                    this.tick++;
                    resolve();
                }, goalDelay);
            });            
        }else{
            this.tick++;
        }             
    }

    public addTrigger(trigger: Trigger){
        this.triggers.push(trigger);
    }

    public async waitForNextTick(){
        if(this.perdiodicTriggerMode){
            u.fatal("Can't explicitely call waitForNextTick() in \"perdiodicTriggerMode\".");
        }else if(!this.started){
            u.fatal("Rate is not started.");
        }
        await this.nextTick();
    }    

    public start(){        
        if(this.started){
            return;
        }
        this.started = true;
        this.reset();
        if(this.perdiodicTriggerMode){
            this.runPeriodicTriggers(this);
        }
    }

    public reset(){
        this.startMillis = Date.now();
        this.tick = 0;
    }

    public stop(){
        this.started = false;
    }

    public isStarted(): boolean {
        return this.started;
    }
}