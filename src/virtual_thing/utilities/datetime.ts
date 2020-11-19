export class DateTime {

    public get(path: string){
        // TODO

        if(path.startsWith("now")){            
            
        }else if(path.startsWith("utc")){
            
        }else{
            switch(path){
                case "ms":
                    break;
                case "s":
                    break;
                case "m":
                    break;
                case "h":
                    break;
                case "d":
                    break;
                case "M":
                    break;
                case "y":
                    break;
                case "w":
                    break;
                case "dow":
                    break;
                case "unix":
                    break;
                default:
                    // TODO error
                    break;
            }
        }
    }
}