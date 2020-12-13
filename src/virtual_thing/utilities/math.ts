import {
    Entity,
    ParamStringResolver,
    IVtdMath,
    IVtdMathObj,
    IVtdParameterizedString,
    u
} from "../common/index";

import { create, all } from "mathjs"


export class Math extends Entity {
    
    private expr: string = undefined;
    private conf: object = undefined;
    
    private strResolver: ParamStringResolver = undefined;

    private readonly mathjs: any = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdMath){
        super(name, parent);

        if(u.testType(jsonObj, Array) || u.testType(jsonObj, String)){
            this.expr = ParamStringResolver.join(jsonObj as IVtdParameterizedString);
        }else{
            this.expr = ParamStringResolver.join((jsonObj as IVtdMathObj).expr);
            this.conf = (jsonObj as IVtdMathObj).conf;
        }

        this.mathjs = create(all, this.conf);

        let strResolver = new ParamStringResolver(undefined, this);
        if(strResolver.hasParams(this.expr)){
            this.strResolver = strResolver;
        }
    }

    public evaluate(): any {
        if(!this.expr){
            return undefined;
        }

        if(this.strResolver){
            return this.mathjs.evaluate(this.strResolver.resolveParams(this.expr));
        }else{
            return this.mathjs.evaluate(this.expr);
        }
    }
}