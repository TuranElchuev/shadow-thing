import {
    Instruction,
    Instructions,
    CompoundData
} from "../index";


export class FireEvent extends Instruction {

    private event: string = undefined;
    private data: CompoundData = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(instrObj, parentInstrBlock);

        let fireEventObj = instrObj.fireEvent;

        this.event = fireEventObj.event;
        if(fireEventObj.data){
            this.data = new CompoundData(this.getProcess(), fireEventObj.data);
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