import { ReadableData } from "../components/data";
import {
    Entity,
    Process,
    Loop,
    Instruction,
    Instructions,
    Pointer,
    ValueSource,
    u
} from "../index";
import {  } from "../utilities/pointer";


export class Switch extends Instruction {

    private switchPtr: Pointer = undefined;
    private cases: Case[] = [];
    private default: Case;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let switchObj = jsonObj.switch;

        if(switchObj.switch){
            this.switchPtr = new Pointer("switch", this, switchObj.switch, [ReadableData], true);
        }        
        
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
        if(!this.switchPtr){
            return;
        }

        try{
            let satisfied = false;

            for (const _case of this.cases){
                satisfied = await _case.execute(this.switchPtr) && _case.mustBreak();
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

    private case: ValueSource = undefined; // undefined = "default" case in "switch"
    private instructions: Instructions = undefined;
    private break: boolean = true;

    public constructor(name: string, parent: Switch, jsonObj: any, process: Process, parentLoop: Loop){
        super(name, parent);
        
        if(jsonObj.case){
            this.case = new ValueSource("case", this, jsonObj.case);
        }        
        if(jsonObj.instructions){
            this.instructions = new Instructions("instructions", this, jsonObj.instructions, process, parentLoop);
        }
        if(jsonObj.break != undefined){
            this.break = jsonObj.break;
        }        
    }

    public async execute(_switch: Pointer = undefined) {        
        try{            
            let isCase = true;
            if(_switch && this.case){
                isCase = _switch.readValue() == this.case.get();
            }
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