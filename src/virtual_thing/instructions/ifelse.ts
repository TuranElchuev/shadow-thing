import {
    Instruction,
    Instructions,    
    Expression,
    InstructionType
} from "../index";

export class IfElse extends Instruction {

    private if: If = undefined;
    private elif: If[] = [];
    private else: Instructions = undefined;
    
    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(InstructionType.ifelse, instrObj, parentInstrBlock);

        let ifelseObj = instrObj.ifelse;

        if(ifelseObj.if){
            this.if = new If(ifelseObj.if, parentInstrBlock, this.getGlobalPath() + "/if");
        }
        if(ifelseObj.elif instanceof Array){
            let index = 0;
            ifelseObj.elif.forEach(ifObj => this.elif.push(
                new If(ifObj, parentInstrBlock, this.getGlobalPath() + "/elif/" + index)));
            index++;
        }
        if(ifelseObj.else){
            this.else = new Instructions(this.getProcess(),
                                            ifelseObj.else,
                                            this.getParentLoop(),
                                            this.getGlobalPath() + "/else");
        }        
    }

    public async  execute(){
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

    public constructor(jsonObj: any, parentInstrBlock: Instructions, globalPath: string){
        if(jsonObj.condition){
            this.condition = new Expression(parentInstrBlock.getProcess(), jsonObj.condition);        
        }
        if(jsonObj.instructions){
            this.instructions = new Instructions(parentInstrBlock.getProcess(), 
                                                    jsonObj.instructions,
                                                    parentInstrBlock.getParentLoop(),
                                                    globalPath + "/instructions");
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