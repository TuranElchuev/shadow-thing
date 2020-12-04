import {
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Trigger,
    Data,
    Instructions,
    Expression,
    RuntimeEvent,
    Action,
    Property,
    Event,
    IVtdProcess,
    u
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
    private wait: boolean = true;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdProcess){

        super(name, parent);
            
        if(jsonObj.triggers instanceof Array){
            let index = 0;
            jsonObj.triggers.forEach(trigObj => this.triggers.push(new Trigger("triggers/" + index++, this, trigObj)));
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
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;
        }        

        this.getModel().registerProcess(this);
    }

    public setup(){
        if(this.triggers.length == 0){
            let parent = this.getParent();
            if(parent instanceof Property){
                parent.registerProcess(RuntimeEvent.readProperty, this);
                parent.registerProcess(RuntimeEvent.writeProperty, this);
            }else if(parent instanceof Action){
                parent.registerProcess(RuntimeEvent.invokeAction, this);
            }else if(parent instanceof Event){
                parent.registerProcess(RuntimeEvent.emitEvent, this);
            }            
        }
    }

    public async invoke(){
        try{
            if(!this.condition || this.condition.evaluate()){
                this.onStart();
                if(this.instructions){
                    if(this.wait){
                        await this.instructions.execute();
                    }else{
                        this.instructions.execute();
                    }    
                }                
                this.onStop();
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }    
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