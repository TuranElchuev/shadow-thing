import {
    Instruction,
    Instructions,
    PathResolver,
    u,
    InstructionType
} from "../index";

export class Log extends Instruction {

    private expression: string = undefined;
    private pathResolver: PathResolver = undefined;

    public constructor(instrObj: any, parentInstrBlock: Instructions, index: number){
        super(InstructionType.log, instrObj, parentInstrBlock, index);

        let logObj = instrObj.log;

        this.expression = logObj.expression;

        let pathResolver = new PathResolver(this.getModel(), this.getGlobalPath());
        if(pathResolver.isComposite(this.expression)){
            this.pathResolver = pathResolver;
        }
    }

    public async execute(){
        await super.execute();
        
        if(this.pathResolver){
            u.log(this.pathResolver.resolvePointers(this.expression), this.getGlobalPath());
        }else{
            u.log(this.expression, this.getGlobalPath());
        }
    }    
}