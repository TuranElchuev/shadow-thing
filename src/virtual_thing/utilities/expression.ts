import {
    Entity,
    StringArgResolver
} from "../index";

import { create, all } from "mathjs"


export class Expression extends Entity {
    
    private mathjsExpr: string = undefined;
    private mathjsConfig: object = undefined;
    
    private strArgResolver: StringArgResolver = undefined;

    private readonly math: any = undefined;

    private value: any = undefined;

    public constructor(name: string, parent: Entity, jsonObj: any){
        super(name, parent);

        this.mathjsExpr = jsonObj.mathjs;
        this.mathjsConfig = jsonObj.config;

        this.math = create(all, this.mathjsConfig);

        let strArgResolver = new StringArgResolver(undefined, this);
        if(strArgResolver.isComposite(this.mathjsExpr)){
            this.strArgResolver = strArgResolver;
        }
    }

    public evaluate(): any {
        if(!this.mathjsExpr){
            return null;
        }

        if(this.strArgResolver){
            return this.math.evaluate(this.strArgResolver.resolvePointers(this.mathjsExpr));
        }else if(this.value === undefined){
            this.value = this.math.evaluate(this.mathjsExpr);
        }
        return this.value;
    }
}