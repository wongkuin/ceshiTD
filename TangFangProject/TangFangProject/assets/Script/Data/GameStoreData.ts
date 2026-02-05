

import UserVariable, { nonSerialized } from "../../TRFrameWork/cocos-module/component/UserVariable";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ConfigMgr from "../config/ConfigMgr";
import { DrawMainData, DrawSubData, ItemBaseData, ShopBoxData, ShopData } from "../config/DataDef";
import GameHelp from "../Mgr/GameHelp";

import GameUserData from "./GameUserData";
import { UserKeyType } from "./UserKeyType";


/**解锁/出战的水果数据 */
export default class GameStoreData extends UserVariable<GameStoreData> {

    constructor() {
        super(UserKeyType.GameStoreData, true);
    }
    /**普通商品列表 */
    storeItemList: StoreItemVo[] = [];
    /**铜钱商品列表 */
    goldItemList: StoreItemVo[] = [];
    /** */
    /**key 增加前缀防止重名 */
    @nonSerialized()
    zhekouList: { id: number, weight: number }[] = [];

    /**最后刷新时间 */
    lastTime = "";
    /**商店刷新次数 */
    storeRefreshTime: number = 0;

    /**果蔬商店等级 */
    curLv: number = 1;
    /**当前总经验 */
    totalExp: number = 0;
    /**果蔬宝箱1灵石领取次数 */
    fruitItemGGNum1: number = 0;
    /**果蔬宝箱2灵石领取次数 */
    fruitItemGGNum2: number = 0;

    /**商店1号商品购买次数 */
    storeBuyNum1: number = 0;

    /**普通宝箱领取时间，一个小时以后能免费领取 */
    lastBoxTime = 0;


    setLastBoxTime() {
        this.lastBoxTime = new Date().getTime();
    }

    checkFreeBox() {
        let nowTime = new Date().getTime();
        let time = ConfigMgr.getInstance().getById(26, ShopData).val;
        if (nowTime - this.lastBoxTime >= parseInt(time)) {
            return true;
        }
        return false;
    }

    addExp(addExp) {
        this.totalExp += addExp;
    }
    /**检查等级是否提升 */
    checkLvUpgrade() {
        let nextCfg = ConfigMgr.getInstance().getById(this.curLv + 1, ShopBoxData);
        if (!nextCfg) {
            return false;
        }
        return this.totalExp >= nextCfg.exp;
    }
    /**等级提升 */
    lvUpgrade() {
        let nextCfg = ConfigMgr.getInstance().getById(this.curLv + 1, ShopBoxData);
        this.curLv++;
        this.totalExp -= nextCfg.exp;
    }

    resetData() {
        let nowTime = this.getTime();
        if (nowTime == this.lastTime) {
            return;
        }
        this.storeRefreshTime = 0;
        this.lastTime = nowTime;
        this.initStoreItem();
        this.initGoldItem();
        this.initFruitStoreItem();
        this.storeBuyNum1 = 0;

    }

    getTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 注意，getMonth()返回的是0-11
        const day = date.getDate();
        return `${year}:${month}:${day}`
    }
    protected init(first: boolean): void {
        var arr = [];
        for (var i: number = 1; i <= 6; i++) {
            let shopVo = ConfigMgr.getInstance().getById(i, ShopData);
            var obj = { id: 11 - i, weight: Number(shopVo.val) };
            arr.push(obj);
        }
        this.zhekouList = arr;
        this.resetData();

    }

    /**初始化全部商店item */
    initStoreItem() {
        this.storeItemList = [];
        for (let i = 0; i <= 7; i++) {
            let zhekou = this.getZheKou();
            if (i == 0) {//1号特殊商品
                let shopVo = ConfigMgr.getInstance().getById(7, ShopData).val.split(",").map((item) => {
                    return parseInt(item);
                });
                let vo = new StoreItemVo(i, shopVo[0], shopVo[1], 10, StoreBuyType.ad);
                this.storeItemList.push(vo);
                //  } else if (i == 1) {

                //     let vo = new StoreItemVo(i, 212, 1, 10, StoreBuyType.ad);
                //     this.storeItemList.push(vo);
            } else {
                let subData = this.getNewStoreItem(i);
                //  let random = ConfigMgr.getInstance().getById(12, ShopData).val;
                //  let buyType = (Random.range(0, 100) <= parseInt(random)) ? StoreBuyType.diamond : StoreBuyType.gold;
                let buyType = this.getStoreZheKou(i);
                let vo = new StoreItemVo(i, subData.itemId, subData.itemValue, zhekou, buyType);
                this.storeItemList.push(vo);
            }
        }

    }
    /**刷新全部item */
    refreshStoreItem() {
        this.storeBuyNum1 = 0;
        this.initStoreItem();
        // for (let i = 1; i <= 5; i++) {
        //     let zhekou = this.getZheKou();
        //     let subData = this.getNewStoreItem(i);
        //     let random = ConfigMgr.getInstance().getById(12, ShopData).val;
        //     let buyType = (Random.range(0, 100) <= parseInt(random)) ? StoreBuyType.diamond : StoreBuyType.gold;
        //     let vo = new StoreItemVo(i, subData.itemId, subData.itemValue, zhekou, buyType);
        //     this.storeItemList[i] = vo;
        // }
    }

    getNewStoreItem(index): DrawSubData {
        let shopVo = ConfigMgr.getInstance().getById(7 + 2 * index, ShopData).val.split(",");
        let subData = GameHelp.getInstance().calcReward(parseInt(shopVo[0]));
        let itemId = subData.itemId;
        let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);

        // if (itemData.type == 1 && !GameFruitData.getInstance().getFruitById(itemData.value1)) {
        //     return this.getNewStoreItem(index);
        // } else {
        return subData;
        // }
    }

    getStoreZheKou(index) {
        let zhekouCfg = ConfigMgr.getInstance().getById(8 + 2 * index, ShopData).val.split(",").map((item) => {
            return parseInt(item);
        });
        let list = [];
        for (let i = 0; i < zhekouCfg.length; i++) {
            var obj = { id: i + 1, weight: zhekouCfg[i] };
            list.push(obj);
        }
        let zhekou = Utils.getRandDataOfWeightObjectList(list).data.id;
        return zhekou;
    }

    getZheKou() {
        let zhekou = Utils.getRandDataOfWeightObjectList(this.zhekouList).data.id;
        return zhekou;
    }

    getGold1BeiLv(buyIndex) {
        if (buyIndex == 0) {
            return 2;
        } else {
            var arr = [];
            let shopVo = ConfigMgr.getInstance().getById(31, ShopData).val.split(",").map((item) => {
                return parseInt(item);
            });
            for (var i: number = 0; i < shopVo.length; i++) {
                var obj = { id: i + 1, weight: Number(shopVo[i]) };
                arr.push(obj);
            }
            console.log("arr", arr);
            let beilv = Utils.getRandDataOfWeightObjectList(arr).data.id;
            return beilv;
        }
    }

    //#region  铜钱item

    initGoldItem() {
        this.goldItemList = [];
        for (let i = 0; i <= 2; i++) {

            if (i == 0) {//1号特殊商品
                let shopVo = ConfigMgr.getInstance().getById(30, ShopData).val.split(",");
                let vo = new StoreItemVo(i, parseInt(shopVo[0]), parseInt(shopVo[1]), 10, StoreBuyType.ad);
                this.goldItemList.push(vo);
            } else if (i == 1) {

                let shopVo = ConfigMgr.getInstance().getById(33, ShopData).val.split(",");
                let cost = ConfigMgr.getInstance().getById(32, ShopData).val.split(",").map((item) => {
                    return parseInt(item);
                });
                let vo = new StoreItemVo(i, parseInt(shopVo[0]), parseInt(shopVo[1]), 10, cost[0], cost[1]);
                this.goldItemList.push(vo);
            } else {
                let shopVo = ConfigMgr.getInstance().getById(35, ShopData).val.split(",");
                let cost = ConfigMgr.getInstance().getById(34, ShopData).val.split(",").map((item) => {
                    return parseInt(item);
                });
                let vo = new StoreItemVo(i, parseInt(shopVo[0]), parseInt(shopVo[1]), 10, cost[0], cost[1]);
                this.goldItemList.push(vo);;
            }
        }
    }
    /**重置为可以购买 */
    initFruitStoreItem() {
        this.fruitItemGGNum1 = this.fruitItemGGNum2 = 0;
    }

    getBoxCostByIndexAndNum(index, num) {

    }

    checkRedDot() {
        let result = false;

        if (this.storeBuyNum1 == 0) {
            result = true;
            return result;
        }

        let gold = this.goldItemList[0];
        if (gold?.buyNum == 0) {
            result = true;
            return result;

        }

        let nowTime = new Date().getTime();
        let time = ConfigMgr.getInstance().getById(26, ShopData).val;
        if (nowTime - GameStoreData.getInstance().lastBoxTime >= parseInt(time)) {
            result = true;
        }
        return result;
    }
}
export enum StoreBuyType {
    /**免费 */
    free = -1,
    /**元宝 */
    gold = 1,
    /**灵石 */
    diamond = 2,
    /**广告 */
    ad = 3,
}

/**商品数据 */
export class StoreItemVo {
    /**id index位置,从0~7 */
    index: number;
    /**道具id */
    itemId: number;
    /**道具数量 */
    itemNum: number;
    /**折扣, 5-10 */
    zhekou: number = null;
    /**购买类型 */
    buyType: StoreBuyType;
    /**当天购买次数 */
    buyNum: number;
    /**购买铜钱，钻石花费的数量*/
    costNum?: number


    constructor(index, itemId, itemNum, zhekou, buyType: StoreBuyType, costNum?) {
        this.index = index;
        this.itemId = itemId;
        this.itemNum = itemNum;
        this.zhekou = zhekou;
        this.buyType = buyType;
        this.buyNum = 0;
        if (costNum) {
            this.costNum = costNum;
        }
    }

}


