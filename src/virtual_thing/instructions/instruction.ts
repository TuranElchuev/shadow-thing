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
    Control,
    u
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
            let index = 0;         
            jsonObj.forEach(instrObj => 
                this.instructions.push(this.createInstruction(instrObj, index++)));
        }
    }

    private createInstruction(instrObj: any, index: number): Instruction{
        if(instrObj.readProperty){
            return new ReadProperty(instrObj, this, index);
        }else if(instrObj.writeProperty){
            return new WriteProperty(instrObj, this, index);
        }else if(instrObj.invokeAction){
            return new InvokeAction(instrObj, this, index);
        }else if(instrObj.fireEvent){
            return new FireEvent(instrObj, this, index);
        }else if(instrObj.invokeProcess){
            return new InvokeProcess(instrObj, this, index);
        }else if(instrObj.move){
            return new Move(instrObj, this, index);
        }else if(instrObj.ifelse){
            return new IfElse(instrObj, this, index);
        }else if(instrObj.switch){
            return new Switch(instrObj, this, index);
        }else if(instrObj.loop){
            return new Loop(instrObj, this, index);
        }else if(instrObj.try){
            return new Try(instrObj, this, index);
        }else if(instrObj.log){
            return new Log(instrObj, this, index);
        }else if(instrObj.control){
            return new Control(instrObj, this, index);
        }else{
            return new Instruction(InstructionType.empty, instrObj, this, index);
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
    private relativePath: string = undefined;

    protected delay: Delay = undefined;
    protected wait: boolean = true;

    public constructor(type: InstructionType, jsonObj: any, instructionBlock: Instructions, index: number){
        this.type = type;

        this.parentInstructionBlock = instructionBlock;

        this.relativePath = "/" + index + "/" + this.getType(); 

        if(jsonObj.delay){
            this.delay = new Delay(jsonObj.delay, this);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;        
        }

        u.debug("", this.getGlobalPath());
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
        return this.parentInstructionBlock.getGlobalPath() + this.relativePath;
    }

    public getRelativePath(){
        return this.relativePath;
    }

    public async execute() {
        if(this.delay){
            await this.delay.execute();
        }
    }
}