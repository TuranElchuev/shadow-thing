import { 
    Action,
    WritableData
} from "../index";

import {
    Process,
    InstructionBody,
    Pointer,
    CompoundData
} from "../index";

export class ReadProperty implements InstructionBody {

    private process: Process = undefined;

    private webUri: string = undefined;
    private property: string = undefined;
    private result: Pointer = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.property = jsonObj.property;
        if(jsonObj.webUri){
            this.webUri = jsonObj.webUri;
        }        
        if(jsonObj.result){
            this.result = new Pointer(jsonObj.result, this.process, [WritableData]);
        }
    }

    // TODO
    execute(){
        if(!this.property){
            return;
        }
        
        if(this.webUri){

        }

        let result = undefined; // wait for value
        if(this.result){
            this.result.writeValue(result);
        }
    }
}

export class WriteProperty implements InstructionBody {

    private process: Process = undefined;

    private webUri: string = undefined;
    private property: string = undefined;
    private value: CompoundData = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.property = jsonObj.property;
        if(jsonObj.webUri){
            this.webUri = jsonObj.webUri;
        }      
        if(jsonObj.value){
            this.value = new CompoundData(this.process, jsonObj.value);
        }
    }

    // TODO
    execute(){
        if(!this.property){
            return;
        }
        
        if(this.webUri){

        }

        if(this.value){
            
        }
    }
}

export class InvokeAction implements InstructionBody {

    private process: Process = undefined;

    private webUri: string = undefined;
    private action: string = undefined;
    private input: CompoundData = undefined;
    private output: Pointer = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;
        
        this.action = jsonObj.action;
        if(jsonObj.webUri){
            this.webUri = jsonObj.webUri;
        }      
        if(jsonObj.input){
            this.input = new CompoundData(this.process, jsonObj.input);
        }
        if(jsonObj.output){
            this.output = new Pointer(jsonObj.output, this.process, [Action]);
        }
    }

    // TODO
    execute(){
        if(!this.action){
            return;
        }
        
        if(this.webUri){

        }

        if(this.input){
            // invoke action with this input
        }

        if(this.output){
            // wait for action results and store in output
        }
    }
}


export class FireEvent implements InstructionBody {

    private process: Process = undefined;

    private event: string = undefined;
    private data: CompoundData = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.event = jsonObj.event;
        if(jsonObj.data){
            this.data = new CompoundData(this.process, jsonObj.data);
        }        
    }

    // TODO
    execute(){
        if(!this.event){
            return;
        }        

        if(this.data){

        }
    }
}

export class InvokeProcess implements InstructionBody {

    private process: Process = undefined;

    private processPtr: Pointer = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        if(jsonObj.process){
            this.processPtr = new Pointer(jsonObj.process, this.process, [Process]);      
        }        
    }

    // TODO
    execute(){
        if(this.processPtr){
            (this.processPtr.readValue() as Process).invoke();
        }        
    }
}


