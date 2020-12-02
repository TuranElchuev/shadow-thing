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

    public async onRead(uriVars: object) {
        try{
            this.parseUriVariables(uriVars);                
            await this.onInteractionEvent(RuntimeEvent.readProperty);
            // return output
        }catch(err){
            u.error(err.message, this.getPath());
            // reject
        }    
    }

    public async onWrite(uriVars: object, input: any) {     
        try{   
            this.parseUriVariables(uriVars);        
            if(this.input && input !== undefined){
                this.input.write(WriteOp.copy, input);
            }
            await this.onInteractionEvent(RuntimeEvent.writeProperty);
            // accept
        }catch(err){
            u.error(err.message, this.getPath());
            // reject
        }    
    }
}