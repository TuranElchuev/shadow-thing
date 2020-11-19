import {
    Process,
    InstructionBody,
    Pointer,
    CompoundData,
    Expression
} from "../index";


enum Operation {
    get,
    set,
    push,
    pop,
    copy,
    length
}

export class Move implements InstructionBody {

    private moveTo: MoveTo = undefined;
    private moveFrom: MoveFrom = undefined;

    public constructor(process: Process, jsonObj: any){
        this.moveTo = new MoveTo(process, jsonObj);
        this.moveFrom = new MoveFrom(process, jsonObj);
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
    private operation: Operation = Operation.get;

    public constructor(process: Process, jsonObj: any){
        
        this.process = process;

        let from = jsonObj?.from;
        if(from != undefined){           
           
            if(from.expression != undefined)
                this.expression = new Expression(this.process, from.expression);
                
            if(from.compoundData != undefined)
                this.compoundData = new CompoundData(this.process, from.compoundData);

            if(from.operation != undefined)
                this.operation = from.operation;

            if(from.pointer != undefined)
                this.pointer = new Pointer(from.pointer, this.process.getModel());
        }        
    }

    public get(): any {

    }
}

class MoveTo {    

    private process: Process = undefined;

    private pointer: Pointer = undefined;
    private operation: Operation = Operation.set;

    public constructor(process: Process, jsonObj: any){
        
        this.process = process;

        this.pointer = new Pointer(jsonObj?.to?.pointer, this.process.getModel());

        if(jsonObj?.to?.operation != undefined)
            this.operation = jsonObj.to.operation;
    }

    public set(value: any){

    }
}