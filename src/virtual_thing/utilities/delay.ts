export class Delay {

    private delayMs: number = 0;

    public constructor(jsonObj: any){
        try{
            if(jsonObj instanceof String){
                let durString = jsonObj.toString().toLowerCase();
                let isMs = durString.indexOf("ms") >= 0;
                let numStr = durString.match(/\d+(?:\.\d+)?/);
                let num = parseInt(numStr[0], 10);
                this.delayMs = isMs ? num : num * 1000;
            }
        }catch(err){
            
        }        
    }

    public async execute(){
        if(this.delayMs > 0)
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }
}