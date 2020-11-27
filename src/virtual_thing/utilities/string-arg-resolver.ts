import {
    Entity,
    ReadOp,
    Pointer,
    u
} from "../index";


export class StringArgResolver extends Entity {

    private readonly innerPtrRegex: RegExp = /(\$\{)([^${}]+)(\})/g;
    private readonly ptrObjectRegex: RegExp = /(\s*\{\s*"pointer"\s*:\s*")([^${}]+)("\s*\})/g;

    private readonly readOpRegexp: RegExp = /^(length|copy|pop|get)(:)(.*)/;

    public constructor(name: string, parent: Entity){        
        super(name, parent);
    }

    public isComposite(ptrStr: string): boolean {
        if(ptrStr){
            return ptrStr.match(this.innerPtrRegex) != undefined
                    || ptrStr.match(this.ptrObjectRegex) != undefined;
        }else{
            return false;
        }
    }

    private hasReadOp(path: string): boolean {
        return path.match(this.readOpRegexp) != undefined;
    }

    private getReadOp(path: string): ReadOp {
        if(this.hasReadOp(path)){
            return path.replace(this.readOpRegexp, "$1") as ReadOp;
        }else{
            return ReadOp.get;
        }
    }

    private removeReadOp(path: string): string {
        if(this.hasReadOp(path)){
            return path.replace(this.readOpRegexp, "$3");
        }else{
            return path;
        }
    }    

    private resolvePaths(pathStr: string, ptrRegexp: RegExp, replace: string, validate: boolean = false): string {
        
        let ptrPathWithReadOp = undefined;
        let ptrVal = undefined;
        let ptrs = pathStr.match(ptrRegexp);

        while(ptrs){
            for (const ptrStr of ptrs){
                
                ptrPathWithReadOp = ptrStr.replace(ptrRegexp, replace);     
                
                ptrVal = new Pointer(undefined,
                                        this,
                                        this.removeReadOp(ptrPathWithReadOp),
                                        undefined,
                                        validate)
                                    .readValueAsStr(this.getReadOp(ptrPathWithReadOp));

                if(ptrVal === undefined){
                    u.fatal(`Could not resolve inner pointer "${ptrPathWithReadOp}": `
                                + "value is undefined.", this.getPath());
                }                
                pathStr = pathStr.replace(ptrStr, ptrVal);
            }
            ptrs = pathStr.match(ptrRegexp);
        }
        return pathStr;
    }

    public resolvePointers(pathStr: string): string {
        let innerResolved = this.resolvePaths(pathStr, this.innerPtrRegex, "$2");
        return this.resolvePaths(innerResolved, this.ptrObjectRegex, "$2");        
    }
}