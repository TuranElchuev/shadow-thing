import {
    Process,
    InstructionBody,
    PathResolver,
    u
} from "../index";

export class Log implements InstructionBody {

    private process: Process = undefined;
    private expression: string = undefined;
    private pathResolver: PathResolver = undefined;

    public constructor(process: Process, jsonObj: any){
        this.process = process;
        this.expression = jsonObj.expression;

        let pathResolver = new PathResolver(process);
        if(pathResolver.isComposite(this.expression)){
            this.pathResolver = pathResolver;
        }
    }

    execute(){
        if(this.pathResolver){
            u.log(this.pathResolver.resolvePaths(this.expression), this.process.getGlobalPath());
        }else{
            u.log(this.expression, this.process.getGlobalPath());
        }
    }    
}