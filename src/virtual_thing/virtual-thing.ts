import {
    ComponentFactory,
    ComponentType,
    VirtualThingModel,
    IVirtualThingDescription,
    ModelStateListener,
    u
} from "./index";

const Ajv = require('ajv');

export class VirtualThing implements ModelStateListener {

    private vtd: IVirtualThingDescription = undefined;
    private td: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(instance: number,
        vtd: IVirtualThingDescription,
        factory: WoT.WoT,
        tdSchema: any,
        vtdSchema: any) {

        this.factory = factory;
        this.vtd = vtd;

        this.vtd.title = vtd.title ? vtd.title + "_" + instance : "vt_" + instance;

        var ajv = new Ajv();
        ajv.addSchema(tdSchema, 'td');
        ajv.addSchema(vtdSchema, 'vtd');
        
        /*
        if(!ajv.validate('td', vtd)){
            u.fatal("Invalid TD specified: " + ajv.errorsText(), this.getTitle());
        }*/
        
        if(!ajv.validate('vtd', vtd)){
            u.fatal("Invalid VTD specified: " + ajv.errorsText(), this.getTitle());
        }
        
        this.model = ComponentFactory.makeComponent(ComponentType.Model, 
            this.getTitle(), undefined, this.vtd) as VirtualThingModel;
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
        if(td.properties){
            for (let key in td.properties){
                deleteBehavior(td.properties[key]);
            }
        }
        if(td.actions){
            for (let key in td.actions){
                deleteBehavior(td.actions[key]);
            }
        }
        if(td.events){
            for (let key in td.events){
                deleteBehavior(td.events[key]);
            }
        }        
        if(td.sensors){
            delete td.sensors;
        }
        if(td.actuators){
            delete td.actuators;
        }

        this.td = td;
    }

    public onModelFailed(message: string) {
        u.error("Model failed:\n" + message, this.getTitle());
    }
    
    public onModelStartIssued() {
        u.info("Model start issued.", this.getTitle());
    }

    public onModelStopIssued() {
        u.info("Model stop issued.", this.getTitle());

        // TODO adapt this when "destroy" is implemented in node-wot
        this.thing.destroy()
            .then(() => u.info("Exposed thing destroyed.", this.getTitle()))
            .catch(err => u.error(err.message, this.getTitle()));
    }

    public getTitle(): string {
        return this.vtd.title;
    }

    public getModel(): VirtualThingModel {
        return this.model;
    }

    public async produce() {
        if(!this.thing){
            try{
                this.thing = await this.factory.produce(this.td);
                this.model.bindToThing(this.thing);
            }catch(err){
                throw err;
            }  
        }
        return this;         
    }

    public expose() {
        this.thing.expose()
            .then(() => this.model.start())
            .catch(err => u.error(err.message, this.getTitle()));
    }
}