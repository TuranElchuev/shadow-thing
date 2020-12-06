import {
    Entity,
    Instruction,
    Pointer,
    Interval,
    Instructions,
    Math,
    ReadableData,
    WritableData,
    IVtdInstruction,
    u
} from "../index";


export enum LoopState {
    default,
    break,
    continue
}

export class Loop extends Instruction {

    protected state: LoopState = LoopState.default;

    private iteratorPointer: Pointer = undefined;
    private initialValueExpr: Math = undefined;
    private condition: Math = undefined;
    private increment: number = 1;
    private interval: Interval = undefined;
    private instructions: Instructions = undefined;
    private conditionFirst: boolean = true;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let loopObj = jsonObj.loop;

        if(loopObj.iterator){
            this.iteratorPointer = new Pointer("iterator", this, loopObj.iterator,
                                                [ReadableData, WritableData, Number]);
        }        
        if(loopObj.condition){
            this.condition = new Math("condition", this, loopObj.condition);
        }
        if(loopObj.interval){
            this.interval = new Interval("interval", this, loopObj.interval);
        }
        if(loopObj.instructions){
            this.instructions = new Instructions("instructions", this, loopObj.instructions);
        }
        if(loopObj.conditionFirst != undefined){
            this.conditionFirst = loopObj.conditionFirst;
        }
        if(loopObj.increment != undefined){
            this.increment = loopObj.increment;
        }
        if(loopObj.initialValueExpr){
            this.initialValueExpr = new Math("initialValueExpr", this, loopObj.initialValueExpr);
        }
    }

    private initIterator(){
        let initialValue = 0;
        if(this.initialValueExpr){
            initialValue = this.initialValueExpr.evaluate();
            if(!u.testType(initialValue, Number)){
                u.fatal(`Invalid initialValue: ${JSON.stringify(initialValue)}.`, this.getFullPath());
            }            
        }
        if(this.iteratorPointer){
            this.iteratorPointer.writeValue(initialValue);
        }         
    }

    private async incrementIterator(){
        if(this.iteratorPointer){
            this.iteratorPointer.writeValue(this.iteratorPointer.readValue() + this.increment);
        }
    }

    private canRun(): boolean {
        return this.getProcess().canContinueExecution() 
                && (!this.condition || this.condition.evaluate())
                && this.state != LoopState.break;
    }

    private async whiledo(){
        try{
            while(this.canRun()){
                if(this.interval){
                    await this.interval.waitForNextTick();
                }

                await this.incrementIterator();
                
                if(this.state == LoopState.continue){
                    this.state = LoopState.default;                    
                    continue;
                }
                
                if(this.instructions){
                    await this.instructions.execute();
                }                
            }
        }catch(err){
            throw err;
        }   
    }

    private async dowhile(){
        try{
            do {
                if(this.interval){
                    await this.interval.waitForNextTick();
                }

                await this.incrementIterator();
                
                if(this.state == LoopState.continue){
                    this.state = LoopState.default;
                    continue;
                }
                                
                if(this.instructions){
                    await this.instructions.execute();
                }  
            }while(this.canRun());
        }catch(err){
            throw err;
        }   
    }

    protected async executeBody() {
        try{
            this.initIterator();

            if(this.interval){
                if(this.interval.isStarted()){
                    this.interval.reset();
                }else{
                    this.interval.start();
                }            
            }

            if(this.conditionFirst){
                await this.whiledo();
            }else{
                await this.dowhile();
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }

    public break() {
        this.state = LoopState.break;
    }

    public continue() {
        this.state = LoopState.continue;
    }

    public canExecuteNextInstruction(): boolean {
        return this.state == LoopState.default;
    }    
}