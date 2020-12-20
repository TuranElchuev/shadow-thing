# Virtual Thing Description Specification

# Contents:

- [Introduction](#introduction)
- [Definitions](#definitions)
- [Architecture](#architecture)
- [Components](#components)
    - [Main Components](#main-components)
        - [VirtualThingModel](#virtualthingmodel)
        - [DataHolder](#dataholder)
        - [Process](#process)
        - [Property](#property)
        - [Action](#action)
        - [Event](#event)
        - [Sensor](#sensor)
        - [Actuator](#actuator)
    - [Instructions](#instructions)
        - [Instruction](#instruction)
        - [Empty](#empty)
        - [Fake](#fake)
        - [Control](#control)
        - [Move](#move)
        - [Ifelse](#ifelse)
        - [Switch](#switch)
        - [Try](#try)
        - [Loop](#loop)
        - [ReadProperty](#readproperty)
        - [WriteProperty](#writeproperty)
        - [ObserveProperty](#observeproperty)
        - [UnobserveProperty](#unobserveproperty)
        - [InvokeAction](#invokeaction)
        - [EmitEvent](#emitEvent)
        - [SubscribeEvent](#subscribeevent)
        - [UnsubscribeEvent](#unsubscribeEvent)
        - [InvokeProcess](#invokeProcess)
        - [Log](#log)
        - [Info](#info)
        - [Warn](#warn)
        - [Debug](#debug)
        - [Error](#error)
    - [Helper Components](#helper-components)
        - [CompoundData](#compoundData)
        - [DateTime](#dateTime)
        - [Delay](#delay)
        - [File](#file)
        - [Interval](#interval)
        - [Math](#math)
        - [Pointer](#pointer)
        - [ParameterizedString](#parameterizedstring)
        - [Trigger](#trigger)
        - [ValueSource](#valuesource)
        - [ValueTarget](#valuetarget)
- [Console message reference](#console-message-reference)
- [Developer notes](#developer-notes)


# Introduction

# Definitions

### Virtual Thing Description
A [Thing Description][td] complemented by Virtual Thing-related [components](#components).

### Virtual Thing Engine
The program that `interpretes` and `executes` [Virtual Thing Description][vtd] instances.

# Architecture

### DataMap
A map of variables/constants that can be used by processes. There are various places within a [Virtual Thing Description][vtd] where DataMap instances can be defined. Processes can access any DataMap defined anywhere within a [Virtual Thing Description][vtd], i.e. all DataMap instances are "global". The decision where to place variables/constants for a particular process is the matter of structuring, readability and maintainability of [Virtual Thing Descriptions][vtd]. In some cases, though, you might want to place variables/constants accessed by a certain process within the process. An example of such a case would be designing a reusable process that can be copy-pasted into different [Virtual Thing Descriptions][vtd] and work right-away without or with minimum modifications.

### Processes
Entities executable by the [Engine][engine] as a sequence of instructions to perform the described behavior. Like [DataMap](#datamap), Processes can also be defined in various places within a [Virtual Thing Description][vtd], and their behavior generally does not depend on location, with one exception: if a [Process](#process) is placed within an interaction affordance instance ([Property](#property), [Action](#action) or [Event](#event)), and the process has no explicit triggers defined, then it will be hooked to certain interaction events and invoked when those events are fired. However, there is an alternative way to invoke a process on an interaction event - using a [Trigger](#trigger). Hence, generally, where you place a process is the matter of structuring, readability and maintainability of the [Virtual Thing Description][vtd].  
More on this in [Process](#process), [Property](#property), [Action](#action) and [Event](#event).


### Sensors and Actuators
Components that describe hardware behavior. Currently, there is no functionality implemented that could be applied specially to sensors and actuators. All the simulation behavior of a Virtual Thing is based on [Processes](#processes) and [DataMaps](#datamap). As such, a [Sensor](#sensor) or an [Actuator](#actuator) instance within a [Virtual Thing Description][vtd] is nothing but yet another place where [Processes](#processes) and/or a [DataMap](#datamap) can be placed. Nevertheless, `Sensors` and `Actuators` can be used for semantical categorization of components, and hence, better structuring in a [Virtual Thing Description][vtd].

# Components

## Main Components




### VirtualThingModel
The root object in the [Virtual Thing Description][vtd].

#### Schema

Extends [Thing][td_thing] with the following differences:
- the mandatory properties of [Thing][td_thing] are not mandatory
- the overriden properties are: `properties`, `actions` and `events`
- there are additional properties (in the table below).

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| properties | Property affordances. | | Map of [Property](#property) | |
| actions | Action affordances. | | Map of [Action](#action) | |
| events | Event affordances. | | Map of [Event](#event) | |
| sensors | Sensor description entries. | | Map of [Sensor](#sensor) | |
| actuators | Actuator description entries. | | Map of [Actuator](#actuator) | |
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |
| dataSchemas | Reusable schemas for [DataHolder](#dataholder) entries. | | Map of [DataHolder](#dataholder) | |




### DataHolder
All value instances, i.e. variables, constants, etc.

#### Schema

Extends [DataSchema][td_dataSchema] with the following differences:
- the properties that are irrelevant for data validation are ignored by the [Engine][engine]
- there are additional properties (in the table below).

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| default | Default value to initialize. | | any | |
| fake | Indicates whether the value should be faked. Faking the value means, that each `read` operation performed by the [Engine][engine] on the corresponding `DataHolder instance` will return a new random value in compliance with the schema of that instance. | | `boolean` | false |
| schema | A valid name of a `reusable data schema` (an entry from `dataSchemas` map in [VirtualThingModel](#VirtualThingModel)). If specified, the properties of the `reusable data schema` will be inherited, but will **not** overwrite the alredy existing properties with matching names. | | `string` | |

#### Behavioral Notes
- Initialize/reset value.  
    For an arbitrary combination of the *root* properties of a `DataHolder instance`, its initialization/reset behavior is defined by the following table:
    |Priority|Root property|Property's value|Initial/reset value|Access rights|Remark|
    |:------:|:--:|:--------:|-------------------|:--------:|------|
    |1|const|any|Property's value|RO||
    |2|fake|true|Generated by [json-schema-faker][json-faker].|RO|Each `read operation` performed by the [Engine][engine] will reset the value.|
    |3|type|any valid|Instantiated by [json-schema-instantiator][json-inst].|R/W||
    |4|default|any|Property's value|R/W||
    |5|-|-|undefined|R/W||



    
### Process
A component that can be `executed` by the [Engine][engine] as a sequence of instructions to perform the described behavior.

#### Schema
Type: `object`
| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|triggers|Triggers define when the process should be invoked automatically. Further ways of invoking a process are described in corresponding sections.||Array of [Trigger](#trigger)||
|condition|A process can execute only if its condition (if any) is met.||[Math](#math)||
|instructions|Instructions that will be executed in a sequence when the process is invoked.|yes|Array of [Instruction](#instruction)||
|dataMap|See [DataMap](#datamap).||Map of [DataHolder](#dataholder)||
|wait|If true, after invokation, the process will wait for the `instructions` block to complete its execution, otherwise it will return right after invoking the `instructions` block. This behavior is analogous to "awaiting" an "async" entity, where the "async" entity is the `instructions` block.||`boolean`|true|
|comment|A property to use on your own purpose, ignored by the [Engine][engine].||`string` or `array of string`||

**\*** additional properties are not allowed.



### Property
Is [PropertyAffordance][td_property] complemented by Virtual Thing-related functionality.
#### Schema
Extends [PropertyAffordance][td_property] plus the following properties:

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |

#### Behavioral Notes
- Implicit process triggers on interaction events.  
    If a `Process` in the `processes` of a `Property` has **no explicitly defined** `triggers`, it will be invoked automatically on interaction events depending on the name of the process as shown in the table:  
    |Process name|Interaction event that will invoke the process|
    |------------|:---------------:|
    |"read"|`readProperty`|
    |"write"|`writeProperty`|
    |any other name|`readProperty` and `writeProperty`|




### Action
Is [ActionAffordance][td_action] complemented by Virtual Thing-related functionality.
#### Schema
Extends [ActionAffordance][td_action] plus the following properties:

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |

#### Behavioral Notes
- Implicit process triggers on interaction events.  
    If a `Process` in the `processes` of an `Action` has **no explicitly defined** `triggers`, it will be invoked automatically on each `invokeAction` event.




### Event
Is [EventAffordance][td_event] complemented by Virtual Thing-related functionality.
#### Schema
Extends [EventAffordance][td_event] plus the following properties:

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |

#### Behavioral Notes
- Implicit process triggers on interaction events.  
    If a `Process` in the `processes` of an `Event` has **no explicitly defined** `triggers`, it will be invoked automatically on interaction events depending on the name of the process as shown in the table:  
    |Process name|Interaction event that will invoke the process|
    |------------|:---------------:|
    |"subscribe"|`subscribeEvent`|
    |"unsubscribe"|`unsubscribeEvent`|
    |any other name|`emitEvent`|




### Sensor
An object that describes behavior of a sensor (e.g. a temperature sensor) that needs to be simulated.

#### Schema
Type: `object`

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |




### Actuator
An object that describes behavior of an actuator (e.g. a motor, switch, etc.) that needs to be simulated.

#### Schema
Type: `object`

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |




## Instructions

### Instruction
### Empty
### Fake
### Control
### Move
### Ifelse
### Switch
### Try
### Loop
### ReadProperty
### WriteProperty
### ObserveProperty
### UnobserveProperty
### InvokeAction
### EmitEvent
### SubscribeEvent
### UnsubscribeEvent
### InvokeProcess
### Log
### Info
### Warn
### Debug
### Error

## Helper Components

### CompoundData
### DateTime
### Delay
### File
### Interval
### Math
### Pointer
### ParameterizedString
### Trigger
### ValueSource
### ValueTarget

# Console message reference

# Developer notes


[vtd]: #virtual-thing-description
[engine]: #virtual-thing-engine

[json-inst]: https://www.npmjs.com/package/json-schema-instantiator
[json-faker]: https://www.npmjs.com/package/json-schema-faker

[td]: https://www.w3.org/TR/wot-thing-description/

[td_thing]: https://www.w3.org/TR/wot-thing-description/#thing
[td_dataSchema]: https://www.w3.org/TR/wot-thing-description/#dataschema
[td_property]: https://www.w3.org/TR/wot-thing-description/#propertyaffordance
[td_action]: https://www.w3.org/TR/wot-thing-description/#actionaffordance
[td_event]: https://www.w3.org/TR/wot-thing-description/#eventaffordance