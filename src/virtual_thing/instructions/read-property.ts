import {
    ConsumerInteractionInstruction,
    Instructions,
    ValueTarget,
    IVtdInstruction,
    u
} from "../index";


export class ReadProperty extends ConsumerInteractionInstruction {
    
    private result: ValueTarget = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.readProperty);

        if(jsonObj.readProperty.result){
            this.result = new ValueTarget("result", this, jsonObj.readProperty.result);
        }
    }

    protected async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string) {
        try{
            let result = await thing.readProperty(name, this.getOptions());     
            if(this.result){
                this.result.set(result);
            }
        }catch(err){
            u.fatal("Read property failed: " + err.message);
        }         
    }
}