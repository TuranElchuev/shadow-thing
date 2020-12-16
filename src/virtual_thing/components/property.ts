import {
    InteractionAffordance,
    RuntimeEvent,
    ComponentOwner,
    ComponentType,
    Component,
    Data,
    WriteOp,
    IVtdProperty,
    IVtdDataSchema,
    u
} from "../common/index";
import { ReadOp } from "./data";


export class Property extends InteractionAffordance {

    public static procNameRead = "read";
    public static procNameWrite = "write";

    private input: Data = undefined;
    private output: Data = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdProperty){
        super(name, parent, jsonObj);

        this.input = new Data("input", this, jsonObj as IVtdDataSchema);
        this.output = new Data("output", this, jsonObj as IVtdDataSchema);
    }

    public getChildComponent(type: ComponentType): Component {

        let component = undefined;

        switch(type){
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
            this.errChildDoesNotExist(type);
        }
        return component;
    }

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