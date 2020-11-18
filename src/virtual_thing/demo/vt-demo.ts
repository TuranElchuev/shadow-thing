import { readFileSync } from "fs";
import { join } from "path";

import { Servient, Helpers } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "./tmp_virtual_thing";

const VTD_PATH = join(__dirname, "..", "tmp_confs", "new_approach_device.json");
let VTD_string: string = readFileSync(VTD_PATH, "utf-8");

let servient = new Servient();
Helpers.setStaticAddress('localhost');
servient.addServer(new HttpServer({port: 8081}));

servient.start()
    .then(thingFactory => {
        new VirtualThing(thingFactory, VTD_string)
            .produce().then(VT => VT.expose());
    })    
    .catch(e => console.log(e));