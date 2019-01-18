import * as WoT from "wot-typescript-definitions";
import { VirtualThing, VirtualThingConfig} from './virtual-thing';

export class DigitalTwin {
    public realThing: WoT.ConsumedThing;
    public virtualThing: VirtualThing;
    public thing: WoT.ExposedThing;
    public readonly config: VirtualThingConfig;
    public readonly thingDescription: WoT.ThingInstance;
    private customHandlers: { [key: string]: DTCustomHandler };
    private lastReadValues : { [key: string]: {value: any, timestamp: Date} };

    public constructor(thingDescription: WoT.ThingDescription, factory: WoT.WoTFactory, config?: VirtualThingConfig) {
        // Convert TD to an object.
        this.thingDescription = <WoT.ThingInstance> JSON.parse(thingDescription);

        // Consume thing
        this.realThing = factory.consume(thingDescription);

        // Create a virtual thing (name/id have to be different for the servient to work)
        let virtualTD = JSON.parse(thingDescription);
        virtualTD.name = "Virtual-Thing" + Math.floor(Math.random() * 1000);
        virtualTD.id = "de:tum:ei:esi:fp:virt" + Math.floor(Math.random() * 1000);
        this.virtualThing = new VirtualThing(JSON.stringify(virtualTD), factory, config);

        // Initialise custom handlers and last read values objects
        this.customHandlers = {};
        this.lastReadValues = {};

        // Generate thing and add handlers to it
        this.thing = factory.produce(JSON.stringify(this.thingDescription));
        this.addPropertyHandlers();
        this.addActionHandlers();
        this.addEventHandlers();

        // change properties in TD to reflect annotation
        this.annotateTD();
    }

    public expose() {
        this.thing.expose();
    }

    public addCustomPropertyReadHandler (property: string, handler: DTCustomHandler) {
        this.customHandlers[property] = handler; 
    }

    private annotateTD() {
        for (let property in this.thing.properties) {
            this.annotateAccuracy(this.thing.properties[property]);
            this.annotateCaching(property);
        }
    }

    // What happens to title / discripton / unit / custom elements ...
    private annotateAccuracy(property: WoT.ThingProperty) {
        // Schema describing the added accuracy attributes
        let annotatedProperties = {
            origin: {
                type: "string",
                enum: ["thing", "model", "random"]
            },
            accuracy: {
                type: "integer",
                minimum: 0,
                maximum: 100,
                unit: "%"
            },
            data: {
                type: property.type,
                enum: property.enum,
                const: property.const,
                oneOf: property.oneOf
            }
        }

        property.required = ["origin", "data"];
        property.properties = annotatedProperties;
        delete property.enum;
        delete property.const;
        delete property.oneOf;

        // Change property schema depending on it's original type
        if (property.type === "object") {
            property.properties.data.required = property.required;
            property.properties.data.properties = property.properties;
            delete property.required;
            delete property.properties;
        } else if (property.type === "integer" || property.type === "number") {
            property.properties.data.maximum = property.maximum;
            property.properties.data.minimum = property.minimum;
            delete property.maximum;
            delete property.minimum;
        } else if (property.type === "array") {
            property.properties.data.maxItems = property.maxItems;
            property.properties.data.minItems = property.minItems;
            property.properties.data.items = property.items;
            delete property.maxItems;
            delete property.minItems;
            delete property.items;
        }

        property.type = "object";
    }

    private annotateCaching(property: string) {
        if (this.config && this.config.twinPropertyCaching && this.config.twinPropertyCaching[property]) {
            this.thing.properties[property].maxAge = this.config.twinPropertyCaching[property];
        }
    }

    private addPropertyReadHandler(property: string) {
        this.thing.setPropertyReadHandler(
            property,
            () => {
                return new Promise((resolve, reject) => {
                    let maxAge: number;
                    if (this.config && this.config.twinPropertyCaching && this.config.twinPropertyCaching[property]) { 
                        maxAge = this.config.twinPropertyCaching[property]
                    } else if (this.thingDescription.properties[property].maxAge) { 
                        maxAge = this.thingDescription.properties[property].maxAge
                    }
                    if (maxAge && this.lastReadValues[property]) {
                        let timeDelta = (Date.now() - this.lastReadValues[property].timestamp.valueOf()) / 1000;
                        if (timeDelta < maxAge) {
                            resolve(
                                {
                                    data: this.lastReadValues[property].value,
                                    origin: "thing"
                                }
                            );
                            return;
                        }
                    }
                    this.realThing.properties[property].read()
                    .then((realResponse) => {
                        // Save received value for future use.
                        this.lastReadValues[property] = { 
                            value: realResponse, 
                            timestamp: new Date()
                        }
                        // anontate response with accuracy data
                        let annotatedResponse = { 
                            data: realResponse,
                            origin: "thing",
                        }
                        resolve(annotatedResponse)
                    })
                    .catch((realError) => {
                        console.warn("Could not read property " + property + " from real thing: " + realError);

                        // If a custom handler is defined use it, otherwise default to virtualThing.
                        if (this.customHandlers[property]) {
                            let lastValue: any = null;
                            let timestamp: Date = null;
                            if (this.lastReadValues[property]) {
                                lastValue = this.lastReadValues[property].value;
                                timestamp = this.lastReadValues[property].timestamp;
                            };
                            this.customHandlers[property](lastValue, timestamp)
                            .then((customResponse) => {
                                let annotatedResponse = { 
                                    data: customResponse.data,
                                    origin: "model",
                                    accuracy: customResponse.accuracy
                                }
                                resolve(annotatedResponse)
                            })
                            .catch((customError) => {
                                reject(customError) // TODO: Should this return the custom or the real error ?
                            })
                        } else {
                            this.virtualThing.thing.properties[property].read()
                            .then((fakeResponse) => {
                                let annotatedResponse = { 
                                    data: fakeResponse,
                                    origin: "random",
                                }
                                resolve(annotatedResponse)
                            })
                            .catch((fakeError) => {
                                console.error("ERROR: Could not read property " + property + " from virtual thing: " + fakeError);
                                reject(realError)
                            })
                        }
                    })
                })
            }
        )
    }

    private addPropertyWriteHandler(property: string) {
        this.thing.setPropertyWriteHandler(
            property,
            (receivedValue) => { 
                return new Promise((resolve, reject) => {
                    this.realThing.properties[property].write(receivedValue)
                    .then((realResponse) => { 
                        // TODO: should we annotate this ? if not just return original promise.
                        resolve(realResponse); 
                    })
                    .catch((realError) => { 
                        reject(realError); 
                    })
                })
            }
        )
    }

    // Add read and write handlers for properties.
    private addPropertyHandlers() {
        for (let property in this.thing.properties) {
            // add handlers to readable properties.
            if (this.thing.properties[property].writeOnly !== true) { 
                this.addPropertyReadHandler(property);
            }
            // add handlers to writable properties.
            if (this.thing.properties[property].readOnly !== true) { 
                this.addPropertyWriteHandler(property);
            }
            // TODO: subscribe to observable.
        }
    }

    private addActionHandlers() {
        for (let action in this.thing.actions) {
            this.thing.setActionHandler(
                action, 
                (receivedInput) => {
                    return this.realThing.actions[action].invoke(receivedInput)
                }
            )
        }
    }

    private addEventHandlers() {
        for (let event in this.thingDescription.events) {
            this.realThing.events[event].subscribe(
                (realData) => { this.thing.events[event].emit(realData); },
                (RealError) => { this.thing.events[event].emit(RealError); } // FIXME: should we emit an error with a 200 status ?
            )
        }
    }
    
}

export type DTCustomResponse = {
    data: any,
    accuracy: number
}

export type DTCustomHandler = (lastValue: any, timestamp: Date) => Promise<DTCustomResponse>