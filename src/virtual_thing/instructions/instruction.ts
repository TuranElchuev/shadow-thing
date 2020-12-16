import {
    Entity,
    Delay,
    Loop,
    InvokeAction,
    SubscribeEvent,
    UnsubscribeEvent,
    ReadProperty,
    WriteProperty,
    EmitEvent,
    InvokeProcess,
    IfElse,
    Switch,
    Move,
    Try,
    Output,
    Control,
    Fake,
    Empty,
    IVtdInstruction,
    IVtdInstructions,
    u,
    ObserveProperty,
    UnobserveProperty
} from "../common/index";


export enum InstructionType {
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    observeProperty = "observeProperty",
    unobserveProperty = "unobserveProperty",
    invokeAction = "invokeAction",
    subscribeEvent = "subscribeEvent",
    unsubscribeEvent = "unsubscribeEvent",
    emitEvent = "emitEvent",
    invokeProcess = "invokeProcess",
    move = "move",
    ifelse = "ifelse",
    switch = "switch",
    loop = "loop",
    try = "try",
    log = "log",
    info = "info",
    warn = "warn",
    debug = "debug",
    error = "error",
    control = "control",
    fake = "fake",
    empty = "emepty"
}

export class Instructions extends Entity {

    private instructions: Instruction[] = [];

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstructions){
        super(name, parent);

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
        }else if(jsonObj.observeProperty){
            return new ObserveProperty("" + index + "/" + InstructionType.observeProperty, this, jsonObj);
        }else if(jsonObj.unobserveProperty){
            return new UnobserveProperty("" + index + "/" + InstructionType.unobserveProperty, this, jsonObj);
        }else if(jsonObj.invokeAction){
            return new InvokeAction("" + index + "/" + InstructionType.invokeAction, this, jsonObj);
        }else if(jsonObj.subscribeEvent){
            return new SubscribeEvent("" + index + "/" + InstructionType.subscribeEvent, this, jsonObj);
        }else if(jsonObj.unsubscribeEvent){
            return new UnsubscribeEvent("" + index + "/" + InstructionType.unsubscribeEvent, this, jsonObj);
        }else if(jsonObj.emitEvent){
            return new EmitEvent("" + index + "/" + InstructionType.emitEvent, this, jsonObj);
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
            return new Output("" + index + "/" + InstructionType.log, this, jsonObj);
        }else if(jsonObj.info){
            return new Output("" + index + "/" + InstructionType.info, this, jsonObj);
        }else if(jsonObj.warn){
            return new Output("" + index + "/" + InstructionType.warn, this, jsonObj);
        }else if(jsonObj.debug){
            return new Output("" + index + "/" + InstructionType.debug, this, jsonObj);
        }else if(jsonObj.error){
            return new Output("" + index + "/" + InstructionType.error, this, jsonObj);
        }else if(jsonObj.control){
            return new Control("" + index + "/" + InstructionType.control, this, jsonObj);
        }else if(jsonObj.fake){
            return new Fake("" + index + "/" + InstructionType.fake, this, jsonObj);
        }else{
            return new Empty("" + index + "/" + InstructionType.empty, this, jsonObj);
        }
    }

    private canExecuteNextInstruction(): boolean {
        return this.getProcess().canContinueExecution()
                && (!this.getParentLoop() || this.getParentLoop().canExecuteNextInstruction())
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
}

export abstract class Instruction extends Entity {

    protected delay: Delay = undefined;
    protected wait: boolean = true;

    public constructor(name: string, parent: Entity, jsonObj: any){        
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

    protected abstract executeBody();

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