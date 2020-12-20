# Process
A component that can be `executed` by the [Engine] as a sequence of instructions to perform the described behavior.

## Schema
Type: `object`
| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|triggers|Triggers define when the process should be invoked.||Array of [Trigger]||
|condition|A process can execute only if its condition (if any) is met.||[Math]||
|instructions|Instructions that will be executed in a sequence when the process is invoked.|yes|Array of [Instruction]||
|dataMap|See [DataMap].||Map of [DataHolder]||
|wait|If set to `true`, after invokation, the process will wait for the `instructions` block to complete its execution, otherwise it will return right after invoking the `instructions` block. This behavior is analogous to "awaiting" an "async" entity, where the "async" entity is the `instructions` block.||`boolean`|true|
|comment|A property to use on your own purpose, ignored by the [Engine].||`string` or Array of `string`||

**\*** additional properties are not allowed.

## Behavior
A `Process` can be invoked using the following methods:
1. `triggers`
2. [Instruction] of type [invokeProcess]
3. See `Implicitly attached processes` of [Property], [Action] or [Event]

The method `2.` can be used at the same time with either of the methods `1.` and `3.`. The methods `1.` and `3.` are mutually exclusive.

[Instruction]: ../instructions/Instruction.md
[InvokeProcess]: ../instructions/InvokeProcess.md

[Math]: ../helper_components/Math.md
[Trigger]: ../helper_components/Trigger.md

[Property]: Property.md
[Action]: Action.md
[Event]: Event.md
[DataHolder]: DataHolder.md

[Engine]: ../Definitions.md#virtual-thing-engine-and-engine

[DataMap]: ../Architecture.md#DataMap