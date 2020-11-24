import {
    Process,
    InstructionBody,
    Loop,
    Instructions
} from "../index";

export class Switch implements InstructionBody {

    private _switch: any = undefined;
    private cases: Case[] = [];
    private default: Case;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){

        this._switch = jsonObj.switch;
        
        if(jsonObj.cases instanceof Array){
            jsonObj.cases.forEach(c => this.cases.push(new Case(process, c, parentLoop)));
        }
        if(jsonObj.default){
            this.default = new Case(process, jsonObj.default, parentLoop);
        }
    }

    execute(){
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

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        
        this.case = jsonObj.case;
        if(jsonObj.instructions){
            this.instructions = new Instructions(process, jsonObj.instructions, parentLoop);
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