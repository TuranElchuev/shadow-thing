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

    private name: string = undefined;
    private vtd: IVirtualThingDescription = undefined;
    private td: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(name: string,
        vtd: IVirtualThingDescription,
        factory: WoT.WoT,
        tdSchema: any,
        vtdSchema: any) {

        if(name){
            this.name = name;
        }else{
            this.name = vtd.title;
        }
        this.factory = factory;
        this.vtd = vtd;

        var ajv = new Ajv();
        ajv.addSchema(tdSchema, 'td');
        ajv.addSchema(vtdSchema, 'vtd');
        
        /* TODO uncomment this when done with development
        if(!ajv.validate('td', vtd)){
            u.fatal("Invalid TD specified: " + ajv.errorsText(), this.getName());
        }*/
        
        if(!ajv.validate('vtd', vtd)){
            u.fatal("Invalid VTD specified: " + ajv.errorsText(), this.getName());
        }
        
        try{
            this.model = ComponentFactory.makeComponent(ComponentType.Model, 
                this.getName(), undefined, this.vtd) as VirtualThingModel;
                this.model.addModelStateListener(this);        
                this.extractTD();              
        }catch(err){
            u.fatal("Failed to create a model:\n" + err.message, this.getName());
        }
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
        u.error("Model failed:\n" + message, this.getName());
    }
    
    public onModelStartIssued() {
        u.info("Model start issued.", this.getName());
    }

    public onModelStopIssued() {
        u.info("Model stop issued.", this.getName());

        // TODO adapt this when "destroy" is implemented in node-wot
        this.thing.destroy()
            .then(() => u.info("Exposed thing destroyed.", this.getName()))
            .catch(err => u.error(err.message, this.getName()));
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
            .catch(err => u.error(err.message, this.getName()));
    }
}