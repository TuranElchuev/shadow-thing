import {
    VTMNode,
    ParamStringResolver,
    ICompoundData,
    u
} from "../common/index";


/**
 * Class that represents instances of 'compound' value in Virtual Thing Description.
 * A compound value is a json value with arbitrary structure that is
 * composed of constants and/or pointers.
 */
export class CompoundData extends VTMNode {
 
    // A string representation of the json value from which this instance was created.
    private originalDataStr: string = undefined;

    // The resulting data after resolving.
    private resolvedData: any = undefined;    
    
    /**
     * 'resolvedOnce' is used to avoid unnecessary repeated resolution where possible.
     * If the 'originalDataStr' contains dynamic parameters,
     * then the 'resolvedOnce' will have no effect.
     */ 
    private resolvedOnce: boolean = false;

    /**
     * Indicates whether the value of the json object from which 
     * this instance is created was a string. If so, then additonal
     * stringification and parsing during resolution will be omitted.
     */ 
    private targetValueIsString: boolean = false;

    private strResolver: ParamStringResolver = undefined;

    public constructor(name: string, parent: VTMNode, jsonObj: ICompoundData){    
        super(name, parent);  

        this.targetValueIsString = u.instanceOf(jsonObj, String);
        if(this.targetValueIsString){
            this.originalDataStr = jsonObj;
        }else{
            this.originalDataStr = JSON.stringify(jsonObj);
        }
        
        let strResolver = new ParamStringResolver(undefined, this);
        if(strResolver.hasDynamicParams(this.originalDataStr)){
            // store strResolver only if the 'originalDataStr' contains dynamic parameters.
            this.strResolver = strResolver;
        }
    }

    /**
     * Resolves the value of the CompoundData by applying resolution
     * of string parameters (if any) on the 'originalDataStr',
     * and then parsing the resulting string.
     */
    private resolve(){
        if(!this.strResolver && this.resolvedOnce){
            return;
        }

        /**
         * Check if a strResolver is present. If yes, then it means the 'originalDataStr'
         * contains dynamic parameters that need to be resolved.
         */
        if(this.strResolver){
            try{
                let resolvedValueStr = this.strResolver.resolve(this.originalDataStr);
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