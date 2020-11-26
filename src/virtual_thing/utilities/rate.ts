import {
    VirtualThingModel,
    Expression,
    Trigger,
    u
} from "../index";


export class Rate {

    private globalPath: string = undefined;

    private periodicTriggerMode: boolean = false;
    private triggers: Array<Trigger> = [];
    
    private expression: Expression = undefined;

    private started: boolean = false;
    private startMillis: number = 0;
    public tick: number = 0;


    public constructor(model: VirtualThingModel, expression: any, globalPath: string, periodicTriggerMode: boolean = false){
        this.globalPath = globalPath;
        this.periodicTriggerMode = periodicTriggerMode;

        this.expression = new Expression(model, expression, this.globalPath + "/expression");        
        if(this.periodicTriggerMode){
            model.getModel().registerPeriodicTriggerRate(this);
        } 
        u.debug("", this.globalPath);      
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
            u.fatal(`Invalid rate: ${goalRate}.`, this.globalPath);
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
        if(this.periodicTriggerMode){
            u.fatal("Can't explicitely call waitForNextTick() in \"perdiodicTriggerMode\".", this.globalPath);
        }else if(!this.started){
            u.fatal("Rate is not started.", this.globalPath);
        }
        await this.nextTick();
    }    

    public start(){        
        if(this.started){
            return;
        }
        this.started = true;
        this.reset();
        if(this.periodicTriggerMode){
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