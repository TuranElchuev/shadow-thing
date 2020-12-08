import {
    ComponentFactory,
    ComponentType,
    ComponentOwner,
    Behavior,
    Process,
    Trigger,
    WriteOp,
    UriVariable,
    IVtdInteractionAffordance,
    u
} from "../common/index";


export enum RuntimeEvent {
    invokeAction = "invokeAction",    
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    emitEvent = "emitEvent",
    startup = "startup",
    shutdown = "shutdown"
}

export abstract class InteractionAffordance extends Behavior {
    
    protected uriVariables: Map<string, UriVariable> = undefined;

    protected listeningProcesses: Map<RuntimeEvent, Process[]> = new Map();
    protected listeningTriggers: Map<RuntimeEvent, Trigger[]> = new Map();

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdInteractionAffordance){                
        super(name, parent, jsonObj);

        if(jsonObj.uriVariables){
            this.uriVariables = ComponentFactory.parseComponentMap(ComponentType.UriVariable,
                "uriVariables", this, jsonObj.uriVariables) as Map<string, UriVariable>;
        }            
    }

    protected parseUriVariables(options?: WoT.InteractionOptions){
        if(this.uriVariables){   
            for (let key of Array.from(this.uriVariables.keys())){
                var uriVar = this.uriVariables.get(key);

                uriVar.reset();

                if(options && options.uriVariables
                    && options.uriVariables[key] !== undefined){

                    try{
                        uriVar.write(WriteOp.copy, options.uriVariables[key]);
                    }catch(err){
                        u.fatal("Could not parse uri variable \"" + key + "\":\n" + err.message);
                    }                    
                }                                
            }
        }
    }

    public registerProcess(interactionEvent: RuntimeEvent, process: Process){
        if(!this.listeningProcesses.has(interactionEvent)){
            this.listeningProcesses.set(interactionEvent, []);
        }
        if(!this.listeningProcesses.get(interactionEvent).includes(process)){
            this.listeningProcesses.get(interactionEvent).push(process)
        }        
    }

    public registerTrigger(interactionEvent: RuntimeEvent, trigger: Trigger){
        if(!this.listeningTriggers.has(interactionEvent)){
            this.listeningTriggers.set(interactionEvent, []);
        }
        if(!this.listeningTriggers.get(interactionEvent).includes(trigger)){
            this.listeningTriggers.get(interactionEvent).push(trigger)
        }        
    }

    protected async onInteractionEvent(interactionEvent: RuntimeEvent){
        try{
            if(this.listeningProcesses){
                let processes = this.listeningProcesses.get(interactionEvent);
                if(processes){
                    for (const process of processes){
                        await process.invoke();
                    }
                }
            }        
    
            if(this.listeningTriggers){
                let triggers = this.listeningTriggers.get(interactionEvent);
                if(triggers){
                    for (const trigger of triggers){
                        await trigger.invoke();
                    }
                }
            }  
        }catch(err){
            throw err;
        }              
    }
}
