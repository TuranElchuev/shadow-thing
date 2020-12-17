import {
    VTMNode,
    IVtdDelay,
    u
} from "../common/index";


/** Class that represents the 'delay' object in instruction objects. */
export class Delay extends VTMNode {

    private delayMs: number = 0;

    public constructor(name: string, parent: VTMNode, delayStr: IVtdDelay){
        super(name, parent);

        try{
            if(u.instanceOf(delayStr, String)){                
                let durString = delayStr.toLowerCase();                
                let numStr = durString.match(/\d+(?:\.\d+)?/);
                let num = parseInt(numStr[0], 10);
                let isMs = durString.indexOf("ms") >= 0;
                this.delayMs = isMs ? num : num * 1000;
            }else{
                u.error("Failed to parse delay.", this.getFullPath());
            }
        }catch(err){
            u.error("Failed to parse delay:\n" + err.message, this.getFullPath());
        }
    }

    public async execute(){
        if(this.delayMs > 0){
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }            
    }
}