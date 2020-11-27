import {
    Entity,
    Pointer,
    WriteOp,
    WritableData
} from "../index";


export class ValueTarget extends Entity {    

    private pointer: Pointer = undefined;
    private operation: WriteOp = WriteOp.set;

    public constructor(name: string, parent: Entity, jsonObj: any){
        super(name, parent);

        if(jsonObj.pointer){
            this.pointer = new Pointer("pointer", this, jsonObj.pointer, [WritableData]);
        }
        if(jsonObj.operation){
            this.operation = jsonObj.operation;
        }
    }

    public accept(value: any){
        if(this.pointer){            
            this.pointer.writeValue(value, this.operation);
        }
    }
}