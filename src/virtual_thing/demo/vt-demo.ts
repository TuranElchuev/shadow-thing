import { readFileSync } from "fs";
import { join } from "path";

//import { Servient, Helpers } from "@node-wot/core";
//import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "../index";


const VTD_PATH = join(__dirname, '..', '..', '..', 'src', 'virtual_thing', 'demo' ,'vt-descr-demo.json');

let VTD_string: string = readFileSync(VTD_PATH, "utf-8");

new VirtualThing("vt_instance_1", VTD_string, undefined).test();

/*
let servient = new Servient();
Helpers.setStaticAddress('localhost');
servient.addServer(new HttpServer({port: 8081}));

servient.start()
    .then(thingFactory => {
        new VirtualThing(thingFactory, VTD_string, "vt_instance_1")
            .produce().then(VT => VT.expose());
    })    
    .catch(e => console.log(e));*/