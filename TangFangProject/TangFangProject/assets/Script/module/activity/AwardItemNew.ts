import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";



const { ccclass, property } = cc._decorator;

@ccclass
export default class AwardItemNew extends cc.Component {


    @property({ type: cc.Sprite, tooltip: "奖励图标" })
    protected icon: cc.Sprite = null;
    @property({ type: cc.Sprite, tooltip: "奖励图标背景" })
    protected iconBg: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "奖数量" })
    protected bounsNum: cc.Label = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "光" })
    protected guang: cc.Node = null;

    @property({ type: cc.Node, tooltip: "首通" })
    protected stNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "碎片" })
    protected spNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "get" })
    protected getNode: cc.Node = null;




    protected onLoad(): void {
        //this.playGuangAni(this.guang);
    }
    num: number = 0;
    itemVo: ItemVo = null;
    redDot: cc.Node = null;
    getItemVo() {
        return this.itemVo;
    }

    initItem(itemVO: ItemVo, showGuang = true) {
        this.itemVo = itemVO;
        let itemId = itemVO.itemID;
        let num = itemVO.num;
        this.redDot = this.node.getChildByName("redDot");
        if (cc.isValid(this.redDot)) {
            this.redDot.active = false;
        }
        this.num = UserItemsData.getInstance().getRealAwardNum(itemId, num);


        let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);

        if (itemData.type == 4) {
            this.icon.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        } else {
            this.icon.sizeMode = cc.Sprite.SizeMode.RAW;
        }
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/sp${itemData.colour || 3}`, this.spNode.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, this.icon, GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${itemData.colour || 3}`, this.iconBg, GameBundle.Bundle_commonRes);
        this.bounsNum.string = this.num.toString();
        this.guang.active = showGuang;
        this.stNode.active = itemVO.st;

        this.spNode.active = itemData.type == 5;

    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    hideNum() {
        this.bounsNum.node.active = false;
    }

    setName(name: string, color = cc.Color.WHITE) {
        let nameLab = Utils.getWidget("nameLab", this.node);
        if (nameLab) {
            nameLab.active = true;
            nameLab.getComponent(cc.Label).string = name;
            this.nameLab.node.color = color;

        }
    }

    setBg(color: number = 1) {
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${color}`, this.iconBg, GameBundle.Bundle_commonRes);
    }

    setRedDot(State) {
        this.redDot = this.node.getChildByName("redDot");
        if (cc.isValid(this.redDot)) {
            this.redDot.active = State;
        }
    }



    setGuangActive(active: boolean) {
        this.guang.active = active;
    }


    setGetActive(active: boolean) {
        this.getNode.active = active;
        this.guang.active = !active;
        this.setRedDot(!active);

    }








}