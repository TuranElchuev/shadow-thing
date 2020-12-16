import {
    Instruction,
    Entity,
    ValueSource,
    ValueTarget,
    IVtdInstruction,
    u
} from "../common/index";


export class Move extends Instruction {

    private moveFrom: ValueSource = undefined;
    private moveTo: ValueTarget = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let moveObj = jsonObj.move;

        if(moveObj.from){
            this.moveFrom = new ValueSource("from", this, moveObj.from);
        }
        if(moveObj.to){        
            this.moveTo = new ValueTarget("to", this, moveObj.to);
        }
    }

    protected async executeBody() {
        try{
            if(this.moveFrom){
                let value = await this.moveFrom.get();
                if(this.moveTo){
                    await this.moveTo.set(value);
                }
            }                    
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }    
}