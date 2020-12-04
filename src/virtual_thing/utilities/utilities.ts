import { Entity } from "../index";

export class Utilities {

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
        return (messageType ? messageType + ": " : "")
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
    
    public static warning(message: string, source: string = undefined): string {
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
}