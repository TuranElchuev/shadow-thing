import {
    EntityFactory,
    EntityOwner,
    EntityType,
    Trigger,
    Data,
    Instructions,
    Expression,
    InteractionEvent,
    Action,
    Property,
    Event
} from "../index";

export enum ProcessState {
    stopped,
    started,
    aborted
}

export class Process extends EntityOwner {

    private state: ProcessState = ProcessState.stopped;

    private triggers: Trigger[] = [];
    private condition: Expression = undefined;
    private dataMap: Map<string, Data> = undefined;
    private instructions: Instructions = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){

        super(EntityType.Process, name, parent);
            
        if(jsonObj.triggers instanceof Array){
            jsonObj.triggers.forEach(t => this.triggers.push(new Trigger(t, this)));
        }else{
            if(parent instanceof Property){
                parent.registerProcess(InteractionEvent.readProperty, this);
                parent.registerProcess(InteractionEvent.writeProperty, this);
            }else if(parent instanceof Action){
                parent.registerProcess(InteractionEvent.invokeAction, this);
            }else if(parent instanceof Event){
                parent.registerProcess(InteractionEvent.fireEvent, this);
            }            
        }

        if(jsonObj.instructions){
            this.instructions = new Instructions(this,
                                                    jsonObj.instructions,
                                                    undefined,
                                                    this.getGlobalPath() + "/instructions");
        }
        if(jsonObj.condition){
            this.condition = new Expression(this, jsonObj.condition);
        }                
        if(jsonObj.dataMap){
            this.dataMap = EntityFactory.parseEntityMap(jsonObj.dataMap, EntityType.Data, this) as Map<string, Data>;
        }        
    }

    public async invoke(){
        
        if(this.condition && !this.condition.evaluate()){
            return;
        } 

        this.onStart();

        if(this.instructions){
            await this.instructions.execute();
        }        

        this.onStop();
    }

    public canContinueExecution(): boolean {
        return this.state != ProcessState.aborted;
    }

    public abort(){
        this.state = ProcessState.aborted;
    }

    public getChildEntity(type: string, name: string) {

        let entity = undefined;

        switch(type){
            case EntityType.Data:
                entity = this.dataMap ? this.dataMap.get(name) : undefined;
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(entity == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return entity;
    }

    public getState(): ProcessState {
        return this.state;
    }

    private onStart(){
        this.state = ProcessState.started;
    }

    private onStop(){
        this.state = ProcessState.stopped;
    }
}