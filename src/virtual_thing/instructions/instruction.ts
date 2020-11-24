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
    Log
} from "../index";

export enum Statement {
    invokeAction = "invokeAction",
    invokeProcess = "invokeProcess",
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    fireEvent = "fireEvent",
    move = "move",
    ifelse = "ifelse",
    switch = "switch",
    loop = "loop",
    try = "try",
    continue = "continue",
    break = "break",
    return = "return",
    delay = "delay",
    log = "log"
}

export interface InstructionBody {
    execute(): any;
}

export class Instructions {

    private process: Process = undefined;
    private parentLoop: Loop = undefined;

    private instructions: Instruction[] = [];

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        this.process = process;
        this.parentLoop = parentLoop;

        if(jsonObj instanceof Array){
            jsonObj.forEach(i => this.instructions.push(new Instruction(this.process, i, this.parentLoop)));
        }
    }

    public async execute() {
        for (const instr of this.instructions) {         
            if(this.process.canContinueExecution()
                && (!this.parentLoop || this.parentLoop.canExecuteNextInstruction())){
                    instr.execute();
            }                
        }
    }
}

export class Instruction {

    private process: Process = undefined;
    private parentLoop: Loop = undefined;

    private statement: Statement = undefined;
    private body: InstructionBody = undefined;
    private delay: Delay = undefined;
    private wait: boolean = true;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){

        this.process = process;
        this.parentLoop = parentLoop;

        this.statement = jsonObj.statement;

        if(jsonObj.delay){
            this.delay = new Delay(jsonObj.delay);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;        
        }            

        if(jsonObj.body){
            switch(this.statement){
                case Statement.readProperty:
                    this.body = new ReadProperty(this.process, jsonObj.body);
                    break;
                case Statement.writeProperty:
                    this.body = new WriteProperty(this.process, jsonObj.body);
                    break;
                case Statement.invokeAction:
                    this.body = new InvokeAction(this.process, jsonObj.body);
                    break;
                case Statement.fireEvent:
                    this.body = new FireEvent(this.process, jsonObj.body);
                    break;
                case Statement.invokeProcess:
                    this.body = new InvokeProcess(this.process, jsonObj.body);
                    break;
                case Statement.move:
                    this.body = new Move(this.process, jsonObj.body);
                    break;
                case Statement.ifelse:
                    this.body = new IfElse(this.process, jsonObj.body);
                    break;
                case Statement.switch:
                    this.body = new Switch(this.process, jsonObj.body);
                    break;
                case Statement.loop:
                    this.body = new Loop(this.process, jsonObj.body);
                    break;
                case Statement.try:
                    this.body = new Try(this.process, jsonObj.body);
                    break;
                case Statement.log:
                    this.body = new Log(this.process, jsonObj.body);
                    break;
                default:
                    break;
            }
        }        
    }

    public execute() {
        
        // Remove this //
        if(this.delay){

        }
        if(this.wait){

        }
        //////////////////


        //await this.delay.execute();

        switch(this.statement){
            case Statement.break:
                if(this.parentLoop){
                    this.parentLoop.break();
                }                        
                break;
            case Statement.continue:
                if(this.parentLoop){
                    this.parentLoop.continue();
                }                        
                break;
            case Statement.return:
                this.process.abort();
                break;
            case Statement.invokeAction:                
            case Statement.move:
            case Statement.ifelse:
            case Statement.switch:
            case Statement.loop:
            case Statement.try:
            case Statement.log:
                if(this.body){
                    this.body.execute();
                }                    
            default:           
                break;
        }

        /*
        try{
            if(this.wait){
                await promise;
            }                
            else{
                promise.then();
            }                
        }catch(err){

        }*/
    }
}