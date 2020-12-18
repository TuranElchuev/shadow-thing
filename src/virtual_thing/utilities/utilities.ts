import {
    VTMNode,
    IVirtualThingDescription,
    IBehavior,
    IDataMap,
    IDataSchema
} from "../common/index";


export enum ConsoleMessageType {
    log = "VT_LOG",
    info = "VT_INFO",
    warn = "VT_WARN",
    debug = "VT_DEBUG",
    error = "VT_ERROR"
}

/** Class with static utility functions */
export class Utilities {

    //#region Data and types

    public static copy(value: any){
        if(value === undefined){
            return undefined;
        }else{
            return JSON.parse(JSON.stringify(value));
        }
    }

    public static equalAsStr(val1: any, val2: any){
        return JSON.stringify(val1) == JSON.stringify(val2);
    }

    public static instanceOf(value: any, type: any): boolean {
        switch(type){
            case null:
            case Boolean:
            case Number:
            case String:
            case Object:
                if(typeof value == this.getTypeNameFromType(type)){
                    return true;
                }
                break;
            case Array:
                if(Array.isArray(value)){
                    return true;
                }
                break;
            default:
                if(typeof type == "function" && value instanceof type){
                    return true;
                }
                break;
        }
        return false;
    }
    
    public static getTypeNameFromType(type: any){
        switch(type){
            case Boolean:
                return "boolean";
            case Number:
                return "number";
            case String:
                return "string";
            case Array:
                return "array";
            case null:
            case Object:
                return "object";
            case Array:
                return "array";
            default:
                if(typeof type == "function"){
                    return type.name;
                }else{
                    return "unknown";
                }
        }
    }
    
    public static getTypeNameFromValue(value: any){
        if(typeof value == "object"){
            return value.constructor.name;
        }else{
            return typeof value;
        }
    }

    //#endregion
    
    //#region Console messages

    /**
     * Returns a string of the form:  
     * 
     *      <messageType>: <source>:
     *      <message>
     * If a passed parameter is undefined, it will not appear in the message's structure.  
     * Some examples:  
     * - VT_LOG: /MyThing/processes/someProcess/instructions/0/log:  
     * This is a log message.
     * - /MyThing/processes/someProcess/instructions/0/log:  
     * This is a log message.
     * - VT_LOG: This is a log message.  
     * - This is a log message.
     * 
     * @param messageType 
     * @param message 
     * @param source 
     */
    public static makeVTMessage(messageType: ConsoleMessageType,
                                        message: string,
                                        source: string): string {
                                            
        return (messageType ? messageType + ": " : "")
                + (source ? source + ": " : "")
                + (message ? message : "");
    }

    /**
     * Issues failure on the VirtualThingModel instance
     * of the given 'source' node.
     * 
     * @param reason A message indicating the reason of the failure.
     * @param source An instance of VTMNode that issues failure.
     */
    public static modelFailure(reason: string, source: VTMNode){
        source.getModel().failure(this.makeVTMessage(undefined, reason, source.getFullPath()));        
    }
    
    /** Throws an Error */ 
    public static fatal(message: string, source: string = undefined){
        throw new Error(this.makeVTMessage(undefined, message, source));
    }
    
    public static info(message: string, source: string = undefined, withType: boolean = true): string {
        let mes = this.makeVTMessage(withType ? ConsoleMessageType.info: undefined, message, source);
        console.info(mes);
        return mes;
    }
    
    public static debug(message: string, source: string = undefined, withType: boolean = true): string {
        let mes = this.makeVTMessage(withType ? ConsoleMessageType.debug: undefined, message, source);
        console.debug(mes);
        return mes;
    }
    
    public static warn(message: string, source: string = undefined, withType: boolean = true): string {
        let mes = this.makeVTMessage(withType ? ConsoleMessageType.warn: undefined, message, source);
        console.warn(mes);
        return mes;
    }
    
    /** Does not throw error, only prints in console. */
    public static error(message: string, source: string = undefined, withType: boolean = true): string {
        let mes = this.makeVTMessage(withType ? ConsoleMessageType.error: undefined, message, source);
        console.error(mes);
        return mes;
    }
    
    public static log(message: string, source: string = undefined, withType: boolean = true): string {
        let mes = this.makeVTMessage(withType ? ConsoleMessageType.log: undefined, message, source);
        console.log(mes);
        return mes;
    }

    //#endregion

    //#region Virtual Thing Description

    /**
     * Resolve the 'schema' property in the following 'DataSchema' instances in the given
     * Virtual Thing Description (vtd) object:
     * - all entries in 'vtd.properties'
     * - 'input', 'output' of all entries in 'vtd.actions'
     * - 'data', 'subscription', 'cancellation' of all entries in 'vtd.events'
     * - all entries in all 'dataMap' instances
     * - all entries in all 'uriVariables' instances
     * 
     * @param vtd An object representing a valid Virtual Thing Description
     */
    public static resolveSchemaReferences(vtd: IVirtualThingDescription){
       
        if(!vtd.dataSchemas){
            return;
        }
    
        /**
         * In the 'given dataSchema object', replace the 'schema' property by the properties of the
         * corresponding object from the 'vtd.dataSchemas'. DO NOT OVERWRITE existing properties
         * in the 'given dataSchema object'.
         * @param dataSchema The 'given dataSchema object'
         */
        let resolveDataSchema = function(dataSchema: IDataSchema){
            if(dataSchema && dataSchema.schema){
                let schemaObj = vtd.dataSchemas[dataSchema.schema];
                if(!schemaObj){
                    Utilities.fatal("No data schema \"" + dataSchema.schema + "\" is defined.", vtd.title);
                }
                for (let key in schemaObj){
                    if(!(key in dataSchema)){
                        dataSchema[key] = Utilities.copy(schemaObj[key]);
                    }
                }
                delete dataSchema.schema;
            }
        }
    
        let resolveDataMap = function(dataMap: IDataMap){
            if(dataMap){
                for (let key in dataMap){
                    resolveDataSchema(dataMap[key]);
                }
            }
        }

        let resolveBehavior = function(behavior: IBehavior){
            if(behavior){
                resolveDataMap(behavior.dataMap);
                if(behavior.processes){
                    for (let key in behavior.processes){
                        resolveDataMap(behavior.processes[key].dataMap);
                    }
                }
            }        
        }

        resolveBehavior(vtd);
        if(vtd.properties){
            for (let key in vtd.properties){
                resolveBehavior(vtd.properties[key]);
                resolveDataMap(vtd.properties[key].uriVariables);
                resolveDataSchema(vtd.properties[key] as IDataSchema);
            }
        }     
        if(vtd.actions){
            for (let key in vtd.actions){
                resolveBehavior(vtd.actions[key]);
                resolveDataMap(vtd.actions[key].uriVariables);
                resolveDataSchema(vtd.actions[key].input);
                resolveDataSchema(vtd.actions[key].output);
            }
        }     
        if(vtd.events){
            for (let key in vtd.events){
                resolveBehavior(vtd.events[key]);
                resolveDataMap(vtd.events[key].uriVariables);
                resolveDataSchema(vtd.events[key].data);
                resolveDataSchema(vtd.events[key].subscription);
                resolveDataSchema(vtd.events[key].cancellation);
            }
        }     
        if(vtd.sensors){
            for (let key in vtd.sensors){
                resolveBehavior(vtd.sensors[key]);
            }
        }     
        if(vtd.actuators){
            for (let key in vtd.actuators){
                resolveBehavior(vtd.actuators[key]);
            }
        }
    }

    /**
     * Extracts a WoT Thing Description object from a Virtual Thing Description object
     * by taking a copy of the latter and removing all Virtual Thing-specific properties from it.
     * @param vtd An object representing a valid Virtual Thing Description
     */
    public static extractTD(vtd: IVirtualThingDescription): WoT.ThingDescription {

        let clearBehavior = function(behavior: IBehavior){
            delete behavior.dataMap;
            delete behavior.processes;
        }

        let td: IVirtualThingDescription = this.copy(vtd);

        clearBehavior(td);

        if(td.properties){
            for (let key in td.properties){
                clearBehavior(td.properties[key]);
            }
        }
        if(td.actions){
            for (let key in td.actions){
                clearBehavior(td.actions[key]);
            }
        }
        if(td.events){
            for (let key in td.events){
                clearBehavior(td.events[key]);
            }
        }        
        delete td.sensors;
        delete td.actuators;
        delete td.dataSchemas;

        return td;
    }

    //#endregion
}