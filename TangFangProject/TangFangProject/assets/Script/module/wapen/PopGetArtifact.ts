import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { WapenFusionData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopGetArtifact extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, true);



    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;


    @property({ type: cc.Label, tooltip: "武器名称" })
    protected nameLab: cc.Label = null;


    @property({ type: cc.Node, tooltip: "tips" })
    protected bossTips: cc.Node = null;

    @property({ type: cc.Node, tooltip: "tips" })
    protected jt: cc.Node = null;

    @property({ type: sp.Skeleton, tooltip: "spine" })
    protected spine: sp.Skeleton = null;



    wapenId: number;
    public onInit(params: any): void {


    }






    public onShow(params: { wapenId: number, showTips?: boolean }): void {
        this.wapenId = params.wapenId;
        this.initView();
        this.bossTips.active = params.showTips;
        this.jt.parent.active = params.showTips;

        if (params.showTips) {
            this.scheduleOnce(() => {
                this.jt.parent.active = false;
            }, 4)
            this.jt.active = false;
            this.unschedule(this.playJtAni);
            this.schedule(this.playJtAni, 1, 5);
            this.playJtAni();
        }
    }

    playJtAni() {
        let jt = cc.instantiate(this.jt);
        jt.parent = this.jt.parent;
        jt.active = true;
        jt.opacity = 0;
        jt.y = -50;
        cc.tween(jt)
            .to(0.5, { opacity: 255, y: 5 })
            .to(0.5, { opacity: 50, y: 50 })
            .removeSelf()
            .start();
    }



    onClose() {
        // UIMgr.getInstance().hide(this.node);
        this.closeSelf()
    }

    initView() {
        this.hideBoneByName(this.spine, "yingzi")
        let data = ConfigMgr.getInstance().getById(this.wapenId, WapenFusionData);
        this.loadSpirteFrame(`wapen/${data.animation}`, this.img, GameBundle.Bundle_commonRes);
        this.nameLab.string = data.name;
    }

    hideBoneByName(spine: sp.Skeleton, boneName: string) {

        const skeleton = spine.skeletonData;
        // 找到该骨骼对应的所有bones
        const bones = skeleton["_skeletonJson"].bones;
        // console.log("skeleton",sk,skeleton,bones);
        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            if (bone.name === boneName) {
                bone.scaleX = 0;
                bone.scaleY = 0; // 设置透明度为0
            }
        }



    }




}