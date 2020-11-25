import { Process } from "../entities/process";
import { u } from "../index";

export class Delay {

    private process: Process = undefined;
    private delayMs: number = 0;

    public constructor(delayStr: any, process: Process){
        this.process = process;
        try{
            if(u.testType(delayStr, String)){
                let durString = delayStr.toLowerCase();                
                let numStr = durString.match(/\d+(?:\.\d+)?/);
                let num = parseInt(numStr[0], 10);
                let isMs = durString.indexOf("ms") >= 0;
                this.delayMs = isMs ? num : num * 1000;
            }else{
                u.error("Failed to parse delay.", this.process.getGlobalPath());
            }
        }catch(err){
            u.error("Failed to parse delay: " + err.message, this.process.getGlobalPath());
        }        
    }

    public async execute(){
        if(this.delayMs > 0){
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }            
    }
}