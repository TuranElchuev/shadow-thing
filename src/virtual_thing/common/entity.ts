import { u } from "../index";

export abstract class HasGlobalPath {

    private globalPath: string = undefined;

    public constructor(globalPath: string){
        this.globalPath = globalPath;
        u.debug("", this.getGlobalPath());        
    }

    public getGlobalPath(): string{
        return this.globalPath;
    }
}

