
export class Utilities {

    public static DEBUG: boolean = false;

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
    
    private static makeMessage(message: string, source: string): string {
        return (source ? "[" + source + "]" + (message ? ":" : "") : "")
                + (message ? (source ? "\n" : "") + message : "");
    }
    
    public static fatal(message: string, source: string = undefined){
        throw new Error(this.makeMessage(message, source));
    }

    // failure should lead to a shutdown of a particular VT instance
    public static failure(message: string, source: string = undefined){
        this.error(message, source);
    }
    
    public static info(message: string, source: string = undefined){
        console.info("Info: " + this.makeMessage(message, source));
    }
    
    public static debug(message: string, source: string = undefined){
        console.debug("Debug: " + this.makeMessage(message, source));
    }
    
    public static warning(message: string, source: string = undefined){
        console.warn("Warning: " + this.makeMessage(message, source));
    }
    
    public static error(message: string, source: string = undefined){
        console.error("ERROR: " + this.makeMessage(message, source));
    }
    
    public static log(message: string, source: string = undefined){
        console.log("Log: " + this.makeMessage(message, source));
    }

    public static toJsonStr(value: any): string {
        if(this.testType(value, String)){
            return value;
        }else{
            return JSON.stringify(value);
        }
    }
}