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

    public getChildComponent(name: string): Component {

        let component = undefined;
        
        switch(name){
            case ComponentType.Process:
                component = this.processes;
                break;
            case ComponentType.Data:
                component = this.dataMap;
                break;
            case ComponentType.UriVariable:
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
            u.error("Invoke action failed:\n" + err.message, this.getFullPath());
        }
    }
}