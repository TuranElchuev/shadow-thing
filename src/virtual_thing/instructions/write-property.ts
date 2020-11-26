import {
    Instruction,
    Instructions,
    CompoundData,
    InstructionType
} from "../index";

export class WriteProperty extends Instruction {

    private webUri: string = undefined;
    private property: string = undefined;
    private value: CompoundData = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(InstructionType.writeProperty, instrObj, parentInstrBlock);

        let writePropertyObj = instrObj.writeProperty;

        this.property = writePropertyObj.property;
        if(writePropertyObj.webUri){
            this.webUri = writePropertyObj.webUri;
        }      
        if(writePropertyObj.value){
            this.value = new CompoundData(this.getProcess(), writePropertyObj.value);
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

        if(this.value){
            
        }
    }
}