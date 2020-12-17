import {
    VTMNode,
    ParamStringResolver,
    IVtdMath,
    IVtdMathObj,
    IVtdParameterizedString,
    u
} from "../common/index";

import { create, all } from "mathjs"


/** Class that represents 'math' objects in a Virtual Thing Description. */
export class Math extends VTMNode {
    
    private expr: string = undefined;
    private conf: object = undefined;
    
    private strResolver: ParamStringResolver = undefined;

    private readonly mathjs: any = undefined;

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdMath){
        super(name, parent);

        if(u.instanceOf(jsonObj, Array) || u.instanceOf(jsonObj, String)){
            this.expr = ParamStringResolver.join(jsonObj as IVtdParameterizedString);
        }else{
            this.expr = ParamStringResolver.join((jsonObj as IVtdMathObj).expr);
            this.conf = (jsonObj as IVtdMathObj).conf;
        }

        this.mathjs = create(all, this.conf);

        let strResolver = new ParamStringResolver(undefined, this);
        if(strResolver.hasDynamicParams(this.expr)){
            this.strResolver = strResolver;
        }
    }

    /**
     * Evaluates the expression and returns the result.
     */
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