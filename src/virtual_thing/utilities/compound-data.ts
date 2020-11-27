import {
    Entity,
    StringArgResolver,
    u
} from "../index";


export class CompoundData extends Entity {
 
    private originalDataStr: string = undefined;
    private resolvedData: any = undefined;    
    
    private resolvedOnce: boolean = false;

    private strArgResolver: StringArgResolver = undefined;

    public constructor(name: string, parent: Entity, jsonObj: any){    
        super(name, parent);  

        this.originalDataStr = JSON.stringify(jsonObj);

        let strArgResolver = new StringArgResolver(undefined, this);
        if(strArgResolver.isComposite(this.originalDataStr)){
            this.strArgResolver = strArgResolver;
        }
    }

    private resolve(){
        if(!this.strArgResolver && this.resolvedOnce){
            return;
        }
        if(this.strArgResolver){
            try{
                this.resolvedData = JSON.parse(this.strArgResolver.resolvePointers(this.originalDataStr));
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