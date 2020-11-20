
export class Messages {

    private static makeMessage(message: string, source: string): string {
        return (source ? "Source: " + source + "\n" : "")
                + "Message: " + message;
    }

    public static exception(message: string, source: string = undefined){
        throw new Error(this.makeMessage(message, source));
    }

    public static info(message: string, source: string = undefined){
        console.info(this.makeMessage(message, source))
    }

    public static debug(message: string, source: string = undefined){
        console.debug(this.makeMessage(message, source))
    }

    public static warn(message: string, source: string = undefined){
        console.warn(this.makeMessage(message, source))
    }

    public static error(message: string, source: string = undefined){
        console.error(this.makeMessage(message, source))
    }

    public static log(message: string, source: string = undefined){
        console.log(this.makeMessage(message, source))
    }
}