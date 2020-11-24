import {
    Process,
    InstructionBody,
    Loop,
    Instructions,
    u
} from "../index";

export class Try implements InstructionBody {

    private process: Process = undefined;

    private try: Instructions = undefined;
    private catch: Instructions = undefined;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        this.process = process;

        if(jsonObj.try){
            this.try = new Instructions(process, jsonObj.try, parentLoop);
        }
        if(jsonObj.catch){
            this.catch = new Instructions(process, jsonObj.catch, parentLoop);
        }
    }

    public execute(){
        try {
            if(this.try){
                this.try.execute();   
            }            
        } catch (error) {
            u.error(error.message, this.process.getGlobalPath());
            if(this.catch){
                this.catch.execute();
            }            
        }
    }

}