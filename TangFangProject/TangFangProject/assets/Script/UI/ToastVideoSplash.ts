

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIToast, UIWindow } from "../../TRFrameWork/UIFrame/UIForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastVideoSplash extends UIToast {

    @property(cc.Node)
    bg: cc.Node = null;

    modalType = new ModalType(ModalOpacity.OpacityHalf, false);


    public onInit(params: any): void {
        super.onInit(params);
        this.setBlockInput(true);
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.bg);
        this.bg.opacity = 66;
    }

    public onShow(params: any): void {
        console.warn("ToastVideoSplash onShow pauseGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.pauseGame);
    }

    public onAfterHide(params: any): void {
        console.warn("ToastVideoSplash onAfterHide resumeGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame);
    }

    // update (dt) {}
}

