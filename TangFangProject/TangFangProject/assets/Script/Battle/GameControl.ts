//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn TypeScript:
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { nameof } from "../../TRFrameWork/cocos-module/component/Watch";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import { QuadTree } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import ConfigMgr from "../config/ConfigMgr";
import { HeroData, KvData, PassData, PassiveSkillData, TeamCopyDailyData, WaveTimesData } from "../config/DataDef";
// import PackageNode from "../BattlePackage/PackageNode";
import CharHeroInfo, { PassInfo } from "../config/DataInfo";
import { GamePassiveSkillEffect, GamePassType } from "../config/GameEnum";
import UserItemsData, { ItemVo } from "../Data/UserItemsData";
import GameHelp from "../Mgr/GameHelp";
import UISceneBattleBase from "../UI/UISceneBattleBase";
import BattleCharUI from "./BattleCharUI";
import PassiveSkillMgr from "./PassiveSkillMgr";
import PowUpEffectMgr from "./PowUpEffectMgr";
import TurretMoveUI from "./TurretMoveUI";
// import GameTutoialData from "../Data/GameTutoislData";
// import GameUserData from "../Data/GameUserData";
// import LanguageMgr from "../lang/LanguageMgr";
// import GameAttrCalcMgr from "../Mgr/GameAttrCalcMgr";
// import GameHelp from "../Mgr/GameHelp";


// export type passHeroInfo = {
//     hid: number, // 英雄id
//     level: number, // 英雄等级
//     skills: number[], // 英雄技能
// }

export type passCharInfo = {
    ID: number, // 角色
    maxHP: number, // 最大血量
    // cartHp: number, // 车辆血量
    // cartDefLv: number, // 车辆防御等级
    // cartDef: number // 车辆防御
}

export type telentInfo = {
    atk: number, // 攻击力
    atkNum: number, // 攻击力数字
    hp: number, // 血量
    def: number, // 防御
}

export type passTurretInfo = {
    tid: number, // 炮塔id
    level: number, // 炮塔等级
    skillExt: number[], // 炮塔技能
    atk: number,

    // hpAdd: number, // hp上限加成
    // hpRecover: number, // hp回复加成
    // shieldRecover: number, // 护盾回复加成
    // powups: number[], // 强化效果id
}

export type GameBattleInfo = {
    fid: string,
    // hero: passHeroInfo[],   // 战斗中的 英雄
    char: passCharInfo,
    turret: passTurretInfo[], //  战斗中的 炮塔
    telent: telentInfo, //  战斗中的 特效
    passId: number,     //  关卡id
    // spuer: number[],    // 超级进化表
    tutorial: boolean, // 引导关卡
    lastPassLV: number, // 上一个关卡id
    maxPassWave: number, // 最大关卡波数
    relicSkillList: number[] //遗物被动技能
    teamerId?: number//队友id
}


export type TurretInfoExt = {
    tid: number, // 炮塔id
    startBuff: number[][], // buff列表
    unlock5: boolean, // 是否解锁5级
}


export default class GameControl extends Singleton<GameControl> {

    protected _info: GameBattleInfo = null;

    protected _passInfo: PassInfo = null;

    //protected _carMapInfo: CarMapInfo = null;

    // protected _effectTarget: Map<number, PackageNode[]> = new Map(); // 当前果蔬效果列表

    protected _charInfo: CharHeroInfo = null;

    protected _charHero: BattleCharUI = null; // 英雄

    protected _charHeroTeamer: BattleCharUI = null; // 团队英雄

    // protected _allSpecialPowup: number[] = [];

    protected _heroAtkSpeed: number = Number.MAX_VALUE;

    protected _isTutorialHero: boolean = false;

    protected _energyPercent: number = 0;

    protected _energyMax: number = 0;

    protected _freeAdCount: number = 0;

    protected _quadTree: QuadTree = null;

    protected _curWave: number = 0;

    protected _reviveAttack: number = 0; // 复活攻击

    protected _tripodHp: number = 0; // 三脚架血量

    protected _sceneBattle: UISceneBattleBase = null;

    protected _turretInfoExt: TurretInfoExt[] = []; // 炮塔信息扩展

    protected _moveingTurret: cc.Node = null;

    protected _zoomScale: number = 1;
    // 默认速度，
    _defaultSpeed: number = 1;
    /**加速速度 */
    _addSpeed: number = 2;


    _dropNum: number = 0; // 掉落数
    addDropNum() {
        this._dropNum++;
    }
    deleteDropNum() {
        this._dropNum--;
    }

    public get zoomScale(): number {
        return this._zoomScale;
    }
    public set zoomScale(val: number) {
        this._zoomScale = val;
    }


    public get moveingTurret(): cc.Node {
        return this._moveingTurret;
    }

    public set moveingTurret(val: cc.Node) {
        this._moveingTurret = val;
    }

    public get sceneBattle(): UISceneBattleBase {
        return this._sceneBattle;
    }

    public set sceneBattle(val: UISceneBattleBase) {
        this._sceneBattle = val;
    }

    //队友半区
    public get teamBlocks(): number[] {
        return [1, 2, 3, 4, 9, 10, 11, 12, 17, 18];
    }

    //自己半区
    public get myBlocks(): number[] {
        return [0, 5, 6, 7, 8, 13, 14, 15, 16, 19];
    }

    public async resetGame(params: any) {
        // console.log('init game', params)
        this._info = params.info;
        this._dropNum = 0;
        let list = ConfigMgr.getInstance().getById(42, KvData).val.split(",").map((item) => {
            return Number(item);
        })

        this._defaultSpeed = list[0];
        this._addSpeed = list[1];

        PassiveSkillMgr.getInstance().cleanData();
        let relicSkillList = params.info.relicSkillList;
        let skillList = ConfigMgr.getInstance().getById(params.info.char.ID, HeroData).skill2;
        skillList = skillList.concat(relicSkillList);
        console.warn("宝物和皮肤被动技能汇总", skillList);
        let cfgList: PassiveSkillData[] = [];
        skillList.forEach((skillId) => {
            let cfg = ConfigMgr.getInstance().getById(skillId, PassiveSkillData)
            cfgList.push(cfg);
        })
        PassiveSkillMgr.getInstance().addPowUpEffect(cfgList);

        this.initTuretInfoExt();

        //- 初始HP最大值=(A+B)*（1+D/100）+C
        let C = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_maxHPAdd);
        let D = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_maxHPMul);
        this._tripodHp = (this._info.char.maxHP + this._info.telent.hp) * (1 + D / 100) + C;



        this._charInfo = new CharHeroInfo(this._info.char.ID);
        // this._isTutorialHero = GameTutoialData.getInstance().hasFightHero;

        // // 
        // if (this._info.tutorial && this._info.hero.length < 1) {
        //     this._info.hero.push({
        //         hid: 1,
        //         level: 1,
        //         skills: []
        //     })
        // }

        // let graphics = new cc.Node();
        // this.sceneBattle.gRoot.addChild(graphics);
        // let xx = graphics.addComponent(cc.Graphics)
        this._quadTree = new QuadTree(cc.rect(-2000, -3000, 4000, 6600), 0);

        // console.log('Use powup id:', JSON.stringify(this._allSpecialPowup));
    }

    protected initTuretInfoExt() {
        this._turretInfoExt = []; // 炮塔信息扩展
        for (const element of this._info.turret) {
            let skills = element.skillExt; // 炮塔技能
            let unlock5 = false;
            let startBuff = [];

            for (const skill of skills) {
                let pData = PowUpEffectMgr.getInstance().addSkillExtSkill(skill);
                unlock5 = pData.unlock == 1 || unlock5;
                pData.buffTgt.forEach((lvId) => {
                    if (!startBuff[lvId]) {
                        startBuff[lvId] = []; // buff列表
                    }
                    startBuff[lvId].concat(pData.buff);
                })
            }

            let infoExt: TurretInfoExt = {
                tid: element.tid,
                startBuff: startBuff,
                unlock5: unlock5
            }
            this._turretInfoExt.push(infoExt);
        }
    }

    getIsTeamBlocks(idx: number = 0): boolean {
        return this.teamBlocks.indexOf(idx) >= 0;
    }
    getIsMyBlocks(idx: number = 0): boolean {
        return this.myBlocks.indexOf(idx) >= 0;
    }

    setCharHero(hero) {
        this._charHero = hero
    }

    getCharHero(): BattleCharUI {
        return this._charHero
    }

    setCharHeroTeamer(hero) {
        this._charHeroTeamer = hero
    }
    /**是否世界boss副本*/
    isWorldBossBaid() {
        return GameControl.getInstance().getPassInfo().data.type == GamePassType.WorldBoss;
    }
    /**是否团队副本 */
    isTeamBaid() {
        return GameControl.getInstance().getPassInfo().data.type == GamePassType.teamRaid;
    }
    /**团队副本每日武器伤害加成 */
    getTurretHurtExt(TurretType): number {
        let ext = 1;
        if (!this.isTeamBaid()) {
            return ext;
        }
        let day = new Date().getDate();
        let wapenData = ConfigMgr.getInstance().getById(day, TeamCopyDailyData).weaponAdd.split(",").map((item) => {
            return parseInt(item);
        });
        for (let i = 0; i < wapenData.length; i = i + 3) {
            if (wapenData[i] == TurretType) {
                ext += wapenData[i + 1] / 100;
                console.warn("团队副本武器伤害加成", ext);
                return ext;
            }
        }
        return ext;
    }

    getCharHeroTeame(): BattleCharUI {
        return this._charHeroTeamer
    }

    // 获取战斗中的 炮塔
    public isFightTurret(tid: number): boolean {
        if (this._info == null) {
            return false
        }
        return this._info.turret.find(val => val.tid == tid) != null;
    }

    // 获取所有战斗中的 炮塔
    public getAllFightTurret(): passTurretInfo[] {
        if (this._info == null) {
            return []
        }
        return this._info.turret || [];
    }

    // 获取战斗中的 炮塔
    public getFightTurretById(tid: number): passTurretInfo {
        if (this._info == null) {
            return null
        }
        return this._info.turret.find(val => val.tid == tid);
    }

    // 获取炮塔的回复hp
    // public getTurretRecoverById(tid: number): number {
    //     let v = this.getFightTurretById(tid);
    //     if (v == null) {
    //         return 0;
    //     }
    //     return v.hpRecover;
    // }

    // // 获取炮塔的回复护盾
    // public getTurretRecoverShieldById(tid: number): number {
    //     let v = this.getFightTurretById(tid);
    //     if (v == null) {
    //         return 0;
    //     }
    //     return v.shieldRecover;
    // }

    /** 得到遗物技能列表 */
    public getRelicSkillList(): number[] {
        return this._info.relicSkillList;
    }

    public getTelentAck(): number {
        return this._info.telent.atk;
    }

    public getTelentAckNum(): number {
        return this._info.telent.atkNum;
    }

    public getTurretOutLv(tid: number): number {
        let v = this.getFightTurretById(tid);
        if (v == null) {
            return 0;
        }
        return v.level;
    }

    public getTurretAck(tid: number): number {
        let v = this.getFightTurretById(tid);
        if (v == null) {
            return 0;
        }
        return v.atk;
    }

    // 炮塔初始buff
    public getTurretStartBuff(tid: number, lv: number): number[] {
        let startBuff = [];
        for (const element of this._turretInfoExt) {
            if (element.tid == tid) {

                if (element.startBuff[0]) {
                    startBuff = startBuff.concat(element.startBuff[0]);
                }
                if (element.startBuff[lv]) {
                    startBuff = startBuff.concat(element.startBuff[lv]);
                }
            }
        }
        return startBuff;
    }

    // 是否解锁5级
    public isLock5(tid: number): boolean {
        let bRet = false;
        for (const element of this._turretInfoExt) {
            if (element.tid == tid) {
                bRet = element.unlock5;
                break;
            }
        }
        return bRet;
    }

    // // 可用的强化效果
    // public isUseSpecialPowup(powupId: number): boolean {
    //     return this._allSpecialPowup.indexOf(powupId) >= 0;
    // }

    // 获取战斗中的 英雄
    // public isFightHero(hid: number): boolean {
    //     if (this._info == null) {
    //         return false
    //     }
    //     let v = this._info.hero.find(val => val.hid == hid);
    //     return v != null;
    // }

    // //  获取所有战斗中的 英雄
    // public getAllFightHero(): passHeroInfo[] {
    //     if (this._info == null) {
    //         return []
    //     }
    //     return this._info.hero || [];
    // }

    // public setHeroDefualSpeed(speed: number) {
    //     this._heroAtkSpeed = speed; // Math.min(speed, this._heroAtkSpeed);
    // }

    // // 英雄攻击速度
    // public getHeroAtkSpeed(): number {
    //     return this._heroAtkSpeed;
    // }

    // 是否是 引导关卡
    // public isTutorialLV(): boolean {
    //     if (this._info == null) {
    //         return false
    //     }
    //     return this._info.tutorial;
    // }

    // // 是否是 引导英雄
    // public isTutorialHero(): boolean {
    //     let bRet = false;

    //     // if (this.getAllFightHero().length >= 0 && !this._isTutorialHero && this._info.lastPassLV < 2) {
    //     //     bRet = true;
    //     // }
    //     return bRet;
    // }


    // 获取关卡id
    public getPassId(): number {
        return this.sceneBattle.getPassControl().getPassInfo().data.id;
        // if (this._info == null) {
        //     return 0
        // }
        // return this._info.passId || 0;
    }

    public get maxPassWave(): number {
        return this._info.maxPassWave || 0;
    }

    public set maxPassWave(val: number) {
        this._info.maxPassWave = val;
    }

    public getFid(): string {
        if (!this._info) {
            return "0";
        }
        return this._info.fid || "0";
    }

    // 获取关卡信息
    public getPassInfo(): PassInfo {
        // if (this._passInfo == null) {
        //     this._passInfo = new PassInfo(this.getPassId());
        //     this._passInfo.maxPassWave = this._info.maxPassWave;
        // }
        // return this._passInfo;
        return this.sceneBattle.getPassControl().getPassInfo();
    }


    public getCharInfo(): CharHeroInfo {
        return this._charInfo;
    }

    // getPassCartInfo(): passCharInfo {
    //     return this._info.char;
    // }

    getTurretDamLv(): number {
        return 0;
    }

    // 外部hp上限 加成
    public getHpDefule(): number {
        return this._tripodHp;
    }

    public getShieldDefule(): number {
        return this._info.telent.def;
    }

    // 使用 免广告券
    // public checkuseTicketAD(): boolean {

    //     if (this._freeAdCount > 0) {
    //         this._freeAdCount--;
    //         let txt = LanguageMgr.getInstance().getLang('txt_use_tickAD_Eff');
    //         GameHelp.getInstance().showToast(txt);
    //         GameUserData.getInstance().emitItem(nameof<GameUserData>().ticketAD);
    //         return true;
    //     }

    //     if (GameUserData.getInstance().ticketAD > 0) {
    //         GameUserData.getInstance().useTicketAD();
    //         let txt = LanguageMgr.getInstance().getLang('txt_use_tickAD');
    //         GameHelp.getInstance().showToast(txt);
    //         return true;
    //     }
    //     return false
    // }

    // public addFreeCount(val: number): void {
    //     this._freeAdCount += val;
    //     GameUserData.getInstance().emitItem(nameof<GameUserData>().ticketAD);
    // }

    public getFreeADCount(): number {
        return this._freeAdCount;
    }

    // public isLockedSpuer(tid: number): boolean {
    //     return this._info.spuer.indexOf(tid) >= 0;
    // }

    // public setEnergyPercent(percent: number) {
    //     this._energyPercent = percent;
    // }

    // public setEnergyPer(percent: number) {
    //     this._energyPercent = percent;
    // }

    // public getEnergyPercent(): number {
    //     return this._energyPercent;
    // }

    // public setEnergyMax(max: number) {
    //     this._energyMax = max;
    // }

    // public getEnergyMax(): number {
    //     return this._energyMax;
    // }

    public getQuadTree(): QuadTree {
        return this._quadTree;
    }

    public getCurWave(): number {
        return this._curWave;
    }

    public setCurWave(wave: number) {
        this._curWave = wave;
    }

    getReviveAttack(): number {
        return this._reviveAttack;
    }

    setReviveAttack(val: number) {
        this._reviveAttack = val;
    }

    protected _baseWpos: cc.Vec3 = cc.v3(0, 0, 0);
    public getBaseWpos(): cc.Vec3 {
        return this._baseWpos;
    }

    public setBaseWpos(pos: cc.Vec3) {
        this._baseWpos = pos;
    }

    clean() {
        this._info = null;
        this._passInfo = null;
        // this._carMapInfo = null;
        this._heroAtkSpeed = 0;
        // this._allSpecialPowup = [];
        this._energyPercent = 0;
        this._energyMax = 0;
        this._freeAdCount = 0;
        this._reviveAttack = 0;
        this._curWave = 0;
        this._quadTree.clear();
        this._turretInfoExt = [];
        this._charInfo = null;
        this._charHero = null;
        delete this._quadTree; // 清理数据


    }

}
