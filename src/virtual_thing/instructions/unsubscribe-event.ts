import {
    Instruction,
    Instructions,
    ParameterizedStringResolver,
    IVtdInstruction,
    u
} from "../index";


export class UnsubscribeEvent extends Instruction {

    private webUri: string = undefined;
    private eventName: string = undefined;

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
        
        let subscribeEventObj = jsonObj.unsubscribeEvent;

        this.eventName = subscribeEventObj.name;
        this.webUri = subscribeEventObj.webUri;

        this.strResolver = new ParameterizedStringResolver(undefined, this);
    }

    protected async executeBody(){
        try{
            let uri = this.strResolver.resolveParams(this.webUri);
            let event = this.strResolver.resolveParams(this.eventName);
            let thing = await this.getModel().getExposedThing(uri);
            await thing.unsubscribeEvent(event);
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }
}