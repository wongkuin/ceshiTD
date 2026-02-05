

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import TipWarningComponent from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/script/component/TipWarningComponent";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import { ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import UIConfig from "../config/UIConfig";
// import GameBattleChestData from "../Data/GameBattleChestData";
import GameGlobalData from "../Data/GameGlobalData";
import GameUserData from "../Data/GameUserData";
import UserItemsData from "../Data/UserItemsData";
import ToastTip from "./ToastTip";
// import UserItemsData from "../Data/UserItemsData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopGM extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(cc.Button)
    btnSure: cc.Button = null;

    @property(cc.EditBox)
    cEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    chestEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    passEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    itemEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    rankEditBox: cc.EditBox = null;

    @property(cc.Button)
    chestBtn: cc.Button = null;
    @property(cc.Button)
    passBtn: cc.Button = null;
    @property(cc.Button)
    itemBtn: cc.Button = null;

    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    public onInit(params: any): void {
        super.onInit(params);
        this.onInitView();
        this.btnClose.addClick(this.onBtnClicked, this);
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }

    onInitView() {
        let helpStr = " \
        help: 查看帮助\n \
        分隔符号英文 \":\" \n \
        item <数量>: 设置道具,例子：发放道具1共100数量item:1_100\n \
        chest:<id> - 发放战斗宝箱,例子：chest:1\n \
        pass:<id> - 指定关卡，pass:1\n \
         ";


        let cBtn = this.btnSure.node;

        cBtn.on("click", () => {
            let cmd = this.cEditBox.string;
            if (cmd == 'help') {
                console.log(helpStr);
                return;
            } else {
                let arr = cmd.split(':');
                if (arr[0] == 'item') {
                    let itemList = arr[1].split("_");
                    UserItemsData.getInstance().pushItem(parseInt(itemList[0]), parseInt(itemList[1]));
                    console.log('设置道具', arr[1])
                } else if (arr[0] == 'pass') {
                    console.log('设置关卡', arr[1])
                    GameUserData.getInstance().setNewPass(parseInt(arr[1]));
                }
            }
        })
    }

    onChestBtnClicked() {
        let cmd = this.chestEditBox.string;
        TipWarningComponent.instance?.showTip(`暂不开放`);
    }

    onSetRankInfo() {
        let score = Number(this.rankEditBox.string);
        let pass = Math.floor(score / 100), wave = score % 100;
        if (!pass || !wave) {
            TipWarningComponent.instance?.showTip(`输入格式错误`);
            return;
        }
        GameUserData.getInstance().updatePassID(score, true);
    }

    onItemBtnClicked() {
        let cmd = this.itemEditBox.string;
        let itemList = cmd.split('_');
        UserItemsData.getInstance().pushItem(parseInt(itemList[0]), parseInt(itemList[1]));
    }

    onPassBtnClicked() {
        let cmd = this.passEditBox.string;
        GameUserData.getInstance().setNewPass(parseInt(cmd));
        GlobalEventMgr.getInstance().emit(GlobalEventID.Refresh_LevelInfo);
        this.closeSelf();
    }

    public onShow(params: any): void {
        super.onShow(params);
        // FormMgr.open(UIConfig.ui_game3in1);
    }

    public onAfterHide(params: any): void {
    }

    // update (dt) {}
}

