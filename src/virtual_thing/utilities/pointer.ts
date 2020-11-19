import * as jsonPointer from 'json-pointer';

import {
    VirtualThingModel,
    EntityOwner
} from "../index";

"/p/myProp" // Property: readable, writable, hasDataMap, hasProcesses, hasUriVariables
"/p/myProp/dm/data1/..." // Data: readable, writable
"/p/myProp/proc/proc1" // Process: invokeable, hasDataMap
"/p/myProp/uv/var1" // Data: readable, writable

"/a/myAc" // Action: invokeable, hasDataMap, hasProcesses, hasUriVariables
-//-

"/e/myEvent" // Event: invokeable, hasDataMap, hasProcesses, hasUriVariables
-//-

"/sen/mySensor" // Sensor: hasDataMap, hasProcesses
"/sen/mySensor/dm/data1/..." // Data: readable, writable
"/sen/mySensor/proc/proc1" // Process: invokeable, hasDataMap

"/act/myActuator" // Actuator: hasDataMap, hasProcesses
"/act/myActuator/dm/data1/..." // Data: readable, writable
"/act/myActuator/proc/proc1" // Process: invokeable, hasDataMap

"/proc/proc1" // Process: Invokeable, HasDataMap
"/proc/proc1/dm/data1" // Data: readable, writable

"/dm/data1/..." // Data: readable, writable

"/ds/schema1/..." // DataSchema: readable

"/dt/":
millisecond
second
minute
hour
day
month
year
week
dayOfWeek
unixMillis
now('format')


/**
 * 1. token must be either of: [ p, a, e, sen, act, pr, dm, ds, dt ]
 * 2. token must be a valid name or 
 * for dt:
ms
s
m
h
d
M
y
w
dow
unix
utcNow(format)
now(format) 

 * 3. must be:
 *          proc - for HasProcess
 *          dm - for HasDataMap
 *          uv - for hasUriVariables
 *          otherwise: 
 *          path - for readable/writable
 *          
 * 4. must be a valid name for 3. in case 3. was one of [ proc, dm, uv ]
 *  or path
 */


export class Pointer {

    private model: VirtualThingModel = undefined;
    private ptrStr: string = undefined;

    private entity: any = undefined;
    private relativePath: string = undefined;

    private fixed: boolean = false;

    public constructor(ptrStr: string, model: VirtualThingModel){
        if(ptrStr == undefined){
            throw new Error("No pointer"); // TODO
        }
        this.model = model;
        this.ptrStr = new String(ptrStr).toString();
    }

    private update() {                
        if(!this.fixed){
            this.fixed = true;            
            this.resolveEntity(this.resolvePath());
        }
    }

    private resolvePath(): string {

        const leafPointerRegexp = /\$\([^${}]+\)/g;
        const extractPathRegexp = /(\$\()(.+)(\))/g;

        let resolvedPath = this.ptrStr.replace(/\s/g, "");

        let leafPtrPath = undefined;
        let leafPtrVal = undefined;
        let leafPtrs = resolvedPath.match(leafPointerRegexp);

        while(leafPtrs != undefined){

            this.fixed = false;

            for (const leafPtr of leafPtrs){
                leafPtrPath = leafPtr.replace(extractPathRegexp, "$2");
                leafPtrVal = new Pointer(leafPtrPath, this.model).getValueAsStr();
                if(leafPtrVal == undefined){
                    throw new Error(`Could not resolve pointer ${leafPtrPath}`); // TODO                    
                }
                resolvedPath = resolvedPath.replace(leafPtr, leafPtrVal);
            }

            leafPtrs = resolvedPath.match(leafPointerRegexp);
        }

        return resolvedPath;
    }

    private resolveEntity(path: string){
        
        const tokens: string[] = jsonPointer.parse(path);

        if(tokens == undefined || tokens.length < 2){
            throw new Error(`Invalid pointer: ${path}`); // TODO                    
        }

        this.entity = this.model.getChildEntity(tokens[0], tokens[1]);
        if(tokens[0] == "dt"){
            this.relativePath = tokens[1];
        }else if(tokens.length > 2){
            switch(tokens[2]){
                case "i":
                    if(tokens.length > 3 && this.entity.getInput){
                        this.entity = this.entity.getInput(tokens[3]);
                        // TODO build path from the rest of tokens
                    }else{
                        throw new Error(`Invalid pointer: ${path}`);
                    }
                    break;
                case "o":
                    if(tokens.length > 3 && this.entity.getOutput){
                        this.entity = this.entity.getOutput(tokens[3]);
                        // TODO build path from the rest of tokens
                    }else{
                        throw new Error(`Invalid pointer: ${path}`);
                    }
                    break;
                case "proc":
                    if(tokens.length == 3 && this.entity.getProcess){
                        this.entity = this.entity.getProcess(tokens[3]); // TODO getProcess() and similar should throw error if does not exist

                        if(tokens.length > 4){
                            switch(tokens[4]){
                                case "i":
                                    if(this.entity.getInput){
                                        this.entity = this.entity.getInput();
                                        // TODO build path from the rest of tokens
                                    }else{
                                        throw new Error(`Invalid pointer: ${path}`);
                                    }
                                    break;
                                case "o":
                                    if(this.entity.getOutput){
                                        this.entity = this.entity.getOutput();
                                        // TODO build path from the rest of tokens
                                    }else{
                                        throw new Error(`Invalid pointer: ${path}`);
                                    }
                                    break;
                                case "dm":
                                    if(tokens.length > 5 && this.entity.getData){
                                        this.entity = this.entity.getData(tokens[5]);
                                        // TODO build path from the rest of tokens
                                    }else{
                                        throw new Error(`Invalid pointer: ${path}`);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }

                    }else{
                        throw new Error(`Invalid pointer: ${path}`);
                    }
                    break;
                case "uv":
                    if(tokens.length > 3 && this.entity.getUriVariable){
                        this.entity = this.entity.getUriVariable(tokens[3]);
                        // TODO build path from the rest of tokens
                    }else{
                        throw new Error(`Invalid pointer: ${path}`);
                    }
                    break;
                case "dm":
                    if(tokens.length > 3 && this.entity.getData){
                        this.entity = this.entity.getData(tokens[3]);
                        // TODO build path from the rest of tokens
                    }else{
                        throw new Error(`Invalid pointer: ${path}`);
                    }
                    break;
                default:
                    if(this.entity.read || this.entity.write){
                        // TODO build path from tokens[3:length]
                    }else{
                        throw new Error(`Invalid pointer: ${path}`);
                    }
                    break;
            }
        }
    }
  
    public getValue(): any {
        this.update();
    }

    public getValueAsStr(): string {
        return new String(this.getValue()).toString();
    }

    public setValue(value: any){
        this.update();
    }
}
