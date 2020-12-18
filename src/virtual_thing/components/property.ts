import {
    InteractionAffordance,
    RuntimeEvent,
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Component,
    Data,
    WriteOp,
    IProperty,
    IDataSchema,
    u
} from "../common/index";
import { ReadOp } from "./data";


/** Class that represents a Property interfaction affordance. */
export class Property extends InteractionAffordance {

    //#region Child components
    private input: Data = undefined;
    private output: Data = undefined;
    //#endregion

    public constructor(name: string, parent: ComponentOwner, jsonObj: IProperty){
        super(name, parent, jsonObj);

        this.input = ComponentFactory.createComponent(ComponentType.Input,
            "input", this, jsonObj as IDataSchema) as Data;
        this.output = ComponentFactory.createComponent(ComponentType.Output,
            "output", this, jsonObj as IDataSchema) as Data;
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
        
    /**
     * The read handler for the corresponding property of the ExposedThing.
     * 
     * @param options The options passed by the ExposedThing.
     */
    public async onRead(options?: WoT.InteractionOptions) {
        this.reportFunctionCall("onRead()");
        try{
            this.parseUriVariables(options);
            await this.onInteractionEvent(RuntimeEvent.readProperty);
            return this.output.read(ReadOp.copy);
        }catch(err){            
            u.error("Read property failed:\n" + err.message, this.getFullPath());
        }
    }
        
    /**
     * The write handler for the corresponding property of the ExposedThing.
     * 
     * @param value The value passed by the ExposedThing. If the value of this parameter
     * is undefined, then default value according to the schema will be sent.
     * @param options The options passed by the ExposedThing.
     */
    public async onWrite(value: any, options?: WoT.InteractionOptions) {   
        this.reportFunctionCall("onWrite()");     
        try{   
            this.parseUriVariables(options);     
            this.input.reset();
            if(value !== undefined){
                this.input.write(WriteOp.copy, value);
            }
            await this.onInteractionEvent(RuntimeEvent.writeProperty);
        }catch(err){
            u.error("Write property failed:\n" + err.message, this.getFullPath());
        }
    }
}