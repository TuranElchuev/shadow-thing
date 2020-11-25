import {
    Process,
    Instruction,
    Instructions,
    Pointer,
    CompoundData,
    ReadOp,
    WriteOp,
    Expression,
    WritableData,
    ReadableData
} from "../index";

export class Move extends Instruction {

    private moveFrom: MoveFrom = undefined;
    private moveTo: MoveTo = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(instrObj, parentInstrBlock);

        let moveObj = instrObj.move;

        if(moveObj.from){
            this.moveFrom = new MoveFrom(this.getProcess(), moveObj.from);
        }
        if(moveObj.to){        
            this.moveTo = new MoveTo(this.getProcess(), moveObj.to);
        }
    }

    public async execute(){
        if(this.moveFrom){
            let value = this.moveFrom.get();
            if(this.moveTo){
                this.moveTo.set(value);    
            }
        }                    
    }    
}

class MoveFrom {    

    private expression: Expression = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(process: Process, jsonObj: any){
           
        if(jsonObj.expression){
            this.expression = new Expression(process, jsonObj.expression);
        }else if(jsonObj.compound !== undefined){
            this.compound = new CompoundData(process, jsonObj.compound);
        }else{
            if(jsonObj.operation){
                this.operation = jsonObj.operation;
            }    
            if(jsonObj.pointer != undefined){
                this.pointer = new Pointer(jsonObj.pointer, process, [ReadableData]);
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

class MoveTo {    

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(process: Process, jsonObj: any){
        
        if(jsonObj.pointer){
            this.pointer = new Pointer(jsonObj.pointer, process, [WritableData]);
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