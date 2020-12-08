import {
    Entity,
    ParamStringResolver,
    IVtdCompoundData,
    u
} from "../common/index";


export class CompoundData extends Entity {
 
    private originalDataStr: string = undefined;
    private resolvedData: any = undefined;    
    
    private resolvedOnce: boolean = false;

    private strResolver: ParamStringResolver = undefined;

    private targetValueIsString: boolean;

    public constructor(name: string, parent: Entity, jsonObj: IVtdCompoundData){    
        super(name, parent);  

        this.targetValueIsString = u.testType(jsonObj, String);
        if(this.targetValueIsString){
            this.originalDataStr = jsonObj;
        }else{
            this.originalDataStr = JSON.stringify(jsonObj);
        }
        
        let strResolver = new ParamStringResolver(undefined, this);
        if(strResolver.hasParams(this.originalDataStr)){
            this.strResolver = strResolver;
        }
    }

    private resolve(){
        if(!this.strResolver && this.resolvedOnce){
            return;
        }
        if(this.strResolver){
            try{
                let resolvedValueStr = this.strResolver.resolveParams(this.originalDataStr);
                if(this.targetValueIsString){
                    this.resolvedData = resolvedValueStr;
                }else{
                    this.resolvedData = JSON.parse(resolvedValueStr);
                }                
            }catch(err){
                u.fatal("Could not resolve compound data:\n" + err.message, this.getFullPath());
            }
        }else{
            if(this.targetValueIsString){
                this.resolvedData = this.originalDataStr;
            }else{
                this.resolvedData = JSON.parse(this.originalDataStr);
            }    
        }
        this.resolvedOnce = true;
    }

    public getValue(): any {
        this.resolve();
        return this.resolvedData;
    }
}