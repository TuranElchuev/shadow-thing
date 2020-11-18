import {
    Process,
    Delay,
    Loop,
    Invoke,
    IfElse,
    Switch,
    Move,
    Try
} from "../index";

export enum Statement {
    invoke,
    move,
    ifelse,
    switch,
    loop,
    try,
    continue,
    break,
    return,
    delay
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

        let instructions = jsonObj?.instructions;
        if(instructions instanceof Array){
            instructions.forEach(i => this.instructions.push(new Instruction(this.process, i, this.parentLoop)));
        }
    }

    async execute() {
        for (const instr of this.instructions) {         
            if(this.process.canContinueExecution() && this.parentLoop?.canContinueIteration()){
                    await instr.execute();
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

        this.delay = new Delay(jsonObj?.delay);
        this.statement = jsonObj?.statement;

        if(jsonObj?.wait != undefined)
            this.wait = jsonObj.wait;        

        switch(this.statement){
            case Statement.invoke:
                this.body = new Invoke(this.process, jsonObj?.body);
                break;
            case Statement.move:
                this.body = new Move(this.process, jsonObj?.body);
                break;
            case Statement.ifelse:
                this.body = new IfElse(this.process, jsonObj?.body);
                break;
            case Statement.switch:
                this.body = new Switch(this.process, jsonObj?.body);
                break;
            case Statement.loop:
                this.body = new Loop(this.process, jsonObj?.body);
                break;
            case Statement.try:
                this.body = new Try(this.process, jsonObj?.body);
                break;
            default:
                break;
        }
    }

    public async execute() {
        
        var promise = new Promise(async (resolve, reject) => {

            await this.delay.execute();

            switch(this.statement){
                case Statement.break:
                    if(this.parentLoop != null)
                        this.parentLoop.break();
                    break;
                case Statement.continue:
                    if(this.parentLoop != null)
                        this.parentLoop.continue();
                    break;
                case Statement.return:
                    this.process.abort();
                    break;
                case Statement.invoke:                
                case Statement.move:
                case Statement.ifelse:
                case Statement.switch:
                case Statement.loop:
                case Statement.try:
                    this.body.execute();
                default:                
                    break;
            }
        });

        try{
            if(this.wait){
                await promise;
            }                
            else{
                promise.then();
            }                
        }catch(err){

        }        
    }
}