import {
    InteractionAffordance,
    RuntimeEvent,
    ComponentOwner,
    ComponentType,
    Data,
    Component,
    WriteOp,
    IVtdEvent,
    u,
    ReadOp
} from "../common/index";


export class Event extends InteractionAffordance {

    public static procNameSubscribe = "subscribe";
    public static procNameUnsubscribe = "unsubscribe";

    private subscription: Data = undefined;
    private data: Data = undefined;
    private cancellation: Data = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdEvent){
        super(name, parent, jsonObj);

        if(jsonObj.data){
            this.data = new Data("data", this, jsonObj.data);
        } 
        if(jsonObj.subscription){
            this.subscription = new Data("subscription", this, jsonObj.subscription);
        } 
        if(jsonObj.cancellation){
            this.cancellation = new Data("cancellation", this, jsonObj.cancellation);
        } 
    }

    public getChildComponent(type: ComponentType): Component {

        let component = undefined;

        switch(type){
            case ComponentType.Processes:
                component = this.processes;
                break;
            case ComponentType.DataMap:
                component = this.dataMap;
                break;
            case ComponentType.Data:
                component = this.data;
                break;
            case ComponentType.Subscription:
                component = this.subscription;
                break;
            case ComponentType.Cancellation:
                component = this.cancellation;
                break;
            case ComponentType.UriVariables:
                component = this.uriVariables;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(type);
        }
        return component;
    }

    // TODO not actually implemented in WoT
    public async onSubscribe(input: any, options?: WoT.InteractionOptions) {        
        try{   
            this.parseUriVariables(options);                             
            if(this.subscription){
                this.subscription.reset();
                if(input !== undefined){
                    this.subscription.write(WriteOp.copy, input);
                }                
            }
            await this.onInteractionEvent(RuntimeEvent.subscribeEvent);
        }catch(err){
            u.error("Subscribe event failed:\n" + err.message, this.getFullPath());
        }
    }

    // TODO not actually implemented in WoT
    public async onUnsubscribe(input: any, options?: WoT.InteractionOptions) {        
        try{   
            this.parseUriVariables(options);                             
            if(this.cancellation){
                this.cancellation.reset();
                if(input !== undefined){
                    this.cancellation.write(WriteOp.copy, input);
                }                
            }
            await this.onInteractionEvent(RuntimeEvent.unsubscribeEvent);
        }catch(err){
            u.error("Unsubscribe event failed:\n" + err.message, this.getFullPath());
        }
    }

    public async emit(data?: any){
        try{
            let thing = this.getModel().getExposedThing();
            if(!thing){
                u.fatal("Thing is undefined.")
            }
            if(this.data){
                if(data !== undefined){
                    this.data.write(WriteOp.copy, data);
                }
                thing.emitEvent(this.getName(), this.data.read(ReadOp.copy));
            }else{
                thing.emitEvent(this.getName(), undefined);
            }            
            await this.onInteractionEvent(RuntimeEvent.emitEvent);
        }catch(err){
            u.fatal("Emit event failed:\n" + err.message, this.getFullPath());
        }        
    }
}