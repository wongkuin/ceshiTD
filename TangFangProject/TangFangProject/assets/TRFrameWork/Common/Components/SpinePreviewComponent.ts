/*
 * @Descripttion: spine 的封装 主要支持能在ide中自动播放
 * @version: 1.0.0
 * @Author: YeeChan
 * @Date: 2020-09-14 13:52:50
 */

const { ccclass, property, menu, executeInEditMode, playOnFocus } = cc._decorator;
@ccclass
@executeInEditMode
@playOnFocus
@menu('Skeleton/SpinePreviewComponent')
export class SpinePreviewComponent extends sp.Skeleton {

    private currentAnim: string;

    @property()
    private _isEditorPlay_csryw: boolean = true;
    @property({ tooltip: "编辑器中自动播放动作\n勾选状态，在选中节点时，帧率60，否则只有必要时才重绘\n非勾选，不自动播放", type: cc.Boolean })
    set isEditorPlay(val: boolean) {
        this._isEditorPlay_csryw = val;
        if (this._isEditorPlay_csryw) {
            let data = this["_skeleton"]["data"];
            let events = data["events"];
            let eventsName = this["_N$skeletonData"]["_name"] + "事件集合："
            let eventsInfo = "["
            for (let index = 0; index < events.length; index++) {
                let name = events[index].name;
                let stringValue = events[index].stringValue;
                if (stringValue == "") {
                    stringValue = "\"\""
                }
                if (index != 0) {
                    eventsInfo = eventsInfo + ","
                }
                eventsInfo = eventsInfo + name + ":" + stringValue
            }
            eventsInfo = eventsInfo + "]"

            Editor.info(eventsName + eventsInfo)

            if (CC_EDITOR && this.currentAnim)
            {
                this.setAnimation(0, this.currentAnim, this.loop);
            }
        }
    }
    get isEditorPlay() { return this._isEditorPlay_csryw; }

    @property()
    private _isEditoAttach_csryw: boolean = false;
    @property({ tooltip: "编辑器中生成挂点\n勾选状态，生成挂点 ATTACHED_NODE_TREE\n非勾选，不做操作", type: cc.Boolean })
    set isEditorAttach(val: boolean) {
        this._isEditoAttach_csryw = val;
        if (this._isEditoAttach_csryw) {
            this["attachUtil"].generateAllAttachedNodes()
        }
    }
    get isEditorAttach() { return this._isEditoAttach_csryw; }
    
    /**
     * 重写update 修改编辑器模式
     * @param dt 
     */
    protected update(dt: number): void {
        if (CC_EDITOR) {
            if (this.isEditorPlay) {
                CC_EDITOR = false;
                super.update(dt);
                CC_EDITOR = true;
                //cc.log("", this.getCurrent(0).trackTime);
                this.currentAnim = this.getCurrent(0)?.animation?.name;
            }
        } else {
            super.update(dt);
        }
    }


    /**
     * 打印spine信息
     */
    public dumpSpineInfo_csryw(): void {
        let data = this["_skeleton"]["data"];
        let animations = data["animations"];
        let events = data["events"];
        let skins = data["skins"];

        console.group(`spine : 节点 ${this.name} ,动画 <${this["_N$skeletonData"]["_name"]} >`)

        let animationsName = "动作集合："
        let animationsInfo = "["
        for (let index = 0; index < animations.length; index++) {
            let name = animations[index].name;
            if (index != 0) {
                animationsInfo = animationsInfo + ","
            }
            animationsInfo = animationsInfo + name;
        }
        animationsInfo = animationsInfo + "]"

        let eventsName = "事件集合："
        let eventsInfo = "["
        for (let index = 0; index < events.length; index++) {
            let name = events[index].name;
            let stringValue = events[index].stringValue;
            if (stringValue == "") {
                stringValue = "\"\""
            }
            if (index != 0) {
                eventsInfo = eventsInfo + ","
            }
            eventsInfo = eventsInfo + name + ":" + stringValue
        }
        eventsInfo = eventsInfo + "]"

        let skinsName = "皮肤集合："
        let skinsInfo = "["
        for (let index = 0; index < skins.length; index++) {
            let name = skins[index].name;
            if (index != 0) {
                skinsInfo = skinsInfo + ","
            }
            skinsInfo = skinsInfo + name
        }
        skinsInfo = skinsInfo + "]"


        console.log(
            `%c ${animationsName} %c ${animationsInfo} `,
            'background: #35495E;padding: 1px;border-radius: 2px 0 0 2px;color: #fff;',
            'background: #409EFF;padding: 1px;border-radius: 0 2px 2px 0;color: #fff;'
        );
        console.log(
            `%c ${eventsName} %c ${eventsInfo} `,
            'background: #35495E;padding: 1px;border-radius: 2px 0 0 2px;color: #fff;',
            'background: #409EFF;padding: 1px;border-radius: 0 2px 2px 0;color: #fff;'
        );
        console.log(
            `%c ${skinsName} %c ${skinsInfo} `,
            'background: #35495E;padding: 1px;border-radius: 2px 0 0 2px;color: #fff;',
            'background: #409EFF;padding: 1px;border-radius: 0 2px 2px 0;color: #fff;'
        );

        console.groupEnd()
    }
}

// 将接口导出
(<any>window).SpinePreviewComponent = SpinePreviewComponent;


