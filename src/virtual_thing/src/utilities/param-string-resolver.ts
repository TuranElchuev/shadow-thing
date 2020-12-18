import {
    VTMNode,
    ReadOp,
    Pointer,
    u,
    IParameterizedString
} from "../index";


/** Class that is used to resolve dynamic parameters in strings. */
export class ParamStringResolver extends VTMNode {

    private readonly inStringParamRegExp: RegExp = /(\$p?[1-9]?\{)([^${}]+)(\})/g;
    private readonly prettyRegExp: RegExp = /^\$p[1-9]?\{/;
    private readonly indentationRegExp: RegExp = /^\$p([1-9])\{/;
    private readonly copyValueRegExp: RegExp = /(\s*\{\s*"copy"\s*:\s*")([^${}]+)("\s*\})/g;
    private readonly parseValueRegExp: RegExp = /(\s*\{\s*"parse"\s*:\s*")([^${}]+)("\s*\})/g;

    private readonly readOpRegexp: RegExp = /^(length|copy|pop|get)(:)(.*)/;

    public constructor(name: string, parent: VTMNode){        
        super(name, parent);
    }

    public static join(value: IParameterizedString){
        if(Array.isArray(value)){
            return value ? value.join("") : "";
        }else{
            return value;
        }        
    }

    public hasDynamicParams(str: string): boolean {
        if(str){
            return str.match(this.inStringParamRegExp) != undefined
                    || str.match(this.copyValueRegExp) != undefined
                    || str.match(this.parseValueRegExp) != undefined;
        }else{
            return false;
        }
    }

    private hasReadOp(str: string): boolean {
        return str.match(this.readOpRegexp) != undefined;
    }

    private getReadOp(str: string): ReadOp {
        if(this.hasReadOp(str)){
            return str.replace(this.readOpRegexp, "$1") as ReadOp;
        }else{
            return ReadOp.get;
        }
    }

    private removeReadOp(str: string): string {
        if(this.hasReadOp(str)){
            return str.replace(this.readOpRegexp, "$3");
        }else{
            return str;
        }
    }    

    private hasPretty(str: string): boolean {
        return str.match(this.prettyRegExp) != undefined;
    }

    private getIndentation(str: string): number {
        if(str.match(this.indentationRegExp) != undefined){
            return Number.parseInt(str.replace(this.indentationRegExp, "$1"));
        }else{
            return 2;
        }
    }

    /**
     * Resolves dynamic parameters of the given type defined by the 'paramRegExp'
     * and returns a resolved string.  
     * 
     * Parameters in a string have a tree structure, i.e. a parameter can have
     * inner (child) parameters. The parameters are resolved in a bottom-up manner,
     * i.e. the atomic (or leave) parameters are resolved first.  
     * 
     * An example of a parameterized string:  
     * 
     * "Value is: ${/path/to/array/${path/to/dynamicIndexValue}}"  
     * 
     * In the example above, first the parameter ${path/to/dynamicIndexValue} will
     * resolve leading, lets assume, to a number 5. Then the parameter
     * ${/path/to/array/5} will be resolved leading, lets assume, to a
     * number 100. Finally, the resolved string will be "Value is: 100".
     * 
     * 
     * @param str A string with valid or no parameters. Valid parameters are those
     * which match the given 'paramRegExp' and contain a 'path' component that is
     * a valid Pointer path. Example of a 'path' component: if a parameter string
     * is "${path/to/value}", then the 'path' component is "path/to/value".
     * @param paramRegExp A RegExp to match parameters in the given string.
     * @param replace The position of the group in the 'paramRegExp' (e.g. "$2") which contains
     * the 'path' component.
     */
    private resolveForRegExp(str: string, paramRegExp: RegExp, replace: string): string {
        
        let paramPathWithReadOp = undefined;
        let paramVal = undefined;
        let params = str.match(paramRegExp);

        while(params){
            for (const paramStr of params){
                
                paramPathWithReadOp = paramStr.replace(paramRegExp, replace);     
                
                paramVal = new Pointer(undefined, this, [this.removeReadOp(paramPathWithReadOp)], undefined, false)
                                    .readValue(this.getReadOp(paramPathWithReadOp));

                if(paramRegExp == this.parseValueRegExp){
                    if(u.instanceOf(paramVal, String)){
                        paramVal = JSON.parse(paramVal);
                    }else{
                        u.fatal(`Could not parse object from path: "${paramPathWithReadOp}": `
                                + "value is not a string.", this.getFullPath());
                    }                    
                }
                /** 
                 * If current regexp == inStringParamRegExp and paramVal is already a string
                 * then do not stringify it additionally. In all other cases stringify.    
                */
                if(paramRegExp != this.inStringParamRegExp || !u.instanceOf(paramVal, String)){                    
                    if(paramRegExp == this.inStringParamRegExp && this.hasPretty(paramStr)){
                        /** If has pretty params, then stringify prettily */
                        paramVal = JSON.stringify(paramVal, undefined, this.getIndentation(paramStr));
                    }else{
                        paramVal = JSON.stringify(paramVal);   
                    }                    
                }
                str = str.replace(paramStr, paramVal);
            }
            params = str.match(paramRegExp);
        }
        return str;
    }

    /**
     * Resolves the dynamic parameters of the given string,
     * returns a resolved string.
     * @param str 
     */
    public resolve(str: string): string {        
        let inStringParamsResolved = this.resolveForRegExp(str, this.inStringParamRegExp, "$2");
        let copyValueParamsResolved = this.resolveForRegExp(inStringParamsResolved, this.copyValueRegExp, "$2");
        return this.resolveForRegExp(copyValueParamsResolved, this.parseValueRegExp, "$2");
    }
}