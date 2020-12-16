import {
    ComponentFactory,
    ComponentType,
    VirtualThingModel,
    IVirtualThingDescription,
    ModelStateListener,
    u,
} from "./common/index";

import { readFileSync } from "fs";
import { join } from "path";

const Ajv = require('ajv');


const TD_VALID_SCH = join(__dirname, 'validation-schemas', 'td-json-schema-validation.json');
const VTD_VALID_SCH = join(__dirname, 'validation-schemas', 'vtd-json-schema-validation.json');

var tdSchema = JSON.parse(readFileSync(TD_VALID_SCH, "utf-8"));
var vtdSchema = JSON.parse(readFileSync(VTD_VALID_SCH, "utf-8"));

var ajv = new Ajv();
ajv.addSchema(tdSchema, 'td');
ajv.addSchema(vtdSchema, 'vtd');

/** Class representing a Virtual Thing instance. */
export class VirtualThing implements ModelStateListener {

    private vtd: IVirtualThingDescription = undefined;
    private td: WoT.ThingDescription = undefined;
    private factory: WoT.WoT = undefined;
    private thing: WoT.ExposedThing = undefined;
    private model: VirtualThingModel = undefined;
    
    /**
     * Create a virtual thing
     * @param vtd - an object representing a valid Virtual Thing Description
     * @param factory - a WoTFactory attached to the node WoT servient where the thing should be exposed
     */
    public constructor(vtd: IVirtualThingDescription, factory: WoT.WoT) {

        this.factory = factory;
        this.vtd = vtd;

        try{            
            u.resolveSchemaReferences(this.vtd);
            
            /* TODO uncomment this when done with development
            if(!ajv.validate('td', vtd)){
                u.fatal("Invalid TD specified: " + ajv.errorsText());
            }*/
            
            if(!ajv.validate('vtd', vtd)){
                u.fatal("Invalid VTD specified: " + ajv.errorsText());
            }
            
            this.model = ComponentFactory.makeComponent(ComponentType.Model, 
                    this.getName(), undefined, this.vtd) as VirtualThingModel;

            this.model.addModelStateListener(this);        
            this.td = u.extractTD(this.vtd);              
        }catch(err){
            u.fatal("Create model failed:\n" + err.message, this.getName());
        }
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
            //.then(() => u.info("Exposed thing destroyed.", this.getName()))
            .catch(err => u.error(err.message, this.getName()));
    }

    public getModel(): VirtualThingModel {
        return this.model;
    }

    public getName(): string {
        return this.vtd.title;
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