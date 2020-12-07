import {
    Entity,
    Pointer,
    CompoundData,
    Math,
    ReadOp,
    ReadableData,
    IVtdValueSource,
    u
} from "../common/index";


export class ValueSource extends Entity {    

    private math: Math = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(name: string, parent: Entity, jsonObj: IVtdValueSource){
        super(name, parent);
        
        if(jsonObj.math){
            this.math = new Math("math", this, jsonObj.math);
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
            if(this.math){
                return this.math.evaluate();
            }else if(this.compound){
                return this.compound.getValue();
            }else if(this.pointer){
                return this.pointer.readValue(this.operation);
            }else{
                return undefined;
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }        
    }
}