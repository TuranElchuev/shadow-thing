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
    private uriVariables: Map<string, ValueSource> = new Map();
    private onEmit: Instructions = undefined;

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
        
        let subscribeEventObj = jsonObj.subscribeEvent;

        this.eventName = subscribeEventObj.name;
        this.webUri = subscribeEventObj.webUri;

        if(subscribeEventObj.onEmit){
            this.onEmit = new Instructions("onEmit", this, subscribeEventObj.onEmit, this.getProcess(), this.getParentLoop());
        }  
            
        if(subscribeEventObj.uriVariables){
            for (let key in subscribeEventObj.uriVariables){
                this.uriVariables.set(key, new ValueSource("uriVariables/" + key,
                                        this, subscribeEventObj.uriVariables[key]));
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

    private async onEventEmitted(data: any){
        try{
            await this.onEmit.execute();
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }
    }

    protected async executeBody(){
        try{
            let uri = this.strResolver.resolveParams(this.webUri);
            let event = this.strResolver.resolveParams(this.eventName);
            let thing = await this.getModel().getExposedThing(uri);
            let options = this.getOptions();
            await thing.subscribeEvent(event, data => this.onEventEmitted(data), options);
        }catch(err){
            u.fatal("Subscription failed: " + err.message, this.getFullPath());
        }   
    }
}