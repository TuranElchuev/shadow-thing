import {
    VTMNode,
    IVtdParameterizedString,
    ParamStringResolver,
    ReadOp,
    WriteOp,
    u
} from "../common/index";

import { readFileSync, writeFileSync, appendFileSync } from "fs";


export class File extends VTMNode {

    private unresolvedPath: string = undefined;
    private stringResolve: ParamStringResolver = undefined;

    public constructor(name: string, parent: VTMNode, jsonObj: IVtdParameterizedString){
        super(name, parent);
        this.unresolvedPath = ParamStringResolver.join(jsonObj);
        this.stringResolve = new ParamStringResolver("path", this);
    }

    public async read(operation: ReadOp){
        let promise = new Promise<string>(resolve => {
            resolve(readFileSync(this.stringResolve.resolveParams(this.unresolvedPath), "utf-8"));
        });
        try{
            switch(operation){
                case ReadOp.length:
                    return (await promise).length;
                case ReadOp.parse:
                    return JSON.parse(await promise);
                default:
                    return await promise;
            }
        }catch(err){
            u.fatal("Failed to read file:\n" + err.message, this.getFullPath());
        }        
    }

    public async write(operation: WriteOp, data: any){
        try{
            await new Promise<void>(resolve => {
                switch(operation){
                    case WriteOp.concat:
                    case WriteOp.push:
                    case WriteOp.pushCopy:
                        appendFileSync(this.stringResolve.resolveParams(this.unresolvedPath), data, "utf-8");
                        break;
                    default:
                        writeFileSync(this.stringResolve.resolveParams(this.unresolvedPath), data, "utf-8");
                        break;
                }
                resolve();
            });
        }catch(err){
            u.fatal("Failed to write file:\n" + err.message, this.getFullPath());
        }
    }
}