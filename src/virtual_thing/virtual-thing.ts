import {
    EntityFactory,
    EntityType,
    VirtualThingModel
} from "./index";

export class VirtualThing {

    private VTD: object = undefined;
    private TD: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(factory: WoT.WoT, vtdString: string, name: string) {        

        this.factory = factory;        
        this.VTD = JSON.parse(vtdString);
        
        this.validateVTD();
        this.model = EntityFactory.makeEntity(EntityType.Model, name, this.VTD, undefined) as VirtualThingModel;
        
        this.generateTD();
        this.validateTD();        
    }

    public produce() : Promise<VirtualThing> {
        return new Promise((resolve) => {
            if(!this.thing){
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
    
    private validateVTD() {        
    }
    
    private generateTD() {        
    }

    private validateTD(){
    }

    private createThingHandlers(){
    }

    public expose(): Promise<void> {
        return new Promise(resolve => {
            this.thing.expose().then(() => {
                this.model.start();
                resolve();
            });
        })
    }


    public test(){
        this.model.start();
        this.model.getChildEntity("proc", "testProcess").invoke();
    }
}