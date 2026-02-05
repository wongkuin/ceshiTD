import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { PassiveSkillData, RelicsCategoryData, RelicsUpData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameRelicData, { RelicVo } from "../../Data/GameRelicData";
import GameHelp from "../../Mgr/GameHelp";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopRelicInfo extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    @property({ type: cc.Sprite, tooltip: "物品背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;




    @property({ type: cc.Label, tooltip: "品质" })
    protected pzLab: cc.Label = null;

    @property({ type: SpriteFrame, tooltip: "品质" })
    protected pzSp: SpriteFrame = null;

    @property({ type: cc.Label, tooltip: "lv" })
    protected lvLab: cc.Label = null;

    @property({ type: ButtonPlus, tooltip: "关闭" })
    protected btnClose: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "升级" })
    protected btnUpgrade: ButtonPlus = null;

    @property({ type: cc.Sprite, tooltip: "物品数量进度条数量" })
    protected progressBar: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "花费" })
    protected costNumLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "解锁" })
    protected tipsLab: cc.Label = null;

    @property({ type: cc.RichText, tooltip: "满级文本提示" })
    protected descLab: cc.RichText = null;


    // @property({ type: sp.Skeleton, tooltip: "升级动效" })
    // protected lvUpSpine: sp.Skeleton = null;

    relicId: number = 0; //当前宝物id
    RelicCfg: RelicsCategoryData = null; //当前宝物配置
    itemVo: RelicVo = null; //当前宝物数据
    public onInit(params: any): void {
        this.btnClose.node.on("click", this.onClose, this);
        this.btnUpgrade.addClick(this.onClickUpgrade, this);
    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    onClickUpgrade() {
        if (this.itemVo.level < this.RelicCfg.maxLv) {
            let costNum = this.getCostNum();
            if (this.itemVo.suiPianNum >= costNum) {
                this.itemVo.level++;
                this.itemVo.suiPianNum -= costNum;
                GameHelp.getInstance().showToast("升级成功");
                if (this.itemVo.level == 1) {
                    FormMgr.open(UIConfig.ui_PopRelicUnlock, { relicId: this.relicId })
                }
                //this.playLvUpSpine();
                this.initView(this.relicId);
            } else {
                //  GameHelp.getInstance().showToast("拥有宝物数量不足");
            }

        } else {
            GameHelp.getInstance().showToast("已满级");
        }

    }

    initView(relicId) {
        this.relicId = relicId;
        this.itemVo = GameRelicData.getInstance().getRelicById(relicId);
        this.RelicCfg = ConfigMgr.getInstance().getById(relicId, RelicsCategoryData);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${this.RelicCfg.img}`, this.img, GameBundle.Bundle_commonRes);


        this.lvLab.string = `Lv.${this.itemVo.level}`;
        this.nameLab.string = this.RelicCfg.name;
        let pzStr = "一般";
        let index = 0;
        switch (this.RelicCfg.relicscCharacter) {
            case 1:
                pzStr = "一般";
                index = 0;
                break;
            case 2:
                pzStr = "稀有";
                index = 1;
                break;
            case 3:
                pzStr = "传奇";
                index = 2;
                break;

        }
        this.pzSp.setFrameByIndex(index);
        this.pzLab.string = pzStr;
        Utils.setAllChildrenSpGray(this.btnUpgrade.node, true);
        this.btnUpgrade.node.getChildByName("redDot").active = false;
        let str = this.itemVo.level == 0 ? "解锁" : "升级";
        if (this.itemVo.level == 0) {
            cc.Tween.stopAllByTarget(this.imgBg.node);
            Utils.setSpGray(this.img, true)
        } else {
            Utils.setSpGray(this.img, false)
        }
        this.btnUpgrade.getComponentInChildren(cc.Label).string = str;
        this.tipsLab.string = this.RelicCfg.note;
        if (this.itemVo.level < this.RelicCfg.maxLv) {
            let costNum = this.getCostNum();
            this.costNumLab.string = `${this.itemVo.suiPianNum}/${costNum}`;
            this.progressBar.fillRange = this.itemVo.suiPianNum / costNum;
            Utils.setAllChildrenSpGray(this.btnUpgrade.node, !(this.itemVo.suiPianNum >= costNum));
            if (this.itemVo.suiPianNum >= costNum) {
                this.btnUpgrade.node.getChildByName("redDot").active = true;
            }
        } else {
            this.progressBar.fillRange = 1;
            this.costNumLab.string = "已满级";
            this.btnUpgrade.node.active = false;
            this.tipsLab.string = "已满级";
        }


        this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(this.getAttrLab()), 2, '#000000');
    }




    getAttrLab() {
        let attrList: number[] = [];
        let level = (this.itemVo.level) > 0 ? this.itemVo.level : 1;
        let nextRelicUp = ConfigMgr.getInstance().getById(level, RelicsUpData);
        if (nextRelicUp) {
            attrList = nextRelicUp["attribute" + this.RelicCfg.relicscUp] || [];
        }
        let str = "";
        for (let i = 0; i < attrList.length; i++) {
            let passiveSkillCfg = ConfigMgr.getInstance().getById(attrList[i], PassiveSkillData);
            let huanghang = `\n`;
            str += passiveSkillCfg.note;
            if (i < attrList.length - 1) {
                str += huanghang;
            }
        }

        return str;
    }


    getCostNum() {
        let costNum = 0;
        let nextRelicUp = ConfigMgr.getInstance().getById(this.itemVo.level + 1, RelicsUpData);
        costNum = nextRelicUp["cost" + this.RelicCfg.relicscUp] || 0;
        return costNum;

    }


    public onShow(params: any): void {
        this.playGuangAni(this.imgBg.node);
        this.initView(params.relicId);
    }



    onClose() {
        // UIMgr.getInstance().hide(this.node);
        this.closeSelf()
    }







}