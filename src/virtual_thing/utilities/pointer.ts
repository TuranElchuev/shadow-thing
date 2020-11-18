enum PointerType {
    Property,
    Action,
    Event,
    Sensor,
    Actuator,
    Variable,
    Process,
    DataSchema
}

export class Pointer {

    private readonly openSequence: string = "$(";
    private readonly closeSequence: string = ")";

    private owner: VTModelComponent = undefined;
    private process: Process = undefined;

    private ptrStr: string = undefined;
    private pointerType: PointerType = undefined

    public constructor(ptrStr: string, owner: VTModelComponent, process: Process = undefined){
        this.owner = owner;
        this.process = process;
        this.ptrStr = JSON.stringify(ptrStr);

    }

    private resolve(): string {
        
        if(this.ptrStr == undefined)
            return undefined;

        var ptr = this.ptrStr.trim().replace(/ /g, "");

        let open = ptr.indexOf(this.openSequence);

        while(open > -1){      

            let nextOpen = ptr.indexOf(this.openSequence, open + 1);
            let close = ptr.indexOf(this.closeSequence);

            if(close > open && (nextOpen < 0 || close < nextOpen)){
                    
                ptr = ptr.substring(0, open) 
                    + this.getValue(ptr.substring(open + this.openSequence.length, close))
                    + ptr.substring(close + this.closeSequence.length, ptr.length);

                open = ptr.indexOf(this.openSequence);

            }else if(nextOpen > 0 && close > nextOpen){
                open = nextOpen;
            }else{
                throw new Error('Invalid JSON pointer: ${}' + this.ptrStr);
            }
        }

        return ptr.replace(/\/\//g, "/");
    }

    public getValue(ptr: string = undefined): any {

        if(ptr == undefined)
            ptr = this.resolve();

        if(ptr == undefined)
            return undefined;

        let tokens: string[] = undefined;
        try{
            tokens = pointer.parse(ptr);
        }catch(err){
            // 
        }
         
        
        // use ptr to access object directly

        return ptr;
    }

    public setValue(value: any){

    }

    public getValueStr(): string {
        return JSON.stringify(this.getValue());
    }
 }
