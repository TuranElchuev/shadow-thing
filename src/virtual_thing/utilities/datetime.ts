
export class DateTime {

    public getValue(component: string){
        // TODO

        if(component.startsWith("now")){            
            
        }else if(component.startsWith("utc")){
            
        }else{
            switch(component){
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