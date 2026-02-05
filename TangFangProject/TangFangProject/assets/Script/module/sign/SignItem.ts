import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, SignData, WapenFusionData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameGlobalData from "../../Data/GameGlobalData";
import GameSignData from "../../Data/GameSignData";
import LanguageMgr from "../../lang/LanguageMgr";
import GameHelp from "../../Mgr/GameHelp";
import PopSign from "./PopSign";

const { ccclass, property } = cc._decorator;

@ccclass
export default class signItem extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "英雄背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "英雄图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Node, tooltip: "hasSignNode" })
    protected hasSignNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "redDot" })
    protected redDotNode: cc.Node = null;

    @property({ type: cc.Label, tooltip: "" })
    protected dayLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "" })
    protected numLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "redDot" })
    protected guang: cc.Node = null;

    @property({ type: cc.Node, tooltip: "redDot" })
    protected xzkuang: cc.Node = null;


    static choiceHeroId: number

    protected onLoad(): void {
        this.node.on("click", this.onXZ, this);
        this.playGuangAni(this.guang);
    }
    /**本item对应的日子，今日，本item对应data */
    parent: PopSign
    data: SignData
    initItem(data: SignData, parent: PopSign) {
        this.parent = parent;
        this.data = data;

        this.redDotNode.active = GameSignData.getInstance().checkCanReceiveNormal(data.day);
        this.hasSignNode.active = GameSignData.getInstance().checkFinishByDay(data.day);
        let index = (data.day <= GameSignData.getInstance().canSignDay) ? 0 : 1;
        // this.node.getComponent(SpriteFrame).setFrameByIndex(index);
        this.dayLab.string = `第${data.day}天`;
        //this.guang.active = GameSignData.getInstance().checkCanReceiveNormal(data.day);

        let itemId = data.bouns[0];
        let itemNum = data.bouns[1];
        let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
        if (itemData) {
            this.numLab.string = "x" + itemNum;
            // this.suiPianNode.active = itemData.type == 1;
            SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, this.img, GameBundle.Bundle_commonRes);
            let wpFusionData = ConfigMgr.getInstance().getById(itemData.typeArgs, WapenFusionData);
            if (wpFusionData) SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${wpFusionData.level}`, this.imgBg, GameBundle.Bundle_commonRes);
        }
        this.setXzkuang(false);

        // this.clickItem(this.img.node, itemId);
    }


    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    clickItem(item: cc.Node, itemId) {

        let btn = item.getComponent(cc.Button);
        if (!btn) {
            item.addComponent(cc.Button);
        }
        item.off('click');
        item.on("click", async () => {
            let wpos = item.parent.convertToWorldSpaceAR(item.getPosition())
            FormMgr.open(UIConfig.ui_PopItemInfo, { itemId: itemId, wpos: wpos });
        })
    }

    setXzkuang(state: boolean) {
        this.xzkuang.active = state;
        this.guang.active = false;
        if (GameSignData.getInstance().checkCanReceive(this.data.day)) {
            this.guang.active = state;
        }
        if (this.hasSignNode.active) this.xzkuang.active = false;
    }


    onXZ() {
        if (this.data.day <= GameSignData.getInstance().canSignDay) {
            this.parent.xzItem(this.data.day);
        } else {
            GameHelp.getInstance().showToast("领取时间未到");
        }
        //this.
    }


}