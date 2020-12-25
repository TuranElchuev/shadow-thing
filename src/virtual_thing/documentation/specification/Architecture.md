# Architecture

In [Virtual Thing Description][vtd] (VTD), behavior of a [Thing] is described in a similar way as writing a script. The core components tha make up a behavior description are [DataMaps](#datamap) and [Processes](#Processes). The Processes can be seen as procedures of a script, whereas the DataMaps are structures that store global variables/constants that can be accessed by those procedures.  

The root object in a VTD is a [VirtualThingModel]. It contains the entire content of the respective [Thing Description][td], but the properties, which are relevant for simulation behavior, are the maps: `Properties`, `Actions` and `Events`. In addition to those maps, a [VirtualThingModel] can, among other properties, contain maps of [Sensors and Actuators](#Sensors-and-Actuators). Each entry from the 5 mentioned maps as well as the [VirtualThingModel] self is a so called [Component with Behavior][behavior], i.e. a component that can contain [Processes](#processes) and [DataMap](#datamap).

## DataMap
A map of variables/constants that can be used by [Processes](#processes). There are various places within a [Virtual Thing Description][vtd] where DataMap instances can be defined. [Processes](#processes) can access any DataMap defined anywhere within a [Virtual Thing Description][vtd], i.e. all DataMap instances are "global". The decision where to place variables/constants for a particular process is the matter of structuring, readability and maintainability of [Virtual Thing Descriptions][vtd]. In some cases, though, you might want to place variables/constants accessed by a certain process within the process. An example of such a case would be designing a reusable process that can be copy-pasted into different [Virtual Thing Descriptions][vtd] and work right-away without or with minimum modifications.

## Processes
Entities executable by the [Engine] as a sequence of instructions to perform the described behavior. Like [DataMap](#datamap), Processes can also be defined in various places within a [Virtual Thing Description][vtd], and their behavior generally does not depend on location, with one exception: if a [Process] is placed within an interaction affordance instance ([Property], [Action] or [Event]), and the process has no explicit triggers defined, then it will be hooked to certain interaction events and invoked when those events are fired. However, there is an alternative way to invoke a process on an interaction event - using a [Trigger]. Hence, generally, where you place a process is the matter of structuring, readability and maintainability of the [Virtual Thing Description][vtd].  
More on this in [Process], [Property], [Action] and [Event].

## Sensors and Actuators
Components that describe hardware behavior. Currently, there is no functionality implemented that could be applied specially to sensors and actuators. All the simulation behavior of a Virtual Thing is based on [Processes](#processes) and [DataMaps](#datamap). As such, a [Sensor] or an [Actuator] instance within a [Virtual Thing Description][vtd] is nothing but yet another place where [Processes](#processes) and/or a [DataMap](#datamap) can be placed. Nevertheless, `Sensors` and `Actuators` can be used for semantical categorization of components, and hence, better structuring in a [Virtual Thing Description][vtd].


[Engine]: Definitions.md#Virtual-Thing-Engine-and-Engine
[vtd]: Definitions.md#Virtual-Thing-Description
[behavior]: Definitions.md#Component-With-Behavior-and-Behavior

[Process]: main_components/Process.md

[VirtualThingModel]: main_components/VirtualThingModel.md
[Property]: main_components/Property.md
[Action]: main_components/Action.md
[Event]: main_components/Event.md
[Sensor]: main_components/Sensor.md
[Actuator]: main_components/Actuator.md

[Trigger]: helper_components/Trigger.md

[Thing]: https://www.w3.org/TR/wot-thing-description/#thing
[td]: https://www.w3.org/TR/wot-thing-description