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

    public constructor(instrObj: any, parentInstrBlock: Instructions, index: number){
        super(InstructionType.writeProperty, instrObj, parentInstrBlock, index);

        let writePropertyObj = instrObj.writeProperty;

        this.property = writePropertyObj.property;
        if(writePropertyObj.webUri){
            this.webUri = writePropertyObj.webUri;
        }      
        if(writePropertyObj.value){
            this.value = new CompoundData(this.getModel(), writePropertyObj.value, this.getGlobalPath() + "/value");
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