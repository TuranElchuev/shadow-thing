import {
    Entity,
    Instruction,
    Instructions,
    IVtdInstruction,
    u
} from "../common/index";


export class Try extends Instruction {

    private static readonly erroMessageExpression: RegExp = /^\/?err$/;

    private try: Instructions = undefined;
    private catch: Instructions = undefined;
    private errorMessage: string = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdInstruction){
        super(name, parent, jsonObj);

        let tryObj = jsonObj.try;

        if(tryObj.try){
            this.try = new Instructions("try", this, tryObj.try);
        }
        if(tryObj.catch){
            this.catch = new Instructions("catch", this, tryObj.catch);
        }
    }

    public static isErrorMessageExpr(str: string): boolean {
        return str.match(this.erroMessageExpression) != undefined;
    }

    public getErrorMessage(): string {
        return this.errorMessage;
    }

    protected async executeBody() {
        try {
            this.errorMessage = undefined;
            if(this.try){
                await this.try.execute();   
            }            
        } catch (err) {
            this.errorMessage = err.message;
            u.error(err.message, this.getFullPath());
            try{
                if(this.catch){
                    await this.catch.execute();
                }            
            }catch(err){
                u.fatal(err.message, this.getFullPath());
            }   
        }
    }

}