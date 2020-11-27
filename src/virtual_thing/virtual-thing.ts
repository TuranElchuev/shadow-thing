import {
    ComponentFactory,
    ComponentType,
    VirtualThingModel
} from "./index";


export class VirtualThing {

    private vtdObj: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(name: string, vtdObj: object, factory: WoT.WoT) {
        this.factory = factory;
        this.vtdObj = vtdObj;

        this.model = ComponentFactory.makeComponent(ComponentType.Model, 
            name, undefined, this.vtdObj) as VirtualThingModel;
        
        this.generateTD();              
    }

    private generateTD() {        
    }

    private createThingHandlers(){
    }

    public getModel(){
        return this.model;
    }

    public async produce() {
        if(!this.thing){
            try{
                this.thing = await this.factory.produce(this.vtdObj);
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