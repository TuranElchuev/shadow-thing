# VirtualThingModel
The root object in the [Virtual Thing Description][vtd].

## Schema

Extends [Thing] with the following differences:
- the mandatory properties of [Thing] are not mandatory
- the overriden properties are: `properties`, `actions` and `events`
- there are additional properties.

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| properties | Property affordances. | | Map of [Property] | |
| actions | Action affordances. | | Map of [Action] | |
| events | Event affordances. | | Map of [Event] | |
| sensors | Sensor description entries. | | Map of [Sensor] | |
| actuators | Actuator description entries. | | Map of [Actuator] | |
| dataMap | See [DataMap]. | | Map of [DataHolder] | |
| processes | See [Processes]. | | Map of [Process] | |
| dataSchemas | Reusable schemas for [DataHolder] entries. | | Map of [DataHolder] | |


## Behavior

### Start
A `VirtualThingModel` starts when you run the program.  
On start, the model `invokes` all the [Trigger] instances registered for the `"startup"` [RuntimeEvent] in parallel.

### Stop
A `VirtualThingModel` instance can stop in the following cases:
- Initiated by the `"shutdown"` command of a [Control] instruction.
- On model [Failure](#failure).

On stop, the model sequentially `invokes` and `awaits` all the [Trigger] instances registered for the `"shutdown"` [RuntimeEvent].

### Failure
 A `VirtualThingModel` instance should fail if a [fatal error][fatal] happens. Normal [errors][error] should not lead to a failure. A failure will lead to [Stop](#stop).





[vtd]: ../Definitions.md#virtual-thing-description

[fatal]: ../ConsoleMessagesReference.md#Fatal-Errors
[error]: ../ConsoleMessagesReference.md#Errors

[Property]: Property.md
[Action]: Action.md
[Event]: Event.md
[DataHolder]: DataHolder.md
[Process]: Process.md
[Sensor]: Sensor.md
[Actuator]: Actuator.md

[DataMap]: ../Architecture.md#DataMap
[Processes]: ../Architecture.md#Processes

[Thing]: https://www.w3.org/TR/wot-thing-description/#thing

[Control]: ../instructions/Control.md

[Interval]: ../helper_components/Interval.md
[Trigger]: ../helper_components/Trigger.md
[RuntimeEvent]: ../helper_components/Enums.md#RuntimeEvent