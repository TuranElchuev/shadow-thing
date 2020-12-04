import {
    Entity,
    Instruction,
    Instructions,
    IVtdInstruction,
    u
} from "../index";


export class Try extends Instruction {

    private try: Instructions = undefined;
    private catch: Instructions = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let tryObj = jsonObj.try;

        if(tryObj.try){
            this.try = new Instructions("try", this, tryObj.try);
        }
        if(tryObj.catch){
            this.catch = new Instructions("catch", this, tryObj.catch);
        }
    }

    protected async executeBody() {
        try {
            if(this.try){
                await this.try.execute();   
            }            
        } catch (error) {
            u.error(error.message, this.getFullPath());
            try{
                if(this.catch){
                    await this.catch.execute();
                }            
            }catch(err){
                u.fatal(err.message, this.getFullPath());
            }   
        }
    }

}