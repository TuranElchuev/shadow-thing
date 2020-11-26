import {
    Instruction,
    Instructions
} from "../index";


export enum ControlType {
    break = "break",
    continue = "continue",
    return = "return"
}

export class Control extends Instruction {

    private controlType: ControlType = undefined;

    public constructor(name: string, parent: Instructions, jsonObj: any){
        super(name, parent, jsonObj);

        let controlObj = jsonObj.control;

        this.controlType = controlObj.control;
    }

    public async execute(){
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
            default:
                break;
        }
    }    
}