import { VirtualThingModel } from "../index";

export class VirtualThing {
    
    private VTD: object = undefined;
    private TD: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    public constructor(factory: WoT.WoT, vtdString: string) {        

        this.factory = factory;        
        this.VTD = JSON.parse(vtdString);
        
        this.validateVTD();
        this.model = new VirtualThingModel(this.VTD);
        
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