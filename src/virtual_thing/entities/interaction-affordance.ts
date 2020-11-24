import {
    EntityFactory,
    EntityType,
    EntityOwner,
    Behavior,
    Process,
    Trigger,
    WriteOp
} from "../index";
import { UriVariable } from "./data";

export enum InteractionEvent {
    invokeAction,    
    readProperty,
    writeProperty,
    fireEvent
}

export abstract class InteractionAffordance extends Behavior {
    
    protected uriVariables: Map<string, UriVariable> = undefined;

    private listeningProcesses: Map<InteractionEvent, Process[]> = new Map();
    private listeningTriggers: Map<InteractionEvent, Trigger[]> = new Map();

    public constructor(jsonObj: any, type: EntityType, name: string, parent: EntityOwner){        
        super(jsonObj, type, name, parent);

        if(jsonObj.uriVariables){
            this.uriVariables = EntityFactory.parseEntityMap(jsonObj.uriVariables, EntityType.UriVariable, this) as Map<string, UriVariable>;
        }            
    }

    protected parseUriVariables(uriVars: object){
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
        if(!this.listeningProcesses.get(interactionEvent)){
            this.listeningProcesses.set(interactionEvent, []);
        }
        if(!this.listeningProcesses.get(interactionEvent).includes(process)){
            this.listeningProcesses.get(interactionEvent).push(process)
        }        
    }

    public registerTrigger(interactionEvent: InteractionEvent, trigger: Trigger){
        if(!this.listeningTriggers.get(interactionEvent)){
            this.listeningTriggers.set(interactionEvent, []);
        }
        if(!this.listeningTriggers.get(interactionEvent).includes(trigger)){
            this.listeningTriggers.get(interactionEvent).push(trigger)
        }        
    }

    protected onInteractionEvent(interactionEvent: InteractionEvent){
        
        let processes = this.listeningProcesses.get(interactionEvent);
        if(processes){
            for (const process of processes){
                process.invoke();
            }
        }

        let triggers = this.listeningTriggers.get(interactionEvent);
        if(triggers){
            for (const trigger of triggers){
                trigger.invoke();
            }
        }
    }
}
