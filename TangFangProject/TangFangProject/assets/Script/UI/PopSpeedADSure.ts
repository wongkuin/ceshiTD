import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import { ModalType, ECloseType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import GameGlobalData from "../Data/GameGlobalData";
import GameUserData from "../Data/GameUserData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopSpeedADSure extends UIWindow {

    @property(ButtonPlus)
    btnSure: ButtonPlus = null;


    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(cc.RichText)
    tips: cc.RichText = null;


    modalType = new ModalType(ModalOpacity.OpacityHalf, false);
    closeType = ECloseType.CloseAndDestory;

    callFunc: Function = null;
    public onInit(params: any): void {
        super.onInit(params);

        this.btnSure.addClick(this.onSure, this);
        this.btnClose.addClick(this.closeSelf, this);
        if (params && params.callFunc) {
            this.callFunc = params.callFunc;
        }

    }

    onSure() {
        this.callFunc && this.callFunc();
        this.closeSelf();
    }
    //  public onShow(params: any): void {
    //         let str  = `<color=#ffffff>(再看</c><color=#00ff00>${10-GameGlobalData.getInstance().speedX2ADNum}</c><color=#ffffff>次广告后,可</c><color=#00ff00>永久解锁</color><color=#ffffff>)</c>`;
    //         this.tips.string =  CommonUtils.addOutline(str, 2, '#000000');
    //     }

    public onShow(params: any): void {
         console.warn("PopSpeedADShow onShow pauseGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.pauseGame);
        let str = `<color=#ffffff>(再看任意</c><color=#00ff00>${10 - GameUserData.getInstance().adTimes}</c><color=#ffffff>次广告后,可</c><color=#00ff00>永久解锁</color><color=#ffffff>)</c>`;
        this.tips.string = CommonUtils.addOutline(str, 2, '#000000');
    }

    public onAfterHide(params: any): void {
         console.warn("PopSpeedADSure onAfterHide resumeGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame);
    }


}

