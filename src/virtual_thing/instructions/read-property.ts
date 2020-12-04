import {
    Instruction,
    Instructions,
    ValueTarget,
    ValueSource,
    ParameterizedStringResolver,
    IVtdInstruction,
    u
} from "../index";


export class ReadProperty extends Instruction {

    private webUri: string = undefined;
    private propertyName: string = undefined;
    private uriVariables: Map<string, ValueSource> = new Map();
    private result: ValueTarget = undefined;

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let readPropertyObj = jsonObj.readProperty;

        this.propertyName = readPropertyObj.name;
        this.webUri = readPropertyObj.webUri;
        
        if(readPropertyObj.result){
            this.result = new ValueTarget("result", this, readPropertyObj.result);
        }
        if(readPropertyObj.uriVariables){
            for (let key in readPropertyObj.uriVariables){
                this.uriVariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, readPropertyObj.uriVariables[key]));
            } 
        }

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    private getOptions(): WoT.InteractionOptions {
        let options: WoT.InteractionOptions = { uriVariables: {} };
        for(let key of Array.from(this.uriVariables.keys())){
            options.uriVariables[key] = this.uriVariables.get(key).get();
        }
        return options;
    }

    protected async executeBody() {
        try{
            let uri = this.strResolver.resolveParams(this.webUri);
            let property = this.strResolver.resolveParams(this.propertyName);
            let thing = await this.getModel().getExposedThing(uri);
            let options = this.getOptions();
            let result = await thing.readProperty(property, options);     
            if(this.result){
                this.result.set(result);
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        } 
    }
}