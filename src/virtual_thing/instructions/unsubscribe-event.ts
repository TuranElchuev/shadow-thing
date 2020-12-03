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

    // TODO
    protected async executeBody(){
        try{       
            if(!this.eventName || !this.webUri){
                return;
            }
            
            this.strResolver.resolveParams(this.webUri);
            this.strResolver.resolveParams(this.eventName);
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }
}