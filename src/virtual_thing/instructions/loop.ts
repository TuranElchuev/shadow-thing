import {
    Process,
    InstructionBody,
    Pointer,
    Rate,
    Instructions,
    Expression
} from "../index";

export enum LoopState {
    default,
    break,
    continue
}

export class Loop  implements InstructionBody {

    protected process: Process = undefined;
    protected state: LoopState = LoopState.default;

    private iterator: Pointer = undefined;
    private initializationNumber: number = undefined;
    private initializationPointer: Pointer = undefined;
    private condition: Expression = undefined;
    private increment: number = undefined;
    private rate: Rate = undefined;
    private instructions: Instructions = undefined;
    private conditionFirst: boolean = true;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        if(jsonObj?.iterator != undefined)
            this.iterator = new Pointer(jsonObj.iterator, this.process.getModel());

        if(jsonObj?.initializationNumber != undefined)
            this.initializationNumber = jsonObj?.initializationNumber;
        else if(jsonObj?.initializationPointer != undefined)
            this.initializationPointer = new Pointer(jsonObj.initializationPointer, this.process.getModel());
        
        if(jsonObj?.condition != undefined)
            this.condition = new Expression(process, jsonObj.condition);

        this.increment = jsonObj?.increment;

        if(jsonObj?.rate != undefined)
            this.rate = new Rate(process, jsonObj.rate);
        
        if(jsonObj?.instructions != undefined)
            this.instructions = new Instructions(process, jsonObj.instructions, this);

        if(jsonObj?.conditionFirst != undefined)
            this.conditionFirst = jsonObj.conditionFirst;
    }

    private initIterator(){
        if(this.iterator != undefined){
            if(this.initializationNumber != undefined){
                this.iterator.set(this.initializationNumber);
            }else if(this.initializationPointer != undefined){
                this.iterator.set(this.initializationPointer.get());
            }                
        }        
    }

    private incrementIterator(){
        if(this.iterator != undefined && this.increment != undefined)
            this.iterator.set(this.iterator.get() + this.increment);
    }

    private canRun(): boolean {
        return this.process.canContinueExecution() 
                && (this.condition == undefined || this.condition.evaluate())
                && this.state != LoopState.break;
    }

    public break() {
        this.state = LoopState.break;
    }

    public continue() {
        this.state = LoopState.continue;
    }

    public canContinueIteration(): boolean {
        return this.state == LoopState.default;
    }

    async execute() {

        this.initIterator();

        if(this.conditionFirst)
            await this.whiledo();
        else
            await this.dowhile();
    }

    private async whiledo(){

        while(this.canRun()){
        
            if(this.rate != undefined){
                await this.rate.nextTick();
            }
            
            if(this.state == LoopState.continue){
                this.state = LoopState.default;
                this.incrementIterator();
                continue;
            }
            
            await this.instructions.execute();
            this.incrementIterator();
        }
    }

    private async dowhile(){

        do {
            if(this.rate != undefined){
                await this.rate.nextTick();
            }
            
            if(this.state == LoopState.continue){
                this.state = LoopState.default;
                this.incrementIterator();
                continue;
            }
            
            await this.instructions.execute();
            this.incrementIterator();
        } while(this.canRun())
    }
}