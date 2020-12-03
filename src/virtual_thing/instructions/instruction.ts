import {
    Entity,
    Process,
    Delay,
    Loop,
    InvokeAction,
    SubscribeEvent,
    UnsubscribeEvent,
    ReadProperty,
    WriteProperty,
    FireEvent,
    InvokeProcess,
    IfElse,
    Switch,
    Move,
    Try,
    Log,
    Control,
    Empty,
    IVtdInstruction,
    IVtdInstructions,
    u
} from "../index";


export enum InstructionType {
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    invokeAction = "invokeAction",
    subscribeEvent = "subscribeEvent",
    unsubscribeEvent = "unsubscribeEvent",
    fireEvent = "fireEvent",
    invokeProcess = "invokeProcess",
    move = "move",
    ifelse = "ifelse",
    switch = "switch",
    loop = "loop",
    try = "try",
    log = "log",
    control = "control",
    empty = "emepty"
}

export class Instructions extends Entity {

    private process: Process = undefined;
    private parentLoop: Loop = undefined;

    private instructions: Instruction[] = [];

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstructions, process: Process, parentLoop: Loop){
        super(name, parent);

        this.process = process;
        this.parentLoop = parentLoop;

        if(jsonObj instanceof Array){   
            let index = 0;         
            jsonObj.forEach(instrObj => 
                this.instructions.push(this.createInstruction(instrObj, index++)));
        }
    }

    private createInstruction(jsonObj: IVtdInstruction, index: number): Instruction{
        if(jsonObj.readProperty){
            return new ReadProperty("" + index + "/" + InstructionType.readProperty, this, jsonObj);
        }else if(jsonObj.writeProperty){
            return new WriteProperty("" + index + "/" + InstructionType.writeProperty, this, jsonObj);
        }else if(jsonObj.invokeAction){
            return new InvokeAction("" + index + "/" + InstructionType.invokeAction, this, jsonObj);
        }else if(jsonObj.subscribeEvent){
            return new SubscribeEvent("" + index + "/" + InstructionType.subscribeEvent, this, jsonObj);
        }else if(jsonObj.unsubscribeEvent){
            return new UnsubscribeEvent("" + index + "/" + InstructionType.unsubscribeEvent, this, jsonObj);
        }else if(jsonObj.fireEvent){
            return new FireEvent("" + index + "/" + InstructionType.fireEvent, this, jsonObj);
        }else if(jsonObj.invokeProcess){
            return new InvokeProcess("" + index + "/" + InstructionType.invokeProcess, this, jsonObj);
        }else if(jsonObj.move){
            return new Move("" + index + "/" + InstructionType.move, this, jsonObj);
        }else if(jsonObj.ifelse){
            return new IfElse("" + index + "/" + InstructionType.ifelse, this, jsonObj);
        }else if(jsonObj.switch){
            return new Switch("" + index + "/" + InstructionType.switch, this, jsonObj);
        }else if(jsonObj.loop){
            return new Loop("" + index + "/" + InstructionType.loop, this, jsonObj);
        }else if(jsonObj.try){
            return new Try("" + index + "/" + InstructionType.try, this, jsonObj);
        }else if(jsonObj.log){
            return new Log("" + index + "/" + InstructionType.log, this, jsonObj);
        }else if(jsonObj.control){
            return new Control("" + index + "/" + InstructionType.control, this, jsonObj);
        }else{
            return new Empty("" + index + "/" + InstructionType.empty, this, jsonObj);
        }
    }

    private canExecuteNextInstruction(): boolean {
        return this.process.canContinueExecution()
                && (!this.parentLoop || this.parentLoop.canExecuteNextInstruction())
    }

    public async execute() {
        try{
            for (const instr of this.instructions) {         
                if(this.canExecuteNextInstruction()){
                    await instr.execute();
                }else{
                    return;
                }
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }    
    }

    public getProcess(){
        return this.process;
    }

    public getParentLoop(){
        return this.parentLoop;
    }

    public getInstructions(){
        return this.instructions;
    }
}

export abstract class Instruction extends Entity {

    protected delay: Delay = undefined;
    protected wait: boolean = true;

    public constructor(name: string, parent: Instructions, jsonObj: any){        
        super(name, parent);

        if(jsonObj.delay){
            this.delay = new Delay("delay", this, jsonObj.delay);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;        
        }
    }
    
    private async executeWithDelay(){
        try{
            if(this.delay){
                await this.delay.execute();
            }
            await this.executeBody();
        }catch(err){
            throw err;
        }    
    }

    protected abstract async executeBody();

    protected getProcess(){
        return (this.getParent() as Instructions).getProcess();
    }

    protected getParentLoop(){
        return (this.getParent() as Instructions).getParentLoop();
    }

    public async execute() {
        try{
            if(this.wait){
                await this.executeWithDelay();
            }else{
                this.executeWithDelay();
            }
        }catch(err){
            throw err;
        }    
    }
}