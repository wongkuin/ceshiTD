import UserVariable, { nonSerialized } from "../../TRFrameWork/cocos-module/component/UserVariable";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ConfigMgr from "../config/ConfigMgr";
import { ClearanceRewardsData, DailyGiftPackData, KvData, OnlineBounsData, PassData } from "../config/DataDef";
import GameUserData from "./GameUserData";
import { ItemVo } from "./UserItemsData";
import { UserKeyType } from "./UserKeyType";

/**限时礼包 */
export default class GameActivityData extends UserVariable<GameActivityData> {


    /**在线礼包领取id表 */
    onlineBounsGetIdList: number[] = [];
    /**在线时长 */
    onlineTime: number = 0;

    /**扫荡领取时间,时间戳 */
    gameGiftGetTime: number = 0;

    /**视频扫荡领取次数 */
    gameGiftGetAdmobNum: number = 0;
    /**视频扫荡刷新时间 */
    gameGiftGetAdmobTimeLast: number = 0;
    /**体力扫荡领取次数 */
    gameGiftGetPhysicNum: number = 0;
    /**体力扫荡刷新时间 */
    gameGiftGetPhysicTimeLast: number = 0;

    /**每日礼包刷新时间 */
    dailyGiftRefreshTime = 1;
    /**当前待领取的编号 */
    dailyGiftIndex = 1;
    /**元宝购买次数 */
    yuanBaoBuyNum = 0;
    /**灵石购买次数 */
    lingShiBuyNum = 0;

    //#region luckDraw
    /**幸运抽奖刷新时间戳毫秒 */
    lastLuckDrawRefreshTime: number = 0;

    /**幸运抽奖最后免费抽奖时间 */
    lastFreeDrawTime = 0;
    /**今日是否免费抽奖 */
    todayFreeDraw: boolean = false;

    /**抽奖次数 */
    drawNum = 0;
    /**领取奖励的最高抽奖值 */
    drawRewardNum = 0;

    /**看了广告但是没领取 */
    //getADButNoAward: boolean = false;
    cardStateList: number[] = [-1, -1, -1, -1, -1];//-1,未抽取，其他是抽取id;


    //神器礼包
    //神器礼包领取时间
    divineWeaponGiftGetTime: number = 0;
    //神器礼包领取次数
    divineWeaponGiftGetNum: number = 0;

    @nonSerialized()
    firstOpenDivineWeaponGift = false;

    //通关奖励领取数组
    passRewardGetList: number[] = [];




    constructor() {
        super(UserKeyType.GameActivityData, true);
    }

    protected init(first: boolean): void {
        if (this.gameGiftGetTime == 0) {
            this.gameGiftGetTime = Date.now();
        }

        if (this.dailyGiftRefreshTime == 0) {
            this.dailyGiftRefreshTime = Date.now();
            this.dailyGiftIndex = 1;
        }

        this.resetLuckDrewData();
    }

    checkDailyGiftRedDot() {
        let data = ConfigMgr.getInstance().getAll(DailyGiftPackData);
        let result = false;
        for (let i = 0; i < data.length; i++) {
            if (data[i].id >= this.dailyGiftIndex && data[i].cost == 0) {
                result = true;
                break;
            }
        }
        return result;
    }

    checkDailyGiftRefresh() {
        if (!Utils.isSameDay(this.dailyGiftRefreshTime, new Date().getTime())) {
            this.dailyGiftRefreshTime = Date.now();
            this.dailyGiftIndex = 1;
            this.yuanBaoBuyNum = 0;
            this.lingShiBuyNum = 0;
        }
    }

    checkGiftGetNum() {
        if (!Utils.isSameDay(this.gameGiftGetAdmobTimeLast, new Date().getTime())) {
            this.gameGiftGetAdmobNum = 0;
            this.gameGiftGetPhysicNum = 0;
            this.gameGiftGetAdmobTimeLast = new Date().getTime();
            this.gameGiftGetPhysicTimeLast = new Date().getTime();
        }
    }



    addOnlineBounsId(id: number) {
        this.onlineBounsGetIdList.push(id);
    }

    OnlineBounsRedDot() {
        let result = false;
        let data = ConfigMgr.getInstance().getAll(OnlineBounsData);
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (this.onlineTime >= (element.time / 1000) && this.onlineBounsGetIdList.indexOf(element.id) == -1) {
                result = true;
                break;
            }
        }
        return result;
    }

    //-------------------------------------在线时间奖励相关----------------

    getGameTimeAward(): ItemVo[] {
        let result: ItemVo[] = [];
        let lv = GameUserData.getInstance().lastPassLv;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        let item1 = new ItemVo(1, 0);
        let item2 = new ItemVo(2, 0);
        let item3 = new ItemVo(passVo.drop3Vi[0], 0);
        let timeCha = (new Date().getTime() - this.gameGiftGetTime) / 1000 / 3600;//小时
        let maxTime = parseInt(ConfigMgr.getInstance().getById(7, KvData).val);
        timeCha = Math.min(timeCha, maxTime);
        let ybNum = Math.floor(timeCha * passVo.item1);
        let lsNum = Math.floor(timeCha * passVo.item2);
        let spNum = Math.floor(timeCha * passVo.drop3Vi[1]);
        item1.num = ybNum;
        item2.num = lsNum;
        item3.num = spNum;
        result.push(item1);
        result.push(item2);
        result.push(item3);

        return result;

    }

    //-------------------------------------luckDraw相关----------------

    resetLuckDrewData() {
        let nowTime = new Date().getTime();

        if (!this.isSameDay(nowTime, this.lastFreeDrawTime)) {
            this.lastFreeDrawTime = nowTime;
            this.todayFreeDraw = true;
        }
        if (this.isSameWeek(nowTime, this.lastLuckDrawRefreshTime)) {
            return;
        }
        this.drawNum = 0;
        this.drawRewardNum = 0;
        this.lastLuckDrawRefreshTime = nowTime;
        this.resetStateList();
    }
    resetStateList() {
        this.cardStateList = [-1, -1, -1, -1, -1];
    }

    isSameDay(timestamp1: number, timestamp2: number): boolean {
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);

        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    /**
    * 判断两个时间戳是否属于同一周（周一为一周的第一天）
    */
    isSameWeek(timestamp1: number, timestamp2: number): boolean {
        // 获取时间戳对应的周一 0 点的时间戳
        const getMondayMidnight = (timestamp: number): number => {
            const date = new Date(timestamp);
            const day = date.getDay(); // 0（周日）到 6（周六）
            const diff = day === 0 ? 6 : day - 1; // 计算距离周一的天数（周一为0，周日为6）
            date.setDate(date.getDate() - diff); // 调整到周一
            date.setHours(0, 0, 0, 0); // 归零时间
            return date.getTime();
        };

        return getMondayMidnight(timestamp1) === getMondayMidnight(timestamp2);
    }

    checkLuckDrawRedDot(): boolean {
        if (this.todayFreeDraw) {
            return true;
        }
        let progressCfg = ConfigMgr.getInstance().getById(40, KvData).val.split(",").map((item) => {
            return parseInt(item);
        });

        let drawRewardNum = this.drawRewardNum;
        let drawNum = this.drawNum;
        for (let i = 0; i < progressCfg.length; i = i + 3) {
            if (drawNum >= progressCfg[i] && drawRewardNum < progressCfg[i]) {
                return true;
            }
        }
        return false;
    }
    //--------------------------------------通关奖励相关-------------------------------------
    addPassRewardGetId(id: number) {
        this.passRewardGetList.push(id);
    }

    getCurPassId() {
        let lv = GameUserData.getInstance().lastPassLv;
        let id = 1;
        let maxId = ConfigMgr.getInstance().getAll(ClearanceRewardsData).length;
        for (let i = 0; i < lv; i++) {
            if (this.passRewardGetList.indexOf(i + 1) == -1) {
                id = i + 1;
                break;
            }
        }
        id = Math.min(id, maxId);
        return id;
    }

    getPassRewardList(): ItemVo[] {
        let result: ItemVo[] = [];
        let id = this.getCurPassId();
        if (id == -1) {
            return result;
        }
    }

    getPassRewardRedDot(): boolean {
        let result = false;
        let dataList = ConfigMgr.getInstance().getAll(ClearanceRewardsData);
        for (let i = 0; i < dataList.length; i++) {
            if (GameUserData.getInstance().lastPassLv - 1 >= dataList[i].unlock && this.passRewardGetList.indexOf(dataList[i].id) == -1) {
                result = true;
                break;
            }
        }
        return result;
    }



}

