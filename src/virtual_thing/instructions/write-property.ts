import {
    Instruction,
    Instructions,
    ValueSource,
    ParameterizedStringResolver,
    u
} from "../index";


export class WriteProperty extends Instruction {

    private webUri: string = undefined;
    private propertyName: string = undefined;
    private urivariables: Map<string, ValueSource> = new Map();
    private value: ValueSource = undefined;

    private strResolver: ParameterizedStringResolver = undefined;

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
        if(writePropertyObj.urivariables){
            for (const [key, value] of Object.entries(writePropertyObj.urivariables)){
                this.urivariables.set(key, new ValueSource("uriVariables/" + key, this, value));
            } 
        }

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    // TODO
    protected async executeBody() {
        try{
            if(!this.propertyName || !this.webUri){
                return;
            }            

            this.strResolver.resolveParams(this.webUri);
            this.strResolver.resolveParams(this.propertyName);

            if(this.value){
                
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}