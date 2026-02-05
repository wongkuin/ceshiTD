import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { RelicsCategoryData, RelicsUpData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameRelicData, { RelicVo } from "../../Data/GameRelicData";
import GameHelp from "../../Mgr/GameHelp";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RelicItem extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "物品背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "当前等级" })
    protected levelLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "物品数量" })
    protected suipianLab: cc.Label = null;
    @property({ type: cc.ProgressBar, tooltip: "物品数量进度条数量" })
    protected progress: cc.ProgressBar = null;

    @property({ type: ButtonPlus, tooltip: "升级" })
    protected btnUpgrade: ButtonPlus = null;

    @property({ type: sp.Skeleton, tooltip: "" })
    protected lvUpSpine: sp.Skeleton = null;

    @property({ type: cc.Node, tooltip: "" })
    protected root: cc.Node = null;







    protected onLoad(): void {
        this.node.getComponent(ButtonPlus).addClick(this.onOpenRelicInfo, this);
        this.btnUpgrade.addClick(this.onClickUpgrade, this);
    }

    onOpenWapenInfo() {
        //FormMgr.open(UIConfig.ui_PopWapenInfo, { wapenId: this.wapenId });
    }

    itemId: number = null;
    itemVo: RelicVo = null;
    RelicCfg: RelicsCategoryData = null;
    initItem(itemId: number) {
        this.itemId = itemId;
        this.itemVo = GameRelicData.getInstance().getRelicById(itemId);
        this.RelicCfg = ConfigMgr.getInstance().getById(itemId, RelicsCategoryData);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${this.RelicCfg.img}`, this.img, GameBundle.Bundle_commonRes);

        this.levelLab.string = `Lv.${this.itemVo.level}`;
        this.nameLab.string = this.RelicCfg.name;
        if (this.itemVo.level == 0) {
            SceneMgr.getCurrScene().loadSpirteFrame(`texture/ui_djk_0`, this.imgBg, GameBundle.Bundle_Treasure);
            Utils.setAllChildrenSpGray(this.root, true);
        } else {
            Utils.setAllChildrenSpGray(this.root, false);
            SceneMgr.getCurrScene().loadSpirteFrame(`texture/ui_djk_${this.RelicCfg.relicscCharacter}`, this.imgBg, GameBundle.Bundle_Treasure);
        }
        this.btnUpgrade.node.active = false;
        if (this.itemVo.level < this.RelicCfg.maxLv) {
            let costNum = this.getCostNum();
            this.suipianLab.string = `${this.itemVo.suiPianNum}/${costNum}`;
            this.progress.progress = this.itemVo.suiPianNum / costNum;
            this.btnUpgrade.node.active = this.itemVo.suiPianNum >= costNum;
        } else {
            this.suipianLab.string = `已满级`;
            this.progress.progress = 1;
        }
    }

    onOpenRelicInfo() {
        FormMgr.open(UIConfig.ui_PopRelicInfo, { relicId: this.itemId });
    }

    onClickUpgrade() {
        if (this.itemVo.level < this.RelicCfg.maxLv) {
            let costNum = this.getCostNum();
            if (this.itemVo.suiPianNum >= costNum) {
                this.itemVo.level++;
                this.itemVo.suiPianNum -= costNum;
                GameHelp.getInstance().showToast("升级成功");
                if (this.itemVo.level == 1) {
                    FormMgr.open(UIConfig.ui_PopRelicUnlock, { relicId: this.itemId })
                }
                this.playLvUpSpine();
            }
            this.initItem(this.itemId);
        } else {
            GameHelp.getInstance().showToast("已满级");
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



    getCostNum() {
        let costNum = 0;
        let nextRelicUp = ConfigMgr.getInstance().getById(this.itemVo.level + 1, RelicsUpData);
        costNum = nextRelicUp["cost" + this.RelicCfg.relicscUp] || 0;
        return costNum;

    }





}