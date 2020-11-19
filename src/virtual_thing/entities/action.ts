import {
    EntityFactory,
    EntityOwner,
    EntityType,
    Data,
    Process,
    Pointer
} from "../index";


export class Action extends EntityOwner {

    private dataMap: Map<string, Data> = new Map();
    private processes: Map<string, Process> = new Map();

    private processBinding: Pointer = undefined;

    private uriVariables: Map<string, Data> = undefined;
    private input: Data = undefined;
    private output: Data = undefined;

    private outputPointer: Pointer = undefined;

    public constructor(name: string, jsonObj: any, parent: EntityOwner){
        super(EntityType.Action, name, parent);

        if(jsonObj?.processBinding != undefined)
            this.processBinding = new Pointer(jsonObj.processBinding, this.getModel());

        if(jsonObj.dataMap != undefined)
            this.dataMap = EntityFactory.parseEntityMap(jsonObj?.dataMap, EntityType.Data, this) as Map<string, Data>;
        
        if(jsonObj?.processes != undefined)
            this.processes = EntityFactory.parseEntityMap(jsonObj?.processes, EntityType.Process, this) as Map<string, Process>;
            
        if(jsonObj?.uriVariables != undefined)
            this.uriVariables = EntityFactory.parseEntityMap(jsonObj.uriVariables, EntityType.UriVariable, this) as Map<string, Data>;

        if(jsonObj?.input != undefined)
            this.input = EntityFactory.makeEntity(EntityType.Input, "input", jsonObj.input, this) as Data;

        if(jsonObj?.output != undefined){
            this.output = EntityFactory.makeEntity(EntityType.Output, "output", jsonObj.output, this) as Data;
            this.outputPointer = new Pointer(this.output.getPath(), this.getModel());
        }            
    }

    public getChildEntity(container: string, name: string): any {
        let entity = undefined;
        switch(container){
            case "proc":
                entity = this.processes?.get(name);
                break;
            case "dmap":
                entity = this.dataMap?.get(name);
                break;
            case "i":
                entity = this.input;
                break;
            case "o":
                entity = this.output;
                break;
            case "uv":
                entity = this.uriVariables?.get(name);
                break;
            default:
                throw new Error(`Unknown entity type: ${container}`); // TODO                    
        }
        if(entity == undefined){
            throw new Error(`Entity does not exist: /${container}/${name}`); // TODO                    
        }
        return entity;
    }

    public async invoke(uriVars: object, input: any) {

        if(uriVars != undefined && this.uriVariables != undefined){            
            for (const [key, value] of Object.entries(uriVars)){
                let uriVar = this.uriVariables.get(key);
                if(uriVar != undefined){
                    uriVar.write("/", value);
                }
            }
        }

        if(input != undefined && this.input != undefined){
            this.input.write("/", input);
        }

        if(this.processBinding != undefined){
            let process = this.processBinding.get();
            if(process instanceof Process){
                await process.invoke(this.input, this.outputPointer);
            }else{
                throw new Error(`Property "processBinding" must point to a process.`); // TODO
            }
        }
        
        if(this.processes != undefined){
            // TODO invoke processes that are invoked by "invoke" trigger
        }

        return this.output?.read();
    }
}