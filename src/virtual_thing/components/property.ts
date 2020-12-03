import {
    InteractionAffordance,
    RuntimeEvent,
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Input,
    Output,
    WriteOp,
    IVtdProperty,
    u
} from "../index";
import { ReadOp } from "./data";


export class Property extends InteractionAffordance {

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdProperty){
        super(name, parent, jsonObj);

        this.input = ComponentFactory.makeComponent(ComponentType.Input, "input", this, jsonObj) as Input;
        this.output = ComponentFactory.makeComponent(ComponentType.Output, "output", this, jsonObj) as Output;
    }

    public getChildComponent(type: string, name: string) {

        let component = undefined;

        switch(type){
            case ComponentType.Process:
                component = this.processes ? this.processes.get(name) : undefined;
                break;
            case ComponentType.Data:
                component = this.dataMap ? this.dataMap.get(name) : undefined;
                break;
            case ComponentType.UriVariable:
                component = this.uriVariables ? this.uriVariables.get(name) : undefined;
                break;
            case ComponentType.Input:
                component = this.input;
                break;
            case ComponentType.Output:
                component = this.output;
                break;
            default:
                this.errInvalidChildType(type);
        }
        if(component == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return component;
    }

    // should return a promise, proper handler
    public async onRead(options?: WoT.InteractionOptions) {
        try{
            this.parseUriVariables(options);
            await this.onInteractionEvent(RuntimeEvent.readProperty);
            return this.output.read(ReadOp.copy);
        }catch(err){            
            u.error("Read property failed: " + err.message, this.getPath());
            return null;
        }
    }

    public async onWrite(input: any, options?: WoT.InteractionOptions) {        
        try{   
            this.parseUriVariables(options);        
            if(this.input && input !== undefined){
                this.input.write(WriteOp.copy, input);
            }
            await this.onInteractionEvent(RuntimeEvent.writeProperty);
        }catch(err){
            u.error("Write property failed: " + err.message, this.getPath());
        }
    }
}