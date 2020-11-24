import {
    Process,
    PathResolver
} from "../index";

import { create, all } from "mathjs"

export class Expression {
     
    private mathjsExpr: string = undefined;
    private mathjsConfig: object = undefined;
    
    private pathResolver: PathResolver = undefined;

    private readonly math: any = undefined;

    private value: any = undefined;

    public constructor(process: Process, jsonObj: any) {
 
        this.mathjsExpr = jsonObj.mathjs;
        this.mathjsConfig = jsonObj.config;

        this.math = create(all, this.mathjsConfig);

        let pathResolver = new PathResolver(process);
        if(pathResolver.isComposite(this.mathjsExpr)){
            this.pathResolver = pathResolver;
        }
    }

    public evaluate(): any {
        if(!this.mathjsExpr){
            return undefined;
        }

        if(this.pathResolver){
            return this.math.evaluate(this.pathResolver.resolvePaths(this.mathjsExpr));
        }else if(this.value == undefined){
            this.value = this.math.evaluate(this.mathjsExpr);
        }
        return this.value;
    }
}