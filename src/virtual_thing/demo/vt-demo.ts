import { readFileSync } from "fs";
import { join } from "path";

import { Servient, Helpers } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "../index";

const Ajv = require('ajv');



const VTD_PATH = join(__dirname, '..', '..', '..', 'src', 'virtual_thing', 'demo' ,'vt-descr-demo.json');
const TD_VALID_SCH = join(__dirname, '..', '..', '..', 'validation-schemas', 'td-json-schema-validation.json');
const VTD_VALID_SCH = join(__dirname, '..', '..', '..', 'validation-schemas', 'vtd-json-schema-validation.json');

let vtd = JSON.parse(readFileSync(VTD_PATH, "utf-8"));
let tdSchema = JSON.parse(readFileSync(TD_VALID_SCH, "utf-8"));
let vtdSchema = JSON.parse(readFileSync(VTD_VALID_SCH, "utf-8"));

var ajv = new Ajv();
ajv.addSchema(tdSchema, 'td');
ajv.addSchema(vtdSchema, 'vtd');

/*
if(!ajv.validate('td', vtd)){
    console.error("Invalid TD specified: " + ajv.errorsText());
    process.exit();
}
*/

if(!ajv.validate('vtd', vtd)){
    console.error("Invalid VTD specified: " + ajv.errorsText());
    process.exit();
}


let servient = new Servient();
Helpers.setStaticAddress('localhost');
servient.addServer(new HttpServer({port: 8081}));

servient.start().then(thingFactory => {
        new VirtualThing("vt1", vtd, thingFactory).produce().then(vt => vt.expose());
    })    
    .catch(e => console.log(e));