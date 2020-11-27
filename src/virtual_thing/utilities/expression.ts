import {
    Entity,
    StringArgResolver
} from "../index";

import { create, all } from "mathjs"


export class Expression extends Entity {
    
    private expression: string = undefined;
    private config: object = undefined;
    
    private strArgResolver: StringArgResolver = undefined;

    private readonly math: any = undefined;

    private value: any = undefined;

    public constructor(name: string, parent: Entity, jsonObj: any){
        super(name, parent);

        this.expression = jsonObj.expression;
        this.config = jsonObj.config;

        this.math = create(all, this.config);

        let strArgResolver = new StringArgResolver(undefined, this);
        if(strArgResolver.isComposite(this.expression)){
            this.strArgResolver = strArgResolver;
        }
    }

    public evaluate(): any {
        if(!this.expression){
            return null;
        }

        if(this.strArgResolver){
            return this.math.evaluate(this.strArgResolver.resolvePointers(this.expression));
        }else if(this.value === undefined){
            this.value = this.math.evaluate(this.expression);
        }
        return this.value;
    }
}