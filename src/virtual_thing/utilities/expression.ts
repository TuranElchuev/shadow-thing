import {
    Entity,
    ParameterizedStringResolver,
    IVtdExpression
} from "../index";

import { create, all } from "mathjs"


export class Expression extends Entity {
    
    private expression: string = undefined;
    private config: object = undefined;
    
    private strResolver: ParameterizedStringResolver = undefined;

    private readonly math: any = undefined;

    public constructor(name: string, parent: Entity, jsonObj: IVtdExpression){
        super(name, parent);

        this.expression = jsonObj.expr;
        this.config = jsonObj.conf;

        this.math = create(all, this.config);

        let strResolver = new ParameterizedStringResolver(undefined, this);
        if(strResolver.hasParams(this.expression)){
            this.strResolver = strResolver;
        }
    }

    public evaluate(): any {
        if(!this.expression){
            return null;
        }

        if(this.strResolver){
            return this.math.evaluate(this.strResolver.resolveParams(this.expression));
        }else{
            return this.math.evaluate(this.expression);
        }
    }
}