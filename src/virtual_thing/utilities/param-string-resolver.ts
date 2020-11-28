import {
    Entity,
    ReadOp,
    Pointer,
    u
} from "../index";


export class ParameterizedStringResolver extends Entity {

    private readonly inStingPtrRegExp: RegExp = /(\$\{)([^${}]+)(\})/g;
    private readonly ptrObjectRegExp: RegExp = /(\s*\{\s*"pointer"\s*:\s*")([^${}]+)("\s*\})/g;

    private readonly readOpRegexp: RegExp = /^(length|copy|pop|get)(:)(.*)/;

    public constructor(name: string, parent: Entity){        
        super(name, parent);
    }

    public isComposite(ptrStr: string): boolean {
        if(ptrStr){
            return ptrStr.match(this.inStingPtrRegExp) != undefined
                    || ptrStr.match(this.ptrObjectRegExp) != undefined;
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

    private resolve(pathStr: string, ptrRegexp: RegExp, replace: string, validate: boolean = false): string {
        
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
                                    .readValue(this.getReadOp(ptrPathWithReadOp));

                if(ptrVal === undefined){
                    u.fatal(`Could not resolve inner pointer "${ptrPathWithReadOp}": `
                                + "value is undefined.", this.getPath());
                }
                /*
                If current regexp == inStingPtrRegExp and ptrVal is already a string
                then do not stringify it additionally. In all other cases stringify.
                */ 
                if(ptrRegexp != this.inStingPtrRegExp || !u.testType(ptrVal, String)){
                    ptrVal = JSON.stringify(ptrVal);   
                }
                pathStr = pathStr.replace(ptrStr, ptrVal);
            }
            ptrs = pathStr.match(ptrRegexp);
        }
        return pathStr;
    }

    public resolveParams(pathStr: string): string {        
        let innerResolved = this.resolve(pathStr, this.inStingPtrRegExp, "$2");
        return this.resolve(innerResolved, this.ptrObjectRegExp, "$2");        
    }
}