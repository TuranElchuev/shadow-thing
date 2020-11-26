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

export enum InteractionEvent {
    invokeAction,    
    readProperty,
    writeProperty,
    fireEvent
}

export abstract class InteractionAffordance extends Behavior {
    
    protected uriVariables: Map<string, UriVariable> = undefined;

    protected listeningProcesses: Map<InteractionEvent, Process[]> = undefined;
    protected listeningTriggers: Map<InteractionEvent, Trigger[]> = undefined;

    public constructor(jsonObj: any, globalPath: string, owner: ComponentOwner){                
        super(jsonObj, globalPath, owner);

        if(jsonObj.uriVariables){
            this.uriVariables = ComponentFactory.parseComponentMap(jsonObj.uriVariables, ComponentType.UriVariable, this) as Map<string, UriVariable>;
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

    public registerProcess(interactionEvent: InteractionEvent, process: Process){
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

    public registerTrigger(interactionEvent: InteractionEvent, trigger: Trigger){
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

    protected onInteractionEvent(interactionEvent: InteractionEvent){
        if(this.listeningProcesses){
            let processes = this.listeningProcesses.get(interactionEvent);
            if(processes){
                for (const process of processes){
                    process.invoke();
                }
            }
        }        

        if(this.listeningTriggers){
            let triggers = this.listeningTriggers.get(interactionEvent);
            if(triggers){
                for (const trigger of triggers){
                    trigger.invoke();
                }
            }
        }        
    }
}
