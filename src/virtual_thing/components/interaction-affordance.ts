import {
    ComponentFactory,
    ComponentType,
    ComponentOwner,
    Behavior,
    Process,
    Trigger,
    WriteOp,
    UriVariable
} from "../index";


export enum RuntimeEvent {
    invokeAction = "invokeAction",    
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    fireEvent = "fireEvent",
    startup = "startup",
    shutdown = "shutdown"
}

export abstract class InteractionAffordance extends Behavior {
    
    protected uriVariables: Map<string, UriVariable> = undefined;

    protected listeningProcesses: Map<RuntimeEvent, Process[]> = undefined;
    protected listeningTriggers: Map<RuntimeEvent, Trigger[]> = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: any){                
        super(name, parent, jsonObj);

        if(jsonObj.uriVariables){
            this.uriVariables = ComponentFactory.parseComponentMap(ComponentType.UriVariable,
                "uriVariables", this, jsonObj.uriVariables) as Map<string, UriVariable>;
        }            
    }

    protected parseUriVariables(uriVars: any){
        if(uriVars && this.uriVariables){         
            for (const [key, value] of Object.entries(uriVars)){
                var uriVar = this.uriVariables.get(key);
                if(uriVar){
                    uriVar.write(WriteOp.copy, value);
                }                                
            }
        }
    }

    public registerProcess(interactionEvent: RuntimeEvent, process: Process){
        if(!this.listeningProcesses){
            this.listeningProcesses = new Map();
        }
        if(!this.listeningProcesses.get(interactionEvent)){
            this.listeningProcesses.set(interactionEvent, []);
        }
        if(!this.listeningProcesses.get(interactionEvent).includes(process)){
            this.listeningProcesses.get(interactionEvent).push(process)
        }        
    }

    public registerTrigger(interactionEvent: RuntimeEvent, trigger: Trigger){
        if(!this.listeningTriggers){
            this.listeningTriggers = new Map();
        }
        if(!this.listeningTriggers.get(interactionEvent)){
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
