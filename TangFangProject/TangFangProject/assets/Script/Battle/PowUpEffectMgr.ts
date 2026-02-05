
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import ConfigMgr from "../config/ConfigMgr";
import { EquipSkillExData, PowUpData } from "../config/DataDef";
import { GamePowupEffect } from "../config/GameEnum";



export default class PowUpEffectMgr extends Singleton<PowUpEffectMgr> {
    // 强化管理类

    protected _powUpList: Array<PowUpData> = []; // 炮塔强化列表
    protected _powUpExList: Array<EquipSkillExData> = []; // 特例强化列表
    protected _powUpEffectList: Array<number> = []; // 炮塔强化效果列表

    constructor() {
        super();
        this.resetEftectList(); // 初始化
    }

    protected resetEftectList() {
        for (let v = GamePowupEffect.None; v < GamePowupEffect.Max; v++) {
            this._powUpEffectList[v] = 0;
        }
    }

    public addPowUpEffect(powUpData: PowUpData[]) {
        this._powUpList = this._powUpList.concat(powUpData);

        for (const element of powUpData) {

            if (element.monSpeed != 0) {
                this._powUpEffectList[GamePowupEffect.MonsterMoveSpeed] += element.monSpeed;
            }
            if (element.heroSpeed != 0) {
                this._powUpEffectList[GamePowupEffect.player_MoveSpeed] += element.heroSpeed;
            }
            if (element.monAtk != 0) {
                this._powUpEffectList[GamePowupEffect.Monster_attackMul] += element.monAtk;
            }
            if (element.heroAtkMul != 0) {
                this._powUpEffectList[GamePowupEffect.Player_attackMul] += element.heroAtkMul;
            }
            if (element.CriticalProbabilityAdd != 0) {
                this._powUpEffectList[GamePowupEffect.player_Critical] += element.CriticalProbabilityAdd;
            }
            if (element.CriticalDamAdd) {
                this._powUpEffectList[GamePowupEffect.player_CriticalDam] += element.CriticalDamAdd;
            }
            if (element.block) {
                this._powUpEffectList[GamePowupEffect.player_Block] += element.block;
            }
            if (element.maxHPMul) {
                this._powUpEffectList[GamePowupEffect.player_HpMaxPer] += element.maxHPMul;
            }

            if (element.HPRes != 0) {
                this._powUpEffectList[GamePowupEffect.player_HpRegenPer] += element.HPRes;
            }

            if (element.heroDef != 0) {
                this._powUpEffectList[GamePowupEffect.player_def] += element.heroDef;
            }

            // if (element.special > 0) {
            //     let extData = ConfigMgr.getInstance().getById(element.special, PowUpExData);
            //     if (extData) {
            //         this._powUpExList.push(extData);
            //     }
            // }

        }

        GlobalEventMgr.getInstance().emit(GlobalEventID.up_powect);
    }

    public addSkillExtSkill(sid: number): EquipSkillExData {
        let extData = ConfigMgr.getInstance().getById(sid, EquipSkillExData);
        if (extData) {
            this._powUpExList.push(extData);
        }
        return extData;
    }

    // 获取炮塔强化数据
    public getDataById(id: number): PowUpData {
        let getR = this._powUpList.find((item) => {
            return item.id == id;
        })
        return getR;
    }

    public getAllPowUpData(): Array<PowUpData> {
        return this._powUpList;
    }

    // 获取炮塔强化效果
    public getPowUpEffectByType(type: GamePowupEffect): number {
        return this._powUpEffectList[type] || 0;
    }

    // 获取特殊发射包强化数据
    public getShootBagSpecial(shootID: number): Array<EquipSkillExData> {
        let gData = this._powUpExList.filter((item) => {
            return item.shootBag.indexOf(shootID) >= 0; // 查找数组中是否存在shootID
        });
        return gData;
    }

    // 获取特殊强化数据 子弹
    public getBulletSpecial(bId: number): Array<EquipSkillExData> {
        let gData = this._powUpExList.filter((item) => {
            return item.bullet.indexOf(bId) >= 0; // 查找数组中是否存在bId
        });
        return gData;
    }

    public getBuffSpecial(bId: number): Array<EquipSkillExData> {
        let gData = this._powUpExList.filter((item) => {
            return item.buff.indexOf(bId) >= 0; // 查找数组中是否存在bId
        });
        return gData;
    }

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

        console.log("强化值:", cc.js.formatStr("攻击提升=%s, 射速提升=%s,怪物移动=%s, 怪物射击速度=%s",
            // this._powUpEffectList[GamePowupEffect.None].toString(),
            this._powUpEffectList[GamePowupEffect.Player_attackMul].toString(),
            this._powUpEffectList[GamePowupEffect.player_AtkSpeed].toString(),
            this._powUpEffectList[GamePowupEffect.MonsterMoveSpeed].toString(),
            this._powUpEffectList[GamePowupEffect.MonsterShoot].toString()));

        let pStr = "";
        for (const element of this._powUpList) {
            pStr += cc.js.formatStr("id=%s, note=%s\n",
                element.id.toString(),
                element.note
            );
        }
        console.log("普通强化列表 =", pStr);
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
        this._powUpList = [];
        this._powUpExList = [];
        this._powUpEffectList = [];
    }
}
