import {
    VirtualThingModel,
    Process,
    Loop
} from "../index";

export abstract class Entity {

    private parent: Entity = undefined;
    private relativePath: string = undefined;

    private model: VirtualThingModel = null;
    private process: Process = null;
    private parentLoop: Loop = null;

    public constructor(relativePath: string, parent: Entity){
        this.parent = parent;
        this.relativePath = relativePath;
    }

    protected getName(): string {
        let lastSlashIndex = this.getRelativePath().lastIndexOf("/");
        if(lastSlashIndex > -1){
            return this.getRelativePath().substring(lastSlashIndex + 1);
        }else{
            return this.getRelativePath();
        }
    }

    protected getRelativePath(): string {
        return this.relativePath;
    }

    public getFullPath(): string {
        return (this.parent ? this.parent.getFullPath() : "") +
                (this.relativePath ? "/" + this.relativePath : "");
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

    public getParent(): Entity {
        return this.parent;
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

