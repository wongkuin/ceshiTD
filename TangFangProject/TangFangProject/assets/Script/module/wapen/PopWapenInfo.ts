import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { KvData, WapenTableData, WapenUpData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameUserData from "../../Data/GameUserData";
import GameWapenData, { WapenVo } from "../../Data/GameWapenData";
import UserItemsData from "../../Data/UserItemsData";
import GuideMgr from "../../Guide/GuideMgr";
import GameHelp from "../../Mgr/GameHelp";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopWapenInfo extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    @property({ type: cc.Sprite, tooltip: "物品背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;


    @property({ type: cc.Node, tooltip: "powerRoot" })
    protected powerRoot: cc.Node = null;

    @property({ type: cc.Label, tooltip: "当前战力" })
    protected curPowerLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "增加战力" })
    protected addPowerLab: cc.Label = null;

    @property({ type: ButtonPlus, tooltip: "关闭" })
    protected btnClose: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "升级" })
    protected btnUpgrade: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "花费" })
    protected costNumLab: cc.Label = null;

    @property({ type: cc.RichText, tooltip: "满级文本提示" })
    protected descLab: cc.RichText = null;


    @property({ type: sp.Skeleton, tooltip: "升级动效" })
    protected lvUpSpine: sp.Skeleton = null;


    @property({ type: cc.Label, tooltip: "解锁提示" })
    protected lockLab: cc.Label = null;



    public onInit(params: any): void {
        this.btnClose.node.on("click", this.onClose, this);
        this.btnUpgrade.addClick(this.onClickUpgrade, this);
    }




    public onShow(params: any): void {
        this.initView(params.wapenId);
    }



    onClose() {
        // UIMgr.getInstance().hide(this.node);
        this.closeSelf()
    }


    wapenId: number = null;
    itemVo: WapenVo = null;
    wapenTable: WapenTableData = null;
    initView(wapenId: number) {
        this.wapenId = wapenId;
        this.wapenTable = ConfigMgr.getInstance().getById(wapenId, WapenTableData);
        this.itemVo = GameWapenData.getInstance().getWapenById(wapenId);
        SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${this.wapenTable.img}`, this.img, GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`texture/${this.getBgUrl()}`, this.imgBg, GameBundle.Bundle_commonRes);

        let strLv = (this.itemVo && this.wapenTable.maxLv > 1) ? "Lv." + this.itemVo.level : "";
        this.nameLab.string = this.wapenTable.name + strLv;
        let lv = this.itemVo ? this.itemVo.level : 0;
        if (this.itemVo) {//解锁了

            if (this.wapenTable.wapenUp) {
                this.powerRoot.active = true;
                let wapenUp = ConfigMgr.getInstance().getById(this.itemVo.level, WapenUpData)
                let curPower: number = wapenUp["atk" + this.wapenTable.wapenUp];
                this.curPowerLab.string = Math.floor(curPower) + "";
                if (this.itemVo.level == this.wapenTable.maxLv) {
                    this.addPowerLab.string = "";
                } else {
                    let nextWapenUp = ConfigMgr.getInstance().getById(this.itemVo.level + 1, WapenUpData);
                    let addPower = nextWapenUp["atk" + this.wapenTable.wapenUp] - curPower;
                    this.addPowerLab.string = "+" + Math.floor(addPower);
                }
            } else {
                this.powerRoot.active = false;
            }

        } else {

            this.powerRoot.active = false;
        }



        if (lv == 0 && this.wapenTable.stageUnlock > 0) {
            this.lockLab.string = `通过第${this.wapenTable.stageUnlock}关解锁`;
            this.btnUpgrade.node.active = false;
        } else {

            this.btnUpgrade.node.active = lv < this.wapenTable.maxLv;;
            if (lv < this.wapenTable.maxLv) {
                this.costNumLab.node.color = this.getColor();
                this.costNumLab.string = this.getCostNum() + "";
            }
        }
        this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(this.wapenTable.note), 2, '#000000');


        // this.scheduleOnce(()=>{
        //     console.log(this.descLab.node.width)
        //     this.descLab.node.parent.width = this.descLab.node.width +40;
        //     if(this.descLab.node.width>340){
        //         this.descLab.maxWidth =340;
        //     }
        // });
    }

    getBgUrl() {
        let str = "";
        switch (this.wapenTable.colour) {
            case 1:
                str = "ui_k_lv";
                break;
            case 2:
                str = "ui_k_lan";
                break;
            case 3:
                str = "ui_k_zi";
                break;
            case 4:
                str = "ui_k_jin";
                break;
            case 5:
                str = "ui_k_hong";
                break;
        }
        return str;
    }

    onClickUpgrade() {
        if (!this.itemVo) {//解锁
            if (UserItemsData.getInstance().getItemNum(this.wapenTable.unlock[0]) >= this.wapenTable.unlock[1]) {
                GameWapenData.getInstance().addWapenById(this.wapenId);
                FormMgr.open(UIConfig.ui_PopWapenLock, { wapenId: this.wapenId });
                UserItemsData.getInstance().spliceItem(this.wapenTable.unlock[0], this.wapenTable.unlock[1]);
            } else {
                GameHelp.getInstance().showToast("解锁材料不足");
            }
        } else {//升级
            let nextWapenUp = ConfigMgr.getInstance().getById(this.itemVo.level + 1, WapenUpData);
            if (UserItemsData.getInstance().getItemNum(nextWapenUp.item) >= nextWapenUp["cost" + this.wapenTable.wapenUp]) {
                GameWapenData.getInstance().addWapenLevelById(this.wapenId);
                UserItemsData.getInstance().spliceItem(nextWapenUp.item, nextWapenUp["cost" + this.wapenTable.wapenUp]);
                this.playLvUpSpine();
                let kvId = 23;
                let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
                SoundMgr.getInstance().playSound(soundName);

            } else {
                GameHelp.getInstance().showToast("升级材料不足");
            }

        }

        this.initView(this.wapenId);
    }

    getColor(): cc.Color {
        let color: cc.Color = cc.color().fromHEX("#FFFFFF");
        this.btnUpgrade.node.getChildByName("redDot").active = false;
        if (!this.itemVo) {//解锁
            if (UserItemsData.getInstance().getItemNum(this.wapenTable.unlock[0]) >= this.wapenTable.unlock[1]) {
                color = cc.color().fromHEX("#FFFFFF");
                this.btnUpgrade.node.getChildByName("redDot").active = true;
            } else {
                color = cc.color().fromHEX("#fe2b2b");

            }
        } else {//升级
            let nextWapenUp = ConfigMgr.getInstance().getById(this.itemVo.level + 1, WapenUpData);
            if (UserItemsData.getInstance().getItemNum(nextWapenUp.item) >= nextWapenUp["cost" + this.wapenTable.wapenUp]) {
                color = cc.color().fromHEX("#FFFFFF");
                this.btnUpgrade.node.getChildByName("redDot").active = true;
            } else {
                color = cc.color().fromHEX("#fe2b2b");

            }
        }
        return color;
    }

    getCostNum() {
        let costNum = 0;
        if (!this.itemVo) {//解锁
            costNum = this.wapenTable.unlock[1];
        } else {//升级
            let nextWapenUp = ConfigMgr.getInstance().getById(this.itemVo.level + 1, WapenUpData);
            costNum = nextWapenUp["cost" + this.wapenTable.wapenUp] || 0;
        }
        return costNum;

    }


    playLvUpSpine() {
        this.lvUpSpine.node.active = true;
        this.lvUpSpine.setAnimation(0, "animation", false);
        this.lvUpSpine.setCompleteListener(() => {
            this.lvUpSpine.node.active = false;
            this.lvUpSpine.setCompleteListener(null);
        });
    }


    public onAfterShow(params: any): void {
        this.setBlockInput(false)
        this.scheduleOnce(() => {
            this.refreshGuideStep();
        }, 0.1)

    }

    public onAfterHide(params: any): void {
        GlobalEventMgr.getInstance().emit(GlobalEventID.checkWapenGuide);
    }


    refreshGuideStep() {

        //引导2，武器升级
        if (GameWapenData.getInstance().checkRedDotByWapenId(this.wapenId) && GuideMgr.getInstance().CheckShowGuid(3, this.node, this.btnUpgrade.node)) {
            return;
        }
    }



}