

import UserVariable, { nonSerialized } from "../../TRFrameWork/cocos-module/component/UserVariable";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import PlatformMgr, { PlatformEvent } from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import ConfigMgr from "../config/ConfigMgr";
import { KvData, PassData, TalentData } from "../config/DataDef";
import ApiMgr from "../Mgr/ApiMgr";
import GameHelp from "../Mgr/GameHelp";
import { UserKeyType } from "./UserKeyType";

//肥料（置换【零件】）、零食（置换【食物】）、木头（置换【金属】）、宝石（置换【瓶盖】）
export default class GameUserData extends UserVariable<GameUserData> {
    lingshi: number = 300;    // 灵石
    yuanbao: number = 300;      // 元宝
    breakthrough: number = 0;    // 突破丹
    ticketAD: number = 0;   // 免广
    tongqian: number = 0;//铜钱
    water: number = 0;//水
    plantHeart: number = 0;//后勤宝石
    lockingCard: number = 0;//锁定卡

    energy: number = 0;     // 能量,体力

    /**当前解锁武器槽位数量 */
    curSlotNum: number = 4;

    adTimes: number = 0;    // 广告次数

    lastPassLv: number = 1;    // 最大普通通关值

    sideBarReward: number = 0;    // 侧边栏奖励次数
    sideBarReceiveNow: number = 0;    // 侧边栏奖励时间
    @nonSerialized()
    energyCDStartTime: number = 0;    // 体力CD开始时间

    passLV: number[] = [];    // 通关值
    guideVideoFlag: boolean = false; // 战旗视频按钮引导完成
    isMusic: boolean = true;    // 音乐开关
    isSound: boolean = true;    // 音效开关
    version: string = "0.0.0";    // 版本号
    openFunctionPop: boolean = false;//功能解锁
    /**玩家挑战当前最新的未通关过的关卡时,最后两次战斗结果记录,0没通过，1通过 */
    resultsOfLastTwoBattles: number[] = [];
    /**解锁进度动画*/
    @nonSerialized()
    showUnlockProgressAni = false;
    /**广告关卡总数，累计，不删减 */
    adWatchedCount: number = 0;
    /**回馈普通礼包领取记录 */
    feedBackList: number[] = [];
    /**回馈广告礼包领取记录 */
    feedBackADList: number[] = [];

    /**关卡基金领取记录 */
    fundList: number[] = [];
    /**关卡基金广告领取记录 */
    fundADList: number[] = [];

    //------------------------------新------------------
    //当前章节
    curChapterId: number = 1;
    /**当前小关卡 */
    curLevelId: number = 1;
    /**每一关卡奖励记录 */
    passAwardRecord: PassAwardVo[] = [];


    private _endGuide: number[] = []; //结束引导的id

    //----天赋---
    /**血量天赋等级 */
    talentHpLv = 0;
    /**攻击天赋等级 */
    talentAtkLv = 0;
    /**防御天赋等级 */
    talentSpLv = 0;
    /**突破丹等级 */
    breakthroughLv = 0;


    //----新手引导---
    fightGuide1 = false;
    fightGuide2 = false;

    //----保存用户UID----
    GAME_UID: string = "GAME_UID";
    GAME_NAME: string = "GAME_NAME";
    GAME_PASS_ID: string = "GAME_PASS_ID";
    GAME_SER: string = "GAME_SER";//AppSec
    GAME_COMMON_UID: string = "GAME_COMMON_UID";
    //排行榜通关ID
    PASS_ID: number = 0;
    //绑定的内容id
    BIND_UID_NAME_MAP = {}

    constructor() {
        super(UserKeyType.GameUserData, true);
    }

    setFightGuide1() {
        this.fightGuide1 = true;

    }

    setFightGuide2() {
        this.fightGuide2 = true;

    }

    checkNeedFightGuide1(waves) {
        if (this.lastPassLv == 1 && waves == 0) {
            return true;
        }
        return false
    }

    checkNeedFightGuide2(waves) {
        if (this.lastPassLv == 1 && waves == 1) {
            return true;
        }
        return false
    }

    protected init(firist: boolean) {
        PlatformMgr.instance.on(PlatformEvent.VideoReward, this.onVideoShowing, this);
        // this.lastPassLv = 60;
        //this.talentHpLv = 48;
        this.reSetChapterIdAndLevel();

        let autoNum = parseInt(ConfigMgr.getInstance().getById(33, KvData).val);
        this.curSlotNum = Math.max(autoNum, this.curSlotNum);

        if (firist) {
            let autoCfg = ConfigMgr.getInstance().getById(37, KvData).val.split(",").map((v) => {
                return parseInt(v);
            })
            for (let i = 0; i < autoCfg.length; i = i + 2) {
                if (autoCfg[i] == 1) {
                    this.yuanbao = autoCfg[i + 1];
                }
                if (autoCfg[i] == 2) {
                    this.lingshi = autoCfg[i + 1];
                }
            }

            this.energy = this.energyMaxValue();
        } else {
            /**每次重新登录，都走一遍关卡数更新的逻辑,看是否有关卡更新 */
            if (this.passLV.indexOf(this.lastPassLv) >= 0) {
                this.checkNewLv();
            }
        }

        this.newVersion(PlatformMgr.instance.adConfig.gameVer, PlatformMgr.instance.adConfig.svnVer);
        let maxLv = Math.max(this.talentHpLv, this.talentAtkLv, this.talentSpLv);
        this.breakthroughLv = Math.max(ConfigMgr.getInstance().getById(maxLv, TalentData, "lv").breakLv, this.breakthroughLv);


        // 尝试根据上次记录的 energyCDStartTime 恢复体力（如果有间隔时间经过）
        this.getEnergyCDSecond();



        // GameChaptMgr.getInstance().init(this.curChapterId);
    }

    /**通关,关卡数加1 */
    checkNewLv() {
        // let pData = this.getcurPassData();
        // if (pData && pData.nextLv > 0) {
        //     this.setNewPass(pData.nextLv);
        // }

        console.log("当前章节:", this.curChapterId, this.curLevelId)
    }


    /**得到当前正在公关的关卡信息 */
    getcurPassData(): PassData {
        // let list = ConfigMgr.getInstance().getAll(PassData).filter((vo) => {
        //     return vo.chapterId == this.curChapterId && vo.type == 0;
        // });
        // for (let vo of list) {
        //     if (vo.passId == this.curLevelId) {
        //         return vo;
        //     }
        // }
        let pData = ConfigMgr.getInstance().getById(this.lastPassLv, PassData);
        return pData;


    }

    onVideoShowing() {
        this.adTimes += 1;
        this.save();
    }

    public addTicketAD(num) {
        this.ticketAD += num;
        this.save();
    }

    public useTicketAD() {

        this.ticketAD -= 1;
        this.save();
    }
    /**记录战斗结果,0失败，1胜利 */
    recordResultOfBattle(result: 0 | 1) {
        if (this.resultsOfLastTwoBattles.length >= 2) {
            this.resultsOfLastTwoBattles[0] = this.resultsOfLastTwoBattles[1];
            this.resultsOfLastTwoBattles[1] = result;
        } else {
            this.resultsOfLastTwoBattles.push(1)
        }
    }

    /**检查最后两次的战斗结果，0失败两次,1正常，2胜利两次 */
    checkRecordResultState(): 0 | 1 | 2 {
        if (this.resultsOfLastTwoBattles.length < 2) {
            return 1;
        }

        if (this.resultsOfLastTwoBattles[0] == 0 && this.resultsOfLastTwoBattles[1] == 0) {
            return 0;
        }
        if (this.resultsOfLastTwoBattles[0] == 1 && this.resultsOfLastTwoBattles[1] == 1) {
            return 2;
        }
        return 1;
    }



    public changeDiamond(num) {
        // this.diamond += num;
        this.save();
    }

    public changeEnergy(num) {
        this.energy += num;
        if (this.energy < this.energyMaxValue()) {
            if (this.energyCDStartTime == 0) {
                this.energyCDStartTime = Utils.getNowSecondTime();
            }
        }
        this.save();
    }

    // 最大体力值
    public energyMaxValue(): number {
        //最大体力值
        if (GameHelp.energy_max == 0) {
            GameHelp.energy_max = parseInt(ConfigMgr.getInstance().getById(72, KvData).val);
        }
        return GameHelp.energy_max;
    }

    public getEnergyCDSecond(): number {
        if (this.energy >= this.energyMaxValue()) {
            return 0;
        }

        let space = parseInt(ConfigMgr.getInstance().getById(71, KvData).val) / 1000;
        let cdTime = this.energyCDStartTime + space - Utils.getNowSecondTime();
        if (cdTime < 0) {
            if (Math.abs(cdTime) > space) {
                let add = Math.floor(Math.abs(cdTime) / space);
                if (this.energy < this.energyMaxValue()) {
                    this.energy += add;
                    if (this.energy > this.energyMaxValue()) {
                        this.energy = this.energyMaxValue();
                        this.energyCDStartTime = 0;
                    } else {
                        this.energyCDStartTime = Utils.getNowSecondTime() + Math.abs(cdTime) % space - space;
                        cdTime = space - Math.abs(cdTime) % space;
                    }
                }
            } else {
                this.energyCDStartTime = Utils.getNowSecondTime();
                this.changeEnergy(1);
            }
        }
        return cdTime;
    }

    /**
     * 尝试消耗体力，成功返回 true，失败返回 false（不会改变状态）
     */
    public tryConsumeEnergy(num: number, isCost: boolean = true): boolean {
        if (this.energy >= num) {
            if (isCost) {
                this.changeEnergy(-num);
            }
            return true;
        }
        return false;
    }

    /**
     * 是否有足够体力
     */
    public hasEnoughEnergy(cost: number): boolean {
        return this.energy >= cost;
    }

    public isFirstPass(pID: number) {
        if (this.passLV.indexOf(pID) >= 0) {
            return false;
        } else {
            this.passLV.push(pID);
            return true;
        }
    }

    public setNewPass(pID: number) {
        if (pID <= 0) { return; }
        // if (pID <= this.lastPassLv) { return; }
        let cfg = ConfigMgr.getInstance().getById(pID, PassData);
        if (!cfg) {
            return;
        }
        this.lastPassLv = pID;
        // this.reSetSlotNum();
        this.reSetChapterIdAndLevel();
        this.save();
    }

    reSetSlotNum() {
        //    let autoNum=  parseInt(ConfigMgr.getInstance().getById(33,KvData).val);
        // let lockCfg = ConfigMgr.getInstance().getById(34,KvData).val.split(",").map((item)=>{
        //     return parseInt(item);
        // })
        // lockCfg.forEach((item)=>{
        //     if(this.lastPassLv>item){
        //         autoNum++;
        //     }
        // })
        //  this.curSlotNum = autoNum;
    }

    /**
     * 设置当前章节id by lastPassLv
     */
    reSetChapterIdAndLevel() {
        // let passVo: PassData = ConfigMgr.getInstance().getById(this.lastPassLv, PassData);
        // this.curChapterId = passVo.chapter;
        // this.curLevelId = passVo.id;
        // GameChaptMgr.getInstance().init(this.curChapterId);
    }

    public newVersion(version: string, svnVer: number) {
        // TODO something
        console.log("Version", this.version, version, svnVer);
        this.version = version + "." + svnVer;
        // this.save();
    }


    /**根据配置id给货币加数量 */
    public addItemNumById(id, num) {
        // if (id < 1 || id > 4) {
        //     return;
        // }
        //      lingshi: number = 250;    // 灵石
        // yuanbao: number = 250;      // 元宝

        // ticketAD: number = 0;   // 免广
        // tongqian:number = 0;//铜钱
        num = Math.floor(num);
        switch (id) {
            case 1:
                this.yuanbao += num;
                break;
            case 2:
                this.lingshi += num;
                break;
            case 3:
                this.ticketAD += num;
                break;
            case 4:
                this.tongqian += num;
                break;
            case 169:
                this.breakthrough += num;
                break;

        }
    }

    /**根据配置id得到货币数量 */
    public getItemNumById(id) {
        switch (id) {
            case 1:
                return this.yuanbao;
            case 2:
                return this.lingshi;
            case 3:
                return this.ticketAD;
            case 40:
                return this.tongqian;
            case 169:
                return this.breakthrough;

        }
    }

    /**检查是否新增槽位 */
    checkHasAddSlotNum() {
        // if (this.curSlotNum >= 8) {
        //     return;
        // }
        // let cfg = ConfigMgr.getInstance().getById(24, KvData).val.split(",").map((value) => {
        //     return parseInt(value);
        // })

        // cfg.forEach((value, index) => {
        //     if (index == 0) {
        //         if (this.lastPassLv > value) {
        //             this.curSlotNum = Math.max(this.curSlotNum, 7);
        //         }

        //     }
        //     if (index == 1) {
        //         if (this.lastPassLv > value) {
        //             this.curSlotNum = Math.max(this.curSlotNum, 8);
        //         }

        //     }
        // })

    }

    /**检查某个编号的回馈礼包全部领取，普通和广告同时领取才是true */
    checkFeedBackReceivedByIndex(id) {
        let result = false;
        let hasNormal = this.feedBackList.indexOf(id) >= 0;
        let hasAD = this.feedBackADList.indexOf(id) >= 0;

        result = hasNormal && hasAD;
        return result;

    }
    checkFreebackRedDot() {
        // let allCfg = ConfigMgr.getInstance().getAll(AdvFeedbackData);
        // let result = false;
        // for (let i = 0; i < allCfg.length; i++) {
        //     if (this.adWatchedCount >= allCfg[i].adv && this.feedBackList.indexOf(allCfg[i].id) == -1) {
        //         result = true;
        //         break;
        //     }
        // }
        // return result;
        return false; //TODO
    }
    checkFreebackBtnActive() {
        // let length = ConfigMgr.getInstance().getAll(AdvFeedbackData).length;
        // return !(this.feedBackList.length == length && this.feedBackADList.length == length);
        return false; //TODO
    }


    /**检查某个编号的回馈礼包全部领取，普通和广告同时领取才是true */
    checkFundReceivedByIndex(id) {
        let result = false;
        let hasNormal = this.fundList.indexOf(id) >= 0;
        let hasAD = this.fundADList.indexOf(id) >= 0;

        result = hasNormal && hasAD;
        return result;

    }
    checkFundRedDot() {
        // let allCfg = ConfigMgr.getInstance().getAll(StageFundData);
        // let result = false;
        // for (let i = 0; i < allCfg.length; i++) {
        //     if ((this.lastPassLv - 1) >= allCfg[i].stage && this.fundList.indexOf(allCfg[i].id) == -1) {
        //         result = true;
        //         break;
        //     }
        // }
        // return result;
        return false; //TODO
    }
    checkFundBtnActive() {
        // let length = ConfigMgr.getInstance().getAll(StageFundData).length;
        // return !(this.fundList.length == length && this.fundADList.length == length);
    }

    /**
     * 设置记录通过某一关卡波次奖励数据
     * @param passId - 通过ID
     * @param boCi - 波次数
     */
    setPassAwardRecord(passId, boCi) {
        // 首先尝试通过ID获取已有的奖项记录
        let vo = this.getPassAwardById(passId);
        if (vo) {
            if (vo.boCi < boCi) {
                vo.boCi = boCi;
            } else {
                return;
            }
        } else {
            this.passAwardRecord.push({ passId: passId, boCi: boCi, getAwardIndex: [] });
        }
        if (passId >= this.lastPassLv - 1) {
            let data = ConfigMgr.getInstance().getById(passId, PassData);
            if (data.type == 0) {//普通模式才上报
                let ext = {
                    maxLv: passId + "",
                    boci: boCi + "",
                }
                let score = passId * 10000 + boCi
                ApiMgr.getInstance().UpdateRankInfo("square_def_score", score, ext)
                // console.warn("上报排行榜数据：", passId, boCi);
            } else {
                // 世界boss
                //TODO
                // let ext = {
                //     xx: passId + "",
                // }
                // let score = passId * 10000 + boCi
                // ApiMgr.getInstance().UpdateRankInfo("square_def_world", score, ext)
            }
        }
    }

    /**
     * 添加领奖索引
     * @param passId 通行证ID
     * @param index 奖励索引，可以是0、1或2
     */
    addGetAwardIndex(passId, index: 0 | 1 | 2) {
        // 根据通行证ID获取奖励对象
        let vo = this.getPassAwardById(passId);
        // 检查奖励对象是否存在
        if (vo) {
            // 检查当前索引是否已存在于领奖索引数组中
            if (vo.getAwardIndex.indexOf(index) == -1) {
                // 如果索引不存在，则将其添加到领奖索引数组中
                vo.getAwardIndex.push(index);
            }
        }
    }

    /**
     * 根据通行证ID获取通行证奖励信息
     * @param passId 通行证ID
     * @returns 返回对应的PassAwardVo对象，如果未找到则返回null
     */
    getPassAwardById(passId): PassAwardVo {
        let vo = null; // 刔回结果，默认为null
        // 遍历通行证奖励记录数组
        for (let i = 0; i < this.passAwardRecord.length; i++) {
            // 检查当前记录的passId是否与传入的passId匹配
            if (this.passAwardRecord[i].passId == passId) {
                // 找到匹配项，将其赋值给vo并跳出循环
                vo = this.passAwardRecord[i];
                break;
            }
        }
        if (vo == null) {
            vo = { passId: passId, boCi: 0, getAwardIndex: [] };
            this.passAwardRecord.push(vo);
        }
        // 返回找到的奖励记录或null
        return vo;
    }

    /**
     * 左边是否有未领取红点
     * @param passId 
     * @returns 
     */
    /**
     * 检查指定关卡左侧是否有可领取的奖励红点
     * @param passId 当前关卡ID
     * @returns 返回是否存在可领取的奖励红点
     */
    checkPassAwardRedDotByLeft(passId: number) {
        let result = false; // 初始化结果为false
        // 从当前关卡的前一个关卡开始，向前遍历所有关卡
        for (let i = passId - 1; i > 0; i--) {
            // 获取用户当前关卡的奖励数据
            let passAwardVo = GameUserData.getInstance().getPassAwardById(i);
            // 获取当前关卡的配置数据
            let passVo: PassData = ConfigMgr.getInstance().getById(i, PassData);
            // 获取当前打卡次数，如果不存在则默认为0
            let boci = passAwardVo?.boCi || 0;
            // 遍历当前关卡的三个奖励等级
            for (let k = 1; k <= 3; k++) {
                // 检查打卡次数是否达到领取条件，且该奖励尚未被领取
                if (boci >= passVo[`bouns${k}Condition`] && passAwardVo && passAwardVo?.getAwardIndex.indexOf((k - 1)) == -1) {
                    result = true; // 设置结果为true，表示有可领取的奖励
                    break; // 找到第一个可领取的奖励后即退出循环
                    //可以领取
                }
            }
        }
        return result; // 返回检查结果
    }

    checkPassAwardRedDotByRight(passId: number) {
        let result = false;
        for (let i = passId + 1; i < this.lastPassLv; i++) {
            let passAwardVo = GameUserData.getInstance().getPassAwardById(i);
            // 获取当前关卡的配置数据
            let passVo: PassData = ConfigMgr.getInstance().getById(i, PassData);
            // 获取当前打卡次数，如果不存在则默认为0
            let boci = passAwardVo?.boCi || 0;
            for (let k = 1; k <= 3; k++) {
                if (boci >= passVo[`bouns${k}Condition`] && passAwardVo && passAwardVo?.getAwardIndex.indexOf((k - 1)) == -1) {
                    result = true;
                    break;
                    //可以领取
                }
            }
        }
        return result;
    }

    // 完成 引导
    public finishGuide(id: number) {
        this._endGuide.push(id);
        this.save();
    }

    public isFinishGuide(id: number) {
        return this._endGuide.indexOf(id) >= 0;
    }

    getUserTalentAttrList() {
        let totalHp = 0, totalAtk = 0, totalAtkNum = 0, totalSp = 0;
        ConfigMgr.getInstance().getAll(TalentData).forEach((data) => {
            if (data.lv <= GameUserData.getInstance().talentHpLv) {
                totalHp += data.hp;
            }
            if (data.lv <= GameUserData.getInstance().talentAtkLv) {
                if (data.atk[0] == 0) {
                    totalAtkNum += data.atk[1];
                }
                if (data.atk[0] == 1) {
                    totalAtk += data.atk[1];
                }
            }
            if (data.lv <= GameUserData.getInstance().talentSpLv) {
                totalSp += data.sp;
            }
        })
        return [totalHp, totalAtk, totalSp, totalAtkNum];


    }

    checkTalentRedDot() {
        let result = false;
        for (let i = 1; i <= 3; i++) {
            let curlv = GameUserData.getInstance().talentHpLv;
            let sx = "hp";
            let cost = "costHp"
            if (i == 2) {
                curlv = GameUserData.getInstance().talentAtkLv;
                sx = "atk";
                cost = "costAtk"
            } else if (i == 3) {
                sx = "sp";
                cost = "costSp"
                curlv = GameUserData.getInstance().talentSpLv;
            }
            let id = curlv + 1;
            let data = ConfigMgr.getInstance().getById(id, TalentData, "lv");
            if (!data) {
                continue;
            }
            if (this.lingshi >= (data[cost][1] || 0)) {
                result = true;
                break;

            }
        }
        //console.log("checkTalentRedDot", result)
        return result;

    }

    public getGameUid(): string {
        return null
        return cc.sys.localStorage.getItem(this.GAME_UID);
    }

    public setGameUid() {
        return null
        //进游戏保存一个本地uid
        let uid = this.getGameUid();
        if (!uid || !uid.length) {
            uid = `${(new Date()).getTime().toString()}_${Math.random()}`;
            cc.sys.localStorage.setItem(this.GAME_UID, uid);
        }
    }

    public setSerValue(value: string) {
        return null
        if (!value || !value.length) return;
        cc.sys.localStorage.setItem(this.GAME_SER, value);
    }

    public getSerValue() {
        return null
        return cc.sys.localStorage.getItem(this.GAME_SER) || '';
    }

    public setUIDCommon(value: string) {
        return null
        if (!value || !value.length) return;
        cc.sys.localStorage.setItem(this.GAME_COMMON_UID, value);
    }

    public getUIDCommon(): string {
        return null
        return cc.sys.localStorage.getItem(this.GAME_COMMON_UID) || '';
    }

    public getUserName(point: number = 100): string {
        return null
        const name1 = Math.floor(point / 100), name2 = point % 100;
        // let userName = cc.sys.localStorage.getItem(this.GAME_NAME);
        // if (!userName || !userName.length) {
        let userName = '';
        userName = NamePart1[name1 - 1] + NamePart2[name2];
        // cc.sys.localStorage.setItem(this.GAME_NAME, userName);
        // }
        return userName;
    }

    public getRandomName() {
        return null
        return NamePart1[Math.floor(NamePart1.length * Math.random())] + NamePart2[Math.floor(NamePart2.length * Math.random())];
    }

    //前期保存100条数据-绑定openid
    public bingName(uid: string, name: string) {
        return null
        if (!uid || !uid.length || !name || !name.length) return;
        this.BIND_UID_NAME_MAP[uid] = name;
    }

    public getBindName(uid: string) {
        return null
        if (!uid || !uid.length) return null;
        return this.BIND_UID_NAME_MAP[uid] || null;
    }

    //更新通关ID
    public updatePassID(point: number, force: boolean = false) {
        return null
        if (CC_DEBUG && !force) return;
        if (!point || point <= this.PASS_ID) return;
        this.PASS_ID = point;
        cc.sys.localStorage.setItem(this.GAME_PASS_ID, this.PASS_ID);
        ApiMgr.getInstance().setPassRankInfo(point);
    }
}
/**
 * 关卡通关奖励记录
 */
export interface PassAwardVo {
    /**关卡id */
    passId: number,
    /**最大波次 */
    boCi: number,
    /*已领取的奖励索引,0,1,2 */
    getAwardIndex: number[]
}

const NamePart1 = [
    "脆弱的", "沉睡的", "新生的", "封印的", "觉醒的", "狂暴的", "湮灭的", "不朽的",
    "永恒的", "传奇的", "不灭的", "咆哮的", "守望的", "坠落者", "掠夺者", "背叛者",
    "流沙的", "噬魂的", "逐风者", "踏炎者", "破晓的", "永夜的", "崩坏的", "重铸的",
    "百战的", "诡计之", "命运之", "时光之", "战争之", "和平之", "自然之", "机械之",
    "短暂的", "黄昏的", "黎明的", "迷失的", "既定的", "混沌的", "秩序的", "低语的",
    "快乐的", "愤怒的", "忧郁的", "狂喜的", "孤独的", "宁静的", "痴狂的", "狡黠的",
    "英勇的", "狡诈的", "虔诚的", "傲慢的", "谦卑的", "贪婪的", "仁慈的", "冷酷的",
    "燃烧的", "冰封的", "雷鸣的", "潮汐的", "剧毒的", "光辉的", "暗影的", "大地的",
    "被遗忘的", "被诅咒的", "被祝福的", "放逐者", "无名的", "流浪的", "末代的", "先驱的",
    "水晶的", "钢铁的", "腐烂的", "璀璨的", "猩红的", "苍白的", "巨型的", "微光的",
    "迷途的", "嗜血的", "癫疯的", "睿智的", "阴郁的", "荣耀的", "败亡的", "建造者",
    "虚空之", "星界之", "龙血之", "泰坦之", "恶魔之", "天使之", "古神之", "凡人",
]

const NamePart2 = [
    "黑铁酒吧", "狼人酋长", "精灵王", "巫妖王", "矮人匠师", "兽人剑圣", "幽灵船长", "上古贤者",
    "自由之翼", "不朽王冠", "命运之轮", "时间沙漏", "真理之门", "虚空之影", "希望之火", "混沌之眼", "平衡天平",
    "慕容复", "天蚕寺", "风暴峡湾", "迷雾森林", "熔火核心", "哭泣山谷", "寂静平原", "回声山洞",
    "星光湖畔", "腐败沼泽", "悬空城", "遗忘图书馆", "无尽阶梯", "巨龙巢穴", "先贤陵墓", "观星塔",
    "霜之哀伤", "烈焰之拳", "诸界法杖", "王者之剑", "暗月戒指", "圣光法典", "虚空棱镜",
    "银色黎明", "暗影议会", "炎龙军团", "幽影兄弟会", "真理学院", "巡游马戏团", "拾荒者公会", "虚空舰队",
    "巨魔像", "凤凰卵", "深渊巨口", "织梦蜘蛛", "石像鬼群", "星界鲸", "腐化触手", "雷霆蜥蜴",
    "百族之战", "大崩塌", "魔力潮汐", "血色婚礼", "众神黄昏", "觉醒之日", "终焉时刻", "轮回开端",
    "剑魂", "刀锋山", "云中殿", "陨星坑", "试炼场", "流放之地", "秘银矿洞", "水晶洞窟",
    "北海巨妖", "九头蛇", "比蒙巨兽", "狮鹫巢", "美人鱼礁", "独角兽林", "毒液飞龙", "岩壳龟",
    "东方旅人", "西域商队", "南海海盗", "北境蛮族", "中央皇朝", "隐世仙门", "地下王国", "天空遗民",
    "大漩涡", "彩虹桥", "叹息之墙", "永生之泉", "许愿井", "诅咒之地", "祝福圣地", "元素王座",
    "最终防线", "最初火炉", "基因库", "数据库", "反应堆", "传送门", "瞭望台", "纪念碑"
]

