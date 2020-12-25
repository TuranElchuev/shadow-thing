# Virtual Thing
Virtual Thing is a `simulation engine` for [Things][thing]. It can instantiate simulated Things based on their [Virtual Thing Descriptions][vtd] - the [Thing Descriptions][td] complemented by descriptions of the respective devices' "behaviors", which are interpreted and executed by the simulation engine.

## Build
Is built as part of the `Shadow Thing`.

## Run
Is embedded into the `Shadow Thing`. Can, however, be used as a standalone application by means of the built-in [CLI][cli].

[td]: https://www.w3.org/TR/wot-thing-description/
[vtd]: documentation/specification/index.md
[cli]: documentation/cli.md
[thing]: https://www.w3.org/TR/wot-thing-description/#thing