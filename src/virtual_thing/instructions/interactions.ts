import { Action } from "../entities/action";
import { Property } from "../entities/property";
import {
    Process,
    InstructionBody,
    Pointer,
    CompoundData
} from "../index";

export class ReadProperty implements InstructionBody {

    private process: Process = undefined;

    private webUri: string = "localhost";
    private property: string = undefined;
    private output: Pointer = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.output = new Pointer(jsonObj?.output, this.process, [Property]);
        this.property = jsonObj?.property;
        if(jsonObj?.webUri != undefined){
            this.webUri = jsonObj.webUri;
        }  
    }

    execute(){

    }
}

export class WriteProperty implements InstructionBody {

    private process: Process = undefined;

    private webUri: string = "localhost";
    private property: string = undefined;
    private value: CompoundData = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.property = jsonObj?.property;
        if(jsonObj?.value != undefined){
            this.value = new CompoundData(this.process, jsonObj.value);
        }
        if(jsonObj?.webUri != undefined){
            this.webUri = jsonObj.webUri;
        }  
    }

    execute(){

    }
}

export class InvokeAction implements InstructionBody {

    private process: Process = undefined;

    private webUri: string = "localhost";
    private action: string = undefined;
    private input: CompoundData = undefined;
    private output: Pointer = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;
        
        this.action = jsonObj?.action;
        if(jsonObj?.input != undefined){
            this.input = new CompoundData(this.process, jsonObj.input);
        }
        if(jsonObj?.output != undefined){
            this.output = new Pointer(jsonObj.output, this.process, [Action]);
        }        
        if(jsonObj?.webUri != undefined){
            this.webUri = jsonObj.webUri;
        }
    }

    execute(){

    }
}


export class FireEvent implements InstructionBody {

    private process: Process = undefined;

    private event: string = undefined;
    private data: CompoundData = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.event = jsonObj?.event;
        if(jsonObj?.data != undefined){
            this.data = new CompoundData(this.process, jsonObj.data);
        }        
    }

    execute(){

    }
}

export class InvokeProcess implements InstructionBody {

    private process: Process = undefined;

    private processPtr: Pointer = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;

        this.processPtr = new Pointer(jsonObj.process, this.process, [Process]);      
    }

    execute(){

    }
}


