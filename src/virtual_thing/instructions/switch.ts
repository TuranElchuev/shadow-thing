import {
    Entity,
    Process,
    Loop,
    Instruction,
    Instructions,
    u
} from "../index";


export class Switch extends Instruction {

    private _switch: any = undefined;
    private cases: Case[] = [];
    private default: Case;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let switchObj = jsonObj.switch;

        this._switch = switchObj.switch;
        
        if(switchObj.cases instanceof Array){
            let index = 0;
            switchObj.cases.forEach(caseObj => this.cases.push(
                new Case("/cases/" + index++, this, caseObj, this.getProcess(), this.getParentLoop())));
        }
        if(switchObj.default){
            this.default = new Case("default", this, switchObj.default, this.getProcess(), this.getParentLoop());
        }
    }

    protected async executeBody() {
        try{
            let satisfied = false;

            for (const _case of this.cases){
                satisfied = await _case.execute(this._switch) && _case.mustBreak();
                if(satisfied){
                    break;
                }
            }

            if(!satisfied && this.default){
                this.default.execute();
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}

class Case extends Entity {

    private case: any = undefined; // undefined = "default" case in "switch"
    private instructions: Instructions = undefined;
    private break: boolean = true;

    public constructor(name: string, parent: Switch, jsonObj: any, process: Process, parentLoop: Loop){
        super(name, parent);
        
        this.case = jsonObj.case;
        if(jsonObj.instructions){
            this.instructions = new Instructions("instructions", this, jsonObj.instructions, process, parentLoop);
        }
        if(jsonObj.break != undefined){
            this.break = jsonObj.break;
        }        
    }

    public async execute(_switch: any = undefined) {        
        try{
            let isCase = this.case === _switch;
            if(isCase && this.instructions){
                await this.instructions.execute();
            }
            return isCase;
        }catch(err){
            u.fatal(err.message, this.getPath());
        }
        return false;  
    }

    public mustBreak(): boolean {
        return this.break;
    }
}