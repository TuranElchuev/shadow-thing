import {
    VTModelComponent, 
    Trigger,
    Condition,
    CompoundData,
    DataMap,
    Instructions,
    Pointer,
    Invokeable,
    HasDataMap
} from "../index";

export enum ProcessState {
    stopped,
    started,
    aborted
}

export class Process implements Invokeable, HasDataMap {

    private owner: VTModelComponent = undefined;

    private state: ProcessState = ProcessState.stopped;

    private triggers: Trigger[] = [];
    private condition: Condition = undefined;
    private dataMap: DataMap = undefined;
    private instructions: Instructions = undefined;

    private input: CompoundData = undefined;
    private output: Pointer = undefined;

    public constructor(jsonObj: any, owner: VTModelComponent){

        this.owner = owner;

        if(jsonObj instanceof Object){
            
            let triggers = jsonObj?.triggers;
            if(triggers instanceof Array){
                triggers.forEach(t => this.triggers.push(new Trigger(t, this)));
            }

            this.instructions = new Instructions(this, jsonObj?.instructions);
            this.condition = new Condition(this, jsonObj?.condition);
            this.dataMap = new DataMap(jsonObj?.dataMap);
        } 
    }

    public async invoke(input: CompoundData, output: Pointer){
        
        this.input = input;
        this.output = output;

        if(!this.condition?.isMet()) return;

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

    public getOwner(): VTModelComponent {
        return this.owner;
    }

    public getDataMap(): DataMap {
        return this.dataMap;
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

export class Processes {

    private processes: Map<string, Process> = new Map();

    public constructor(owner: VTModelComponent, jsonObj: any) {
        if(jsonObj instanceof Object)
            for (const [key, value] of Object.entries(jsonObj))
                this.processes.set(key, new Process(value, owner));
    }

    public getProcess(name: string): Process {
        return this.processes.get(name);
    }
}