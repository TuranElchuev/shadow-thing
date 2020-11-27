import {
    Entity,
    Expression,
    Trigger,
    u
} from "../index";


export class Rate extends Entity {

    private periodicTriggerMode: boolean = false;
    private triggers: Array<Trigger> = [];
    
    private expression: Expression = undefined;

    private started: boolean = false;
    private startMillis: number = 0;
    public tick: number = 0;

    public constructor(name: string, parent: Entity, jsonObj: any, periodicTriggerMode: boolean = false){
        super(name, parent);

        this.periodicTriggerMode = periodicTriggerMode;
        this.expression = new Expression("expression", this, jsonObj);       

        if(this.periodicTriggerMode){
            this.getModel().registerPeriodicTriggerRate(this);
        }
    }

    private async runPeriodicTriggers(rate: Rate){
        if(!rate.started){
            return;
        }
        try{
            await rate.nextTick();
            for(const trigger of rate.triggers){            
                await trigger.invoke();
            }
        }catch(err){
            u.failure(err.message, this.getPath());
        }   
        setImmediate(rate.runPeriodicTriggers, rate);
    }

    private async nextTick() {        
        
        let goalRate = this.expression.evaluate();
        if(!goalRate || goalRate < 0){
            u.fatal(`Invalid rate: ${goalRate}.`, this.getPath());
        }
        
        let goalDelay = (this.tick + 1) * (1000 / goalRate) + this.startMillis - Date.now();

        if(goalDelay > 0){
            try{
                await new Promise(resolve => {
                    setTimeout(() => {
                        this.tick++;
                        resolve();
                    }, goalDelay);
                });   
            }catch(err){
                throw err;
            }            
        }else{
            this.tick++;
        }             
    }

    public addTrigger(trigger: Trigger){
        this.triggers.push(trigger);
    }

    public async waitForNextTick(){
        if(this.periodicTriggerMode){
            u.fatal("Can't explicitely call waitForNextTick() in \"perdiodicTriggerMode\".", this.getPath());
        }else if(!this.started){
            u.fatal("Rate is not started.", this.getPath());
        }
        try{
            await this.nextTick();
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
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