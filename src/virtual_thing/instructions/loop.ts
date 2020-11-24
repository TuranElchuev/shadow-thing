import {
    Process,
    InstructionBody,
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

export class Loop implements InstructionBody {

    protected process: Process = undefined;
    protected state: LoopState = LoopState.default;

    private iteratorPointer: Pointer = undefined;
    private initialValueExpr: Expression = undefined;
    private condition: Expression = undefined;
    private increment: number = 1;
    private rate: Rate = undefined;
    private instructions: Instructions = undefined;
    private conditionFirst: boolean = true;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        if(jsonObj.iterator){
            this.iteratorPointer = new Pointer(jsonObj.iterator, this.process, [ReadableData, WritableData, Number]);
        }        
        if(jsonObj.condition){
            this.condition = new Expression(process, jsonObj.condition);
        }
        if(jsonObj.rate){
            this.rate = new Rate(process, jsonObj.rate);
        }
        if(jsonObj.instructions){
            this.instructions = new Instructions(process, jsonObj.instructions, this);
        }
        if(jsonObj.conditionFirst != undefined){
            this.conditionFirst = jsonObj.conditionFirst;
        }
        if(jsonObj.increment != undefined){
            this.increment = jsonObj.increment;
        }
        if(jsonObj.initialValueExpr){
            this.initialValueExpr = new Expression(this.process, jsonObj.initialValueExpr);
        }
    }

    private initIterator(){
        let initialValue = 0;
        if(this.initialValueExpr){
            initialValue = this.initialValueExpr.evaluate();
            if(!u.testType(initialValue, Number)){
                u.fatal(`Invalid initialValue: ${JSON.stringify(initialValue)}.`, this.process.getGlobalPath());
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
        return this.process.canContinueExecution() 
                && (!this.condition || this.condition.evaluate())
                && this.state != LoopState.break;
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

    public async execute() {

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
}