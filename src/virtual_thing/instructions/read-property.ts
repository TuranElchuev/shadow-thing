import {
    Instruction,
    Instructions,
    ValueTarget,
    u
} from "../index";


export class ReadProperty extends Instruction {

    private webUri: string = undefined;
    private propertyName: string = undefined;
    private result: ValueTarget = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let readPropertyObj = jsonObj.readProperty;

        this.propertyName = readPropertyObj.name;
        if(readPropertyObj.webUri){
            this.webUri = readPropertyObj.webUri;
        }        
        if(readPropertyObj.result){
            this.result = new ValueTarget("result", this, readPropertyObj.result);
        }
    }

    // TODO
    protected async executeBody() {
        try{
            if(!this.propertyName){
                return;
            }
            
            if(this.webUri){

            }

            let result = undefined; // wait for value
            if(this.result){
                this.result.accept(result);
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}