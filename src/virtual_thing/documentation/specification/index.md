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



[Introduction]: specification/Introduction.md
[Definitions]: specification/Definitions.md
[Architecture]: specification/Architecture.md
[VirtualThingModel]: specification/main_components/VirtualThingModel.md
[DataHolder]: specification/main_components/DataHolder.md
[Process]: specification/main_components/Process.md
[Property]: specification/main_components/Property.md
[Action]: specification/main_components/Action.md
[Event]: specification/main_components/Event.md
[Sensor]: specification/main_components/Sensor.md
[Actuator]: specification/main_components/Actuator.md
[Instruction]: specification/instructions/Instruction.md
[Empty]: specification/instructions/Empty.md
[Fake]: specification/instructions/Fake.md
[Control]: specification/instructions/Control.md
[Move]: specification/instructions/Move.md
[Ifelse]: specification/instructions/Ifelse.md
[Switch]: specification/instructions/Switch.md
[Try]: specification/instructions/Try.md
[Loop]: specification/instructions/Loop.md
[ReadProperty]: specification/instructions/ReadProperty.md
[WriteProperty]: specification/instructions/WriteProperty.md
[ObserveProperty]: specification/instructions/ObserveProperty.md
[UnobserveProperty]: specification/instructions/UnobserveProperty.md
[InvokeAction]: specification/instructions/InvokeAction.md
[EmitEvent]: specification/instructions/EmitEvent.md
[SubscribeEvent]: specification/instructions/SubscribeEvent.md
[UnsubscribeEvent]: specification/instructions/UnsubscribeEvent.md
[InvokeProcess]: specification/instructions/InvokeProcess.md
[Log]: specification/instructions/Console#Log
[Info]: specification/instructions/Console.md#Info
[Warn]: specification/instructions/Console.md#Warn
[Debug]: specification/instructions/Console.md#Debug
[Error]: specification/instructions/Console.md#Error
[CompoundData]: specification/helper_components/CompoundData.md
[DateTime]: specification/helper_components/DateTime.md
[Delay]: specification/helper_components/Delay.md
[File]: specification/helper_components/File.md
[Interval]: specification/helper_components/Interval.md
[Math]: specification/helper_components/Math.md
[Pointer]: specification/helper_components/Pointer.md
[ParameterizedString]: specification/helper_components/ParameterizedString.md
[Trigger]: specification/helper_components/Trigger.md
[ValueSource]: specification/helper_components/ValueSource.md
[ValueTarget]: specification/helper_components/ValueTarget.md
[ConsoleMessagesReference]: specification/ConsoleMessagesReference.md
[DeveloperNotes]: specification/DeveloperNotes.md






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