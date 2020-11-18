export class Try implements InstructionBody {

    private try: Instructions = undefined;
    private catch: Instructions = undefined;

    public constructor(process: Process, jsonObj: any, parentLoop: Loop = undefined){
        this.try = new Instructions(process, jsonObj?.try, parentLoop);
        this.catch = new Instructions(process, jsonObj?.catch, parentLoop);
    }

    async execute(){
        try {
            await this.try.execute();   
        } catch (error) {
            await this.catch.execute();
        }
    }

}