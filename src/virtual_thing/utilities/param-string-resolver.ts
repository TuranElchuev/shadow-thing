import {
    Entity,
    ReadOp,
    Pointer,
    u,
    IVtdParameterizedStrings
} from "../index";


export class ParamStringResolver extends Entity {

    private readonly inStringPtrRegExp: RegExp = /(\$\{)([^${}]+)(\})/g;
    private readonly copyValueRegExp: RegExp = /(\s*\{\s*"copy"\s*:\s*")([^${}]+)("\s*\})/g;
    private readonly parseValueRegExp: RegExp = /(\s*\{\s*"parse"\s*:\s*")([^${}]+)("\s*\})/g;

    private readonly readOpRegexp: RegExp = /^(length|copy|pop|get)(:)(.*)/;

    public constructor(name: string, parent: Entity){        
        super(name, parent);
    }

    public static join(strings: IVtdParameterizedStrings){
        return strings ? strings.join("") : "";
    }

    public hasParams(str: string): boolean {
        if(str){
            return str.match(this.inStringPtrRegExp) != undefined
                    || str.match(this.copyValueRegExp) != undefined
                    || str.match(this.parseValueRegExp) != undefined;
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

    private resolve(str: string, ptrRegExp: RegExp, replace: string, validate: boolean = false): string {
        
        let ptrPathWithReadOp = undefined;
        let ptrVal = undefined;
        let ptrs = str.match(ptrRegExp);

        while(ptrs){
            for (const ptrStr of ptrs){
                
                ptrPathWithReadOp = ptrStr.replace(ptrRegExp, replace);     
                
                ptrVal = new Pointer(undefined,
                                        this,
                                        [ this.removeReadOp(ptrPathWithReadOp) ],
                                        undefined,
                                        validate)
                                    .readValue(this.getReadOp(ptrPathWithReadOp));

                if(ptrVal === undefined){
                    u.fatal(`Could not resolve pointer path "${ptrPathWithReadOp}": `
                                + "value is undefined.", this.getFullPath());
                }
                if(ptrRegExp == this.parseValueRegExp){
                    if(u.testType(ptrVal, String)){
                        ptrVal = JSON.parse(ptrVal);
                    }else{
                        u.fatal(`Could not parse object from path: "${ptrPathWithReadOp}": `
                                + "value is not a string.", this.getFullPath());
                    }                    
                }
                /*
                If current regexp == inStingPtrRegExp and ptrVal is already a string
                then do not stringify it additionally. In all other cases stringify.
                */ 
                if(ptrRegExp != this.inStringPtrRegExp || !u.testType(ptrVal, String)){
                    ptrVal = JSON.stringify(ptrVal);   
                }
                str = str.replace(ptrStr, ptrVal);
            }
            ptrs = str.match(ptrRegExp);
        }
        return str;
    }

    public resolveParams(pathStr: string): string {        
        let inStringPtrsResolved = this.resolve(pathStr, this.inStringPtrRegExp, "$2");
        let copyValuePtrsResolved = this.resolve(inStringPtrsResolved, this.copyValueRegExp, "$2");
        return this.resolve(copyValuePtrsResolved, this.parseValueRegExp, "$2");
    }
}