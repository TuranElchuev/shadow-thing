# Introduction

The Virtual Thing Description (VTD) is an extension to the [Thing Description][td], that is meant to provide a no-code method to describe behavior (back-end logic) of a [Thing] in order to simulate it. Such a description is composed of various json-based components, which describe respective [operations](#Operations]) performed in a certain order, at certain times, based on some conditions, etc. Together, those components describe how a [Thing] should behave, i.e. how to handle interactions, simulate sensor values, actuator states, etc. To instantiate a simulated [Thing], the [Engine] parses its VTD, instantiates (exposes) a [Thing], and performs the [operations](#operations) (handles interactions, simulates values, etc.) according to the VTD.

### Operations
One of the aims of the Virtual Thing Description is to provide a behavior description syntax (VTD schema/syntax), which is compact and expressive, but yet powerful enough to be able to describe diverse functionality that a simulated device might offer. In Virtual Thing, each operation that the [Engine] can interpet and execute has a respective json schema to describe it in a VTD. Since the domain of all possible distinct operations that make up behavior of an arbitrary device can be very large, for each such operation, defining its counterpart in the VTD schema (respectively, implementing in the [Engine]) is unreasonable. As such, to reach a compromise between compactness and the ability to describe arbitrary behavior, the VTD syntax offers the following two main types of operations:
- `Special` - with compact description, are able to execute a complex, but dedicated, operation, e.g. invoke an [ActionAffordance] of a [ConsumedThing] passing an input payload, and store the returned result.
- `General` - some basic control flow and assignment statements borrowed from programming languages, e.g. "if-else", "loop", "try-catch", "switch", etc. Such operations, when used extensively, may lead to a bulky VTD. However, they allow to describe a custom complex behavior when needed.

In general, VTD follows a, so to say, "scripting paradigm", i.e. operations are described in a form of a script, that is interpreted and executed by the [Engine].



 





[COnsumedThing]: https://www.w3.org/TR/wot-scripting-api/#the-consumedthing-interface


[ActionAffordance]: https://www.w3.org/TR/wot-thing-description/#actionaffordance
[Engine]: Definitions.md#Virtual-Thing-Engine-and-Engine
[td]: https://www.w3.org/TR/wot-thing-description
[Thing]: https://www.w3.org/TR/wot-thing-description/#thing