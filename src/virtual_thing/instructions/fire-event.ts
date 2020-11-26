import {
    Instruction,
    Instructions,
    CompoundData
} from "../index";


export class FireEvent extends Instruction {

    private event: string = undefined;
    private data: CompoundData = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let fireEventObj = jsonObj.fireEvent;

        this.event = fireEventObj.event;
        if(fireEventObj.data){
            this.data = new CompoundData("data", this, fireEventObj.data);
        }        
    }

    // TODO
    protected async executeBody(){
        await super.execute();
        
        if(!this.event){
            return;
        }        

        if(this.data){

        }
    }
}