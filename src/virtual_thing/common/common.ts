import { u, VirtualThingModel } from "../index";

export abstract class Entity {

    private parent: Entity = undefined;
    private relPath: string = undefined;

    public constructor(relativePath: string, parent: Entity){
        this.parent = parent;
        this.relPath = relativePath;
    }

    private checkReturnModelNoParent(entity: Entity){
        if(entity instanceof VirtualThingModel){
            return entity;
        }else{
            u.fatal(`Component "${entity.getFullPath()}" must be either of type`
                        + " VirtualThingModel or have a parent", entity.getFullPath());
        }
    }

    protected getRelPath(): string {
        return this.relPath;
    }

    protected getName(): string {
        let lastSlashIndex = this.getRelPath().lastIndexOf("/");
        if(lastSlashIndex > -1){
            return this.getRelPath().substring(lastSlashIndex + 1);
        }else{
            return this.getRelPath();
        }
    }

    protected getParent(): Entity {
        return this.parent;
    }

    public getModel() : VirtualThingModel {
        let root = this.getParent();
        if(!root){
            return this.checkReturnModelNoParent(this);
        }
        while(root.getParent()){
            root = root.getParent();
        }
        return this.checkReturnModelNoParent(root);
    }

    public getFullPath(): string {
        return (this.parent ? this.parent.getFullPath() : "") +
                (this.relPath ? "/" + this.relPath : "");
    }
}

