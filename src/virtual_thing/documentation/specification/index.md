# Virtual Thing Description Specification

# Contents:

- [Introduction]
- [Definitions]
- [Architecture]
- Components
    - Main Components
        - [VirtualThingModel]
        - [DataHolder]
        - [Process]
        - [Property]
        - [Action]
        - [Event]
        - [Sensor]
        - [Actuator]
    - Instructions
        - [Instruction]
        - [Empty]
        - [Fake]
        - [Control]
        - [Move]
        - [Ifelse]
        - [Switch]
        - [Try]
        - [Loop]
        - [ReadProperty]
        - [WriteProperty]
        - [ObserveProperty]
        - [UnobserveProperty]
        - [InvokeAction]
        - [EmitEvent]
        - [SubscribeEvent]
        - [UnsubscribeEvent]
        - [InvokeProcess]
        - [Log]
        - [Info]
        - [Warn]
        - [Debug]
        - [Error]
    - Helper Components
        - [CompoundData]
        - [DateTime]
        - [Delay]
        - [File]
        - [Interval]
        - [Math]
        - [Pointer]
        - [ParameterizedString]
        - [Trigger]
        - [ValueSource]
        - [ValueTarget]
- [Console message reference][ConsoleMessagesReference]
- [Developer notes][DeveloperNotes]



[Introduction]: Introduction.md
[Definitions]: Definitions.md
[Architecture]: Architecture.md
[VirtualThingModel]: main_components/VirtualThingModel.md
[DataHolder]: main_components/DataHolder.md
[Process]: main_components/Process.md
[Property]: main_components/Property.md
[Action]: main_components/Action.md
[Event]: main_components/Event.md
[Sensor]: main_components/Sensor.md
[Actuator]: main_components/Actuator.md
[Instruction]: instructions/Instruction.md
[Empty]: instructions/Empty.md
[Fake]: instructions/Fake.md
[Control]: instructions/Control.md
[Move]: instructions/Move.md
[Ifelse]: instructions/Ifelse.md
[Switch]: instructions/Switch.md
[Try]: instructions/Try.md
[Loop]: instructions/Loop.md
[ReadProperty]: instructions/ReadProperty.md
[WriteProperty]: instructions/WriteProperty.md
[ObserveProperty]: instructions/ObserveProperty.md
[UnobserveProperty]: instructions/UnobserveProperty.md
[InvokeAction]: instructions/InvokeAction.md
[EmitEvent]: instructions/EmitEvent.md
[SubscribeEvent]: instructions/SubscribeEvent.md
[UnsubscribeEvent]: instructions/UnsubscribeEvent.md
[InvokeProcess]: instructions/InvokeProcess.md
[Log]: instructions/Console#Log
[Info]: instructions/Console.md#Info
[Warn]: instructions/Console.md#Warn
[Debug]: instructions/Console.md#Debug
[Error]: instructions/Console.md#Error
[CompoundData]: helper_components/CompoundData.md
[DateTime]: helper_components/DateTime.md
[Delay]: helper_components/Delay.md
[File]: helper_components/File.md
[Interval]: helper_components/Interval.md
[Math]: helper_components/Math.md
[Pointer]: helper_components/Pointer.md
[ParameterizedString]: helper_components/ParameterizedString.md
[Trigger]: helper_components/Trigger.md
[ValueSource]: helper_components/ValueSource.md
[ValueTarget]: helper_components/ValueTarget.md
[ConsoleMessagesReference]: ConsoleMessagesReference.md
[DeveloperNotes]: DeveloperNotes.md






[vtd]: #virtual-thing-description
[engine]: #virtual-thing-engine-and-engine

[iso]: https://www.w3.org/TR/NOTE-datetime



[node-wot]: https://github.com/eclipse/thingweb.node-wot

[td]: https://www.w3.org/TR/wot-thing-description/

[td_thing]: https://www.w3.org/TR/wot-thing-description/#thing
[td_dataSchema]: https://www.w3.org/TR/wot-thing-description/#dataschema
[td_intaff]: https://www.w3.org/TR/wot-thing-description/#interactionaffordance

[td_property]: https://www.w3.org/TR/wot-thing-description/#propertyaffordance
[td_action]: https://www.w3.org/TR/wot-thing-description/#actionaffordance
[td_event]: https://www.w3.org/TR/wot-thing-description/#eventaffordance