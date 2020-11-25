import {
    Instruction,
    Instructions,
    PathResolver,
    u
} from "../index";

export class Log extends Instruction {

    private expression: string = undefined;
    private pathResolver: PathResolver = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions){
        super(instrObj, parentInstrBlock);

        let logObj = instrObj.log;

        this.expression = logObj.expression;

        let pathResolver = new PathResolver(this.getProcess());
        if(pathResolver.isComposite(this.expression)){
            this.pathResolver = pathResolver;
        }
    }

    public async execute(){
        await super.execute();
        
        if(this.pathResolver){
            u.log(this.pathResolver.resolvePointers(this.expression),
                this.getProcess().getGlobalPath());
        }else{
            u.log(this.expression,
                this.getProcess().getGlobalPath());
        }
    }    
}