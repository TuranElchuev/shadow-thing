import {
    Entity,
    Pointer,
    CompoundData,
    Expression,
    ReadOp,
    ReadableData
} from "../index";


export class ValueSource extends Entity {    

    private expression: Expression = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(name: string, parent: Entity, jsonObj: any){
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