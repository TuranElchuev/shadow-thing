import { u, VirtualThingModel } from "../index";

export abstract class Entity {

    private parent: Entity = undefined;
    private name: string = undefined;

    public constructor(name: string, parent: Entity){
        this.parent = parent;
        this.name = name;
    }

    private checkReturnModelNoParent(entity: Entity){
        if(entity instanceof VirtualThingModel){
            return entity;
        }else{
            u.fatal(`Component "${entity.getPath()}" must be either of type`
                        + " VirtualThingModel or have a parent", entity.getPath());
        }
    }

    protected getName(): string {
        return this.name;
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

    public getPath(): string {
        return (this.parent ? this.parent.getPath() : "") +
                (this.name ? "/" + this.name : "");
    }
}

