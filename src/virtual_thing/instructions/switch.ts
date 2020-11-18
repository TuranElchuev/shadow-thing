
class Switch implements InstructionBody {

    private _switch: any = undefined;
    private cases: Case[] = [];
    private default: Case;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){

        this._switch = jsonObj?.switch;
        
        let cases = jsonObj?.cases;
        if(cases instanceof Array){
            cases.forEach(c => this.cases.push(new Case(process, c, parentLoop)));
        }
        this.default = new Case(process, jsonObj?.default, parentLoop);
    }

    execute(){
        let satisfied = false;

        for (const _case of this.cases){
            satisfied = _case.execute(this._switch) && _case.hasBreak();
            if(satisfied){
                break;
            }
        }

        if(!satisfied){
            this.default.execute();
        }
    }
}

class Case {

    private case: any = undefined; // undefined = "default" in "switch"
    private instructions: Instructions = undefined;
    private break: boolean = true;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){

        this.case = jsonObj?.case;
        this.instructions = new Instructions(process, jsonObj?.instructions, parentLoop);
        
        if(jsonObj?.break != undefined){
            this.break = jsonObj.break;
        }
    }

    public execute(_switch: any = undefined) : boolean {        
        let isCase = this.case == _switch;
        if(isCase){
            this.instructions.execute();
        }
        return isCase;
    }

    public hasBreak(): boolean {
        return this.break;
    }
}