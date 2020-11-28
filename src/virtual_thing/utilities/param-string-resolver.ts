import {
    Entity,
    ReadOp,
    Pointer,
    u
} from "../index";


export class ParameterizedStringResolver extends Entity {

    private readonly inStingPtrRegex: RegExp = /(\$\{)([^${}]+)(\})/g;
    private readonly ptrObjectRegex: RegExp = /(\s*\{\s*"pointer"\s*:\s*")([^${}]+)("\s*\})/g;

    private readonly readOpRegexp: RegExp = /^(length|copy|pop|get)(:)(.*)/;

    public constructor(name: string, parent: Entity){        
        super(name, parent);
    }

    public isComposite(ptrStr: string): boolean {
        if(ptrStr){
            return ptrStr.match(this.inStingPtrRegex) != undefined
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
                If current regexp == inStingPtrRegex and ptrVal is already a string
                then do not stringify it additionally. In all other cases stringify.
                */ 
                if(ptrRegexp != this.inStingPtrRegex || !u.testType(ptrVal, String)){
                    ptrVal = JSON.stringify(ptrVal);   
                }
                pathStr = pathStr.replace(ptrStr, ptrVal);
            }
            ptrs = pathStr.match(ptrRegexp);
        }
        return pathStr;
    }

    public resolveParams(pathStr: string): string {        
        let innerResolved = this.resolve(pathStr, this.inStingPtrRegex, "$2");
        return this.resolve(innerResolved, this.ptrObjectRegex, "$2");        
    }
}