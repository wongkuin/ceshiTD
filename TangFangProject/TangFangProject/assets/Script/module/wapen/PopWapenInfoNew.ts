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
import { EquipSkillExData, KvData, WapenTableData, WapenUpData } from "../../config/DataDef";
import { BounsType, GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameUserData from "../../Data/GameUserData";
import GameWapenData, { WapenVo } from "../../Data/GameWapenData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import GuideMgr from "../../Guide/GuideMgr";
import GameHelp from "../../Mgr/GameHelp";
import AwardItemNew from "../activity/AwardItemNew";
import WapenbuffItem from "./WapenbuffItem";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopWapenInfoNew extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, true);

    @property({ type: cc.Sprite, tooltip: "物品背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.RichText, tooltip: "武器描述" })
    protected descLab: cc.RichText = null;

    @property({ type: cc.Label, tooltip: "当前攻击" })
    protected curGG: cc.Label = null;

    @property({ type: cc.Label, tooltip: "攻击增加" })
    protected addGG: cc.Label = null;

    @property({ type: cc.Label, tooltip: "当前冷却" })
    protected curLQ: cc.Label = null;

    @property({ type: cc.Label, tooltip: "增加冷却" })
    protected addLQ: cc.Label = null;

    @property({ type: cc.Label, tooltip: "当前速度" })
    protected curSD: cc.Label = null;

    @property({ type: cc.Label, tooltip: "增加速度" })
    protected addSD: cc.Label = null;

    @property({ type: cc.Label, tooltip: "当前等级" })
    protected curLV: cc.Label = null;

    @property({ type: cc.Label, tooltip: "当前等级" })
    protected curLV1: cc.Label = null;


    @property({ type: cc.Label, tooltip: "下一等级" })
    protected nextLv: cc.Label = null;

    @property({ type: cc.Node, tooltip: "jt" })
    protected jt: cc.Node = null;

    @property({ type: cc.Node, tooltip: "花费root" })
    protected costRoot: cc.Node = null;

    @property({ type: ButtonPlus, tooltip: "升级" })
    protected btnUpgrade: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "关闭" })
    protected btnClose: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "jj" })
    protected btnJJ: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "解锁提示" })
    protected lockLab: cc.Label = null;

    @property({ type: sp.Skeleton, tooltip: "升级动效" })
    protected lvUpSpine: sp.Skeleton = null;

    @property({ type: cc.Prefab, tooltip: "道具" })
    protected awardItem: cc.Prefab = null;

    @property({ type: cc.Prefab, tooltip: "buff" })
    protected buffItem: cc.Prefab = null;

    @property({ type: cc.Node, tooltip: "buffRoot" })
    protected buffRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "最大级" })
    protected maxNode: cc.Node = null;

    @property(cc.RichText)
    protected kzLab: cc.RichText = null;


    private DamageBonus = {
        1: "针对僵尸",
        2: "针对鬼魂",
        3: "针对邪祟",
        4: "针对地面",
        5: "针对飞行",
        6: "针对夜晚",
        7: "针对白天",
        8: "针对雨天",
        9: "针对精英",
        10: "针对雾天",
    }

    public onInit(params: any): void {
        this.btnClose.node.on("click", this.onClose, this);
        this.btnUpgrade.addClick(this.onClickUpgrade, this);
        this.btnJJ.addClick(this.onClickJJ, this);
    }

    onClickJJ() {
        FormMgr.open(UIConfig.ui_PopWapenJJ, { wapenId: this.wapenId });
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
    /**
     * 初始化视图
     * @param wapenId 武器ID
     */
    /**
     * 初始化武器视图
     * @param wapenId 武器ID
     */
    initView(wapenId: number) {
        this.wapenId = wapenId;
        this.wapenTable = ConfigMgr.getInstance().getById(wapenId, WapenTableData);
        this.itemVo = GameWapenData.getInstance().getWapenById(wapenId);
        SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${this.wapenTable.img}`, this.img, GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`texture/${this.getBgUrl()}`, this.imgBg, GameBundle.Bundle_commonRes);
        this.nameLab.string = this.wapenTable.name;

        let hasWapen = this.itemVo ? true : false;

        let wapenUpCfg = ConfigMgr.getInstance().getById(this.wapenTable.wapenUp, WapenUpData);



        if (!hasWapen) {
            this.curLV.string = `Lv.${0}`;
            this.curLV1.string = `Lv.${0}`;
            this.nextLv.string = `Lv.${1}`;
            this.btnUpgrade.node.active = false;
            this.maxNode.active = false;
        } else {
            this.curLV.node.active = true;
            this.maxNode.active = this.itemVo.level == this.wapenTable.maxLv;;
            this.nextLv.node.active = this.itemVo.level < this.wapenTable.maxLv;
            this.jt.active = this.itemVo.level < this.wapenTable.maxLv;
            if (this.itemVo.level >= this.wapenTable.maxLv) {
                this.curLV.node.anchorX = 0.5;
                this.curLV.node.x = 0;
            }
            this.btnUpgrade.node.getComponentInChildren(cc.Label).string = "升级";
            this.curLV.string = `Lv.${this.itemVo.level}`;
            this.curLV1.string = `Lv.${this.itemVo.level}`;
            this.nextLv.string = `Lv.${this.itemVo.level + 1}`;
            this.btnUpgrade.node.active = this.itemVo.level < this.wapenTable.maxLv;
        }



        let lv = this.itemVo ? this.itemVo.level : 0;
        if (lv == 0) {
            if (this.wapenTable.stageUnlock > 0) {
                this.lockLab.string = `通过第${this.wapenTable.stageUnlock}关解锁`;
                this.btnUpgrade.node.active = false;
            } else {
                if (this.wapenTable.unlock.length > 0 && this.wapenTable.unlock[0] == 1) {
                    this.lockLab.string = `元宝解锁`
                }
                if (this.wapenTable.unlock.length > 0 && this.wapenTable.unlock[0] != 1) {
                    this.lockLab.string = `碎片解锁`
                }
            }

        } else {

            this.btnUpgrade.node.active = lv < this.wapenTable.maxLv;
            this.btnUpgrade.node.getChildByName("redDot").active = GameWapenData.getInstance().checkUpgradeByWapenId(this.wapenId);
            this.initAwardItem();
        }
        let curAtk = (wapenUpCfg.baseAtk + Math.floor(wapenUpCfg.growthAtk * (Math.max(0, lv - 1))))
        this.curGG.string = "" + Math.floor(curAtk);

        let addAtk = (lv < this.wapenTable.maxLv) ? (wapenUpCfg.baseAtk + Math.floor(wapenUpCfg.growthAtk * (Math.max(0, lv)))) - curAtk : 0;


        this.addGG.string = "+" + Math.floor(addAtk);

        this.curSD.string = "" + this.wapenTable.speed;
        this.addSD.string = "";

        this.curLQ.string = "" + (this.wapenTable.amm) + "圈";
        this.addLQ.string = "";

        this.initBuffItem();
        this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(this.wapenTable.note), 2, '#000000');

        if (this.wapenTable.enDam) {
            this.kzLab.node.parent.active = true;
            let enDam: string[] = this.wapenTable.enDam.split(",");
            let rsResult = `<color=#05FF00>${this.DamageBonus[Number(enDam[0])] || ''} 伤害加成:${Number(enDam[1]) * 100}%</color>`;
            this.kzLab.string = CommonUtils.addOutline(rsResult, 2, '#000000');
        }
        else
            this.kzLab.node.parent.active = false;
        // this.scheduleOnce(()=>{
        //     console.log(this.descLab.node.width)
        //     this.descLab.node.parent.width = this.descLab.node.width +40;
        //     if(this.descLab.node.width>340){
        //         this.descLab.maxWidth =340;
        //     }
        // });
    }

    initAwardItem() {

        this.costRoot.children.forEach((item) => {
            item.active = false;
        });
        if (this.itemVo.level < this.wapenTable.maxLv) {
            let list = GameWapenData.getInstance().getUpgredeCostById(this.wapenId);
            let suipianId = GameWapenData.getInstance().getSuiPianItemIdByWapenId(this.wapenId);
            let itemList = [];
            // if(list.suipianNum>0){
            itemList.push(new ItemVo(suipianId, list.suipianNum));
            // }
            // if(list.costNum>0){
            itemList.push(new ItemVo(1, list.costNum));
            // }
            for (let i = 0; i < itemList.length; i++) {
                let item = this.costRoot.children[i];
                if (!cc.isValid(item)) {
                    item = cc.instantiate(this.awardItem);
                    this.costRoot.addChild(item);
                }
                item.active = true;

                item.getComponent(AwardItemNew).initItem(itemList[i], false);
                item.scale = 0.85;
                let sp = item.getComponent(AwardItemNew);
                sp.hideNum();
                let hasNum = UserItemsData.getInstance().getItemNum(itemList[i].itemID);
                let string = `${Math.floor(hasNum)}/${itemList[i].num}`
                let color = hasNum >= itemList[i].num ? cc.Color.WHITE : cc.Color.RED;

                sp.setName(string, color);

            }
        }
    }

    initBuffItem() {

        this.buffRoot.children.forEach((node) => {
            node.active = false;
        })
        let list = ConfigMgr.getInstance().getById(this.wapenTable.wapenUp, WapenUpData).equipSkillEx;
        for (let i = 0; i < list.length; i++) {
            let id = list[i];
            let node = this.buffRoot.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.buffItem);
                this.buffRoot.addChild(node);
            } else {
                node.active = true;
            }
            node.getComponent(WapenbuffItem).initItem(this.wapenId, id);
        }
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
        // if (!this.itemVo) {//解锁
        //     if (UserItemsData.getInstance().getItemNum(this.wapenTable.unlock[0]) >= this.wapenTable.unlock[1]) {
        //         GameWapenData.getInstance().addWapenById(this.wapenId);
        //         UserItemsData.getInstance().spliceItem(this.wapenTable.unlock[0], this.wapenTable.unlock[1]);
        //     } else {
        //         GameHelp.getInstance().showToast("解锁材料不足");
        //     }
        // } else {//升级

        if (GameWapenData.getInstance().checkUpgradeByWapenId(this.wapenId)) {
            let list = GameWapenData.getInstance().getUpgredeCostById(this.wapenId);
            UserItemsData.getInstance().spliceItem(this.wapenTable.item, list.suipianNum);

            UserItemsData.getInstance().spliceItem(1, list.costNum);
            GameWapenData.getInstance().addWapenLevelById(this.wapenId);
            this.checkUpgradeSZ();
            this.playLvUpSpine();
            let kvId = 23;
            let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
            SoundMgr.getInstance().playSound(soundName);

        } else {
            GameHelp.getInstance().showToast("升级材料不足");
        }

        //  }

        this.initView(this.wapenId);
    }
    /**检查神装激活 */
    checkUpgradeSZ() {
        let list = ConfigMgr.getInstance().getById(this.wapenTable.wapenUp, WapenUpData).equipSkillEx;
        let id = list[3];
        if (id) {
            let skillVo = ConfigMgr.getInstance().getById(id, EquipSkillExData);
            if (this.itemVo.level == skillVo.lv) {
                FormMgr.open(UIConfig.ui_PopWapenUpgradeSZ, { wapenId: this.wapenId, equipSkillExId: id })
            }
        }
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
