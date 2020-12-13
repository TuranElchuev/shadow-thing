import {
    Entity,
    Math,
    Trigger,
    IVtdMath,
    u
} from "../common/index";


export class Interval extends Entity {

    private periodicTriggerMode: boolean = false;
    private trigger: Trigger = undefined;
    
    private math: Math = undefined;

    private started: boolean = false;

    private lastInterval: number = 0;
    private lastTs: number = 0;

    public constructor(name: string, parent: Entity, jsonObj: IVtdMath, periodicTriggerMode: boolean = false){
        super(name, parent);

        this.periodicTriggerMode = periodicTriggerMode;
        this.math = new Math("math", this, jsonObj);       

        if(this.periodicTriggerMode){
            this.getModel().registerPeriodicTriggerInterval(this);
        }
    }
    
    private async runPeriodicTrigger(){
        try{
            while(this.started){
                await this.nextTick();           
                if(this.trigger){
                    await this.trigger.invoke();
                }
            }                        
        }catch(err){
            u.modelFailure(err.message, this);
        }
    }

    private async nextTick() {        
        
        let interval = this.math.evaluate();
        if(!interval || interval < 0){
            u.fatal(`Invalid interval: ${interval}.`, this.getFullPath());
        }

        if(interval != this.lastInterval){
            this.lastInterval = interval;
            this.reset();
        }

        let nextTs = this.lastTs + interval;        
        let needDelay = nextTs - Date.now();

        if(needDelay > 0){
            try{
                await new Promise<void>(resolve => {
                    setTimeout(() => {
                        this.lastTs = nextTs;
                        resolve();
                    }, needDelay);
                });   
            }catch(err){
                throw err;
            }            
        }else{
            this.lastTs = nextTs;
        }             
    }

    public setTrigger(trigger: Trigger){
        this.trigger = trigger;
    }

    public async waitForNextTick(){
        if(this.periodicTriggerMode){
            u.fatal("Can't explicitely call waitForNextTick() in \"perdiodicTriggerMode\".", this.getFullPath());
        }else if(!this.started){
            u.fatal("Interval is not started.", this.getFullPath());
        }
        try{
            await this.nextTick();
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }    

    public start(){        
        if(this.started){
            return;
        }
        this.started = true;
        this.reset();
        if(this.periodicTriggerMode){
            this.runPeriodicTrigger();
        }
    }

    public reset(){
        this.lastTs = Date.now();
    }

    public stop(){
        this.started = false;
    }

    public isStarted(): boolean {
        return this.started;
    }
}