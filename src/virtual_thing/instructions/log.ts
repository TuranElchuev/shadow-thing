import {
    Instruction,
    Instructions,
    ParameterizedStringResolver,
    u
} from "../index";


export class Log extends Instruction {

    private textExpr: string = undefined;
    
    private strResolver: ParameterizedStringResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        this.textExpr = jsonObj.log;

        let strResolver = new ParameterizedStringResolver(undefined, this);
        if(strResolver.isComposite(this.textExpr)){
            this.strResolver = strResolver;
        }
    }

    protected executeBody(){        
        try{
            if(this.strResolver){
                u.log(this.strResolver.resolvePointers(this.textExpr), this.getPath());
            }else{
                u.log(this.textExpr, this.getPath());
            }
        }catch(err){
            u.fatal(err.message, this.getPath());
        }   
    }    
}