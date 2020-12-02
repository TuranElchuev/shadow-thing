import {
    ComponentFactory,
    ComponentType,
    VirtualThingModel,
    IVirtualThingDescription
} from "./index";


export class VirtualThing {

    private vtd: IVirtualThingDescription = undefined;
    private td: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(name: string, vtd: IVirtualThingDescription, factory: WoT.WoT) {
        this.factory = factory;
        this.vtd = vtd;

        this.model = ComponentFactory.makeComponent(ComponentType.Model, 
            name, undefined, this.vtd) as VirtualThingModel;
        
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

    public getModel(){
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

    public async expose() {
        try{
            await this.thing.expose();
            await this.model.start();
        }catch(err){
            throw err;
        }        
    }
}