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

    private thing: WoT.ExposedThing = undefined;

    private data: Data = undefined;

    public constructor(name: string, parent: ComponentOwner, jsonObj: IVtdEvent){
        super(name, parent, jsonObj);

        if(jsonObj.data){
            this.data = ComponentFactory.makeComponent(ComponentType.Output, "data", this, jsonObj.data) as Data;
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
            case ComponentType.Output:
                component = this.data;
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

    public setThing(thing: WoT.ExposedThing){
        this.thing = thing;
    }

    public async fire(data?: any){
        try{
            if(!this.thing){
                u.fatal("Thing is undefined.")
            }
            if(this.data && data !== undefined){
                this.data.write(WriteOp.copy, data);
            }
            this.thing.emitEvent(this.getName(), data);
            await this.onInteractionEvent(RuntimeEvent.fireEvent);
        }catch(err){
            u.fatal("Emit event failed: " + err.message, this.getFullPath());
        }        
    }
}