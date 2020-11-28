import {
    Entity,
    ParameterizedStringResolver,
    u
} from "../index";


export class CompoundData extends Entity {
 
    private originalDataStr: string = undefined;
    private resolvedData: any = undefined;    
    
    private resolvedOnce: boolean = false;

    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Entity, jsonObj: any){    
        super(name, parent);  

        this.originalDataStr = JSON.stringify(jsonObj);

        let strResolver = new ParameterizedStringResolver(undefined, this);
        if(strResolver.isComposite(this.originalDataStr)){
            this.strResolver = strResolver;
        }
    }

    private resolve(){
        if(!this.strResolver && this.resolvedOnce){
            return;
        }
        if(this.strResolver){
            try{
                this.resolvedData = JSON.parse(this.strResolver.resolveParams(this.originalDataStr));
            }catch(err){
                u.fatal("Could not resolve compound data: " + err.message, this.getPath());
            }
        }else{
            this.resolvedData = JSON.parse(this.originalDataStr);
        }
        this.resolvedOnce = true;
    }

    public getValue(): any {
        this.resolve();
        return this.resolvedData;
    }
}