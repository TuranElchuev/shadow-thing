import {
    Instruction,
    VTMNode,
    ParamStringResolver,
    IInstruction,
    ConsoleMessageType,
    u
} from "../index";


/** Class that represents the console output instructions. */
export class Output extends Instruction {

    private textExpr: string = undefined;
    private messageType: ConsoleMessageType = ConsoleMessageType.log;
    
    private strResolver: ParamStringResolver = undefined;

    public constructor(name: string, parent: VTMNode, jsonObj: IInstruction){
        super(name, parent, jsonObj);

        if(jsonObj.log){
            this.textExpr = ParamStringResolver.join(jsonObj.log);
            this.messageType = ConsoleMessageType.log;
        }else if(jsonObj.info){
            this.textExpr = ParamStringResolver.join(jsonObj.info);
            this.messageType = ConsoleMessageType.info;
        }else if(jsonObj.warn){
            this.textExpr = ParamStringResolver.join(jsonObj.warn);
            this.messageType = ConsoleMessageType.warn;
        }else if(jsonObj.debug){
            this.textExpr = ParamStringResolver.join(jsonObj.debug);
            this.messageType = ConsoleMessageType.debug;
        }else{
            this.textExpr = ParamStringResolver.join(jsonObj.error);
            this.messageType = ConsoleMessageType.error;
        }

        let strResolver = new ParamStringResolver(undefined, this);
        if(strResolver.hasDynamicParams(this.textExpr)){
            this.strResolver = strResolver;
        }
    }

    protected executeBody(){        
        try{
            let message = this.textExpr;
            if(this.strResolver){
                message = this.strResolver.resolve(this.textExpr);
            }
            switch(this.messageType){
                case ConsoleMessageType.log:
                    u.log(message, undefined, false);
                    break;
                case ConsoleMessageType.info:
                    u.info(message, undefined, false);
                    break;
                case ConsoleMessageType.warn:
                    u.warn(message, undefined, false);
                    break;
                case ConsoleMessageType.debug:
                    u.debug(message, undefined, false);
                    break;
                case ConsoleMessageType.error:
                    u.error(message, undefined, false);
                    break;
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }   
    }    
}