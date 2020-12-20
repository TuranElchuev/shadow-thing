# Action
Is [ActionAffordance][td_action] complemented by Virtual Thing-related functionality.

## Schema
Extends [ActionAffordance][td_action] with the following differences:
- the overriden properties are: `uriVariables`, `input` and `output`
- there are additional properties.

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|uriVariables|See [InteractionAffordance][td_intaff].||Map of [DataHolder].||
|input|See [ActionAffordance][td_action].||[DataHolder]||
|output|See [ActionAffordance][td_action].||[DataHolder]||
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder] | |
| processes | See [Processes](#processes). | | Map of [Process] | |

## Behavioral Notes
- For the specified `input` and `output` properties of each `Action` instance, the [Engine][engine] will create respectively an `input-buffer` and an `output-buffer` that can be accessed by any [Process] in the [Virtual Thing Description][vtd] any time.

- For each entry in `uriVariables`, the [Engine][engine] will create a  corresponding `uriVar-buffer` that can be accessed by any [Process] in the [Virtual Thing Description][vtd] any time.

### `invokeAction` handling
1. All `uriVar-buffers` are [reset].
2. The incoming uri variables are written into their corresponding `uriVar-buffers`. If any uri variable does not comply with the schema, an error occurs.
3. If an `input-buffer` exists:
    - The `input-buffer` is [reset].
    - The incoming payload (if any) is written into the `input-buffer`. If the payload does not comply with the schema, an error occurs.
4. The attached [triggers](#trigger) and teh [implicitly attached processes](#implicitly-attached-processes) are invoked `sequentially` and `awaited`.
5. If an `output-buffer` exists, its content is returned as the response payload.

If at any step an error occurs, it is printed and the handler returns nothing.

### Implicitly attached processes
If a `Process` in the `processes` of an `Action` has **no explicitly defined** `triggers`, it will be invoked automatically on each `invokeAction` event.




[td_action]: https://www.w3.org/TR/wot-thing-description/#actionaffordance

[DataHolder]: ../main_components/DataHolder.md
[Process]: ../main_components/Process.md

[reset]: ../main_components/DataHolder.md#reset-value-and-access-rights