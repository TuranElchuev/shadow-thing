# Property
Is [PropertyAffordance][td_property] complemented by Virtual Thing-related functionality.

## Schema
Extends [InteractionAffordance][td_intaff] and [DataHolder](#dataholder) with the following differences:
- the overriden property is: `uriVariables`
- there are additional properties.

| Property | Description | Mandatory | Type | Default |
|----------|-------------|:---------:|------|:-------:|
|uriVariables|See [InteractionAffordance][td_intaff].||Map of [DataHolder](#dataholder).||
| dataMap | See [DataMap](#datamap). | | Map of [DataHolder](#dataholder) | |
| processes | See [Processes](#processes). | | Map of [Process](#process) | |

## Behavioral Notes
- For each `Property` instance, the [Engine][engine] will create a `property-buffer` - an instance of [DataHolder](#dataholder) that can be accessed by any [Process](#process) in the [Virtual Thing Description][vtd] any time.

- For each entry in `uriVariables`, the [Engine][engine] will create a corresponding `uriVar-buffer` that can be accessed by any [Process](#process) in the [Virtual Thing Description][vtd] any time.

### `readProperty` handling
1. All `uriVar-buffers` are [reset](#Initialize/reset-value-and-access-rights).
2. The incoming uri variables are written into their corresponding `uriVar-buffers`. If any uri variable does not comply with the schema, an error occurs.
3. The attached [triggers](#trigger) and processes are invoked `sequentially` and `awaited`.
4. The content of the `property-buffer` is returned as the response payload.

If at any step an error occurs, it is printed and the handler returns nothing.

### `writeProperty` handling
1. All `uriVar-buffers` are [reset](#Initialize/reset-value-and-access-rights).
2. The incoming uri variables are written into their corresponding `uriVar-buffers`. If any uri variable does not comply with the schema, an error occurs.
3. The `property-buffer` is [reset](#Initialize/reset-value-and-access-rights).
4. The incoming payload (if any) is written into the `property-buffer`. If the payload does not comply with the schema, or the `property-buffer` is [RO](#Initialize/reset-value-and-access-rights), an error occurs.
5. The attached [triggers](#trigger) and the [implicitly attached processes](#implicitly-attached-processes) are invoked `sequentially` and `awaited`.

If at any step an error occurs, it is printed and the handler returns.

### Implicitly attached processes
If a `Process` in the `processes` of a `Property` has **no explicitly defined** `triggers`, it will be attached to certain interaction events depending on the name of the process:  

|Process name|Interaction event that will invoke the process|
|------------|:---------------:|
|"read"|`readProperty`|
|"write"|`writeProperty`|
|any other name|`readProperty` and `writeProperty`|

[td_property]: https://www.w3.org/TR/wot-thing-description/#propertyaffordance