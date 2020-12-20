# VirtualThingModel
The root object in the [Virtual Thing Description][vtd].

## Schema

Extends [Thing][td_thing] with the following differences:
- the mandatory properties of [Thing][td_thing] are not mandatory
- the overriden properties are: `properties`, `actions` and `events`
- there are additional properties.

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
| properties | Property affordances. | | Map of [Property] | |
| actions | Action affordances. | | Map of [Action] | |
| events | Event affordances. | | Map of [Event] | |
| sensors | Sensor description entries. | | Map of [Sensor](#sensor) | |
| actuators | Actuator description entries. | | Map of [Actuator](#actuator) | |
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder] | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |
| dataSchemas | Reusable schemas for [DataHolder] entries. | | Map of [DataHolder] | |