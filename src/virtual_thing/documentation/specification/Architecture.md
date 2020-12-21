# Architecture



## DataMap
A map of variables/constants that can be used by [Processes](#processes). There are various places within a [Virtual Thing Description][vtd] where DataMap instances can be defined. [Processes](#processes) can access any DataMap defined anywhere within a [Virtual Thing Description][vtd], i.e. all DataMap instances are "global". The decision where to place variables/constants for a particular process is the matter of structuring, readability and maintainability of [Virtual Thing Descriptions][vtd]. In some cases, though, you might want to place variables/constants accessed by a certain process within the process. An example of such a case would be designing a reusable process that can be copy-pasted into different [Virtual Thing Descriptions][vtd] and work right-away without or with minimum modifications.

## Processes
Entities executable by the [Engine] as a sequence of instructions to perform the described behavior. Like [DataMap](#datamap), Processes can also be defined in various places within a [Virtual Thing Description][vtd], and their behavior generally does not depend on location, with one exception: if a [Process] is placed within an interaction affordance instance ([Property], [Action] or [Event]), and the process has no explicit triggers defined, then it will be hooked to certain interaction events and invoked when those events are fired. However, there is an alternative way to invoke a process on an interaction event - using a [Trigger]. Hence, generally, where you place a process is the matter of structuring, readability and maintainability of the [Virtual Thing Description][vtd].  
More on this in [Process], [Property], [Action] and [Event].

## Sensors and Actuators
Components that describe hardware behavior. Currently, there is no functionality implemented that could be applied specially to sensors and actuators. All the simulation behavior of a Virtual Thing is based on [Processes](#processes) and [DataMaps](#datamap). As such, a [Sensor] or an [Actuator] instance within a [Virtual Thing Description][vtd] is nothing but yet another place where [Processes](#processes) and/or a [DataMap](#datamap) can be placed. Nevertheless, `Sensors` and `Actuators` can be used for semantical categorization of components, and hence, better structuring in a [Virtual Thing Description][vtd].


[Engine]: Definitions.md#Virtual-Thing-Engine-and-Engine
[vtd]: Definitions.md#Virtual-Thing-Description

[Process]: main_components/Process.md

[Property]: main_components/Property.md
[Action]: main_components/Action.md
[Event]: main_components/Event.md
[Sensor]: main_components/Sensor.md
[Actuator]: main_components/Actuator.md

[Trigger]: helper_components/Trigger.md