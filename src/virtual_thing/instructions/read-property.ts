import {
    Instruction,
    Instructions,
    ValueTarget,
    ValueSource,
    ParameterizedStringResolver,
    u
} from "../index";


export class ReadProperty extends Instruction {

    private webUri: string = undefined;
    private propertyName: string = undefined;
    private urivariables: Map<string, ValueSource> = new Map();
    private result: ValueTarget = undefined;

    private strResolver: ParameterizedStringResolver = undefined;

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
        if(readPropertyObj.urivariables){
            for (const [key, value] of Object.entries(readPropertyObj.urivariables)){
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

            let result = undefined; // wait for value
            if(this.result){
                this.result.accept(result);
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}