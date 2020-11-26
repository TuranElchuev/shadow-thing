import {
    ComponentFactory,
    InteractionAffordance,
    InteractionEvent,
    ComponentOwner,
    ComponentType,
    Input,
    Output,
    WriteOp
} from "../index";


export class Action extends InteractionAffordance {

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, jsonObj: any, owner: ComponentOwner){        
        super(jsonObj, owner.getGlobalPath() + "/actions/" + name, owner);

        if(jsonObj.input){
            this.input = ComponentFactory.makeComponent(ComponentType.Input, "input", jsonObj.input, this) as Input;
        }            

        if(jsonObj.output){
            this.output = ComponentFactory.makeComponent(ComponentType.Output, "output", jsonObj.output, this) as Output;
        }
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

    public invoke(uriVars: object, input: any) {

        this.parseUriVariables(uriVars);        

        if(this.input && input !== undefined){
            this.input.write(WriteOp.copy, input);
        }
                
        this.onInteractionEvent(InteractionEvent.invokeAction);
    }
}