

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../config/ConfigMgr";
import { ItemBaseData, ShopData } from "../config/DataDef";

import { GameBundle } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameGlobalData from "../Data/GameGlobalData";
import GameStoreData, { StoreBuyType } from "../Data/GameStoreData";
import UserItemsData, { ItemVo } from "../Data/UserItemsData";
import LanguageMgr from "../lang/LanguageMgr";
import GameHelp from "../Mgr/GameHelp";
import GameTrackHelp from "../Mgr/GameTrackHelp";

import StoreItem from "../module/store/StoreItem";
import MainPageBase from "./MainPageBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPageStore extends MainPageBase {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    @property({ type: cc.ScrollView, tooltip: "滚动容器" })
    protected scroll: cc.ScrollView = null;

    @property({ type: cc.Label, tooltip: "倒计时" })
    protected timeLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "道具item root" })
    protected propRoot: cc.Node = null;
    @property({ type: ButtonPlus, tooltip: "刷新道具item" })
    protected btnRefresh: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "剩余次数" })
    protected refreshLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "铜钱item root" })
    protected goldRoot: cc.Node = null;

    @property({ type: [ButtonPlus], tooltip: "铜钱btn列表" })
    protected buyGoldBtnList: ButtonPlus[] = [];

    @property({ type: [cc.Label], tooltip: "铜钱数量" })
    protected goldNumLab: cc.Label[] = [];
    @property({ type: cc.Prefab, tooltip: "道具预制体" })
    protected propItemPfb: cc.Prefab = null;

    @property({ type: cc.Node, tooltip: "铜钱1售罄" })
    protected shouqingNode: cc.Node = null;


    @property({ type: cc.Label, tooltip: "铜钱1售罄" })
    protected tips: cc.Label = null;

    @property(cc.Node)
    protected tempRoot: cc.Node = null;
    @property(cc.Node)
    protected storeNormalRoot: cc.Node = null;



    //------------------------------------add
    @property({ type: cc.Label, tooltip: "skinTips1" })
    protected timeTip: cc.Label = null;

    @property({ type: cc.Label, tooltip: "skinTips1" })
    protected shuaxinLab: cc.Label = null;


    @property(sp.Skeleton)
    spine1: sp.Skeleton = null;

    @property(sp.Skeleton)
    spine2: sp.Skeleton = null;

    @property(sp.Skeleton)
    spine3: sp.Skeleton = null;

    choiseGoldIndex: number

    @property({ type: cc.Node, tooltip: "fruitRoot" })
    protected fruitRoot: cc.Node = null;



    public onInit(params: any): void {
        super.onInit(params);
        this.btnRefresh.addClick(this.onRefreshStoreAD, this)
        this.scroll.node.height = 220 + cc.winSize.height / 2 - 100;

    }
    onRefreshStoreAD() {
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onSuccessFunc1(b);
        }, this, { scene: "button_shop_refresh" })
    }

    onSuccessFunc1(b) {
        if (!b) {
            return
        }
        GameStoreData.getInstance().storeRefreshTime++;
        GameStoreData.getInstance().refreshStoreItem();
        this.initView(true);
    }


    public onShow(params: any): void {
        super.onShow(params);
        GameStoreData.getInstance().resetData();
        this.initView();
    }

    hideBoneByName(spine: sp.Skeleton, boneName: string) {

        const skeleton = spine.skeletonData;
        // 找到该骨骼对应的所有bones
        const bones = skeleton["_skeletonJson"].bones;
        // console.log("skeleton",sk,skeleton,bones);
        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            if (bone.name === boneName) {
                bone.scaleX = 0;
                bone.scaleY = 0; // 设置透明度为0
            }
        }



    }
    initView(isAni = false) {
        this.calcDJS();

        this.hideBoneByName(this.spine1, "yingzi");
        this.hideBoneByName(this.spine2, "yingzi");
        this.hideBoneByName(this.spine3, "yingzi");
        let limit = parseInt(ConfigMgr.getInstance().getById(23, ShopData).val);
        let shengyu = limit - GameStoreData.getInstance().storeRefreshTime;
        this.timeTip.string = LanguageMgr.getInstance().getLang('storeTime');
        // let cishu = LanguageMgr.getInstance().getLang('sycs');
        this.refreshLab.string = `(${shengyu})`;
        if (shengyu <= 0) {
            this.btnRefresh.interactable = false;
            Utils.setAllChildrenSpGray(this.btnRefresh.node, true);
        } else {
            this.btnRefresh.interactable = true;
            Utils.setAllChildrenSpGray(this.btnRefresh.node, false);
        }
        this.unscheduleAllCallbacks();
        this.schedule(this.calcDJS, 1);
        this.initNormalStore(isAni);
        this.initGoldStore();


        // this.scheduleOnce(()=>{
        //     let list:ItemVo[]= [{ itemID:1,num:5},{ itemID:10002,num:5}];
        // //    let list:ItemVo[]= [{ itemID:1,num:5},{ itemID:10002,num:5},{ itemID:10002,num:5},{ itemID:10002,num:5},
        // //     { itemID:10002,num:5},{ itemID:10002,num:5},{ itemID:10002,num:5},{ itemID:10002,num:5},{ itemID:10002,num:5},
        // //     { itemID:10002,num:5},{ itemID:10002,num:5}]
        //     FormMgr.open(UIConfig.ui_PopGetReward,list)
        // },2)
    }
    initNormalStore(isAni) {
        this.propRoot.children.forEach((node) => {
            node.active = false;
        })
        let list = GameStoreData.getInstance().storeItemList;
        list.forEach((storeVo, i) => {
            let node = this.propRoot.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.propItemPfb);
                this.propRoot.addChild(node);
            } else {
                node.active = true;
            }
            node.getComponent(StoreItem).initItem(storeVo, isAni);
            // node.getComponent()
        })
        this.propRoot.getComponent(cc.Layout).updateLayout();
        setTimeout(() => {
            this.storeNormalRoot.height = Math.abs(this.propRoot.y) + this.propRoot.height;
            this.tempRoot.getComponent(cc.Layout).updateLayout();
        }, 1)
    }

    initGoldStore() {

        for (let i = 0; i < 3; i++) {
            let data = GameStoreData.getInstance().goldItemList[i];
            let btn = this.buyGoldBtnList[i];
            btn.node["posIndex"] = i;
            btn.addClick(this.buyGold, this);
            //  let 
            this.goldNumLab[i].string = "x" + data.itemNum;
            let cost_coin = Utils.getWidget("costItem", btn.node).getComponent(cc.Sprite);
            let costLab = Utils.getWidget("costLab", btn.node).getComponent(cc.Label);
            // let titleLab = Utils.getWidget("titleLab", btn.node).getComponent(cc.Label);
            // titleLab.string = LanguageMgr.getInstance().getLang('gold' + (i + 1));

            switch (data.buyType) {
                case StoreBuyType.free:
                    cost_coin.node.active = false;
                    costLab.string = LanguageMgr.getInstance().getLang('free');
                    break;
                case StoreBuyType.ad:
                    cost_coin.node.active = true;
                    SceneMgr.getCurrScene().loadSpirteFrame(`texture/ui_sp`, cost_coin, GameBundle.Bundle_commonRes);
                    let limit = ConfigMgr.getInstance().getById(29, ShopData).val;
                    costLab.string = LanguageMgr.getInstance().getLang('free') + `(${parseInt(limit) - data.buyNum})`;
                    break;
                case StoreBuyType.gold:
                    cost_coin.node.active = true;
                    let itemData = ConfigMgr.getInstance().getById(1, ItemBaseData);
                    SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, cost_coin, GameBundle.Bundle_commonRes);
                    costLab.string = "" + data.costNum;
                    break;
                case StoreBuyType.diamond:
                    cost_coin.node.active = true;
                    let itemData1 = ConfigMgr.getInstance().getById(2, ItemBaseData);
                    SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData1.img}`, cost_coin, GameBundle.Bundle_commonRes);
                    costLab.string = "" + data.costNum;
                    break;

            }
            /**每天第一次免费,超过次数就售罄 */
            if (i == 0) {
                let limit = ConfigMgr.getInstance().getById(29, ShopData).val;
                btn.interactable = !(data.buyNum >= parseInt(limit));
                Utils.getWidget("costNode", btn.node).active = !(data.buyNum >= parseInt(limit));
                this.shouqingNode.active = (data.buyNum >= parseInt(limit));
                btn.node.active = data.buyNum < parseInt(limit)
                let redDot = btn.node.getChildByName("redDot");
                redDot.active = (data.buyNum == 0);
                this.tips.string = "随机\n2-5倍";
                if (data.buyNum == 0) {
                    this.tips.string = "首次\n翻倍";
                    cost_coin.node.active = false;
                    costLab.string = LanguageMgr.getInstance().getLang('free');
                }
            }
        }
    }
    buyGold(event) {
        let index = event.target["posIndex"];
        let data = GameStoreData.getInstance().goldItemList[index];
        if (index == 0 && data.buyNum == 0) {
            //免费送
            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum * 2 }] });
            data.buyNum++;
            this.initGoldStore();
        } else {
            switch (data.buyType) {
                case StoreBuyType.free:
                    FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
                    data.buyNum++;
                    this.initGoldStore();
                    break;
                case StoreBuyType.ad:
                    this.choiseGoldIndex = index;
                    PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                        if (!cc.isValid(this)) return;
                        this.onSuccessFunc(b);
                    }, this, { scene: "button_shop_gold1" })
                    break;
                case StoreBuyType.gold:
                    let hasNum = UserItemsData.getInstance().getItemNum(1);
                    if (hasNum >= data.costNum) {
                        UserItemsData.getInstance().spliceItem(1, data.costNum);
                        FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
                        data.buyNum++;
                        this.initGoldStore();
                    } else {
                        let str = LanguageMgr.getInstance().getLang('gold_notEnough')
                        GameHelp.getInstance().showToast(str);
                    }
                    break;
                case StoreBuyType.diamond:
                    let hasNum1 = UserItemsData.getInstance().getItemNum(2);
                    if (hasNum1 >= data.costNum) {
                        UserItemsData.getInstance().spliceItem(2, data.costNum);
                        FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum }] });
                        data.buyNum++;
                        this.initGoldStore();
                        GameTrackHelp.getInstance().track_trigger_shop_gold(data.index);
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
        let index = this.choiseGoldIndex;
        let data = GameStoreData.getInstance().goldItemList[index];
        let beilv = 1;
        if (index == 0) {
            beilv = GameStoreData.getInstance().getGold1BeiLv(data.buyNum);
        }

        FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: data.itemId, num: data.itemNum * beilv }] });
        data.buyNum++;
        this.initGoldStore();
    }

    calcDJS() {
        let tomorrow = this.getTomorrow();
        let now = new Date().getTime();
        let cha = Math.floor((tomorrow - now) / 1000);
        this.timeLab.string = Utils.getTimeFormatClock(cha);
        if (cha <= 0) {
            GameStoreData.getInstance().resetData();
        }
    }

    getTomorrow() {
        let now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1); // 加 1 天
        tomorrow.setHours(0, 0, 0, 0); // 时、分、秒、毫秒归零

        // 获取时间戳（毫秒）
        const timestamp = tomorrow.getTime();
        return timestamp;
    }



    // update (dt) {}
}
