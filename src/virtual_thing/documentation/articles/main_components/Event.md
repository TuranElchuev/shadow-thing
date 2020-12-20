# Event
Is [EventAffordance][td_event] complemented by Virtual Thing-related functionality.

## Schema
Extends [EventAffordance][td_event] with the following differences:
- the overriden properties are: `uriVariables`, `data`, `subscription` and `cancellation`
- there are additional properties.

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|uriVariables|See [InteractionAffordance][td_intaff].||Map of [DataHolder](#dataholder).||
|data|See [EventAffordance][td_event].||[DataHolder](#dataholder)||
|subscription|See [EventAffordance][td_event].||[DataHolder](#dataholder)||
|cancellation|See [EventAffordance][td_event].||[DataHolder](#dataholder)||
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |

## Behavioral Notes
- For the specified `data`, `subscription` and `cancellation` properties of each `Event` instance, the [Engine][engine] will create respectively a `data-buffer`, a `subscription-buffer` and a `cancellation-buffer` that can be accessed by any [Process](#process) in the [Virtual Thing Description][vtd] any time.

- For each entry in `uriVariables`, the [Engine][engine] will create a corresponding `uriVar-buffer` that can be accessed by any [Process](#process) in the [Virtual Thing Description][vtd] any time.

### `Emit event` handling
After an event is emitted by the instruction [emitEvent](#emitevent), the attached [triggers](#trigger) and processes are invoked `sequentially` and `awaited`.

### `subscribeEvent` handling
1. All `uriVar-buffers` are [reset](#Initialize/reset-value-and-access-rights).
2. The incoming uri variables are written into their corresponding `uriVar-buffers`. If any uri variable does not comply with the schema, an error occurs.
3. If a `subscription-buffer` exists:
    - The `subscription-buffer` is [reset](#Initialize/reset-value-and-access-rights).
    - The incoming payload (if any) is written into the `subscription-buffer`. If the payload does not comply with the schema, an error occurs.
4. The attached [triggers](#trigger) and the `implicitly attached processes` are invoked `sequentially` and `awaited`.

If at any step an error occurs, it is printed and the handler returns.

### `unsubscribeEvent` handling
1. All `uriVar-buffers` are [reset](#Initialize/reset-value-and-access-rights).
2. The incoming uri variables are written into their corresponding `uriVar-buffers`. If any uri variable does not comply with the schema, an error occurs.
3. If a `cancellation-buffer` exists:
    - The `cancellation-buffer` is [reset](#Initialize/reset-value-and-access-rights).
    - The incoming payload (if any) is written into the `cancellation-buffer`. If the payload does not comply with the schema, an error occurs.
4. The attached [triggers](#trigger) and the [implicitly attached processes](#implicitly-attached-processes) are invoked `sequentially` and `awaited`.
    
If at any step an error occurs, it is printed and the handler returns.

> **Remark**: the `subscribeEvent` and `unsubscribeEvent` at the time of writing of this document are not yet implemented in [node-wot]. The corresponding behavior described above is implemented only in Virtual Thing, and needs to be attached to corresponding handlers in [node-wot] when they are implemented.

### Implicitly attached processes  
If a `Process` in the `processes` of an `Event` has **no explicitly defined** `triggers`, it will be invoked automatically on certain interaction events depending on the name of the process:  

|Process name|Interaction event that will invoke the process|
|------------|:---------------:|
|"subscribe"|`subscribeEvent`|
|"unsubscribe"|`unsubscribeEvent`|
|any other name|`emitEvent`|