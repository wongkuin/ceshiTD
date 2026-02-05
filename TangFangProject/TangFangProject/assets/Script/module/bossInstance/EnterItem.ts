import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ActiveEntranceData, ItemBaseData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameBossInstanceData from "../../Data/GameBossInstanceData";
import GameUserData from "../../Data/GameUserData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";
import AwardItemNew from "../activity/AwardItemNew";



const { ccclass, property } = cc._decorator;

@ccclass
export default class EnterItem extends cc.Component {


    @property({ type: cc.Sprite, tooltip: "bg" })
    protected bg: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "" })
    protected titleLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "提示" })
    protected tips: cc.Label = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected locktips: cc.Label = null;

    @property({ type: cc.Node, tooltip: "" })
    protected lockRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "期待" })
    protected waiting: cc.Node = null;

    @property({ type: cc.Node, tooltip: "" })
    protected awardRoot: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "" })
    protected awardItem: cc.Prefab = null;

    @property({ type: cc.Node, tooltip: "" })
    protected redDot: cc.Node = null;







    protected onLoad(): void {
        this.node.getComponent(ButtonPlus).addClick(this.openPopInfo, this)
        //this.playGuangAni(this.guang);
    }
    openPopInfo() {
        // GameHelp.getInstance().showToast("敬请期待");
        // return;
        // if (this.enterCfg.unlock_type == 1 && (GameUserData.getInstance().lastPassLv - 1) < this.enterCfg.unlock_value) {
        //     GameHelp.getInstance().showToast("尚未解锁");
        //     return;
        // }
        if (this.enterId == 1) {
            FormMgr.open(UIConfig.ui_PopSnowBossInfo, {}, { quick: true });
        }
        if (this.enterId == 2) {
            FormMgr.open(UIConfig.ui_PopTeamRaidInfo, {}, { quick: true });
        }
    }
    enterId: number;

    enterCfg: ActiveEntranceData

    initItem(enterId: number) {
        this.redDot.active = false
        this.enterId = enterId;
        if (!enterId) {
            this.waiting.active = true;
            return;
        }
        this.waiting.active = false;
        this.enterCfg = ConfigMgr.getInstance().getById(enterId, ActiveEntranceData);
        this.titleLab.string = this.enterCfg.name;
        this.tips.string = this.enterCfg.rich_text;
        this.lockRoot.active = true;
        SceneMgr.getCurrScene().loadSpirteFrame(`texture/enter/${this.enterCfg.img}`, this.bg, GameBundle.Bundle_WB)
        //   this.locktips.string = "敬请期待";
        if (this.enterCfg.unlock_type == 1 && (GameUserData.getInstance().lastPassLv - 1) < this.enterCfg.unlock_value) {
            this.lockRoot.active = true;
            this.locktips.string = "通关" + this.enterCfg.unlock_value + "关后解锁";
        } else {
            this.lockRoot.active = false;
        }
        this.initAward();
        switch (this.enterId) {
            case 1:
                this.redDot.active = GameBossInstanceData.getInstance().checkSnowRedDot();
                break;
            case 2:
                this.redDot.active = false;
                break;
        }

    }

    initAward() {
        this.awardRoot.children.forEach((item) => {
            item.active = false;
        })

        let awardCfg = this.enterCfg.item_list;
        let index = 0;
        for (let i = 0; i < awardCfg.length; i = i + 2) {
            let item = this.awardRoot.children[index];
            if (!cc.isValid(item)) {
                item = cc.instantiate(this.awardItem);
                this.awardRoot.addChild(item);
            }
            item.active = true;
            item.scale = 0.6;
            index++;
            item.getComponent(AwardItemNew).initItem({ itemID: awardCfg[i], num: awardCfg[i + 1] }, false);
            item.getComponent(AwardItemNew).hideNum();
        }
    }








}