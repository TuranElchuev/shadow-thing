import {
    Instruction,
    Instructions,
    ValueSource,
    ParameterizedStringResolver,
    IVtdInstruction,
    u
} from "../index";


export class SubscribeEvent extends Instruction {

    private webUri: string = undefined;
    private eventName: string = undefined;
    private urivariables: Map<string, ValueSource> = new Map();

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
        
        let subscribeEventObj = jsonObj.subscribeEvent;

        this.eventName = subscribeEventObj.name;
        this.webUri = subscribeEventObj.webUri;
            
        if(subscribeEventObj.uriVariables){
            for (let key in subscribeEventObj.uriVariables){
                this.urivariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, subscribeEventObj.uriVariables[key]));
            } 
        }

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    // TODO
    protected async executeBody(){
        try{       
            if(!this.eventName || !this.webUri){
                return;
            }
            
            this.strResolver.resolveParams(this.webUri);
            this.strResolver.resolveParams(this.eventName);
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }
}