import {
    InteractionAffordance,
    RuntimeEvent,
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Component,
    Input,
    Output,
    WriteOp,
    IVtdProperty,
    u
} from "../common/index";
import { ReadOp } from "./data";


export class Property extends InteractionAffordance {

    public static procNameRead = "read";
    public static procNameWrite = "write";

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdProperty){
        super(name, parent, jsonObj);

        this.input = ComponentFactory.makeComponent(ComponentType.Input, "input", this, jsonObj) as Input;
        this.output = ComponentFactory.makeComponent(ComponentType.Output, "output", this, jsonObj) as Output;
    }

    public getChildComponent(name: string): Component {

        let component = undefined;

        switch(name){
            case ComponentType.Processes:
                component = this.processes;
                break;
            case ComponentType.DataMap:
                component = this.dataMap;
                break;
            case ComponentType.UriVariables:
                component = this.uriVariables;
                break;
            case ComponentType.Input:
                component = this.input;
                break;
            case ComponentType.Output:
                component = this.output;
                break;
        }
        if(component == undefined){
            this.errChildDoesNotExist(name);
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
            u.error("Read property failed:\n" + err.message, this.getFullPath());
        }
    }

    public async onWrite(input: any, options?: WoT.InteractionOptions) {        
        try{   
            this.parseUriVariables(options);     
            this.input.reset();
            if(input !== undefined){
                this.input.write(WriteOp.copy, input);
            }
            await this.onInteractionEvent(RuntimeEvent.writeProperty);
        }catch(err){
            u.error("Write property failed:\n" + err.message, this.getFullPath());
        }
    }
}