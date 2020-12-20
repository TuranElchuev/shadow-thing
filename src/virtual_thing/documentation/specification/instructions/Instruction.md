# Instruction

An entity that can be `executed` by the [Engine] to perform some operation.

## Schema
Type: `object`
| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|delay|An instruction can be executed with a delay (not immediately).||[Delay]||
|wait|If set to `true`, the [Engine] will wait for completion of current instruction before invoking the next one. This behavior is analogous to "awaiting" an "async" entity, where the "async" entity is the `instruction`.||`boolean`|true|
|readProperty|||[ReadProperty]||
|writeProperty|||[WriteProperty]||
|observeProperty|||[ObserveProperty]||
|unobserveProperty|||[UnobserveProperty]||
|invokeAction|||[InvokeAction]||
|subscribeEvent|||[SubscribeEvent]||
|unsubscribeEvent|||[UnsubscribeEvent]||
|emitEvent|||[EmitEvent]||
|invokeProcess|||[InvokeProcess]||
|move|||[Move]||
|ifelse|||[IfElse]||
|switch|||[Switch]||
|loop|||[Loop]||
|try|||[Try]||
|log|||[Log]||
|info|||[Info]||
|warn|||[Warn]||
|debug|||[Debug]||
|error|||[Error]||
|fake|||[Fake]||
|control|||[Control]||
|comment|A property to use on your own purpose, ignored by the [Engine].||`string` or Array of `string`||





[Engine]: ../Definitions.md#virtual-thing-engine-and-engine

[Delay]: ../helper_components/Delay.md

[ReadProperty]: ReadProperty.md
[WriteProperty]: WriteProperty.md
[ObserveProperty]: ObserveProperty.md
[UnobserveProperty]: UnobserveProperty.md
[InvokeAction]: InvokeAction.md
[SubscribeEvent]: SubscribeEvent.md
[UnsubscribeEvent]: UnsubscribeEvent.md
[EmitEvent]: EmitEvent.md
[InvokeProcess]: InvokeProcess.md
[Move]: Move.md
[IfElse]: IfElse.md
[Switch]: Switch.md
[Loop]: Loop.md
[Try]: Try.md
[Fake]: Fake.md
[Control]: Control.md
[Log]: Console.md#Log
[Info]: Console.md#Info
[Warn]: Console.md#Warn
[Debug]: Console.md#Debug
[Error]: Console.md#Error