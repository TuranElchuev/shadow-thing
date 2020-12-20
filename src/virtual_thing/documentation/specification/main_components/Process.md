### Process
A component that can be `executed` by the [Engine] as a sequence of instructions to perform the described behavior.

#### Schema
Type: `object`
| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|triggers|Triggers define when the process should be invoked automatically. Further ways of invoking a process are described in corresponding sections.||Array of [Trigger]||
|condition|A process can execute only if its condition (if any) is met.||[Math]||
|instructions|Instructions that will be executed in a sequence when the process is invoked.|yes|Array of [Instruction]||
|dataMap|See [DataMap].||Map of [DataHolder]||
|wait|If set to `true`, after invokation, the process will wait for the `instructions` block to complete its execution, otherwise it will return right after invoking the `instructions` block. This behavior is analogous to "awaiting" an "async" entity, where the "async" entity is the `instructions` block.||`boolean`|true|
|comment|A property to use on your own purpose, ignored by the [Engine].||`string` or Array of `string`||

**\*** additional properties are not allowed.

[Instruction]: ../instructions/Instruction.md

[Math]: ../helper_components/Math.md
[Trigger]: ../helper_components/Trigger.md

[DataHolder]: DataHolder.md

[Engine]: ../Definitions.md#virtual-thing-engine-and-engine

[DataMap]: ../Architecture.md#DataMap