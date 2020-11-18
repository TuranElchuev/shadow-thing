export class Data {

    protected data: any = undefined;
    protected dataSchema: object = undefined;

    public constructor(jsonObj: any) {
        // retreive schema
        // create data instance according to schema and with default values
    }

    public write(path: string, value: any){
        if(this.data[path] != undefined)
            this.data[path] = value;        
    }

    public read(path: string): any {
        return this.data[path];
    }
}

export class CompoundData {
 
    private process: Process = undefined;
    
    public constructor(process: Process, jsonObj: any) {
        this.process = process;
    }
}

export class DataMap {
    
    protected map: Map<string, Data> = new Map();

    public constructor(jsonObj: any) {
        if(jsonObj instanceof Object)
            for (const [key, value] of Object.entries(jsonObj))
                this.map.set(key, new Data(value));
    }

    public get(name: string): Data {
        return this.map.get(name);
    }
}