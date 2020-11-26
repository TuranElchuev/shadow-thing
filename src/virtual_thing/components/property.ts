import {
    InteractionAffordance,
    InteractionEvent,
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Input,
    Output
} from "../index";

export class Property extends InteractionAffordance {

    private input: Input = undefined;
    private output: Output = undefined;

    public constructor(name: string, jsonObj: any, owner: ComponentOwner){
        super(jsonObj, owner.getGlobalPath() + "/properties/" + name, owner);

        this.input = ComponentFactory.makeComponent(ComponentType.Input, "input", jsonObj, this) as Input;
        this.output = ComponentFactory.makeComponent(ComponentType.Output, "output", jsonObj, this) as Output;
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

    public read(uriVars: object) {
        this.parseUriVariables(uriVars);                
        this.onInteractionEvent(InteractionEvent.readProperty);
    }

    public write(uriVars: object, input: any) {        
        this.parseUriVariables(uriVars);        
        this.onInteractionEvent(InteractionEvent.writeProperty);
    }
}