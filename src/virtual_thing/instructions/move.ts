import {
    Instruction,
    VTMNode,
    ValueSource,
    ValueTarget,
    IVtdInstruction,
    u
} from "../common/index";


/** Class that represents the 'move' instruction. */
export class Move extends Instruction {

    private moveFrom: ValueSource = undefined;
    private moveTo: ValueTarget = undefined;

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdInstruction){
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
                let value = await this.moveFrom.getValue();
                if(this.moveTo){
                    await this.moveTo.setValue(value);
                }
            }                    
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }    
}