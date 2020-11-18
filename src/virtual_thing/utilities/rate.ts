import { Process } from "../index";

export class Rate {

    private process: Process = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;
    }

    public async nextTick(){

    }
}