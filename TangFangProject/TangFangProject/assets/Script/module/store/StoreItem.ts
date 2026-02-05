import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, ShopData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameStoreData, { StoreItemVo, StoreBuyType } from "../../Data/GameStoreData";
import GameWapenData from "../../Data/GameWapenData";
import UserItemsData from "../../Data/UserItemsData";
import LanguageMgr from "../../lang/LanguageMgr";
import GameHelp from "../../Mgr/GameHelp";
import GameTrackHelp from "../../Mgr/GameTrackHelp";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StoreItem extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "iconBg" })
    protected iconBg: cc.Sprite = null;
    @property({ type: cc.Sprite, tooltip: "icon" })
    protected iconImg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "cost_icon" })
    protected cost_icon: cc.Sprite = null;

    @property({ type: cc.Node, tooltip: "广告图标" })
    protected adNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "碎片" })
    protected suiPianNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "折扣" })
    protected zhekouRoot: cc.Node = null;

    @property({ type: ButtonPlus, tooltip: "提示" })
    protected tishiBtn: ButtonPlus = null;
    @property({ type: ButtonPlus, tooltip: "购买" })
    protected buyBtn: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "numLab" })
    protected numLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "zhekouLab" })
    protected zhekouLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "nameLab" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "花费数量" })
    protected costLab: cc.Label = null;
    @property({ type: cc.Node, tooltip: "售罄" })
    protected shouQinNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "costNode" })
    protected costNode: cc.Node = null;

    @property({ type: sp.Skeleton, tooltip: "扫光" })
    protected sgSpine: sp.Skeleton = null;

    @property({ type: sp.Skeleton, tooltip: "光" })
    protected itemLight: sp.Skeleton = null;




    protected onLoad(): void {
        this.buyBtn.addClick(this.onBuyItem, this);
        this.tishiBtn.node.active = false;
    }
    data: StoreItemVo;
    static choiseIndex: number;
    initItem(vo: StoreItemVo, isAni = false) {
        let data = vo;
        this.data = vo;
        //  let 
        // this.levelAni.node.active = false;
        if (isAni && vo.index != 0) {
            // this.playLevelUpAni();
        }
        let itemData = ConfigMgr.getInstance().getById(vo.itemId, ItemBaseData);
        if (itemData) {
            this.nameLab.string = itemData.name;
            this.numLab.string = "x" + data.itemNum;
            this.suiPianNode.active = itemData.type == 5;
            let img = itemData.img;
            // if (vo.index == 1) {
            //     img = "icon_mgbx";
            // }
            SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${img}`, this.iconImg, GameBundle.Bundle_commonRes);
            SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${itemData.colour || 3}`, this.iconBg, GameBundle.Bundle_commonRes);
            SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/sp${itemData.colour || 3}`, this.suiPianNode.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
            SceneMgr.getCurrScene().loadSpirteFrame(`img/main/bg${itemData.colour || 3}`, this.node.getComponent(cc.Sprite), GameBundle.Bundle_Store);
        }

        // if (vo.index == 1) {
        //     this.numLab.string = " " ;
        //     this.nameLab.string = LanguageMgr.getInstance().getLang('storeBox');
        // }
        let cost_coin = this.cost_icon;
        let costLab = this.costLab;
        this.zhekouRoot.active = data.zhekou < 10 && data.buyType != StoreBuyType.ad;
        let zhe = LanguageMgr.getInstance().getLang('zhekou');
        this.zhekouLab.string = cc.js.formatStr(zhe, data.zhekou);

        this.shouQinNode.getComponent(cc.Label).string = LanguageMgr.getInstance().getLang('yishouqing');

        this.adNode.active = false;
        switch (data.buyType) {
            case StoreBuyType.free:
                cost_coin.node.active = false;
                this.adNode.active = false;
                costLab.string = LanguageMgr.getInstance().getLang('free');
                break;
            case StoreBuyType.ad:
                cost_coin.node.active = false;
                this.adNode.active = true;
                let limit = ConfigMgr.getInstance().getById(8, ShopData).val;
                //  SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/kanguanggao`, cost_coin, GameBundle.Bundle_common);
                costLab.string = LanguageMgr.getInstance().getLang('free');//+ `[${parseInt(limit) - data.buyNum}]`;
                break;
            case StoreBuyType.gold:
                cost_coin.node.active = true;

                let itemData1 = ConfigMgr.getInstance().getById(1, ItemBaseData);
                SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData1.img}`, cost_coin, GameBundle.Bundle_commonRes);

                let costNum = itemData.cost1 * this.data.itemNum * this.data.zhekou / 10;
                costLab.string = "" + Math.floor(costNum);
                break;
            case StoreBuyType.diamond:
                cost_coin.node.active = true;
                let itemData2 = ConfigMgr.getInstance().getById(2, ItemBaseData);
                SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData2.img}`, cost_coin, GameBundle.Bundle_commonRes);

                let costNum1 = itemData.cost2 * this.data.itemNum * this.data.zhekou / 10;
                costLab.string = "" + Math.floor(costNum1);
                break;

        }
        /**每天第一次免费,超过次数就售罄 */
        if (vo.index == 0) {
            SceneMgr.getCurrScene().loadRes(`spine/UI_lightsweep`, sp.SkeletonData, GameBundle.Bundle_commonRes).then((res: sp.SkeletonData) => {
                if (cc.isValid(this.sgSpine.node) && res) {
                    let spCom = this.sgSpine;
                    spCom.skeletonData = res;
                    spCom.setAnimation(0, "animation", true);
                }
            });

            let limit = ConfigMgr.getInstance().getById(8, ShopData).val;
            let buyTime = GameStoreData.getInstance().storeBuyNum1;
            this.shouQinNode.active = (buyTime >= parseInt(limit));
            this.itemLight.node.active = !(buyTime >= parseInt(limit));
            this.buyBtn.node.active = !(buyTime >= parseInt(limit));
            this.costNode.active = this.getComponent(cc.Button).interactable = !(buyTime >= parseInt(limit));
            let redDot = this.buyBtn.node.getChildByName("redDot");
            if (buyTime == 0) {
                this.adNode.active = false;
                cost_coin.node.active = false;
                costLab.string = LanguageMgr.getInstance().getLang('free');
                redDot.active = true;
            } else {
                costLab.string = LanguageMgr.getInstance().getLang('free') + `(${parseInt(limit) - buyTime})`;
                redDot.active = false;
            }
            // } else if (vo.index == 1) {
            //     let limit = ConfigMgr.getInstance().getById(10, ShopData).val;
            //     this.shouQinNode.active = (data.buyNum >= parseInt(limit));
            //     this.costNode.active =this.getComponent(cc.Button).interactable = !(data.buyNum >= parseInt(limit));
        } else {
            this.shouQinNode.active = data.buyNum > 0;
            this.itemLight.node.active = !(data.buyNum > 0);
            this.buyBtn.node.active = !(data.buyNum > 0);
            this.costNode.active = this.getComponent(cc.Button).interactable = !(data.buyNum > 0);
        }


    }

    onBuyItem() {

        let data = this.data;
        let index = data.index;
        if (index == 0 && GameStoreData.getInstance().storeBuyNum1 == 0) {
            //免费送

            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
            GameStoreData.getInstance().storeBuyNum1++;
            //data.buyNum++;
            this.initItem(data);
            GameTrackHelp.getInstance().track_button_shop_other(data.itemId, data.itemNum)
        } else {
            //免费的不管
            // if (data.buyType != StoreBuyType.free) {
            //let itemData = ConfigMgr.getInstance().getById(data.itemId, ItemBaseData);
            // if (itemData.type == 5 && !GameWapenData.getInstance().checkNeedSuiPianById(itemData.typeArgs)) {
            //     GameHelp.getInstance().showToast(LanguageMgr.getInstance().getLang('notBuy'));
            //     return;
            // }
            // }
            switch (data.buyType) {
                case StoreBuyType.free:
                    FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
                    data.buyNum++;
                    this.initItem(data);
                    break;
                case StoreBuyType.ad:
                    StoreItem.choiseIndex = index;

                    PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                        if (!cc.isValid(this)) return;
                        this.onSuccessFunc(b);
                    }, this, { scene: "button_shop_adv" });
                    break;
                case StoreBuyType.gold:


                    let hasNum = UserItemsData.getInstance().getItemNum(1);
                    //  debugger;
                    let itemData = ConfigMgr.getInstance().getById(this.data.itemId, ItemBaseData);

                    let costNum = itemData.cost1 * this.data.itemNum * this.data.zhekou / 10;
                    if (hasNum >= Math.floor(costNum)) {
                        UserItemsData.getInstance().spliceItem(1, Math.floor(costNum));
                        if (itemData.type == 7) {
                            this.getMGLB();
                        } else {
                            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
                        }
                        data.buyNum++;
                        this.initItem(data);
                    } else {
                        let str = LanguageMgr.getInstance().getLang('gold_notEnough')
                        GameHelp.getInstance().showToast(str);
                    }
                    break;
                case StoreBuyType.diamond:

                    let hasNum1 = UserItemsData.getInstance().getItemNum(2);
                    let itemData1 = ConfigMgr.getInstance().getById(this.data.itemId, ItemBaseData);

                    let costNum2 = itemData1.cost2 * this.data.itemNum * this.data.zhekou / 10;
                    if (hasNum1 >= Math.floor(costNum2)) {
                        UserItemsData.getInstance().spliceItem(2, Math.floor(costNum2));
                        if (itemData1.type == 7) {
                            this.getMGLB();
                        } else {
                            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
                        }
                        data.buyNum++;
                        this.initItem(data);
                    } else {
                        let str = LanguageMgr.getInstance().getLang('diamond_notEnough')
                        GameHelp.getInstance().showToast(str);
                    }
                    break;

            }
        }
    }

    onSuccessFunc(b) {
        if (!b) {
            return
        }
        if (StoreItem.choiseIndex == this.data.index) {
            // if (this.data.index == 1) {//item2 要算买的道具;
            //     let shopVo = ConfigMgr.getInstance().getById(9, ShopData).val.split(",");
            //     let subData = GameHelp.getInstance().getDataList(parseInt(shopVo[0]),parseInt(shopVo[1]));
            //     // let itemId = subData.itemId;
            //     // let itemNum = subData.itemValue;
            //     FormMgr.open(UIConfig.ui_PopGetReward, { rewards: subData });
            //     this.data.buyNum++;
            //     this.initItem(this.data);
            // } else {
            if (this.data.index == 0) {
                GameStoreData.getInstance().storeBuyNum1++;
            }
            let itemData = ConfigMgr.getInstance().getById(this.data.itemId, ItemBaseData);
            if (itemData.type == 7) {
                this.getMGLB();
            } else {
                FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: this.data.itemId, num: this.data.itemNum }] });
            }

            this.data.buyNum++;
            this.initItem(this.data);

            // }
        }
    }

    getMGLB() {
        // let shopVo = ConfigMgr.getInstance().getById(9, ShopData).val.split(",");

        let drawList = ConfigMgr.getInstance().getById(this.data.itemId, ItemBaseData).typeArgs2;
        let subData = GameHelp.getInstance().getDataList(drawList[0], drawList[1]);
        // let itemId = subData.itemId;
        // let itemNum = subData.itemValue;
        FormMgr.open(UIConfig.ui_PopGetReward, { rewards: subData });
        this.data.buyNum++;
        this.initItem(this.data);
    }

    // playLevelUpAni() {
    //     this.levelAni.node.active = true;

    //     this.unscheduleAllCallbacks();
    //     this.levelAni.on('finished', this.onAnimationFinished, this);
    //     this.levelAni.play("lvlup2");
    //     this.levelParticle.resetSystem()
    // }

    // onAnimationFinished() {
    //     this.scheduleOnce(() => {
    //         this.levelAni.node.active = false;
    //     }, 1)
    //     //
    //     this.levelAni.off('finished', this.onAnimationFinished, this);
    // }





}