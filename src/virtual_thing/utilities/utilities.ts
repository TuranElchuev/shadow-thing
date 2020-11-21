
export function testType(value: any, type: any): boolean{
    switch(type){
        case Boolean:
        case Number:
        case String:
        case Object:
            if(typeof value == getTypeName(type)){
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

export function getTypeName(type: any){
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
                return (new type()).constructor.name;
            }else{
                return "unknown";
            }
    }
}

function makeMessage(message: string, source: string): string {
    return (source ? "Source: " + source + "\n" : "")
            + "Message: " + message;
}

export function fatal(message: string, source: string = undefined){
    error(message, source);
    process.exit();
}

export function info(message: string, source: string = undefined){
    console.info(makeMessage(message, source))
}

export function debug(message: string, source: string = undefined){
    console.debug(makeMessage(message, source))
}

export function warn(message: string, source: string = undefined){
    console.warn(makeMessage(message, source))
}

export function error(message: string, source: string = undefined){
    console.error(makeMessage(message, source))
}

export function log(message: string, source: string = undefined){
    console.log(makeMessage(message, source))
}