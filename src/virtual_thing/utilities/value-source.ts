import {
    Entity,
    Pointer,
    CompoundData,
    Math,
    ReadOp,
    ReadableData,
    IVtdValueSource,
    u,
    ParamStringResolver
} from "../common/index";

import { readFileSync } from "fs";


export class ValueSource extends Entity {    

    private math: Math = undefined;
    private compound: CompoundData = undefined;
    private pointer: Pointer = undefined;
    private filePath: string = undefined;
    private operation: ReadOp = ReadOp.get;

    public constructor(name: string, parent: Entity, jsonObj: IVtdValueSource){
        super(name, parent);
        
        if(jsonObj.math){
            this.math = new Math("math", this, jsonObj.math);
        }else if(jsonObj.compound !== undefined){
            this.compound = new CompoundData("compound", this, jsonObj.compound);
        }else if(jsonObj.file){
            this.filePath = new ParamStringResolver("file", this)
                .resolveParams(ParamStringResolver.join(jsonObj.file)); 
        }else if(jsonObj.pointer){
            this.pointer = new Pointer("pointer", this, jsonObj.pointer, [ReadableData]);
        }

        if(jsonObj.operation){
            this.operation = jsonObj.operation;
        }      
    }

    public async get() {
        try{
            if(this.math){
                return this.math.evaluate();
            }else if(this.compound){
                return this.compound.getValue();
            }else if(this.filePath){
                switch(this.operation){
                    case ReadOp.length:
                        return await readFileSync(this.filePath, "utf-8").length;
                    case ReadOp.parse:
                        return JSON.parse(await readFileSync(this.filePath, "utf-8"));
                    default:
                        return await readFileSync(this.filePath, "utf-8");
                }
            }else if(this.pointer){
                return this.pointer.readValue(this.operation);
            }else{
                return undefined;
            }
        }catch(err){
            u.fatal(err.message, this.getFullPath());
        }        
    }
}