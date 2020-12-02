import {
    InteractionAffordance,
    RuntimeEvent,
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Data,
    WriteOp,
    IVtdEvent,
    u
} from "../index";


export class Event extends InteractionAffordance {

    private data: Data = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdEvent){
        super(name, parent, jsonObj);

        if(jsonObj.data){
            this.data = ComponentFactory.makeComponent(ComponentType.Input, "data", this, jsonObj.data) as Data;
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
            default:
                this.errInvalidChildType(type);
        }
        if(component == undefined){
            this.errChildDoesNotExist(type, name);
        }
        return component;
    }

    public async fire(data: any){
        try{
            if(this.data && data !== undefined){
                this.data.write(WriteOp.copy, data);
            }

            // fire TD event

            await this.onInteractionEvent(RuntimeEvent.fireEvent);
        }catch(err){
            u.error(err.message, this.getPath());
        }        
    }
}