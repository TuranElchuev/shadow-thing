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

[vtd]: ../Definitions.md#virtual-thing-description

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