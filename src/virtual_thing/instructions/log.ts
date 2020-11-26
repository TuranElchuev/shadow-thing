import {
    Instruction,
    Instructions,
    PathResolver,
    u
} from "../index";


export class Log extends Instruction {

    private expression: string = undefined;
    
    private pathResolver: PathResolver = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let logObj = jsonObj.log;

        this.expression = logObj.expression;

        let pathResolver = new PathResolver("pathResolver", this);
        if(pathResolver.isComposite(this.expression)){
            this.pathResolver = pathResolver;
        }
    }

    protected async executeBody(){        
        if(this.pathResolver){
            u.log(this.pathResolver.resolvePointers(this.expression), this.getPath());
        }else{
            u.log(this.expression, this.getPath());
        }
    }    
}