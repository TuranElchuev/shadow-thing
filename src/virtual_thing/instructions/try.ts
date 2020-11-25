import {
    Instruction,
    Instructions,
    u
} from "../index";

export class Try extends Instruction {

    private try: Instructions = undefined;
    private catch: Instructions = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(instrObj, parentInstrBlock);

        let tryObj = instrObj.try;

        if(tryObj.try){
            this.try = new Instructions(this.getProcess(), tryObj.try, this.getParentLoop());
        }
        if(tryObj.catch){
            this.catch = new Instructions(this.getProcess(), tryObj.catch, this.getParentLoop());
        }
    }

    public async  execute(){
        try {
            if(this.try){
                this.try.execute();   
            }            
        } catch (error) {
            u.error(error.message, this.getProcess().getGlobalPath());
            if(this.catch){
                this.catch.execute();
            }            
        }
    }

}