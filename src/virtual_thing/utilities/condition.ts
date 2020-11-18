export class Condition {

    private process: Process = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;
    }

    public isMet(): boolean{
        return true;
    }

}