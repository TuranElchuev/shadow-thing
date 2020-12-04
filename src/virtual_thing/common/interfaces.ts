import {
    RuntimeEvent,
    ReadOp,
    WriteOp,
    ControlType
} from "../index";


export type IVtdTriggers = IVtdTrigger[];
export type IVtdInstructions = IVtdInstruction[];
export type IVtdEnumRuntimeEvent = RuntimeEvent;

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
    condition?: IVtdExpression;
    dataMap?: IVtdDataMap;
    instructions: IVtdInstructions;
    wait?: boolean;
}

export interface IVtdExpression {
    expr: string;
    conf?: {
      [k: string]: unknown;
    };
}

export interface IVtdTrigger {
    runtimeEvent?: IVtdEnumRuntimeEvent;
    interactionAffordance?: string;
    interval?: IVtdExpression;
    condition?: IVtdExpression;
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

export type IVtdDelay = string;
export type IVtdParameterizedString = string;
export type IVtdCompoundData = any;
export type IVtdEnumReadOp = ReadOp;
export type IVtdEnumWriteOp = WriteOp;
export type IVtdPointer = IVtdParameterizedString;
export type IVtdInstructionLog = IVtdParameterizedString;
export type IVtdInstructionControl = ControlType;

export interface IVtdValueSourceMap {
    [k: string]: IVtdValueSource;
}

export interface IVtdValueSource {
    expression?: IVtdExpression;
    compound?: IVtdCompoundData;
    pointer?: IVtdPointer;
    operation?: IVtdEnumReadOp;
}

export interface IVtdValueTarget {
    pointer: IVtdPointer;
    operation?: IVtdEnumWriteOp;
}

export interface IVtdInstructionReadProperty {
    webUri: IVtdParameterizedString;
    name: IVtdParameterizedString;
    uriVariables?: IVtdValueSourceMap;
    result?: IVtdValueTarget;
}

export interface IVtdInstructionWriteProperty {
    webUri: IVtdParameterizedString;
    name: IVtdParameterizedString;
    uriVariables?: IVtdValueSourceMap;
    value?: IVtdValueSource;
}

export interface IVtdInstructionInvokeAction {
    webUri: IVtdParameterizedString;
    name: IVtdParameterizedString;
    uriVariables?: IVtdValueSourceMap;
    input?: IVtdValueSource;
    output?: IVtdValueTarget;
}

export interface IVtdInstructionSubscribeEvent {
    webUri: IVtdParameterizedString;
    name: IVtdParameterizedString;
    uriVariables?: IVtdValueSourceMap;
}

export interface IVtdInstructionUnsubscribeEvent {
    webUri: IVtdParameterizedString;
    name: IVtdParameterizedString;
}

export interface IVtdInstructionEmitEvent {
    name: IVtdParameterizedString;
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
    condition: IVtdExpression;
    instructions?: IVtdInstructions;
}

export interface IVtdInstructionSwitch {
    switch: IVtdPointer;
    cases: IVtdInstructionSwitchCase[];
    default?: IVtdInstructionSwitchDefault;
}

export interface IVtdInstructionSwitchCase {
    case?: IVtdValueSource;
    break?: boolean;
    instructions?: IVtdInstructions;
}

export interface IVtdInstructionSwitchDefault {
    break?: boolean;
    instructions?: IVtdInstructions;
}

export interface IVtdInstructionLoop {
    interval?: IVtdExpression;
    iterator?: IVtdPointer;
    initialValueExpr?: IVtdExpression;
    increment?: number;
    condition?: IVtdExpression;
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
