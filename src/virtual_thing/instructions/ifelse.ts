import {
    Process,
    InstructionBody,
    Instructions,
    Loop,
    Expression
} from "../index";

export class IfElse implements InstructionBody {

    private if: If = undefined;
    private elif: If[] = [];
    private else: Instructions = undefined;
    
    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        if(jsonObj.if){
            this.if = new If(process, jsonObj.if, parentLoop);
        }
        if(jsonObj.elif instanceof Array){
            jsonObj.elif.forEach(e => this.elif.push(new If(process, e, parentLoop)));
        }
        if(jsonObj.else){
            this.else = new Instructions(process, jsonObj.else, parentLoop);
        }        
    }

    execute(){
        if(!this.if){
            return;
        }
        
        let satisfied = this.if.execute();

        if(!satisfied){
            for (const _if of this.elif){
                satisfied = _if.execute();

                if(satisfied) {
                    break;
                }
            }
        }

        if(!satisfied && this.else){
            this.else.execute();
        }
    }
}

class If {

    private condition: Expression = undefined;
    private instructions: Instructions = undefined;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        if(jsonObj.condition){
            this.condition = new Expression(process, jsonObj.condition);        
        }
        if(jsonObj.instructions){
            this.instructions = new Instructions(process, jsonObj.instructions, parentLoop);
        }        
    }

    public execute() : boolean {
        if(this.condition.evaluate()){
            this.instructions.execute();
            return true;
        }
        return false;
    }
}