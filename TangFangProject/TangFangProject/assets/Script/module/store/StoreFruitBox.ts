import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, ShopBoxData, ShopData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameStoreData from "../../Data/GameStoreData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import LanguageMgr from "../../lang/LanguageMgr";
import GameHelp from "../../Mgr/GameHelp";
import GameTrackHelp from "../../Mgr/GameTrackHelp";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StoreFruitBox extends cc.Component {
    @property({ type: ButtonPlus, tooltip: "广告" })
    protected btnGG: ButtonPlus = null;
    @property({ type: ButtonPlus, tooltip: "铜钱" })
    protected btnCoin: ButtonPlus = null;


    @property({ type: cc.Node, tooltip: "售罄" })
    protected shouqingNode: cc.Node = null;
    @property({ type: cc.Node, tooltip: "消耗img" })
    protected costItem: cc.Node = null;
    @property({ type: cc.Label, tooltip: "数量" })
    protected costLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "广告图标" })
    protected adNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "免费" })
    protected freeNode: cc.Node = null;

    @property({ type: cc.Label, tooltip: "倒计时" })
    protected djsLab: cc.Label = null;


    @property({ type: cc.Node, tooltip: "红点" })
    protected redDot: cc.Node = null;




    boxType: number;
    protected onLoad(): void {
        this.btnGG.addClick(this.onClickGG, this);
        this.btnCoin.addClick(this.onClickBtnCoin, this);

    }

    /**
     * 
     * @param boxType 1 普通，2 高级
     */
    initItem(boxType: number) {
        this.boxType = boxType;
        let cost = []
        let costNum = 0;
        switch (boxType) {
            case 1:
                this.djs();
                break;
            case 2:

                break;
        }
        let itemData = ConfigMgr.getInstance().getById(2, ItemBaseData);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, this.costItem.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
        costNum = this.getCost();
        this.costLab.string = "" + costNum;



    }

    getCost() {
        let costNum = 0;
        let cost = [];
        let boxType = this.boxType;
        switch (boxType) {
            case 1:
                let buyTime = GameStoreData.getInstance().fruitItemGGNum1;
                cost = ConfigMgr.getInstance().getById(24, ShopData).val.split(",").map((v) => {
                    return parseInt(v);
                });

                if (buyTime >= cost.length) {
                    costNum = cost[cost.length - 1];
                } else {
                    costNum = cost[buyTime];
                }

                break;
            case 2:
                let buyTime2 = GameStoreData.getInstance().fruitItemGGNum2;
                cost = ConfigMgr.getInstance().getById(27, ShopData).val.split(",").map((v) => {
                    return parseInt(v);
                });

                if (buyTime2 >= cost.length) {
                    costNum = cost[cost.length - 1];
                } else {
                    costNum = cost[buyTime2];
                }
                break;
        }
        return costNum;
    }

    djs() {
        this.unschedule(this.scheduleDJS);
        let nowTime = new Date().getTime();
        let time = ConfigMgr.getInstance().getById(26, ShopData).val;
        if (nowTime - GameStoreData.getInstance().lastBoxTime >= parseInt(time)) {
            this.djsLab.string = "";
            this.adNode.active = false;
            this.freeNode.active = true;
            this.redDot.active = true;
            Utils.setAllChildrenSpGray(this.adNode.parent, false);
            this.btnGG.interactable = true;
        } else {
            this.adNode.active = false;
            this.freeNode.active = true;
            this.redDot.active = false;
            Utils.setAllChildrenSpGray(this.adNode.parent, true)
            this.btnGG.interactable = false;
            this.scheduleDJS();
            this.schedule(this.scheduleDJS, 1);


        }
    }

    scheduleDJS() {
        let nowTime = new Date().getTime();
        let time = ConfigMgr.getInstance().getById(26, ShopData).val;
        if (nowTime - GameStoreData.getInstance().lastBoxTime >= parseInt(time)) {
            this.djsLab.string = "";
            this.unschedule(this.scheduleDJS);
            this.initItem(this.boxType);
        } else {
            let djs = parseInt(time) - (nowTime - GameStoreData.getInstance().lastBoxTime);
            this.djsLab.string = "免费倒计时:" + Utils.getTimeFormatClock(Math.floor(djs / 1000));

        }
    }

    onClickGG() {

        if (this.boxType == 1 && this.freeNode.active == true) {
            GameStoreData.getInstance().lastBoxTime = new Date().getTime();
            this.onSuccessFunc(true);
            return;
        }
        let s = ""
        if (this.boxType == 1) {
            s = "button_shop_box1_adv"
        } else {
            s = "button_shop_box2_adv"
        }
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onSuccessFunc(b);
        }, this, { scene: s })

    }

    onClickBtnCoin() {
        let addExp = 0;
        //let cost = [];
        let costNum = this.getCost();
        let cost = [2, costNum];
        switch (this.boxType) {
            case 1:

                let hasNum = UserItemsData.getInstance().getItemNum(cost[0]);
                if (hasNum >= costNum) {
                    GameStoreData.getInstance().fruitItemGGNum1++;
                    UserItemsData.getInstance().spliceItem(cost[0], cost[1]);

                    addExp = parseInt(ConfigMgr.getInstance().getById(25, ShopData).val);
                    GameStoreData.getInstance().addExp(addExp);
                    this.getAward();
                    this.initItem(this.boxType);
                } else {
                    let itemName1 = ConfigMgr.getInstance().getById(cost[0], ItemBaseData).name;
                    let str = LanguageMgr.getInstance().getLang("porp_notEnough")
                    let str1 = cc.js.formatStr(str, itemName1);

                    GameHelp.getInstance().showToast(str1);
                }
                break;
            case 2:


                let hasNum2 = UserItemsData.getInstance().getItemNum(cost[0]);
                if (hasNum2 >= cost[1]) {
                    UserItemsData.getInstance().spliceItem(cost[0], cost[1]);
                    GameStoreData.getInstance().fruitItemGGNum2++;
                    addExp = parseInt(ConfigMgr.getInstance().getById(28, ShopData).val);
                    GameStoreData.getInstance().addExp(addExp);
                    this.getAward();
                    this.initItem(this.boxType);
                } else {
                    let itemName1 = ConfigMgr.getInstance().getById(cost[0], ItemBaseData).name;
                    let str = LanguageMgr.getInstance().getLang("porp_notEnough")
                    let str1 = cc.js.formatStr(str, itemName1);

                    GameHelp.getInstance().showToast(str1);
                }
                break;

        }
        GameTrackHelp.getInstance().track_trigger_shop_box_diamond(this.boxType);
    }

    onClickBox() {
        FormMgr.open(UIConfig.ui_PopStoreFruitPreview);
    }

    onSuccessFunc(b) {
        if (!b) {
            return
        }
        let addExp = 0;
        switch (this.boxType) {
            case 1:

                //GameStoreData.getInstance().fruitItemGGNum1++;
                addExp = parseInt(ConfigMgr.getInstance().getById(25, ShopData).val);
                break;
            case 2:
                //GameStoreData.getInstance().fruitItemGGNum2++;
                addExp = parseInt(ConfigMgr.getInstance().getById(28, ShopData).val);
                break;
        }
        GameStoreData.getInstance().addExp(addExp);
        this.getAward();
        this.initItem(this.boxType);

    }

    getAward() {
        let cfg = ConfigMgr.getInstance().getById(GameStoreData.getInstance().curLv, ShopBoxData);
        let bounsA: number[] = null;
        let bounsB: number[] = null;
        switch (this.boxType) {
            case 1:
                bounsA = cfg.bounsA1;
                bounsB = cfg.bounsB1;
                break;
            case 2:
                bounsA = cfg.bounsA2;
                bounsB = cfg.bounsB2;
                break;
        }

        let curBouns: ItemVo[] = [];

        for (let i = 0; i < bounsA.length; i = i + 2) {
            let item: ItemVo = { itemID: bounsA[i], num: bounsA[i + 1] };
            curBouns.push(item);
        }
        for (let i = 0; i < bounsB.length; i = i + 2) {
            let suiJiBouns = GameHelp.getInstance().getDataList(bounsB[i], bounsB[i + 1]);
            curBouns = curBouns.concat(suiJiBouns);
        }
        let bouns: ItemVo[] = this.mergDuplicateRewards(curBouns);

        FormMgr.open(UIConfig.ui_PopGetReward, { rewards: bouns, stroeBox: this.node.getChildByName("baoxiang"), boxType: this.boxType });
    }



    mergDuplicateRewards(data: ItemVo[]): ItemVo[] {
        let list: ItemVo[] = [];

        function getListIndexBy(id) {
            let index = -1;
            for (let i = 0; i < list.length; i++) {
                if (list[i].itemID == id) {
                    return i;
                }
            }
            return index;
        }
        data.forEach((item: ItemVo) => {
            let index = getListIndexBy(item.itemID);
            if (index >= 0) {
                list[index].num += item.num;
            } else {
                list.push({ itemID: item.itemID, num: item.num });
            }
        })
        return list;
    }




}