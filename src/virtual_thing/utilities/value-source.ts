import {
    Entity,
    Pointer,
    CompoundData,
    Expression,
    ReadOp,
    ReadableData,
    IVtdValueSource,
    u
} from "../index";


export class ValueSource extends Entity {    

    private expression: Expression = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(name: string, parent: Entity, jsonObj: IVtdValueSource){
        super(name, parent);
        
        if(jsonObj.expression){
            this.expression = new Expression("expression", this, jsonObj.expression);
        }else if(jsonObj.compound !== undefined){
            this.compound = new CompoundData("compound", this, jsonObj.compound);
        }else{
            if(jsonObj.operation){
                this.operation = jsonObj.operation;
            }    
            if(jsonObj.pointer){
                this.pointer = new Pointer("pointer", this, jsonObj.pointer, [ReadableData]);
            }
        }        
    }

    public get(): any {
        try{
            if(this.expression){
                return this.expression.evaluate();
            }else if(this.compound){
                return this.compound.getValue();
            }else if(this.pointer){
                return this.pointer.readValue(this.operation);
            }else{
                return undefined;
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }        
    }
}