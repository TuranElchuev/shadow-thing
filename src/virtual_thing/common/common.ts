import { u, VirtualThingModel } from "../index";

export abstract class Entity {

    private parent: Entity = undefined;
    private name: string = undefined;

    public constructor(name: string, parent: Entity){
        this.parent = parent;
        this.name = name;
        if(u.DEBUG){
            u.debug("", this.getPath());
        }
    }

    private checkReturnModelNoParent(entity: Entity){
        if(entity instanceof VirtualThingModel){
            return entity;
        }else{
            u.fatal(`Component "${entity.getPath()}" must be either of type`
                        + " VirtualThingModel or have a parent", entity.getPath());
        }
    }

    protected getPath(): string {
        return (this.parent ? this.parent.getPath() : "") +
                (this.name ? "/" + this.name : "");
    }

    protected getName(): string {
        return this.name;
    }

    protected getParent(): Entity {
        return this.parent;
    }

    protected getModel() : VirtualThingModel {
        let root = this.getParent();
        if(!root){
            return this.checkReturnModelNoParent(this);
        }
        while(root.getParent()){
            root = root.getParent();
        }
        return this.checkReturnModelNoParent(root);
    }
}

