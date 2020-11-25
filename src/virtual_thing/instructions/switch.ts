import {
    Instruction,
    Instructions
} from "../index";

export class Switch extends Instruction {

    private _switch: any = undefined;
    private cases: Case[] = [];
    private default: Case;


    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(instrObj, parentInstrBlock);

        let switchObj = instrObj.switch;

        this._switch = switchObj.switch;
        
        if(switchObj.cases instanceof Array){
            switchObj.cases.forEach(caseObj => this.cases.push(new Case(caseObj, parentInstrBlock)));
        }
        if(switchObj.default){
            this.default = new Case(switchObj.default, parentInstrBlock);
        }
    }

    public async execute(){
        let satisfied = false;

        for (const _case of this.cases){
            satisfied = _case.execute(this._switch) && _case.hasBreak();
            if(satisfied){
                break;
            }
        }

        if(!satisfied && this.default){
            this.default.execute();
        }
    }
}

class Case {

    private case: any = undefined; // undefined = "default" in "switch"
    private instructions: Instructions = undefined;
    private break: boolean = true;

    public constructor(jsonObj: any, parentInstrBlock: Instructions){
        
        this.case = jsonObj.case;
        if(jsonObj.instructions){
            this.instructions = new Instructions(parentInstrBlock.getProcess(),
                                                    jsonObj.instructions,
                                                    parentInstrBlock.getParentLoop());
        }
        if(jsonObj.break != undefined){
            this.break = jsonObj.break;
        }
    }

    public execute(_switch: any = undefined) : boolean {        
        let isCase = this.case == _switch;
        if(isCase && this.instructions){
            this.instructions.execute();
        }
        return isCase;
    }

    public hasBreak(): boolean {
        return this.break;
    }
}