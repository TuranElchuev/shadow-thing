import {
    Instruction,
    Instructions,
    u
} from "../index";


export class Try extends Instruction {

    private try: Instructions = undefined;
    private catch: Instructions = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let tryObj = jsonObj.try;

        if(tryObj.try){
            this.try = new Instructions("try", this, tryObj.try, this.getProcess(), this.getParentLoop());
        }
        if(tryObj.catch){
            this.catch = new Instructions("catch", this, tryObj.try, this.getProcess(), this.getParentLoop());
        }
    }

    protected async executeBody() {
        try {
            if(this.try){
                await this.try.execute();   
            }            
        } catch (error) {
            u.error(error.message, this.getPath());
            if(this.catch){
                await this.catch.execute();
            }            
        }
    }

}