import {
    EntityFactory,
    EntityType,
    EntityOwner,
    Behavior,
    Process,
    Data,
    Trigger
} from "../index";

export enum InteractionEvent {
    invokeAction,    
    readProperty,
    writeProperty,
    fireEvent
}

export abstract class InteractionAffordance extends Behavior {
    
    protected uriVariables: Map<string, Data> = undefined;

    private listeningProcesses: Map<InteractionEvent, Process[]> = new Map();
    private listeningTriggers: Map<InteractionEvent, Trigger[]> = new Map();

    public constructor(jsonObj: any, type: EntityType, name: string, parent: EntityOwner){        
        super(jsonObj, type, name, parent);

        if(jsonObj.uriVariables != undefined)
            this.uriVariables = EntityFactory.parseEntityMap(jsonObj.uriVariables, EntityType.UriVariable, this) as Map<string, Data>;
    }

    protected parseUriVariables(uriVars: object){
        if(uriVars != undefined && this.uriVariables != undefined){            
            for (const [key, value] of Object.entries(uriVars)){
                this.uriVariables.get(key)?.write(value);
            }
        }
    }

    public registerProcess(interactionEvent: InteractionEvent, process: Process){
        if(this.listeningProcesses.get(interactionEvent) == undefined){
            this.listeningProcesses.set(interactionEvent, []);
        }
        if(!this.listeningProcesses.get(interactionEvent).includes(process)){
            this.listeningProcesses.get(interactionEvent).push(process)
        }        
    }

    public registerTrigger(interactionEvent: InteractionEvent, trigger: Trigger){
        if(this.listeningTriggers.get(interactionEvent) == undefined){
            this.listeningTriggers.set(interactionEvent, []);
        }
        if(!this.listeningTriggers.get(interactionEvent).includes(trigger)){
            this.listeningTriggers.get(interactionEvent).push(trigger)
        }        
    }

    protected onInteractionEvent(interactionEvent: InteractionEvent){
        let processes = this.listeningProcesses.get(interactionEvent);
        if(processes != undefined){
            for (const process of processes){
                process.invoke();
            }
        }

        let triggers = this.listeningTriggers.get(interactionEvent);
        if(triggers != undefined){
            for (const trigger of triggers){
                trigger.invoke();
            }
        }
    }
}
