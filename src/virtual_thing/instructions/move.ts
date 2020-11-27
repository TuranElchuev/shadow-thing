import {
    Instruction,
    Instructions,
    ValueSource,
    ValueTarget,
    u
} from "../index";


export class Move extends Instruction {

    private moveFrom: ValueSource = undefined;
    private moveTo: ValueTarget = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let moveObj = jsonObj.move;

        if(moveObj.from){
            this.moveFrom = new ValueSource("from", this, moveObj.from);
        }
        if(moveObj.to){        
            this.moveTo = new ValueTarget("to", this, moveObj.to);
        }
    }

    protected executeBody() {
        try{
            if(this.moveFrom){
                let value = this.moveFrom.get();
                if(this.moveTo){
                    this.moveTo.accept(value);
                }
            }                    
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }    
}