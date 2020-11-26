import {
    VirtualThingModel,
    Instruction,
    Instructions,
    Pointer,
    CompoundData,
    ReadOp,
    WriteOp,
    Expression,
    WritableData,
    ReadableData,
    InstructionType,
    u
} from "../index";

export class Move extends Instruction {

    private moveFrom: MoveFrom = undefined;
    private moveTo: MoveTo = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions, index: number){
        super(InstructionType.move, instrObj, parentInstrBlock, index);

        let moveObj = instrObj.move;

        if(moveObj.from){
            this.moveFrom = new MoveFrom(this.getProcess().getModel(), moveObj.from, this.getGlobalPath() + "/from");
        }
        if(moveObj.to){        
            this.moveTo = new MoveTo(this.getProcess().getModel(), moveObj.to, this.getGlobalPath() + "/to");
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

    private globalPath: string = undefined;

    private expression: Expression = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(model: VirtualThingModel, jsonObj: any, globalPath: string){
        this.globalPath = globalPath;      
        u.debug("", this.globalPath);
        
        if(jsonObj.expression){
            this.expression = new Expression(model, jsonObj.expression, this.globalPath + "/expression");
        }else if(jsonObj.compound !== undefined){
            this.compound = new CompoundData(model, jsonObj.compound, globalPath + "/compound");
        }else{
            if(jsonObj.operation){
                this.operation = jsonObj.operation;
            }    
            if(jsonObj.pointer != undefined){
                this.pointer = new Pointer(jsonObj.pointer, model, [ReadableData], this.globalPath + "/pointer");
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

    private globalPath: string = undefined;

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(model: VirtualThingModel, jsonObj: any, globalPath: string){
        this.globalPath = globalPath;
        u.debug("", this.globalPath);     

        if(jsonObj.pointer){
            this.pointer = new Pointer(jsonObj.pointer, model, [WritableData], this.globalPath + "/pointer");
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