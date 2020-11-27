import {
    Instruction,
    Instructions,
    ValueSource,
    u
} from "../index";


export class WriteProperty extends Instruction {

    private webUri: string = undefined;
    private propertyName: string = undefined;
    private value: ValueSource = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let writePropertyObj = jsonObj.writeProperty;

        this.propertyName = writePropertyObj.name;
        if(writePropertyObj.webUri){
            this.webUri = writePropertyObj.webUri;
        }      
        if(writePropertyObj.value){
            this.value = new ValueSource("value", this, writePropertyObj.value);
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

            if(this.value){
                
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}