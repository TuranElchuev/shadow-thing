import {
    Instruction,
    Instructions,
    StringArgResolver,
    u
} from "../index";


export class Log extends Instruction {

    private textExpr: string = undefined;
    
    private strArgResolver: StringArgResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        this.textExpr = jsonObj.log;

        let strArgResolver = new StringArgResolver(undefined, this);
        if(strArgResolver.isComposite(this.textExpr)){
            this.strArgResolver = strArgResolver;
        }
    }

    protected async executeBody(){        
        if(this.strArgResolver){
            u.log(this.strArgResolver.resolvePointers(this.textExpr), this.getPath());
        }else{
            u.log(this.textExpr, this.getPath());
        }
    }    
}