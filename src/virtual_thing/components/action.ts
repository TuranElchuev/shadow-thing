import {
    IVtdAction,
    ComponentFactory,
    InteractionAffordance,
    RuntimeEvent,
    ComponentOwner,
    ComponentType,
    Input,
    Output,
    Component,
    WriteOp,
    ReadOp,
    u
} from "../common/index";


export class Action extends InteractionAffordance {

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdAction){        
        super(name, parent, jsonObj);

        if(jsonObj.input){
            this.input = ComponentFactory.makeComponent(ComponentType.Input, "input", this, jsonObj.input) as Input;
        }            

        if(jsonObj.output){
            this.output = ComponentFactory.makeComponent(ComponentType.Output, "output", this, jsonObj.output) as Output;
        }
    }

    public getChildComponent(type: string, name: string): Component {

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

    public async onInvoke(input: any, options?: WoT.InteractionOptions) {        
        try{   
            this.parseUriVariables(options);                             
            if(this.input){
                this.input.reset();
                if(input !== undefined){
                    this.input.write(WriteOp.copy, input);
                }                
            }
            await this.onInteractionEvent(RuntimeEvent.invokeAction);
            if(this.output){
                return this.output.read(ReadOp.copy);
            }            
        }catch(err){
            u.error("Invoke action failed: " + err.message, this.getFullPath());
            throw new Error("FAILED");
        }
    }
}