import {
    Instruction,
    Instructions,
    WritableData,
    Pointer,
    InstructionType
} from "../index";

export class ReadProperty extends Instruction {

    private webUri: string = undefined;
    private property: string = undefined;
    private result: Pointer = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(InstructionType.readProperty, instrObj, parentInstrBlock);

        let readPropertyObj = instrObj.readProperty;

        this.property = readPropertyObj.property;
        if(readPropertyObj.webUri){
            this.webUri = readPropertyObj.webUri;
        }        
        if(readPropertyObj.result){
            this.result = new Pointer(readPropertyObj.result, this.getProcess(), [WritableData]);
        }
    }

    // TODO
    public async execute(){
        await super.execute();
        
        if(!this.property){
            return;
        }
        
        if(this.webUri){

        }

        let result = undefined; // wait for value
        if(this.result){
            this.result.writeValue(result);
        }
    }
}