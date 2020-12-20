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



[Introduction]: articles/Introduction.md
[Definitions]: articles/Definitions.md
[Architecture]: articles/Architecture.md
[VirtualThingModel]: articles/main_components/VirtualThingModel.md
[DataHolder]: articles/main_components/DataHolder.md
[Process]: articles/main_components/Process.md
[Property]: articles/main_components/Property.md
[Action]: articles/main_components/Action.md
[Event]: articles/main_components/Event.md
[Sensor]: articles/main_components/Sensor.md
[Actuator]: articles/main_components/Actuator.md
[Instruction]: articles/instructions/Instruction.md
[Empty]: articles/instructions/Empty.md
[Fake]: articles/instructions/Fake.md
[Control]: articles/instructions/Control.md
[Move]: articles/instructions/Move.md
[Ifelse]: articles/instructions/Ifelse.md
[Switch]: articles/instructions/Switch.md
[Try]: articles/instructions/Try.md
[Loop]: articles/instructions/Loop.md
[ReadProperty]: articles/instructions/ReadProperty.md
[WriteProperty]: articles/instructions/WriteProperty.md
[ObserveProperty]: articles/instructions/ObserveProperty.md
[UnobserveProperty]: articles/instructions/UnobserveProperty.md
[InvokeAction]: articles/instructions/InvokeAction.md
[EmitEvent]: articles/instructions/EmitEvent.md
[SubscribeEvent]: articles/instructions/SubscribeEvent.md
[UnsubscribeEvent]: articles/instructions/UnsubscribeEvent.md
[InvokeProcess]: articles/instructions/InvokeProcess.md
[Log]: articles/instructions/Console#Log
[Info]: articles/instructions/Console.md#Info
[Warn]: articles/instructions/Console.md#Warn
[Debug]: articles/instructions/Console.md#Debug
[Error]: articles/instructions/Console.md#Error
[CompoundData]: articles/helper_components/CompoundData.md
[DateTime]: articles/helper_components/DateTime.md
[Delay]: articles/helper_components/Delay.md
[File]: articles/helper_components/File.md
[Interval]: articles/helper_components/Interval.md
[Math]: articles/helper_components/Math.md
[Pointer]: articles/helper_components/Pointer.md
[ParameterizedString]: articles/helper_components/ParameterizedString.md
[Trigger]: articles/helper_components/Trigger.md
[ValueSource]: articles/helper_components/ValueSource.md
[ValueTarget]: articles/helper_components/ValueTarget.md
[ConsoleMessagesReference]: articles/ConsoleMessagesReference.md
[DeveloperNotes]: articles/DeveloperNotes.md






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