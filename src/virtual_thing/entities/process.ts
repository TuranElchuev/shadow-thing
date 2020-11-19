import {
    EntityFactory,
    Entity,
    EntityOwner,
    EntityType, 
    Invokable,
    Trigger,
    CompoundData,
    Instructions,
    Expression,
    Pointer
} from "../index";

export enum ProcessState {
    stopped,
    started,
    aborted
}

export class Process extends Invokable {

    private state: ProcessState = ProcessState.stopped;

    private triggers: Trigger[] = [];
    private condition: Expression = undefined;
    private dataMap: Map<string, Entity> = undefined;
    private instructions: Instructions = undefined;

    private input: CompoundData = undefined;
    private output: Pointer = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){

        super(EntityType.Process, name, parent);

        if(jsonObj instanceof Object){
            
            let triggers = jsonObj?.triggers;
            if(triggers instanceof Array){
                triggers.forEach(t => this.triggers.push(new Trigger(t, this)));
            }

            this.instructions = new Instructions(this, jsonObj?.instructions);
            this.condition = new Expression(this, jsonObj?.condition);

            this.dataMap = EntityFactory.parseEntityMap(jsonObj?.dataMap, EntityType.Data, this);
        } 
    }

    public async invoke(input: CompoundData, output: Pointer){
        
        this.input = input;
        this.output = output;

        if(!this.condition?.evaluate()) return;

        this.onStart();

        await this.instructions.execute();

        this.onStop();
    }

    public canContinueExecution(): boolean {
        return this.state != ProcessState.aborted;
    }

    public abort(){
        this.state = ProcessState.aborted;
    }

    public getChildEntity(container: string, name: string) {
        // data, input, output
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