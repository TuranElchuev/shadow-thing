import {
    Instruction,
    Instructions,
    CompoundData
} from "../index";


export class WriteProperty extends Instruction {

    private webUri: string = undefined;
    private property: string = undefined;
    private value: CompoundData = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let writePropertyObj = jsonObj.writeProperty;

        this.property = writePropertyObj.property;
        if(writePropertyObj.webUri){
            this.webUri = writePropertyObj.webUri;
        }      
        if(writePropertyObj.value){
            this.value = new CompoundData("value", this, writePropertyObj.value);
        }
    }

    // TODO
    protected async executeBody() {
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