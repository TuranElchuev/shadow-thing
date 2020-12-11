import {
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Component,
    Trigger,
    Instructions,
    Math,
    RuntimeEvent,
    Action,
    Property,
    Event,
    IVtdProcess,
    u,
    ComponentMap
} from "../common/index";


export enum ProcessState {
    stopped,
    started,
    aborted
}

export class Process extends ComponentOwner {

    private state: ProcessState = ProcessState.stopped;

    private triggers: Trigger[] = [];
    private condition: Math = undefined;
    private dataMap: ComponentMap = undefined;
    private instructions: Instructions = undefined;
    private wait: boolean = true;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdProcess){

        super(name, parent);
            
        if(jsonObj.triggers instanceof Array){
            let index = 0;
            jsonObj.triggers.forEach(trigObj => this.triggers.push(new Trigger("triggers/" + index++, this, trigObj)));
        }

        if(jsonObj.instructions){
            this.instructions = new Instructions("instructions", this, jsonObj.instructions);
        }
        if(jsonObj.condition){
            this.condition = new Math("condition", this, jsonObj.condition);
        }                
        if(jsonObj.dataMap){
            this.dataMap = ComponentFactory.parseComponentMap(ComponentType.DataMap,
                "dataMap", this, jsonObj.dataMap);
        }
        if(jsonObj.wait != undefined){
            this.wait = jsonObj.wait;
        }        

        this.getModel().registerProcess(this);
    }

    public setup(){
        if(this.triggers.length == 0){
            let behavior = this.getBehavior();
            if(behavior instanceof Property){
                if(this.getName() == Property.procNameRead){
                    behavior.registerProcess(RuntimeEvent.readProperty, this);
                }else if(this.getName() == Property.procNameWrite){
                    behavior.registerProcess(RuntimeEvent.writeProperty, this);
                }else{
                    behavior.registerProcess(RuntimeEvent.readProperty, this);
                    behavior.registerProcess(RuntimeEvent.writeProperty, this);
                }
            }else if(behavior instanceof Action){
                behavior.registerProcess(RuntimeEvent.invokeAction, this);
            }else if(behavior instanceof Event){
                behavior.registerProcess(RuntimeEvent.emitEvent, this);
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

    public getChildComponent(type: string): Component {

        let component = undefined;

        switch(type){
            case ComponentType.DataMap:
                component = this.dataMap;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(type);
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