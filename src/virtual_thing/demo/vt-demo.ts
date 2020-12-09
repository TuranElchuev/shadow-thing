import { readFileSync } from "fs";
import { join } from "path";

import { Servient, Helpers } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "../common/index";


function create(tf: WoT.WoT, vtdFile: string){

        const VTD_PATH = join(__dirname, '..', '..', '..', 'src', 'virtual_thing', 'demo', vtdFile);
        let vtd = JSON.parse(readFileSync(VTD_PATH, "utf-8"));

        new VirtualThing(vtd, tf).produce()
                .then(vt => vt.expose())
                .catch(e => console.error(e));
}

let servient = new Servient();
Helpers.setStaticAddress('localhost');
servient.addServer(new HttpServer({port: 8081}));

servient.start().then(tf => {
                create(tf, 'temperature.json');
                create(tf, 'calculator.json');
                create(tf, 'interval.json');
                create(tf, 'consumer.json');
                create(tf, 'test.json');
        })    
        .catch(e => console.error(e.message));




