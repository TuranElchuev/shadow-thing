import {
    Entity,
    Process,
    Loop,
    Instruction,
    Instructions,    
    Expression,
    IVtdInstruction,
    u
} from "../index";


export class IfElse extends Instruction {

    private if: If = undefined;
    private elif: If[] = [];
    private else: Instructions = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let ifelseObj = jsonObj.ifelse;

        if(ifelseObj.if){
            this.if = new If("if", this, ifelseObj.if, this.getProcess(), this.getParentLoop());
        }
        if(ifelseObj.elif instanceof Array){
            let index = 0;
            ifelseObj.elif.forEach(ifObj => this.elif.push(
                new If("elif/" + index++, this, ifObj, this.getProcess(), this.getParentLoop())));
        }
        if(ifelseObj.else){
            this.else = new Instructions("else", this, ifelseObj.else, this.getProcess(), this.getParentLoop());
        }        
    }

    protected async executeBody() {
        try{
            if(!this.if){
                return;
            }
            
            let satisfied = await this.if.execute();

            if(!satisfied){
                for (const _if of this.elif){
                    satisfied = await _if.execute();

                    if(satisfied) {
                        break;
                    }
                }
            }

            if(!satisfied && this.else){
                await this.else.execute();
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }    
    }
}

class If extends Entity {

    private condition: Expression = undefined;
    private instructions: Instructions = undefined;

    public constructor(name: string, parent: IfElse, jsonObj: any, process: Process, parentLoop: Loop){
        super(name, parent);
        
        if(jsonObj.condition){
            this.condition = new Expression("condition", this, jsonObj.condition);
        }
        if(jsonObj.instructions){
            this.instructions = new Instructions("instructions", this, jsonObj.instructions, process, parentLoop);
        }        
    }

    public async execute() {
        try{
            if(this.condition.evaluate()){
                await this.instructions.execute();
                return true;
            }
            return false;
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }    
        return false;
    }
}