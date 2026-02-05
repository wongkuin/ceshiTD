import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, KvData, WapenTableData, WapenUpData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameUserData from "../../Data/GameUserData";
import GameWapenData, { WapenVo } from "../../Data/GameWapenData";
import UserItemsData from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";

const { ccclass, property } = cc._decorator;


export enum WapenItemType {
    fight = 1,//上场
    have,//拥有
    lock,//未解锁
    skill,//技能

}
@ccclass
export default class WapenItem extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "物品背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "图片" })
    img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "当前等级" })
    protected levelLab: cc.Label = null;



    @property({ type: cc.RichText, tooltip: "满级文本提示" })
    protected descLab: cc.RichText = null;

    @property({ type: sp.Skeleton, tooltip: "升级动效" })
    protected lvUpSpine: sp.Skeleton = null;




    @property({ type: cc.Node, tooltip: "未拥有" })
    protected noHaveRoot: cc.Node = null;

    @property({ type: cc.Label, tooltip: "未拥有解锁提示" })
    protected noHaveLab: cc.Label = null;

    //#region  新增


    @property({ type: ButtonPlus, tooltip: "上场按钮" })
    protected btnFight: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "下场按钮" })
    protected btnDelete: ButtonPlus = null;

    @property({ type: cc.Sprite, tooltip: "碎片" })
    protected sp: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "jdt" })
    protected jdt: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "碎片数量" })
    protected spNumLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "最大级" })
    protected maxNode: cc.Node = null;


    @property({ type: cc.Node, tooltip: "锁" })
    protected lockRoot: cc.Node = null;

    @property({ type: cc.Label, tooltip: "解锁提示" })
    protected lockLab: cc.Label = null;


    @property({ type: cc.Node, tooltip: "空闲" })
    protected emptyRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "root" })
    protected mianRoot: cc.Node = null;

    @property({ type: ButtonPlus, tooltip: "解锁" })
    protected btnLock: ButtonPlus = null;

    @property({ type: cc.Node, tooltip: "可升级" })
    protected canUpgredeNode: cc.Node = null;

    @property({ type: cc.Sprite, tooltip: "" })
    protected lockIcon: cc.Sprite = null;



    protected onLoad(): void {
        this.node.getComponent(ButtonPlus).addClick(this.onOpenWapenInfo, this);
        this.btnFight.addClick(this.onClickFight, this);
        this.btnDelete.addClick(this.onClickDelete, this);
        this.btnLock.addClick(this.onClickBtnLock, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.refreshEditState, this.showClearState, this);
        this.playAni(this.canUpgredeNode);
        this.scheduleOnce(() => {
            this.playAni(this.btnFight.node);
            this.playAni(this.btnDelete.node);
        }, 0.3)
    }

    playAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(0.7, { y: 10 })
            .by(0.7, { y: -10 })
            .union()
            .repeatForever()
            .start();
    }

    onClickFight() {
        let pos = GameWapenData.getInstance().getFightWapenIdlePosIndex();
        if (pos == -1) {
            GameHelp.getInstance().showToast("上场位置已满，请先下场");
            return;
        }

        GameWapenData.getInstance().addFightWapen(this.wapenId, pos);
    }
    onClickDelete() {
        GameWapenData.getInstance().deleteFightWapenByWapenId(this.wapenId)
    }


    onOpenWapenInfo() {
        if (this.btnFight.node.active) {
            this.onClickFight()
            return;
        }
        if (this.btnDelete.node.active) {
            this.onClickDelete()
            return;
        }
        if (this.itemType == WapenItemType.skill) {
            // FormMgr.open(UIConfig.ui_PopWapenInfo, { wapenId: this.wapenId });
        } else {
            FormMgr.open(UIConfig.ui_PopWapenInfoNew, { wapenId: this.wapenId });
        }

    }

    wapenId: number = null;
    itemVo: WapenVo = null;
    wapenTable: WapenTableData = null;
    itemType: WapenItemType = null;

    pos: number = null;
    /**是否是清理整备状态 */
    editState: boolean = false;
    /**
     * 
     * @param itemType 这个item 用在哪里
     * @param wapenId 武器id,可为空，空可能是未解锁，也可能是空闲
     * @param pos itemType为fight时，pos为上场位置
     */
    initItem(itemType: WapenItemType, wapenId: number, isEditState: boolean, pos: number = null) {
        this.itemType = itemType;
        this.wapenId = wapenId;
        this.editState = isEditState;
        this.pos = pos;
        this.node.active = true;

        if (itemType == WapenItemType.fight) {
            if (!wapenId) {//没上场，可能空闲可能未解锁
                if (GameUserData.getInstance().curSlotNum >= this.pos + 1) {//空闲
                    this.emptyRoot.active = true;
                    this.lockRoot.active = false;
                    this.mianRoot.active = false;
                    this.jdt.node.parent.active = true;
                } else {//未解锁
                    this.emptyRoot.active = false;
                    this.lockRoot.active = true;
                    this.jdt.node.parent.active = false;
                    this.mianRoot.active = false;
                    let lockCfg = ConfigMgr.getInstance().getById(34, KvData).val.split(",").map((item) => {
                        return parseInt(item);
                    })
                    this.lockLab.string = `获得新武器解锁`;
                }
                return;
            }

        }

        this.emptyRoot.active = false;
        this.lockRoot.active = false;
        this.mianRoot.active = true;
        this.btnFight.node.active = this.btnDelete.node.active = false;
        if (this.itemType == WapenItemType.fight && this.editState) {
            this.btnDelete.node.active = true;
        }
        if (this.itemType == WapenItemType.have && this.editState) {
            this.btnFight.node.active = true;
        }
        this.wapenTable = ConfigMgr.getInstance().getById(wapenId, WapenTableData);
        this.itemVo = GameWapenData.getInstance().getWapenById(wapenId);

        SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${this.wapenTable.img}`, this.img, GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/wapenBg${this.wapenTable.colour}`, this.imgBg, GameBundle.Bundle_commonRes);
        this.nameLab.string = this.wapenTable.name;
        let lv = this.itemVo ? this.itemVo.level : 0;
        this.btnLock.node.active = false;
        this.canUpgredeNode.active = false;
        if (this.itemVo) {//解锁了
            this.levelLab.node.active = true;
            this.levelLab.string = `Lv.${this.itemVo.level}`;
            this.noHaveRoot.active = false;
            this.jdt.node.active = true;
            this.canUpgredeNode.active = GameWapenData.getInstance().checkUpgradeByWapenId(this.wapenId);
        } else {
            this.levelLab.node.active = false;
            this.noHaveRoot.active = true;
            this.jdt.node.active = false;

            if (this.wapenTable.unlock.length > 0 && GameUserData.getInstance().lastPassLv - 1 >= this.wapenTable.stageUnlock) {
                this.setColor();
            }
        }

        if (this.wapenTable.maxLv == 1) {
            this.levelLab.node.active = false;
        }
        //未解锁
        this.noHaveLab.node.active = true;
        this.noHaveLab.string = "";
        this.spNumLab.node.active = true;
        this.maxNode.active = false;
        if (lv == 0 && this.wapenTable.stageUnlock > 0) {
            this.noHaveLab.string = `通过第${this.wapenTable.stageUnlock}关解锁`;

        } else {
            if (lv > 0) {
                if (lv < this.wapenTable.maxLv) {
                    let suipianNum = GameWapenData.getInstance().getUpgredeCostById(this.wapenId).suipianNum;
                    this.jdt.fillRange = UserItemsData.getInstance().getItemNum(this.wapenTable.item) / suipianNum;
                    this.spNumLab.string = UserItemsData.getInstance().getItemNum(this.wapenTable.item) + "/" + suipianNum;
                    this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(this.wapenTable.note), 2, '#000000');

                } else {
                    this.jdt.node.active = false;
                    this.spNumLab.node.active = false;
                    this.maxNode.active = this.itemType != WapenItemType.skill;
                    // this.descLab.string = CommonUtils.addOutline("已满级", 2, '#000000');
                }
                this.descLab.node.active = false;
            }

        }

        if (this.itemType == WapenItemType.skill && lv > 0) {
            this.jdt.node.active = false;
            this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(this.wapenTable.note), 2, '#000000');
            this.descLab.node.active = true;
        }

    }



    playLvUpSpine() {
        this.lvUpSpine.node.active = true;
        this.lvUpSpine.setAnimation(0, "animation", false);
        this.lvUpSpine.setCompleteListener(() => {
            this.lvUpSpine.node.active = false;
            this.lvUpSpine.setCompleteListener(null);
        });
    }

    showClearState(state: boolean) {
        if (this.itemType == WapenItemType.fight || this.itemType == WapenItemType.have) {
            this.editState = state;
        } else {
            return;
        }

        if (state) {
            if (this.itemType == WapenItemType.fight) {
                this.btnDelete.node.active = true;
                this.btnFight.node.active = false;
            } else if (this.itemType == WapenItemType.have) {
                this.btnDelete.node.active = false;
                this.btnFight.node.active = true;
            }
        } else {
            this.btnFight.node.active = this.btnDelete.node.active = false;
        }
    }

    setColor() {
        this.btnLock.node.active = this.wapenTable.unlock.length > 0;
        let color: cc.Color = cc.color().fromHEX("#FFFFFF");
        this.btnLock.node.getChildByName("redDot").active = false;
        if (!this.itemVo) {//解锁
            if (UserItemsData.getInstance().getItemNum(this.wapenTable.unlock[0]) >= this.wapenTable.unlock[1]) {
                color = cc.color().fromHEX("#FFFFFF");
                this.btnLock.node.getChildByName("redDot").active = true;
            } else {
                color = cc.color().fromHEX("#fe2b2b");

            }
            let data = ConfigMgr.getInstance().getById(this.wapenTable.unlock[0], ItemBaseData);
            let icon = this.btnLock.node.getComponentInChildren(cc.Sprite)
            SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${data.img}`, icon, GameBundle.Bundle_commonRes);
            this.btnLock.node.getComponentInChildren(cc.Label).node.color = color;
            this.btnLock.node.getComponentInChildren(cc.Label).string = "" + this.wapenTable.unlock[1];

        }
    }

    onClickBtnLock() {
        if (GameUserData.getInstance().lastPassLv - 1 < this.wapenTable.stageUnlock) {
            GameHelp.getInstance().showToast("先通过第" + this.wapenTable.stageUnlock + "关");
            return;
        }
        if (UserItemsData.getInstance().getItemNum(this.wapenTable.unlock[0]) >= this.wapenTable.unlock[1]) {
            GameWapenData.getInstance().addWapenById(this.wapenId);
            FormMgr.open(UIConfig.ui_PopWapenLock, { wapenId: this.wapenId });

            UserItemsData.getInstance().spliceItem(this.wapenTable.unlock[0], this.wapenTable.unlock[1]);
            let kvId = 22;
            let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
            SoundMgr.getInstance().playSound(soundName);

        } else {
            GameHelp.getInstance().showToast("解锁材料不足");
            return;
        }
    }

}