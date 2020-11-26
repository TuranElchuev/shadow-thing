import {
    VirtualThingModel,
    PathResolver,
    u
} from "../index";

import { create, all } from "mathjs"

export class Expression {
    
    private globalPath: string = undefined;

    private mathjsExpr: string = undefined;
    private mathjsConfig: object = undefined;
    
    private pathResolver: PathResolver = undefined;

    private readonly math: any = undefined;

    private value: any = undefined;

    public constructor(model: VirtualThingModel, jsonObj: any, globalPath: string) {
        this.globalPath = globalPath; 
        this.mathjsExpr = jsonObj.mathjs;
        this.mathjsConfig = jsonObj.config;

        this.math = create(all, this.mathjsConfig);

        let pathResolver = new PathResolver(model, this.globalPath);
        if(pathResolver.isComposite(this.mathjsExpr)){
            this.pathResolver = pathResolver;
        }
        u.debug("", this.globalPath);
    }

    public evaluate(): any {
        if(!this.mathjsExpr){
            return null;
        }

        if(this.pathResolver){
            return this.math.evaluate(this.pathResolver.resolvePointers(this.mathjsExpr));
        }else if(this.value === undefined){
            this.value = this.math.evaluate(this.mathjsExpr);
        }
        return this.value;
    }
}