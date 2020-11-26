import {
    Process,
    Delay,
    Loop,
    InvokeAction,
    ReadProperty,
    WriteProperty,
    FireEvent,
    InvokeProcess,
    IfElse,
    Switch,
    Move,
    Try,
    Log,
    Control
} from "../index";

export enum InstructionType {
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    invokeAction = "invokeAction",
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

export class Instructions {

    private globalPath: string = undefined;
    private process: Process = undefined;
    private parentLoop: Loop = undefined;

    private instructions: Instruction[] = [];

    public constructor(process: Process, jsonObj: any, parentLoop: Loop, parentGlobalPath: string){
        this.process = process;
        this.parentLoop = parentLoop;
        this.globalPath = parentGlobalPath;

        if(jsonObj instanceof Array){
            jsonObj.forEach(instrObj => {
                this.instructions.push(this.createInstruction(instrObj));
            });
        }
    }

    private createInstruction(instrObj: any,): Instruction{
        if(instrObj.readProperty){
            return new ReadProperty(instrObj, this);
        }else if(instrObj.writeProperty){
            return new WriteProperty(instrObj, this);
        }else if(instrObj.invokeAction){
            return new InvokeAction(instrObj, this);
        }else if(instrObj.fireEvent){
            return new FireEvent(instrObj, this);
        }else if(instrObj.invokeProcess){
            return new InvokeProcess(instrObj, this);
        }else if(instrObj.move){
            return new Move(instrObj, this);
        }else if(instrObj.ifelse){
            return new IfElse(instrObj, this);
        }else if(instrObj.switch){
            return new Switch(instrObj, this);
        }else if(instrObj.loop){
            return new Loop(instrObj, this);
        }else if(instrObj.try){
            return new Try(instrObj, this);
        }else if(instrObj.log){
            return new Log(instrObj, this);
        }else if(instrObj.control){
            return new Control(instrObj, this);
        }else{
            return new Instruction(InstructionType.empty, instrObj, this);
        }
    }

    public async execute() {
        for (const instr of this.instructions) {         
            if(this.process.canContinueExecution()
                && (!this.parentLoop || this.parentLoop.canExecuteNextInstruction())){
                    await instr.execute();
            }                
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

    public getGlobalPath(){
        return this.globalPath;
    }
}

export class Instruction {

    private type: InstructionType = undefined;
    private parentInstructionBlock: Instructions = undefined;
    private globalPath: string = undefined;

    protected delay: Delay = undefined;
    protected wait: boolean = true;

    public constructor(type: InstructionType, jsonObj: any, instructionBlock: Instructions){
        this.type = type;

        this.parentInstructionBlock = instructionBlock;

        this.globalPath = instructionBlock.getGlobalPath()
            + "/" + instructionBlock.getInstructions().indexOf(this)
            + "/" + this.getType(); 

        if(jsonObj.delay){
            this.delay = new Delay(jsonObj.delay, this);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;        
        }            
    }

    protected getProcess(){
        return this.parentInstructionBlock.getProcess();
    }

    protected getParentLoop(){
        return this.parentInstructionBlock.getParentLoop();
    }

    public getModel(){
        return this.getProcess().getModel();
    }

    protected getType(){
        return this.type;
    }

    public getGlobalPath(){
        return this.globalPath;
    }

    public async execute() {
        if(this.delay){
            await this.delay.execute();
        }
    }
}