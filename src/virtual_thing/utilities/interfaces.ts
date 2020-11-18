import {
    Pointer,
    DataMap,
    Processes,
    CompoundData
} from "../index"

export interface Readable {
    read(path: string): any;
}

export interface Writable {
    write(value: any, path: string);
}

export interface Invokeable {
    invoke(input: CompoundData, output: Pointer);
}

export interface HasDataMap {
    getDataMap(): DataMap;
}

export interface HasProcesses {
    getProcesses(): Processes;
}

export interface HasUriVariables {
    getUriVariables(): DataMap;
}