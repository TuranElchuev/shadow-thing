# ParameterizedString
A string or array of strings, which can contain dynamic parameter.

## Schema
Type: `string` or Array of `string`


## Behavior

### Parameter resolution
Value of a `ParameterizedString` (a string or an array of strings) will be joined by simple concatenation into a **`single string`**.  

The `single string` ***may*** contain dynamic parameters of the form `${<pointer path>}` where the `<pointer path>` is a valid [Pointer] expression. Parameters may have nested parameters at any nesting level.  

On each read of the value of a `ParameterizedString` by the [Engine], the parameters (if any) will be resolved iteratively in a `bottom-up` manner, i.e. the parameters at the lowest nesting level will be resolved first. Resolving means a parameter will be replaced by the `stringified representations` of the value obtained using the respective [Pointer] expression. After resolution, a resolved string is returned to the [Engine].

### Parameter formatting
As was mentioned in [Parameter resolution](#Parameter-resolution), each parameter will be replaced by the `stringified representations` of its respective value.  

The `stringified representations` can be formatted "prettily":
- `$p{<pointer path>}` - note `p` after `$`  
This will format the `stringified representations` using indentation level of `2`.
- you can specify a custom indentation by appending a digit `[1-9]` to `p`:  
    `$p4{<pointer path>}` - this will use indentaion `4`.


## Examples

Let's consider a `ParameterizedString`:

```JSON
[
    "This is a long parameterized st",
    "ring ${/path/to/array",
    "/${path/to/index}}."
]
```
1. An instance of `ParameterizedString` created from the above value will have the following value:

    ```JSON
    "This is a long parameterized string ${/path/to/array/${path/to/index}}."
    ```
2. Whenever the value is read by the [Engine], the following will happen:
    1. The deedeps parameter `${path/to/index}` will be resolved.  
    Let's assume a [Pointer] with the path `"path/to/index"` in our [Virtual Thing Description][vtd] returns a value `5`. Then the new value of the `ParameterizedString` will become:

        ```JSON
        "This is a long parameterized string ${/path/to/array/5}."
        ```
    2. Again, the deepest parameter, this time `${/path/to/array/5}`, will be resolved let's assume to a value `"example"`. Then the new value will become:

        ```JSON
        "This is a long parameterized string example."
        ```
    3. Since there are no parameters left, the value will be returned.

[Pointer]: Pointer.md
[Engine]: ../Definitions.md#virtual-thing-engine-and-engine
[vtd]: ../Definitions.md#Virtual-Thing-Description