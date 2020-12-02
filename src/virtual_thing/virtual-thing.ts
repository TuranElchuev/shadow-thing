import {
    ComponentFactory,
    ComponentType,
    VirtualThingModel,
    IVirtualThingDescription,
    ModelStateListener,
    u
} from "./index";


export class VirtualThing implements ModelStateListener {

    private name: string;
    private vtd: IVirtualThingDescription = undefined;
    private td: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(name: string, vtd: IVirtualThingDescription, factory: WoT.WoT) {

        this.name = name;
        this.factory = factory;
        this.vtd = vtd;

        this.model = ComponentFactory.makeComponent(ComponentType.Model, 
            name, undefined, this.vtd) as VirtualThingModel;
        this.model.addModelStateListener(this);
        
        this.extractTD();              
    }
    
    private extractTD() {

        let deleteBehavior = function(obj: any){
            if(obj.dataMap){
                delete obj.dataMap;
            }
            if(obj.processes){
                delete obj.processes;
            }
        }

        let td: IVirtualThingDescription = JSON.parse(JSON.stringify(this.vtd));
        deleteBehavior(td);
        for (const [, value] of Object.entries(td.properties)){
            deleteBehavior(value);
        }
        for (const [, value] of Object.entries(td.actions)){
            deleteBehavior(value);
        }
        for (const [, value] of Object.entries(td.events)){
            deleteBehavior(value);
        }
        if(td.sensors){
            delete td.sensors;
        }
        if(td.actuators){
            delete td.actuators;
        }

        this.td = td;
    }

    private createThingHandlers(){
    }

    public onModelFailed(message: string) {
        u.error("Model failed:\n" + message, this.getName());
        this.destroy();
    }
    
    public onModelStarted() {
        u.info("Model started.", this.getName());
    }

    public onModelStopped() {
        u.info("Model stopped.", this.getName());
    }

    public getName(): string {
        return this.name;
    }

    public getModel(): VirtualThingModel {
        return this.model;
    }

    public async produce() {
        if(!this.thing){
            try{
                this.thing = await this.factory.produce(this.td);
                this.createThingHandlers();
            }catch(err){
                throw err;
            }  
        }
        return this;         
    }

    public expose() {
        this.thing.expose()
            .then(() => this.model.start())
            .catch(err => u.error(err.message, this.getName()));
    }

    public destroy() {
        this.thing.destroy()
            .then(() => this.model.stop())
            .catch(err => u.error(err.message, this.getName()));
    }
}