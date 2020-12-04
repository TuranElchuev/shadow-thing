import {
    Entity,
    ValueSource,
    IVtdInstruction,
    ConsumerInteractionInstruction,
    u
} from "../index";


export class WriteProperty extends ConsumerInteractionInstruction {

    private value: ValueSource = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj, jsonObj.writeProperty);

        if(jsonObj.writeProperty.value){
            this.value = new ValueSource("value", this, jsonObj.writeProperty.value);
        }
    }

    protected async executeConsumerInstruction(thing: WoT.ConsumedThing, name: string) {
        try{
            let value = this.value ? this.value.get() : undefined;
            await thing.writeProperty(name, value, this.getOptions());
        }catch(err){
            u.fatal("Write property failed: " + err.message);
        }         
    }
}