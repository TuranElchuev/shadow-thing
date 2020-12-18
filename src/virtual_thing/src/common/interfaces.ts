/**
 * This file contains interfaces that correspond to the vocabulary of the
 * Virtual Thing Description JSON Validation Scheme.
 */

import {
    RuntimeEvent,
    ReadOp,
    WriteOp,
    ControlType
} from "../index";


export type ITriggers = ITrigger[];
export type IInstructions = IInstruction[];
export type IEnumRuntimeEvent = RuntimeEvent;
export type IDelay = string;
export type IParameterizedString = string | string[];
export type ICompoundData = any;
export type IEnumReadOp = ReadOp;
export type IEnumWriteOp = WriteOp;
export type IPointer = IParameterizedString;
export type IInstructionConsole = IParameterizedString;
export type IInstructionControl = ControlType;
export type IProperty = IInteractionAffordance;
export type ISensor = IBehavior;
export type IActuator = IBehavior;
export type IInstructionUnsubscribeEvent = IInstructionThingInteraction;
export type IInstructionUnobserveProperty = IInstructionThingInteraction;
export type IMath = IMathObj | IParameterizedString;

export interface IVirtualThingDescription {
    title?: string,
    properties?: {
        [k: string]: IProperty;
    };
    actions?: {
        [k: string]: IAction;
    };
    events?: {
        [k: string]: IEvent;
    };
    sensors?: {
        [k: string]: ISensor;
    };
    actuators?: {
        [k: string]: IActuator;
    };
    dataMap?: IDataMap;
    processes?: IProcessMap;
    dataSchemas?: IDataSchemaMap;
}

export interface IBehavior {
    dataMap?: IDataMap;
    processes?: IProcessMap;
}

export interface IInteractionAffordance extends IBehavior {
    uriVariables?: IDataMap;
}

export interface IAction extends IInteractionAffordance {
    input?: IDataSchema;
    output?: IDataSchema;
}

export interface IEvent extends IInteractionAffordance {
    data?: IDataSchema;
    subscription?: IDataSchema;
    cancellation?: IDataSchema;
}

export interface IDataMap {
    [k: string]: IDataSchema;
}

export interface IDataSchemaMap {
    [k: string]: IDataSchema;
}

export interface IProcessMap {
    [k: string]: IProcess;
}

export interface IProcess {
    triggers?: ITriggers;
    condition?: IMath;
    dataMap?: IDataMap;
    instructions: IInstructions;
    wait?: boolean;
}

export interface IMathObj {
    expr: IParameterizedString;
    conf?: {
      [k: string]: unknown;
    };
}

export interface ITrigger {
    runtimeEvent?: IEnumRuntimeEvent;
    interactionAffordance?: string;
    interval?: IMath;
    condition?: IMath;
    wait?: boolean;
}

export interface IInstruction {
    delay?: IDelay;
    wait?: boolean;
    readProperty?: IInstructionReadProperty;
    writeProperty?: IInstructionWriteProperty;
    observeProperty?: IInstructionObserveProperty;
    unobserveProperty?: IInstructionUnobserveProperty;
    invokeAction?: IInstructionInvokeAction;
    subscribeEvent?: IInstructionSubscribeEvent;
    unsubscribeEvent?: IInstructionUnsubscribeEvent;
    emitEvent?: IInstructionEmitEvent;
    invokeProcess?: IPointer;
    move?: IInstructionuctionMove;
    ifelse?: IInstructionIfelse;
    switch?: IInstructionSwitch;
    loop: IInstructionLoop;
    try?: IInstructionTry;
    log?: IInstructionConsole;
    info?: IInstructionConsole;
    warn?: IInstructionConsole;
    debug?: IInstructionConsole;
    error?: IInstructionConsole;
    fake?: IPointer;
    control?: IInstructionControl;
}

export interface IValueSourceMap {
    [k: string]: IValueSource;
}

export interface IValueSource {
    math?: IMath;
    compound?: ICompoundData;
    pointer?: IPointer;
    file?: IParameterizedString;
    operation?: IEnumReadOp;
}

export interface IValueTarget {
    pointer?: IPointer;
    file?: IParameterizedString;
    operation?: IEnumWriteOp;
}

export interface IInstructionThingInteraction {
    webUri?: IParameterizedString;
    name: IParameterizedString;
    uriVariables?: IValueSourceMap;
}

export interface IInstructionReadProperty extends IInstructionThingInteraction {
    result?: IValueTarget;
}

export interface IInstructionWriteProperty extends IInstructionThingInteraction {
    value?: IValueSource;
}

export interface IInstructionObserveProperty extends IInstructionThingInteraction {
    onChange: IInstructions;
    newValue: IValueTarget;
}

export interface IInstructionInvokeAction extends IInstructionThingInteraction {
    input?: IValueSource;
    output?: IValueTarget;
}

export interface IInstructionSubscribeEvent extends IInstructionThingInteraction {
    onEmit: IInstructions;
    data: IValueTarget;
}

export interface IInstructionEmitEvent {
    pointer: IParameterizedString;
    data?: IValueSource;
}

export interface IInstructionuctionMove {
    from: IValueSource;
    to?: IValueTarget;
}

export interface IInstructionIfelse {
    if: IInstructionIfelseIf;
    elif?: IInstructionIfelseIf[];
    else?: IInstructions;
}

export interface IInstructionIfelseIf {
    condition: IMath;
    instructions?: IInstructions;
}

export interface IInstructionSwitch {
    switch: IPointer;
    cases: IInstructionSwitchCase[];
    default?: IInstructions;
}

export interface IInstructionSwitchCase {
    case: IValueSource;
    break?: boolean;
    instructions?: IInstructions;
}

export interface IInstructionSwitchDefault {
    break?: boolean;
    instructions?: IInstructions;
}

export interface IInstructionLoop {
    interval?: IMath;
    iterator?: IPointer;
    initialValueExpr?: IMath;
    increment?: number;
    condition?: IMath;
    instructions?: IInstructions;
    conditionFirst?: boolean;
}

export interface IInstructionTry {
    try: IInstructions;
    catch?: IInstructions;
}

export interface IDataSchema {
    enum?: [unknown, ...unknown[]];
    format?: string;
    type: "boolean" | "integer" | "number" | "string" | "object" | "array" | "null";
    default?: any;
    const?: any;
    fake?: boolean;
    items?: IDataSchema | IDataSchema[];
    maxItems?: number;
    minItems?: number;
    minimum?: number;
    maximum?: number;
    properties?: {
      [k: string]: IDataSchema;
    };
    required?: string[];
    [k: string]: unknown;
    schema?: string;
}
