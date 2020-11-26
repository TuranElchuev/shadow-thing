import {
    Instruction,
    Instructions,
    CompoundData,
    InstructionType
} from "../index";


export class FireEvent extends Instruction {

    private event: string = undefined;
    private data: CompoundData = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions, index: number){
        super(InstructionType.fireEvent, instrObj, parentInstrBlock, index);

        let fireEventObj = instrObj.fireEvent;

        this.event = fireEventObj.event;
        if(fireEventObj.data){
            this.data = new CompoundData(this.getModel(), fireEventObj.data, this.getGlobalPath() + "/data");
        }        
    }

    // TODO
    public async execute(){
        await super.execute();
        
        if(!this.event){
            return;
        }        

        if(this.data){

        }
    }
}