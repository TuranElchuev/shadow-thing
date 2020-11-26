import { Instruction, u } from "../index";

export class Delay {

    private ownerInstr: Instruction = undefined;
    private delayMs: number = 0;

    public constructor(delayStr: any, ownerInstr: Instruction){
        this.ownerInstr = ownerInstr;
        try{
            if(u.testType(delayStr, String)){
                let durString = delayStr.toLowerCase();                
                let numStr = durString.match(/\d+(?:\.\d+)?/);
                let num = parseInt(numStr[0], 10);
                let isMs = durString.indexOf("ms") >= 0;
                this.delayMs = isMs ? num : num * 1000;
            }else{
                u.error("Failed to parse delay.", this.ownerInstr.getGlobalPath());
            }
        }catch(err){
            u.error("Failed to parse delay: " + err.message, this.ownerInstr.getGlobalPath());
        }
        u.debug("Created delay", this.ownerInstr.getGlobalPath());
    }

    public async execute(){
        if(this.delayMs > 0){
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }            
    }
}