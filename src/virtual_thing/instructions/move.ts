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
        this.moveFrom = new MoveFrom(process, jsonObj?.from);
        this.moveTo = new MoveTo(process, jsonObj?.to);
    }

    execute(){
        const value = this.moveFrom.get();
        if(value != undefined)
            this.moveTo.set(value);    
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

        if(jsonObj != undefined){           
           
            if(jsonObj.expression != undefined)
                this.expression = new Expression(this.process, jsonObj.expression);
                
            if(jsonObj.compoundData != undefined)
                this.compoundData = new CompoundData(this.process, jsonObj.compoundData);

            if(jsonObj.operation != undefined)
                this.operation = jsonObj.operation;

            if(jsonObj.pointer != undefined)
                this.pointer = new Pointer(jsonObj.pointer, this.process, [ReadableData]);
        }        
    }

    public get(): any {

    }
}

class MoveTo {    

    private process: Process = undefined;

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(process: Process, jsonObj: any){
        
        this.process = process;

        this.pointer = new Pointer(jsonObj?.pointer, this.process, [WritableData]);

        if(jsonObj?.operation != undefined)
            this.operation = jsonObj.operation;
    }

    public set(value: any){

    }
}