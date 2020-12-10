import {
    VirtualThingModel,
    Behavior,
    Process,
    Loop,
    Try
} from "./index";

export abstract class Entity {

    private parent: Entity = undefined;
    private name: string = undefined;

    private model: VirtualThingModel = null;
    private process: Process = null;
    private behavior: Behavior = null;
    private parentLoop: Loop = null;
    private parentTry: Try = null;

    public constructor(name: string, parent: Entity){
        this.parent = parent;
        this.name = name;
    }

    protected getName(): string {
        return this.name;
    }

    protected getRelativePath(): string {
        return this.name;
    }

    public getFullPath(): string {
        return (this.parent ? this.parent.getFullPath() : "") +
                (this.name ? "/" + this.name : "");
    }

    public getParent(): Entity {
        return this.parent;
    }

    protected getParentLoop(): Loop {
        if(this.parentLoop === null){
            if(this instanceof Loop){
                this.parentLoop = this;
            }else if(this.getParent()){
                this.parentLoop = this.getParent().getParentLoop();
            }else{
                this.parentLoop = undefined;
            }
        }
        return this.parentLoop;
    }

    public getBehavior(): Behavior {
        if(this.behavior === null){
            if(this instanceof Behavior){
                this.behavior = this;
            }else if(this.getParent()){
                this.behavior = this.getParent().getBehavior();
            }else{
                this.behavior = undefined;
            }
        }
        return this.behavior;
    }

    protected getParentTry(): Try {
        if(this.parentTry === null){
            if(this instanceof Try){
                this.parentTry = this;
            }else if(this.getParent()){
                this.parentTry = this.getParent().getParentTry();
            }else{
                this.parentTry = undefined;
            }
        }
        return this.parentTry;
    }

    public getProcess(): Process {
        if(this.process === null){
            if(this instanceof Process){
                this.process = this;
            }else if(this.getParent()){
                this.process = this.getParent().getProcess();
            }else{
                this.process = undefined;
            }
        }
        return this.process;
    }

    public getModel(): VirtualThingModel {
        if(this.model === null){
            if(this instanceof VirtualThingModel){
                this.model = this;
            }else if(this.getParent()){
                this.model = this.getParent().getModel();
            }else{
                this.model = undefined;
            }
        }
        return this.model;
    }
}

