import {
    Loop,
    Process,
    Try,
    VirtualThingModel,
    Behavior,
    u
} from "./index";

/** Base class of all classes which compose a Virtual Thing Model. */
export abstract class Entity {

    private parent: Entity = undefined;
    private name: string = undefined;


    public constructor(name: string, parent: Entity){
        this.setParent(parent);
        this.setName(name);
    }

    public getName(): string {
        return this.name;
    }

    /** Returns the path, which is relative to the parent. */
    public getRelativePath(): string {
        return this.name;
    }

    /**
     * Returns the full path starting from the root.
     */
    public getFullPath(): string {
        return (this.parent ? this.parent.getFullPath() : "") +
                (this.name ? "/" + this.name : "");
    }

    public getParent(): Entity {
        return this.parent;
    }

    /**
     * Returns:
     * - the first instance of 'Loop' on the path
     * towards the root - if such instance exists
     * - undefined - otherwise
     */
    public getParentLoop(): Loop {
        return this.getFirstParentOfType(Loop);
    }

    /**
     * Returns:
     * - the first instance of 'Try' on the path
     * towards the root - if such instance exists
     * - undefined - otherwise
     */
    public getParentTry(): Try {
        return this.getFirstParentOfType(Try);
    }

    /** Returns the first instance of 'Behavior' on the path towards the root. */
    public getBehavior(): Behavior {
        return this.getFirstParentOfType(Behavior);
    }

    /**
     * Returns:
     * - the first (and only possible) instance of 'Process' on the path
     * towards the root - if such instance exists
     * - undefined - otherwise
     */
    public getProcess(): Process {
        return this.getFirstParentOfType(Process);
    }

    /** Returns the root 'Entity' - the instance of 'VirtualThingModel'. */
    public getModel(): VirtualThingModel {
        return this.getFirstParentOfType(VirtualThingModel);
    }
    
    /**
     * Returns:
     * - the first instance of the given type on the path towards
     * the root - if such instance exists
     * - undefined - otherwise
     * 
     * @param type - type (class) of the required entity
     */
    private getFirstParentOfType(type: any) {
        if(u.instanceOf(this, type)){
            return this;
        }else if(this.getParent()){
            return this.getParent().getFirstParentOfType(type);
        }else{
            return undefined;
        }
    }

    public setParent(parent: Entity){
        if(this instanceof VirtualThingModel){
            if(parent != undefined){
                u.fatal("An instance of the VirtualThingModel class must"
                + " be the root of the Entity tree (cannot have a parent).", this.getFullPath());
            }
            return;            
        }else if(!(parent instanceof Entity)){
            u.fatal("The parent must be an instance of the Entity class.", this.getFullPath());
        }else{
            this.parent = parent;
            let node: Entity = this;
            while(node){
                node = node.getParent();
                if(node === this){
                    u.fatal("There can be no loops in the Entity tree", this.getName());
                }
            }            
        }     
    }

    public setName(name: string){
        this.name = name;
    }
}

