import {
    Instruction,
    Pointer,
    Rate,
    Instructions,
    Expression,
    ReadableData,
    WritableData,
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
    private initialValueExpr: Expression = undefined;
    private condition: Expression = undefined;
    private increment: number = 1;
    private rate: Rate = undefined;
    private instructions: Instructions = undefined;
    private conditionFirst: boolean = true;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let loopObj = jsonObj.loop;

        if(loopObj.iterator){
            this.iteratorPointer = new Pointer("iterator", this, loopObj.iterator,
                                                [ReadableData, WritableData, Number]);
        }        
        if(loopObj.condition){
            this.condition = new Expression("condition", this, loopObj.condition);
        }
        if(loopObj.rate){
            this.rate = new Rate("rate", this, loopObj.rate);
        }
        if(loopObj.instructions){
            this.instructions = new Instructions("instructions", this, loopObj.instructions, this.getProcess(), this);
        }
        if(loopObj.conditionFirst != undefined){
            this.conditionFirst = loopObj.conditionFirst;
        }
        if(loopObj.increment != undefined){
            this.increment = loopObj.increment;
        }
        if(loopObj.initialValueExpr){
            this.initialValueExpr = new Expression("initialValueExpr", this, loopObj.initialValueExpr);
        }
    }

    private initIterator(){
        let initialValue = 0;
        if(this.initialValueExpr){
            initialValue = this.initialValueExpr.evaluate();
            if(!u.testType(initialValue, Number)){
                u.fatal(`Invalid initialValue: ${JSON.stringify(initialValue)}.`, this.getPath());
            }            
        }
        if(this.iteratorPointer){
            this.iteratorPointer.writeValue(initialValue);
        }         
    }

    private incrementIterator(){
        if(this.iteratorPointer){
            this.iteratorPointer.writeValue(this.iteratorPointer.readValue() + this.increment);
        }
    }

    private canRun(): boolean {
        return this.getProcess().canContinueExecution() 
                && (!this.condition || this.condition.evaluate())
                && this.state != LoopState.break;
    }

    private async whiledo(loop: Loop){
        
        if(!loop.canRun()){
            return;
        }

        if(loop.rate){
            await loop.rate.waitForNextTick();
        }
        
        if(loop.state == LoopState.continue){
            loop.state = LoopState.default;
            loop.incrementIterator();
            setImmediate(loop.whiledo, loop);
            return;
        }
        
        await loop.instructions.execute();
        loop.incrementIterator();

        setImmediate(loop.whiledo, loop);
    }

    private async dowhile(loop: Loop){
        if(loop.rate){
            await loop.rate.waitForNextTick();
        }
        
        if(loop.state == LoopState.continue){
            loop.state = LoopState.default;
            loop.incrementIterator();
            if(loop.canRun()){
                setImmediate(loop.dowhile, loop);
            }
            return;
        }
        
        await loop.instructions.execute();
        loop.incrementIterator();        
        
        if(loop.canRun()){
            setImmediate(loop.dowhile, loop);
        }
    }

    protected async executeBody() {

        this.initIterator();

        if(this.rate){
            if(this.rate.isStarted()){
                this.rate.reset();
            }else{
                this.rate.start();
            }            
        }

        if(this.conditionFirst){
            await this.whiledo(this);
        }else{
            await this.dowhile(this);
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