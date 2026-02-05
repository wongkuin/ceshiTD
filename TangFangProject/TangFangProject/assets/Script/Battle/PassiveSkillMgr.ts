import Singleton from "../../TRFrameWork/UIFrame/Singleton";

import { PassiveSkillData } from "../config/DataDef";
import { GamePassiveSkillEffect } from "../config/GameEnum";




/**
 * 被动技能管理
 */

export default class PassiveSkillMgr extends Singleton<PassiveSkillMgr> {
    // 强化管理类

    protected _skillList: Array<PassiveSkillData> = []; // 被动技能列表


    protected _powUpEffectList: Array<number> = []; // 技能强化效果列表
    // 掉落概率
    drop:number[]= [];

    constructor() {
        super();
        this.resetEftectList(); // 初始化
    }

    protected resetEftectList() {
        for (let v = GamePassiveSkillEffect.None; v < GamePassiveSkillEffect.Max; v++) {
            this._powUpEffectList[v] = 0;
        }
        this.drop = [];
    }

    public addPowUpEffect(powUpData: PassiveSkillData[]) {
        this._skillList = this._skillList.concat(powUpData);

        for (const element of powUpData) {

            if (element.monSpeed != 0) {
                this._powUpEffectList[GamePassiveSkillEffect.MonsterMoveSpeed] += element.monSpeed;
            }
            if (element.heroSpeed != 0) {
                this._powUpEffectList[GamePassiveSkillEffect.player_heroSpeed] += element.heroSpeed;
            }
            if (element.heroAtkMul != 0) {
                this._powUpEffectList[GamePassiveSkillEffect.player_heroAtkMul] += element.heroAtkMul;
            }
            if (element.CriticalProbabilityAdd != 0) {
                this._powUpEffectList[GamePassiveSkillEffect.player_CriticalProbabilityAdd] += element.CriticalProbabilityAdd;
            }

            if (element.CriticalDamAdd) {
                this._powUpEffectList[GamePassiveSkillEffect.player_CriticalDamAdd] += element.CriticalDamAdd;
            }
            if (element.block) {
                this._powUpEffectList[GamePassiveSkillEffect.player_block] += element.block;
            }
            if (element.maxHPMul) {
                this._powUpEffectList[GamePassiveSkillEffect.player_maxHPMul] += element.maxHPMul;
            }
            if (element.maxHPAdd) {
                this._powUpEffectList[GamePassiveSkillEffect.player_maxHPAdd] += element.maxHPAdd;
            }

            if (element.SPMul) {
                this._powUpEffectList[GamePassiveSkillEffect.player_SPMul] += element.SPMul;
            }

            if (element.SPAdd) {
                this._powUpEffectList[GamePassiveSkillEffect.player_SPAdd] += element.SPAdd;
            }

            if (element.cdChange) {
                this._powUpEffectList[GamePassiveSkillEffect.player_cdChange] += element.cdChange;
            }

            if (element.bossKill != 0) {
                this._powUpEffectList[GamePassiveSkillEffect.player_bossKill] += element.bossKill;
            }

            if (element.drop.length>0) {
                this.drop= element.drop;
            }


        }

        console.log("被动技能整理后汇总列表", this._powUpEffectList,this.drop);
       //. GlobalEventMgr.getInstance().emit(GlobalEventID.up_powupEffect);
    }

    getDropList():number[]{
        return this.drop;
    }

    // 获取炮塔强化数据
    public getDataById(id: number): PassiveSkillData {
        let getR = this._skillList.find((item) => {
            return item.id == id;
        })
        return getR;
    }

    public getAllPowUpData(): Array<PassiveSkillData> {
        return this._skillList;
    }

    // 获取炮塔强化效果
    public getPowUpEffectByType(type: GamePassiveSkillEffect): number {
        return this._powUpEffectList[type];
    }

    // 获取特殊发射包强化数据
    // public getShootBagSpecial(shootID: number): Array<PowUpData> {
    //     let gData = this._powUpExList.filter((item) => {
    //         return item.shootBag.indexOf(shootID) >= 0; // 查找数组中是否存在shootID
    //     });
    //     return gData;
    // }

    // 获取特殊强化数据 子弹
    // public getBulletSpecial(bId: number): Array<PowUpData> {
    //     let gData = this._powUpExList.filter((item) => {
    //         return item.bullet.indexOf(bId) >= 0; // 查找数组中是否存在bId
    //     });
    //     return gData;
    // }

    // // 获取特殊强化数据炮塔
    // public getTurretSpecial(tid: number): Array<PowUpData> {
    //     let gData = this._powUpExList.filter((item) => {
    //         return item.wapen.indexOf(tid) >= 0; // 查找数组中是否存在bId
    //     });
    //     return gData;
    // }

    // 果蔬效果 特殊强化数据
    // public getTurretEffectSpecial(vid: number): Array<PowUpData> {
    //     let gData = this._powUpExList.filter((item) => {
    //         return item.wapen.indexOf(vid) >= 0; // 查找数组中是否存在bId
    //     });
    //     return gData;
    // }

    // // 获取特殊强化数据 英雄
    // public getHeroEffectSpecial(hid: number): Array<PowUpData> {
    //     let gData = this._powUpExList.filter((item) => {
    //         return item.heroEffect.indexOf(hid) >= 0; // 查找数组中是否存在bId
    //     });
    //     return gData;
    // }

    public showDebug() {

        // console.log("强化值:", cc.js.formatStr("攻击提升=%s, 射速提升=%s,怪物移动=%s, 怪物射击速度=%s",
        //     // this._powUpEffectList[GamePowupEffect.None].toString(),
        //     this._powUpEffectList[GamePowupEffect.Player_attackMul].toString(),
        //     this._powUpEffectList[GamePowupEffect.player_AtkSpeed].toString(),
        //     this._powUpEffectList[GamePowupEffect.MonsterMoveSpeed].toString(),
        //     this._powUpEffectList[GamePowupEffect.MonsterShoot].toString()));

        // let pStr = "";
        // for (const element of this._skillList) {
        //     pStr += cc.js.formatStr("id=%s, note=%s\n",
        //         element.id.toString(),
        //         element.note
        //     );
        // }
        // console.log("普通强化列表 =", pStr);
        // let eStr = "";
        // for (const element of this._powUpExList) {
        //     eStr += cc.js.formatStr("id=%s, shootBag=%s\n",
        //         element.id.toString(),
        //         JSON.stringify(element.shootBag));
        // }
        // console.log("特例强化列表 =", eStr);
    }

    // // 清空数据
    public cleanData() {
        this.resetEftectList();
        this._skillList = [];
        // this._powUpExList = [];
    }
}
