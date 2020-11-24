
export class Utilities {

    public static testType(value: any, type: any): boolean{
        switch(type){
            case Boolean:
            case Number:
            case String:
            case Object:
                if(typeof value == this.getTypeName(type)){
                    return true;
                }
            case Array:
                if(Array.isArray(value)){
                    return true;
                }
            default:
                if(typeof type == "function" && value instanceof type){
                    return true;
                }
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
        return "\n"
                + (source ? "Source: " + source + "\n" : "")
                + "Message: " + message
                + "\n";
    }
    
    public static fatal(message: string, source: string = undefined){
        this.error(message, source);
        process.exit();
    }
    
    public static info(message: string, source: string = undefined){
        console.info(this.makeMessage(message, source))
    }
    
    public static debug(message: string, source: string = undefined){
        console.debug(this.makeMessage(message, source))
    }
    
    public static warning(message: string, source: string = undefined){
        console.warn(this.makeMessage(message, source))
    }
    
    public static error(message: string, source: string = undefined){
        console.error(this.makeMessage(message, source))
    }
    
    public static log(message: string, source: string = undefined){
        console.log(this.makeMessage(message, source))
    }
}