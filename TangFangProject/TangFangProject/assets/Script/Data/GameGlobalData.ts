import UserVariable, { nonSerialized } from "../../TRFrameWork/cocos-module/component/UserVariable";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import GameControl from "../Battle/GameControl";
import ConfigMgr from "../config/ConfigMgr";
import { KvData, PassData } from "../config/DataDef";
import GameUserData from "./GameUserData";
import { ItemVo } from "./UserItemsData";
import { UserKeyType } from "./UserKeyType";


interface StarRecord {
    /**章节id */
    id: number;
    /**星级评分 */
    star: number;

}
/**扫荡记录 */
export interface SaoDangVo {
    //关卡id
    passId: number;
    //扫荡次数
    sdNum: number;
}


export type GDailyData = {
    day: string;
    gem_energy: number;
    video_energy: number;
    bonus_add: number;
}
/**游戏全局数据 */
export default class GameGlobalData extends UserVariable<GameGlobalData> {


    constructor() {
        super(UserKeyType.GameGlobalData, true);
    }

    /** 是否初始化了数据保存常驻节点 */
    @nonSerialized()
    isInitSaveDataNode: boolean = false;

    isShowBox = false;

    /**第一次乘员抽奖引导是否完成 */
    firstCrewDrewGiudeFinish = false;

    /**第一次武器抽奖引导是否完成 */
    firstConnonDrewGiudeFinish = false;

    /**第一次乘员上场引导是否完成 */
    firstCrewFightGiudeFinish = false;

    /**游戏评分记录 */
    starRecord: StarRecord[] = [];


    /**更换过大炮 */
    hasChangeCannon: boolean = false;


    /**多倍领取结束时间戳，秒 */
    multipleGetEndTime: number = 0;


    /**当前挑战关卡id */
    @nonSerialized()
    tiaoZhanId: number;

    /**打开引导 */
    @nonSerialized()
    openGuide: boolean = true;



    /**挑战次数表 */
    tianzhanList = {}

    /**挑战时间 */
    tianzhanTime: number = 0;

    /**挑战模式isNew */
    isOpenTiaozhao3: boolean = false;
    /**挑战模式isNew */
    isOpenTiaozhao7: boolean = false;

    /**最后一次机械臂领取物资的时间 */
    lastGetAwardTime = 0;

    /**离线收益,暂存,可能多次未领 */
    waitGetAwardOffLine: ItemVo[] = [];


    /**背景音乐开关 */
    musicEnabled: boolean = true;

    /**音效开关 */
    effectEnabled: boolean = true;

    /**震动开关 */
    shockEnabled: boolean = true;

    //#region  新增邀请抽奖
    /**邀请抽奖剩余次数 */
    inviteDrewNum: number = 0;

    /**看广告抽奖次数,待领取 */
    getDrewNumByAD: number = 0;

    /**看广告的时间戳，毫秒 */
    inviteADTime: number = 0;

    /**分享抽奖次数  */
    getDrewNumByShare: number = 0;

    /**分享的时间戳，毫秒 */
    shareTime: number = 0;

    /**点击过二倍速按钮 */
    clickSpeedBtn: boolean = false;


    noOpenPrivacyInfoUI = false;

    agreePrivacy: boolean = false;
    /**插屏广告时间 */
    InterstitialTime: number = 0;
    /**插屏广告计数，每天5 */
    interstitialTodayNum = 0;

    /**今日扫荡次数 */
    saodangListToday: SaoDangVo[] = [];
    /**扫荡时间 */
    saodangTime: number = 0;


    /**每日数据 */
    dailyData: GDailyData = null;
    /**任务状态，true展开，false收缩 */
    taskUIState: boolean = true;
    /**二倍速战斗广告次数，10次永久解锁 */
    speedX2ADNum = 0;






    /**当前总dsp */
    //  @nonSerialized()
    //  curTotalDSP

    /**当前总dsp */
    @nonSerialized()
    // lastTotalDSPTime

    refreshInviteTime() {
        let time = new Date().valueOf();
        let isSameDay = Utils.isSameDay(this.inviteADTime, time);
        if (!isSameDay) {
            this.getDrewNumByAD = 0;
        }

        let isSameDay1 = Utils.isSameDay(this.shareTime, time);
        if (!isSameDay1) {
            this.getDrewNumByShare = 0;
        }

    }

    checkSaodang() {
        let time = new Date().valueOf();
        let isSameDay = Utils.isSameDay(this.saodangTime, time);
        if (!isSameDay) {
            this.saodangListToday = [];
            this.saodangTime = time;
        }
    }

    /**
     * 根据passId获取对应的扫荡奖励信息
     * @param passId 要查询的passId
     * @returns 返回匹配的SaoDangVo对象，如果没有找到则返回null
     */
    getSaoDangVoById(passId): SaoDangVo {
        let vo = { passId: passId, sdNum: 0 };  // 初始化返回值为null
        // 遍历今日扫荡列表
        for (let i = 0; i < this.saodangListToday.length; i++) {
            // 检查当前记录的passId是否与传入的passId匹配
            if (this.saodangListToday[i].passId == passId) {
                // 找到匹配项，将其赋值给vo并跳出循环
                vo = this.saodangListToday[i];
                break;
            }
        }
        // 返回找到的奖励记录或null
        return vo;
    }

    /**
     * 根据关卡ID增加扫荡次数
     * @param passId 关卡ID
     */
    addSaoDangNumByPassId(passId: number) {
        // 检查扫荡功能是否可用
        this.checkSaodang();
        // 根据passId获取扫荡数据对象
        let vo = this.getSaoDangVoById(passId);
        if (vo.sdNum > 0) {
            // 如果对象存在，增加扫荡次数
            vo.sdNum++;
        } else {
            // 如果对象不存在，创建新的扫荡记录并添加到今日扫荡列表
            this.saodangListToday.push({ passId: passId, sdNum: 1 });
        }
        // 更新扫荡时间为当前时间戳
        this.saodangTime = new Date().valueOf();
    }


    init(first) {
        if (this.lastGetAwardTime == 0) {
            this.lastGetAwardTime = Utils.getNowSecondTime();
        }
    }

    checkInterstitial() {
        let time = new Date().valueOf();
        let isSameDay = Utils.isSameDay(this.InterstitialTime, time);
        if (!isSameDay) {
            this.interstitialTodayNum = 0;
        }
    }
    /**检查能不能播放插屏广告 */
    checkCanPlayInterstitial() {
        this.checkInterstitial();

        if ((GameUserData.getInstance().curChapterId >= 2) && (this.interstitialTodayNum <= 5)) {
            let time = new Date().valueOf();
            if (time - this.InterstitialTime >= 60 * 1000) {
                return true;
            }
        }
        return false;

    }

    addInterstitialNum() {
        this.interstitialTodayNum++;
        let time = new Date().valueOf();
        this.InterstitialTime = time;

    }
    /**更新最后领取物资时间 */
    refreshLastGetAwardTime() {
        this.lastGetAwardTime = Utils.getNowSecondTime();
    }


    waitGetOffLine(addAward: ItemVo[]) {
        for (let i = 0; i < addAward.length; i++) {
            let value = addAward[i];
            let has = false;
            this.waitGetAwardOffLine.forEach((ItemVo) => {
                if (!ItemVo.num) {
                    ItemVo.num = 0;
                }
                if (ItemVo.itemID == value.itemID) {
                    ItemVo.num += value.num;
                    has = true;
                }

            })
            if (!has) {
                this.waitGetAwardOffLine.push(value);
            }
        }
        /**最大累计限制 */
        let val = ConfigMgr.getInstance().getById(63, KvData).val.split("|");

        // {itemID: 1, num: 79170}
        // {itemID: 2, num: 126750}
        // {itemID: 3, num: 47580}
        let maxMultTime = parseInt(val[0]);
        let maxNormalTime = parseInt(val[1]);
        let maxAward = this.calculateRevenue(1, maxMultTime, maxNormalTime);
        for (let i = 0; i < maxAward.length; i++) {
            let maxValue = maxAward[i];

            this.waitGetAwardOffLine.forEach((ItemVo) => {
                if (ItemVo.itemID == maxValue.itemID) {
                    ItemVo.num = Math.min(ItemVo.num, maxValue.num);
                }
            })

        }
    }
    /**计算离线收益
     * type 1:离线收益，2：战斗收益
     * 
     */
    // - 某种资源的产量=(INT(多倍拾取覆盖的离线时间/A)*C+INT(无多倍拾取覆盖的离线时间/A))*B*D/3
    // - A=补给包出现所需时间间隔，从【补给包出现规则】公式获取
    // - B=某种资源在补给包中产出的数量，从【补给包产出规则】公式获取，3种资源各有对应的B值
    // - C=多倍拾取的倍率，从常数表获取(ID=62)
    // - D=离线收益修正，从常数表获取(ID=61)
    //   - D有两个值，一个对应战斗中的值，一个对应游戏关闭时的值
    // - 多倍拾取覆盖的离线时间 和 无多倍拾取覆盖的离线时间 均存在累积上限，从常数表获取(ID=63)
    calculateRevenue(type: 1 | 2, multTime = 0, normalTime = 0): ItemVo[] {
       
        return [];
    }
    
    /**获取某个关卡挑战次数 */
    getTiaoZhanNum(id) {
        let time = new Date().valueOf();
        let isSameDay = Utils.isSameDay(this.tianzhanTime, time);
        if (!isSameDay) {
            this.tianzhanTime = time;
            this.tianzhanList = {};
        }
        return this.tianzhanList[id] || 0;
    }

    /**设置某个关卡挑战次数+1 */
    setTiaozhanNumById(id) {
        let time = new Date().valueOf();
        let isSameDay = Utils.isSameDay(this.tianzhanTime, time);
        if (!isSameDay) {
            this.tianzhanList = {};
        }
        this.tianzhanTime = time;

        if (this.tianzhanList[id]) {
            this.tianzhanList[id]++;
        } else {
            this.tianzhanList[id] = 1;
        }
    }

    public clearTianZhanList() {
        this.tianzhanTime = 0;
    }

    /**
     * 设置关卡评分星级，已经内部处理是否更新数据
     * @param id 对应章节表id
     * @param starNum  对应评分
     */
    setStarRecord(id: number, starNum: number) {
        let info = this.getStarRecord(id);
        if (info) {
            if (info.star < starNum) {
                info.star = starNum;
            }
        } else {
            this.starRecord.push({ id: id, star: starNum })
        }

    }
    /**得到关卡评分数据 */
    getStarRecord(id): StarRecord {

        let info = null;
        for (let i = 0; i < this.starRecord.length; i++) {
            if (this.starRecord[i].id == id) {
                info = this.starRecord[i]
            }
        }
        return info;
    }


    /**得到本章节总星数 */
    /**
     * 根据章节ID获取该章节所有关卡的总星数
     * @param chapterId 章节ID
     * @returns 返回该章节所有关卡的总星数
     */
    // getTotalStarByChapterId(chapterId): number {
    //     // 从配置管理器中获取所有PassData数据，并过滤出属于指定章节的数据
    //     let list = ConfigMgr.getInstance().getAll(PassData).filter((vo) => {
    //         return vo.chapterId == chapterId;
    //     });

    //     let totalStar = 0;
    //     // 遍历该章节的所有关卡
    //     list.forEach((data) => {
    //         // 获取每个关卡的星数记录，如果没有记录则默认为0
    //         let star = this.getStarRecord(data.id)?.star || 0;
    //         // 累加星数
    //         totalStar += star;
    //     })
    //     // 返回总星数
    //     return totalStar;

    // }

    public getDailyData(): GDailyData {
        if (!this.dailyData || this.dailyData.day != Utils.formatDateToYYYYMMDD(new Date())) {
            this.dailyData = this.defGdailyData();
        }
        return this.dailyData;
    }

    public addDailyGemEnergy(num = 1) {
        this.getDailyData().gem_energy += num;
        this.save();
    }

    public addDailyVideoEnergy(num = 1) {
        this.getDailyData().video_energy += num
        this.save();
    }


    /**
     * 添加每日奖励加成
     * @param num 加成的数值，默认为1
     */
    public addDailyBonusAdd(num = 1) {
        // 获取每日数据并将奖励加成增加指定数值
        this.getDailyData().bonus_add += num
        // 保存更改后的数据
        this.save();
    }

    protected defGdailyData(): GDailyData {
        return {
            day: Utils.formatDateToYYYYMMDD(new Date()),
            gem_energy: 0,
            video_energy: 0,
            bonus_add: 0,
        }
    }

}
