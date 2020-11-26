import {
    Instruction,
    Instructions,
    WritableData,
    Pointer
} from "../index";


export class ReadProperty extends Instruction {

    private webUri: string = undefined;
    private property: string = undefined;
    private result: Pointer = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let readPropertyObj = jsonObj.readProperty;

        this.property = readPropertyObj.property;
        if(readPropertyObj.webUri){
            this.webUri = readPropertyObj.webUri;
        }        
        if(readPropertyObj.result){
            this.result = new Pointer("result", this, readPropertyObj.result, [WritableData]);
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

        let result = undefined; // wait for value
        if(this.result){
            this.result.writeValue(result);
        }
    }
}