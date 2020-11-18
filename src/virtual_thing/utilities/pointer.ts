import {
    VirtualThingModel,
    Process
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
now('format') 

 * 3. must be:
 *          proc - for HasProcess
 *          dm - for HasDataMap
 *          uv - for hasUriVariables
 *          otherwise: 
 *          path - for readable/writable
 *          
 * 4. must be a valid name for 3. or path
 */

enum PointerType {
    Property,
    Action,
    Event,
    Sensor,
    Actuator,
    Process,
    DataSchema,
    Data,
    Input,
    UriVariables,
    Plain
}

export class Pointer {

    private ptrStr: string = undefined;
    private pointerType: PointerType = undefined

    public constructor(ptrStr: string, model: VirtualThingModel){
        this.ptrStr = new String(ptrStr).toString();
    }

    private resolveInnerPointers(): string {
        
        if(this.ptrStr == undefined)
            return undefined;

        const leafPointerRegexp = /\$\([^${}]+\)/g;
        const extractPathRegexp = /[${}]/g;

        let completePath = this.ptrStr.replace(/\s/g, "");

        let leafPath = undefined;
        let leafPathVal = undefined;
        let leafPointers = completePath.match(leafPointerRegexp);

        while(leafPointers != undefined){

            for (const leafPtr of leafPointers){
                leafPath = leafPtr.replace(extractPathRegexp, "");
                leafPathVal = this.readAsStr(leafPath);                
                if(leafPathVal == undefined){
                    return undefined;
                }
                completePath = completePath.replace(leafPtr, leafPathVal);
            }

            leafPointers = completePath.match(leafPointerRegexp);
        }

        return completePath;
    }
    
    public read(path: string = undefined): any {

        if(path == undefined)
            path = this.resolveInnerPointers();

        if(path == undefined)
            return undefined;
        
        // use path to access object

        return path;
    }

    public write(value: any){
        let path = this.resolveInnerPointers();

        if(path == undefined){
            // TODO error
        }
    }

    public readAsStr(path: string = undefined): string {
        return new String(this.read(path)).toString();
    }
 }
