import {
    Entity,
    IVirtualThingDescription,
    IVtdBehavior,
    IVtdDataMap,
    IVtdDataSchema
} from "../common/index";

export class Utilities {

    public static equalAsStr(val1: any, val2: any){
        return JSON.stringify(val1) == JSON.stringify(val2);
    }

    public static testType(value: any, type: any): boolean{
        switch(type){
            case null:
            case Boolean:
            case Number:
            case String:
            case Object:
                if(typeof value == this.getTypeName(type)){
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
    
    public static getTypeName(type: any){
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
    
    public static makeMessage(messageType: string, message: string, source: string): string {
        return (messageType ? "--" + messageType + ": " : "")
                + (source ? source + ":" : "")
                + (message ? (source ? "\n" : "") + message : "");
    }

    // failure should lead to a shutdown of a particular VT instance
    public static modelFailure(message: string, source: Entity){
        source.getModel().failure(this.makeMessage(undefined, message, source.getFullPath()));        
    }
    
    // fatal should throw error to kill the program unless caught
    public static fatal(message: string, source: string = undefined){
        // must throw an Error
        throw new Error(this.makeMessage(undefined, message, source));
    }
    
    public static info(message: string, source: string = undefined): string {
        let mes = this.makeMessage("INFO", message, source);
        console.info(mes);
        return mes;
    }
    
    public static debug(message: string, source: string = undefined): string {
        let mes = this.makeMessage("DEBUG", message, source);
        console.debug(mes);
        return mes;
    }
    
    public static warn(message: string, source: string = undefined): string {
        let mes = this.makeMessage("WARNING", message, source);
        console.warn(mes);
        return mes;
    }
    
    public static error(message: string, source: string = undefined): string {
        let mes = this.makeMessage("ERROR", message, source);
        console.error(mes);
        return mes;
    }
    
    public static log(message: string, source: string = undefined): string {
        let mes = this.makeMessage("LOG", message, source);
        console.log(mes);
        return mes;
    }


    public static resolveSchemaReferences(vtd: IVirtualThingDescription){
       
        if(!vtd.dataSchemas){
            return;
        }

        let resolveBehaviorSchemas = function(behavior: IVtdBehavior){
            if(behavior){
                resolveDataMapSchemas(behavior.dataMap);
                if(behavior.processes){
                    for (let key in behavior.processes){
                        resolveDataMapSchemas(behavior.processes[key].dataMap);
                    }
                }
            }        
        }
    
        let resolveDataMapSchemas = function(dataMap: IVtdDataMap){
            if(dataMap){
                for (let key in dataMap){
                    resolveDataSchema(dataMap[key]);
                }
            }
        }
    
        let resolveDataSchema = function(dataSchema: IVtdDataSchema){
            if(dataSchema && dataSchema.schema){
                let schema = vtd.dataSchemas[dataSchema.schema];
                if(!schema){
                    Utilities.fatal("No data schema \"" + dataSchema.schema + "\" is defined.");
                }
                for (let key in schema){
                    if(!(key in dataSchema)){
                        dataSchema[key] = JSON.parse(JSON.stringify(schema[key]));
                    }
                }
            }            
        }

        resolveBehaviorSchemas(vtd);        
        if(vtd.properties){
            for (let key in vtd.properties){
                resolveBehaviorSchemas(vtd.properties[key]);
                resolveDataMapSchemas(vtd.properties[key].uriVariables);
                resolveDataSchema(vtd.properties[key] as IVtdDataSchema);
            }
        }     
        if(vtd.actions){
            for (let key in vtd.actions){
                resolveBehaviorSchemas(vtd.actions[key]);
                resolveDataMapSchemas(vtd.actions[key].uriVariables);
                resolveDataSchema(vtd.actions[key].input);
                resolveDataSchema(vtd.actions[key].output);
            }
        }     
        if(vtd.events){
            for (let key in vtd.events){
                resolveBehaviorSchemas(vtd.events[key]);
                resolveDataMapSchemas(vtd.events[key].uriVariables);
                resolveDataSchema(vtd.events[key].data);
                resolveDataSchema(vtd.events[key].subscription);
                resolveDataSchema(vtd.events[key].cancellation);
            }
        }     
        if(vtd.sensors){
            for (let key in vtd.sensors){
                resolveBehaviorSchemas(vtd.sensors[key]);
            }
        }     
        if(vtd.actuators){
            for (let key in vtd.actuators){
                resolveBehaviorSchemas(vtd.actuators[key]);
            }
        }
    }

    public static extractTD(vtd: IVirtualThingDescription): WoT.ThingDescription {

        let deleteBehavior = function(obj: any){
            if(obj.dataMap){
                delete obj.dataMap;
            }
            if(obj.processes){
                delete obj.processes;
            }
        }

        let td: IVirtualThingDescription = JSON.parse(JSON.stringify(vtd));
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
        if(td.dataSchemas){
            delete td.dataSchemas;
        }

        return td;
    }
}