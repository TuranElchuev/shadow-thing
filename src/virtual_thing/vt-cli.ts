import { readFileSync } from "fs";
import { join } from "path";

import { Servient, Helpers } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";

import { VirtualThing } from "./common/index";

let port = 8081;

let paths = [];
if(process.argv.length > 2){
    for(let i = 2; i < process.argv.length; i++){
        paths.push(process.argv[i]);
    }
}else{
    paths.push(join(__dirname, 'examples', 'test.json'));
}

let servient = new Servient();
Helpers.setStaticAddress('localhost');

servient.addServer(new HttpServer({port: port}));

try{    
    servient.start().then(tf => {
        for(let path of paths){
            let vtd = JSON.parse(readFileSync(path, "utf-8"));
            new VirtualThing(vtd, tf)
                    .produce()
                    .then(vt => vt.expose())
                    .catch(err => console.log(err));
            }
        });               
}catch(err){
    console.log(err);
}




