import {
    InteractionAffordance,
    InteractionEvent,
    ComponentFactory,
    ComponentOwner,
    ComponentType,
    Data,
    WriteOp
} from "../index";

export class Event extends InteractionAffordance {

    private data: Data = undefined;

    public constructor(name: string, jsonObj: any, owner: ComponentOwner){
        super(jsonObj, owner.getGlobalPath() + "/events/" + name, owner);

        if(jsonObj.data){
            this.data = ComponentFactory.makeComponent(ComponentType.Input, "data", jsonObj.data, this) as Data;
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

    public invoke(data: any){
        if(this.data && data !== undefined){
            this.data.write(WriteOp.copy, data);
        }

        this.onInteractionEvent(InteractionEvent.fireEvent);
    }
}