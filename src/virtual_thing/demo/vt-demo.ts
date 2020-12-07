import { readFileSync } from "fs";
import { join } from "path";

import { Servient, Helpers } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "../index";


const TD_VALID_SCH = join(__dirname, '..', '..', '..', 'validation-schemas', 'td-json-schema-validation.json');
const VTD_VALID_SCH = join(__dirname, '..', '..', '..', 'validation-schemas', 'vtd-json-schema-validation.json');

var tdSchema = JSON.parse(readFileSync(TD_VALID_SCH, "utf-8"));
var vtdSchema = JSON.parse(readFileSync(VTD_VALID_SCH, "utf-8"));

function create(tf: WoT.WoT, vtdFile: string, name: string = undefined){

        const VTD_PATH = join(__dirname, '..', '..', '..', 'src', 'virtual_thing', 'demo', vtdFile);
        let vtd = JSON.parse(readFileSync(VTD_PATH, "utf-8"));

        new VirtualThing(name, vtd, tf, tdSchema, vtdSchema).produce()
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
                //create(tf, 'test.json');
        })    
        .catch(e => console.error(e.message));




