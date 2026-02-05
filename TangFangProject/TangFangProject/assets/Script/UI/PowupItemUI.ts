import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import UIBase from "../../TRFrameWork/UIFrame/UIBase";
import { ItemBaseData, PowUpData } from "../config/DataDef";
import { GameBundle } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";
import StarLv from "./StarLv";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PowupItemUI extends cc.Component {


    @property([cc.SpriteFrame])
    itemBgs: cc.SpriteFrame[] = [];

    @property(StarLv)
    starLv: StarLv = null;

    @property(cc.Sprite)
    itemBg: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.RichText)
    itemTitle: cc.RichText = null;

    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    unlock: cc.Node = null;

    @property(cc.Node)
    vidoeIcon: cc.Node = null; // 视频图标

    @property(cc.Node)
    tjIcon: cc.Node = null; // 推荐

    needVideo: boolean = false;

    protected baseUI: UIBase = null;
    protected item: PowUpData = null;

    start() {
        this.itemTitle.node.on(cc.Node.EventType.SIZE_CHANGED, this.onTitleChange, this);
    }

    public showAnim() {
        this.node.stopAllActions();
        this.node.scaleX = 1;
        this.node.skewY = 0;

        cc.tween(this.node)
            .to(0.1, { scaleX: 0, y: 50 })
            .to(0.1, { scaleX: 1, y: 0 })
            .union()
            .repeat(1)
            .call(() => {
                this.node.skewY = 0;
                this.root.active = true;
                this.unlock.active = false;
                // GlobalEventMgr.getInstance().emit(GlobalEventID.ShowGame3in1Btns);
            })
            .start();
    }

    setItem(item: PowUpData, baseUI: UIBase, video: boolean, tj: boolean) {
        this.item = item;
        this.baseUI = baseUI;
        this.refurishUI(item);
        this.needVideo = video;
        // console.log("强化效果, 星级 =", item.star);
        this.itemTitle.node.scale = 1;
        this.tjIcon.active = tj;


    }

    public resetItem(item: PowUpData, baseUI: UIBase, video: boolean, tj: boolean) {
        this.needVideo = video;
        this.showAnim();
        this.item = item;
        this.baseUI = baseUI;
        this.refurishUI(item);
        this.tjIcon.active = tj;
    }

    public resetView() {
        this.itemTitle.node.scale = 1;
    }

    // protected checkUseItem() {
    //     // this.useItemRoot.removeAllChildren();


    //     let getItems: any[] = [];
    //     // let ts = GameControl.getInstance().getAllFightTurret();
    //     // for (const element of ts) {
    //     //     if (this.item.require1.indexOf(element.tid) >= 0) {
    //     //         getItems.push({ id: element.tid, type: 2 });
    //     //     }
    //     // }

    //     // let hs = GameControl.getInstance().getAllFightHero();
    //     // for (const element of hs) {
    //     //     if (this.item.require2.indexOf(element.hid) >= 0) {
    //     //         getItems.push({ id: element.hid, type: 1 });
    //     //     }
    //     // }

    //     // let allItems = ConfigMgr.getInstance().getAll<ItemBaseData>(ItemBaseData);

    //     // for (const element of getItems) {

    //     //     let gItem = allItems.find((item) => {
    //     //         if (item.type == element.type && item.typeArgs == element.id) {
    //     //             return true;
    //     //         }
    //     //     })

    //     //     if (gItem) {
    //     //         let node = cc.instantiate(this.useItemPrefab);
    //     //         node.active = true;
    //     //         let itemImg = node.getChildByName("item").getComponent(cc.Sprite);
    //     //         this.useItemRoot.addChild(node);
    //     //         this.baseUI.loadSpirteFrame(`ItemIcon/${gItem.img}`, itemImg, GameBundle.Bundle_common);
    //     //     }
    //     // }
    // }

    protected refurishUI(item: PowUpData) {

        // this.root.getChildByName('enCard_text_1').active = false;
        // this.root.getChildByName('enCard_text_2').active = false;

        // if (item.imgTxt.length > 0) {
        //     let tNode = this.root.getChildByName(item.imgTxt)
        //     tNode && (tNode.active = true);
        // }

        this.vidoeIcon.active = this.needVideo;

        this.itemBg.spriteFrame = this.itemBgs[item.colour];
        this.itemTitle.string = CommonUtils.addOutline(GameHelp.replaceColorStr(item.note), 3, "#000000");
        this.starLv.setStarLv(item.star);
        this.baseUI.loadSpirteFrame(`powupIcon/${this.item.icon}`, this.itemIcon, GameBundle.Bundle_commonRes);
        // this.checkUseItem();
    }

    onTitleChange() {
        if (this.itemTitle.node.width > 160) {
            this.itemTitle.node.scale = 160 / this.itemTitle.node.width;
        }
    }
    // update (dt) {}
}
