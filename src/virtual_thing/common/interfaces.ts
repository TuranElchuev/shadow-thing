import {
    RuntimeEvent,
    ReadOp,
    WriteOp,
    ControlType
} from "../index";


export type IVtdTriggers = IVtdTrigger[];
export type IVtdInstructions = IVtdInstruction[];
export type IVtdEnumRuntimeEvent = RuntimeEvent;
export type IVtdDelay = string;
export type IVtdParameterizedStrings = string[];
export type IVtdCompoundData = any;
export type IVtdEnumReadOp = ReadOp;
export type IVtdEnumWriteOp = WriteOp;
export type IVtdPointer = IVtdParameterizedStrings;
export type IVtdInstructionLog = IVtdParameterizedStrings;
export type IVtdInstructionControl = ControlType;

export interface IVirtualThingDescription {
    title?: string,
    properties?: {
        [k: string]: IVtdProperty;
    };
    actions?: {
        [k: string]: IVtdAction;
    };
    events?: {
        [k: string]: IVtdEvent;
    };
    sensors?: {
        [k: string]: IVtdSensor;
    };
    actuators?: {
        [k: string]: IVtdActuator;
    };
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
}

export interface IVtdInteractionAffordance {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
    uriVariables?: IVtdDataMap;
}

export interface IVtdBehavior {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
}

export interface IVtdProperty {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
    uriVariables?: IVtdDataMap;
}

export interface IVtdAction {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
    input?: IVtdDataSchema;
    output?: IVtdDataSchema;
    uriVariables?: IVtdDataMap;
}

export interface IVtdEvent {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
    data?: IVtdDataSchema;
    uriVariables?: IVtdDataMap;
}

export interface IVtdSensor {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
}

export interface IVtdActuator {
    dataMap?: IVtdDataMap;
    processes?: IVtdProcessMap;
}

export interface IVtdDataMap {
    [k: string]: IVtdDataSchema;
}

export interface IVtdProcessMap {
    [k: string]: IVtdProcess;
}

export interface IVtdProcess {
    triggers?: IVtdTriggers;
    condition?: mathIVtdMath;
    dataMap?: IVtdDataMap;
    instructions: IVtdInstructions;
    wait?: boolean;
}

export interface mathIVtdMath {
    expr: IVtdParameterizedStrings;
    conf?: {
      [k: string]: unknown;
    };
}

export interface IVtdTrigger {
    runtimeEvent?: IVtdEnumRuntimeEvent;
    interactionAffordance?: string;
    interval?: mathIVtdMath;
    condition?: mathIVtdMath;
    wait?: boolean;
}

export interface IVtdInstruction {
    delay?: IVtdDelay;
    wait?: boolean;
    readProperty?: IVtdInstructionReadProperty;
    writeProperty?: IVtdInstructionWriteProperty;
    invokeAction?: IVtdInstructionInvokeAction;
    subscribeEvent?: IVtdInstructionSubscribeEvent;
    unsubscribeEvent?: IVtdInstructionUnsubscribeEvent;
    emitEvent?: IVtdInstructionEmitEvent;
    invokeProcess?: IVtdPointer;
    move?: IVtdInstructionuctionMove;
    ifelse?: IVtdInstructionIfelse;
    switch?: IVtdInstructionSwitch;
    loop: IVtdInstructionLoop;
    try?: IVtdInstructionTry;
    log?: IVtdInstructionLog;
    control?: IVtdInstructionControl;
}

export interface IVtdValueSourceMap {
    [k: string]: IVtdValueSource;
}

export interface IVtdValueSource {
    math?: mathIVtdMath;
    compound?: IVtdCompoundData;
    pointer?: IVtdPointer;
    operation?: IVtdEnumReadOp;
}

export interface IVtdValueTarget {
    pointer: IVtdPointer;
    operation?: IVtdEnumWriteOp;
}

export interface IVtdInstructionReadProperty {
    webUri: IVtdParameterizedStrings;
    name: IVtdParameterizedStrings;
    uriVariables?: IVtdValueSourceMap;
    result?: IVtdValueTarget;
}

export interface IVtdInstructionConsumerInteraction {
    webUri: IVtdParameterizedStrings;
    name: IVtdParameterizedStrings;
    uriVariables?: IVtdValueSourceMap;
}

export interface IVtdInstructionWriteProperty {
    webUri: IVtdParameterizedStrings;
    name: IVtdParameterizedStrings;
    uriVariables?: IVtdValueSourceMap;
    value?: IVtdValueSource;
}

export interface IVtdInstructionInvokeAction {
    webUri: IVtdParameterizedStrings;
    name: IVtdParameterizedStrings;
    uriVariables?: IVtdValueSourceMap;
    input?: IVtdValueSource;
    output?: IVtdValueTarget;
}

export interface IVtdInstructionSubscribeEvent {
    webUri: IVtdParameterizedStrings;
    name: IVtdParameterizedStrings;
    uriVariables?: IVtdValueSourceMap;
    onEmit: IVtdInstructions;
    data: IVtdValueTarget;
}

export interface IVtdInstructionUnsubscribeEvent {
    webUri: IVtdParameterizedStrings;
    name: IVtdParameterizedStrings;
    uriVariables?: IVtdValueSourceMap;
}

export interface IVtdInstructionEmitEvent {
    name: IVtdParameterizedStrings;
    data?: IVtdValueSource;
}

export interface IVtdInstructionuctionMove {
    from: IVtdValueSource;
    to?: IVtdValueTarget;
}

export interface IVtdInstructionIfelse {
    if: IVtdInstructionIfelseIf;
    elif?: IVtdInstructionIfelseIf[];
    else?: IVtdInstructions;
}

export interface IVtdInstructionIfelseIf {
    condition: mathIVtdMath;
    instructions?: IVtdInstructions;
}

export interface IVtdInstructionSwitch {
    switch: IVtdPointer;
    cases: IVtdInstructionSwitchCase[];
    default?: IVtdInstructions;
}

export interface IVtdInstructionSwitchCase {
    case: IVtdValueSource;
    break?: boolean;
    instructions?: IVtdInstructions;
}

export interface IVtdInstructionSwitchDefault {
    break?: boolean;
    instructions?: IVtdInstructions;
}

export interface IVtdInstructionLoop {
    interval?: mathIVtdMath;
    iterator?: IVtdPointer;
    initialValueExpr?: mathIVtdMath;
    increment?: number;
    condition?: mathIVtdMath;
    instructions?: IVtdInstructions;
    conditionFirst?: boolean;
}

export interface IVtdInstructionTry {
    try: IVtdInstructions;
    catch?: IVtdInstructions;
}

export interface IVtdDataSchema {
    enum?: [unknown, ...unknown[]];
    format?: string;
    type: "boolean" | "integer" | "number" | "string" | "object" | "array" | "null";
    default?: any;
    const?: any;
    items?: IVtdDataSchema | IVtdDataSchema[];
    maxItems?: number;
    minItems?: number;
    minimum?: number;
    maximum?: number;
    properties?: {
      [k: string]: IVtdDataSchema;
    };
    required?: string[];
    [k: string]: unknown;
}
