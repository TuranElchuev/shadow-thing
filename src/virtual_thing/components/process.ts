import {
    ComponentFactory,
    ComponentOwner,
    ComponentType,
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

export class Process extends ComponentOwner {

    private state: ProcessState = ProcessState.stopped;

    private triggers: Trigger[] = [];
    private condition: Expression = undefined;
    private dataMap: Map<string, Data> = undefined;
    private instructions: Instructions = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: any){

        super(name, parent);
            
        if(jsonObj.triggers instanceof Array){
            let index = 0;
            jsonObj.triggers.forEach(t => this.triggers.push(new Trigger(t, this,
                    this.getPath() + "/triggers/" + index++)));
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
            this.instructions = new Instructions("instructions", this, jsonObj.instructions, this, undefined);
        }
        if(jsonObj.condition){
            this.condition = new Expression("condition", this, jsonObj.condition);
        }                
        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.Data,
                "dataMap", this, jsonObj.dataMap) as Map<string, Data>;
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

    public getChildComponent(type: string, name: string) {

        let component = undefined;

        switch(type){
            case ComponentType.Data:
                component = this.dataMap ? this.dataMap.get(name) : undefined;
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(component == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return component;
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