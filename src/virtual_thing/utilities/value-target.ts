import {
    Entity,
    Pointer,
    WriteOp,
    WritableData,
    IVtdValueTarget,
    u
} from "../index";


export class ValueTarget extends Entity {    

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(name: string, parent: Entity, jsonObj: IVtdValueTarget){
        super(name, parent);

        if(jsonObj.pointer){
            this.pointer = new Pointer("pointer", this, jsonObj.pointer, [WritableData]);
        }
        if(jsonObj.operation){
            this.operation = jsonObj.operation;
        }
    }

    public set(value: any){
        try{
            if(this.pointer){            
                this.pointer.writeValue(value, this.operation);
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }            
    }
}