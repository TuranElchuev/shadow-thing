import {
    Instruction,
    Instructions,
    PathResolver,
    u
} from "../index";


export class Log extends Instruction {

    private textExpr: string = undefined;
    
    private pathResolver: PathResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        this.textExpr = jsonObj.log;

        let pathResolver = new PathResolver("pathResolver", this);
        if(pathResolver.isComposite(this.textExpr)){
            this.pathResolver = pathResolver;
        }
    }

    protected async executeBody(){        
        if(this.pathResolver){
            u.log(this.pathResolver.resolvePointers(this.textExpr), this.getPath());
        }else{
            u.log(this.textExpr, this.getPath());
        }
    }    
}