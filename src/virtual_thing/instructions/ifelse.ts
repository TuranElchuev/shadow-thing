export class IfElse implements InstructionBody {

    private if: If = undefined;
    private elif: If[] = [];
    private else: Instructions = undefined;
    
    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        this.if = new If(process, jsonObj?.if, parentLoop);

        let elif = jsonObj?.elif;
        if(elif instanceof Array){
            this.elif.forEach(e => this.elif.push(new If(process, e, parentLoop)));
        }

        this.else = new Instructions(process, jsonObj?.if, parentLoop);
    }

    execute(){
        let satisfied = this.if.execute();

        if(!satisfied){
            for (const _if of this.elif){
                satisfied = _if.execute();

                if(satisfied) {
                    break;
                }
            }
        }

        if(!satisfied){
            this.else?.execute();
        }
    }
}

class If {

    private condition: Condition = undefined;
    private instructions: Instructions = undefined;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        this.condition = new Condition(process, jsonObj?.condition);        
        this.instructions = new Instructions(process, jsonObj?.instructions, parentLoop);
    }

    public execute() : boolean {
        let isMet = this.condition.isMet();
        if(isMet){
            this.instructions.execute();
        }
        return isMet;
    }
}