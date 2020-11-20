import {
    EntityFactory,
    EntityType,
    VirtualThingModel
} from "./index";

export class VirtualThing {
    
    private name: string = undefined;

    private VTD: object = undefined;
    private TD: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(factory: WoT.WoT, vtdString: string, name: string) {        

        this.name = name;

        this.factory = factory;        
        this.VTD = JSON.parse(vtdString);
        
        this.validateVTD();
        this.model = EntityFactory.makeEntity(EntityType.Model, name, this.VTD, undefined) as VirtualThingModel;
        
        this.generateTD();
        this.validateTD();        
    }

    public produce() : Promise<VirtualThing> {
        return new Promise((resolve) => {
            if(this.thing == undefined){
                this.factory.produce(this.TD).then(thing =>{
                    this.thing = thing;
                    this.createThingHandlers();
                    resolve(this);
                });
            }else{
                resolve(this);
            }            
        });
    }
    
    public expose(): Promise<void> {
        this.model.start();
        return this.thing.expose();
    }

    private validateVTD() {        
    }
    
    private generateTD() {        
    }

    private validateTD(){
    }

    private createThingHandlers(){
    }
}