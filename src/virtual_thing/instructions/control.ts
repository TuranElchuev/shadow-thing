import {
    Instruction,
    Entity,
    IVtdInstruction
} from "../index";


export enum ControlType {
    break = "break",
    continue = "continue",
    return = "return",
    shutdown = "shutdown"
}

export class Control extends Instruction {

    private controlType: ControlType = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);
        this.controlType = jsonObj.control;
    }

    protected executeBody() {
        switch(this.controlType){
            case ControlType.break:
                if(this.getParentLoop()){
                    this.getParentLoop().break();
                }
                break;
            case ControlType.continue:
                if(this.getParentLoop()){
                    this.getParentLoop().continue();
                }
                break;
            case ControlType.return:
                this.getProcess().abort();
                break;
            case ControlType.shutdown:
                this.getModel().stop();
                break;
            default:
                break;
        }
    }
}