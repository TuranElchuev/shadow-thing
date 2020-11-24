import {
    Process,
    InstructionBody,
    Pointer,
    CompoundData,
    ReadOp,
    WriteOp,
    Expression,
    WritableData,
    ReadableData
} from "../index";

export class Move implements InstructionBody {

    private moveFrom: MoveFrom = undefined;
    private moveTo: MoveTo = undefined;

    public constructor(process: Process, jsonObj: any){
        if(jsonObj.from){
            this.moveFrom = new MoveFrom(process, jsonObj.from);
        }
        if(jsonObj.to){        
            this.moveTo = new MoveTo(process, jsonObj.to);
        }
    }

    execute(){
        if(this.moveFrom){
            let value = this.moveFrom.get();
            if(this.moveTo){
                this.moveTo.set(value);    
            }
        }                    
    }    
}

class MoveFrom {    

    private process: Process = undefined;

    private expression: Expression = undefined;
    private compoundData: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(process: Process, jsonObj: any){
        
        this.process = process;
           
        if(jsonObj.expression){
            this.expression = new Expression(this.process, jsonObj.expression);
        }else if(jsonObj.compoundData != undefined){
            this.compoundData = new CompoundData(this.process, jsonObj.compoundData);
        }else{
            if(jsonObj.operation){
                this.operation = jsonObj.operation;
            }    
            if(jsonObj.pointer != undefined){
                this.pointer = new Pointer(jsonObj.pointer, this.process, [ReadableData]);
            }
        }
    }

    public get(): any {
        if(this.expression){
            return this.expression.evaluate();
        }else if(this.compoundData){
            return this.compoundData.getValue();
        }else if(this.pointer){
            return this.pointer.readValue(this.operation);
        }else{
            return undefined;
        }
    }
}

class MoveTo {    

    private process: Process = undefined;

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(process: Process, jsonObj: any){
        
        this.process = process;

        if(jsonObj.pointer){
            this.pointer = new Pointer(jsonObj.pointer, this.process, [WritableData]);
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