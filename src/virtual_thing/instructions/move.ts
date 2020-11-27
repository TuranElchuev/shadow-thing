import {
    Entity,
    Instruction,
    Instructions,
    Pointer,
    CompoundData,
    ReadOp,
    WriteOp,
    Expression,
    WritableData,
    ReadableData,
    u
} from "../index";


export class Move extends Instruction {

    private moveFrom: MoveFrom = undefined;
    private moveTo: MoveTo = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let moveObj = jsonObj.move;

        if(moveObj.from){
            this.moveFrom = new MoveFrom("from", this, moveObj.from);
        }
        if(moveObj.to){        
            this.moveTo = new MoveTo("to", this, moveObj.to);
        }
    }

    protected executeBody() {
        try{
            if(this.moveFrom){
                let value = this.moveFrom.get();
                if(this.moveTo){
                    this.moveTo.set(value);
                }
            }                    
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }    
}

class MoveFrom extends Entity {    

    private expression: Expression = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(name: string, parent: Move, jsonObj: any){
        super(name, parent);
        
        if(jsonObj.expression){
            this.expression = new Expression("expression", this, jsonObj.expression);
        }else if(jsonObj.compound !== undefined){
            this.compound = new CompoundData("compound", this, jsonObj.compound);
        }else{
            if(jsonObj.operation){
                this.operation = jsonObj.operation;
            }    
            if(jsonObj.pointer != undefined){
                this.pointer = new Pointer("pointer", this, jsonObj.pointer, [ReadableData]);
            }
        }        
    }

    public get(): any {
        if(this.expression){
            return this.expression.evaluate();
        }else if(this.compound){
            return this.compound.getValue();
        }else if(this.pointer){
            return this.pointer.readValue(this.operation);
        }else{
            return undefined;
        }
    }
}

class MoveTo extends Entity {    

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(name: string, parent: Move, jsonObj: any){
        super(name, parent);

        if(jsonObj.pointer){
            this.pointer = new Pointer("pointer", this, jsonObj.pointer, [WritableData]);
        }
        if(jsonObj.operation){
            this.operation = jsonObj.operation;
        }
    }

    public set(value: any){
        if(this.pointer){            
            this.pointer.writeValue(value, this.operation);
        }
    }
}