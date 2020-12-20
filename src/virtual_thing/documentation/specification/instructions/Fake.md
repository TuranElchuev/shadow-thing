# Fake
Is type of [Instruction] that is used to write a randomly generated value to a [writable][access] instance of [DataHolder] in compliance with its schema.

## Schema
Type: [Pointer] - apointer to a [DataHolder] that should be "faked".

## Behavior
- The purpose of the `Fake` instruction is not the same as that of the `fake` property of [DataHolder]. The latter makes a [DataHolder] instance [read only][access] and generates a fake value on each read operation. Whereas a `Fake` instruction is used in any other case when a fake value should be written into a [writable][access] data.

- Applying on a [read only][access] data will cause a [model failure][failure].




[Instruction]: Instruction.md

[failure]: ../main_components/VirtualThingModel.md#failure

[DataHolder]: ../main_components/DataHolder.md
[access]: ../main_components/DataHolder.md#Reset-value-and-access-rights

[Pointer]: ../helper_components/Pointer.md