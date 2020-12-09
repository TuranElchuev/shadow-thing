import { readFileSync } from "fs";
import { join } from "path";

import { Servient, Helpers } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "./common/index";

let path = join(__dirname, 'examples', 'test.json');
let port = 8081;

if(process.argv.length > 2){
    path = process.argv[2];
}
if(process.argv.length > 3){
    port = Number.parseInt(process.argv[3]);
}

let servient = new Servient();
Helpers.setStaticAddress('localhost');

servient.addServer(new HttpServer({port: port}));

try{
    let vtd = JSON.parse(readFileSync(path, "utf-8"));
    servient.start().then(tf => {
        new VirtualThing(vtd, tf)
                .produce()
                .then(vt => vt.expose());
        });        
}catch(err){
    console.log(err);
}




