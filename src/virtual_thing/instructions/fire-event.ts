import {
    Instruction,
    Instructions,
    ValueSource,
    IVtdInstruction,
    u
} from "../index";


export class FireEvent extends Instruction {

    private eventName: string = undefined;
    private data: ValueSource = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let fireEventObj = jsonObj.fireEvent;

        this.eventName = fireEventObj.name;
        if(fireEventObj.data){
            this.data = new ValueSource("data", this, fireEventObj.data);
        }        
    }

    // TODO
    protected async executeBody(){
        try{        
            if(!this.eventName){
                return;
            }        

            if(this.data){

            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }    
    }
}