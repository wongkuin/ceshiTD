

import GlobalEventMgr from '../../TRFrameWork/cocos-module/mgr/GlobalEventMgr';
import { GlobalEventID } from '../../TRFrameWork/cocos-module/utils/GlobalEvent';
import Random from '../../TRFrameWork/cocos-module/utils/Random';
import Utils from '../../TRFrameWork/cocos-module/utils/Utils';
import { CommonUtils } from '../../TRFrameWork/Common/Utils/CommonUtils';
import BattleAckObject from '../Battle/BattleAckObjet';
import BuffEffect from '../Battle/BuffEffect';
import GameControl from '../Battle/GameControl';
import PassiveSkillMgr from '../Battle/PassiveSkillMgr';
import PowUpEffectMgr from '../Battle/PowUpEffectMgr';
import GameUserData from '../Data/GameUserData';
import UserItemsData, { ItemVo } from '../Data/UserItemsData';
import ApiMgr from '../Mgr/ApiMgr';
import GameHelp from '../Mgr/GameHelp';
import ConfigMgr from './ConfigMgr';
import {
    ActSkillData,
    BuffData,
    BulletData,
    BulletSkillData,
    BulltetSpEffData,
    EquipSkillExData,
    HeroData,
    MapConfigData,
    MonsterData,
    MonsterPathData,
    PassData,
    RefreshCostData,
    ShootBagData,
    SummonData,
    TeamCopyKvData,
    WapenFusionData,
    WaveTimesData,
} from './DataDef';

import {
    GameBulletState,
    GameObjectType,
    MonsterActionStatue,
    BtAckObjState,
    MonsterBrithAlignment,
    MonsterBrithType,
    GamePowupEffect,
    MonsterType,
    MonsterDeathType,
    PathMode,
    BulletVibrateType,
    GameBundle,
    ETurretDir,
    eCharState,
    GamePassiveSkillEffect,
    GamePassType,
} from './GameEnum';

const { ccclass, property } = cc._decorator;


let getSpecialV = function (rData: number[], type: number, replace: number[]): number[] {
    // 空或0=不修改
    // 1=用新数值覆盖旧数值
    // 2=在旧数值上做加法
    //  比如：旧数值[1]，现有值[4],结果=[5]
    //        旧数值[1,0,4]，现有值[0,1,-2],结果=[1,1,2]
    //        旧数值[1]，现有值[0,0,4],结果=[1,0,4]
    //        旧数值[0,3]，现有值[2],结果=[2,3]
    // 3=在旧数值上做乘法
    //  比如：旧数值[10,2]，现有值[1.5],结果=[15,2]

    // 4= 数值追加
    //  比如：旧数值[10,2]，现有值[1，5],结果=[10,2，1,5]
    let retData = rData;
    if (type == 1) {
        retData = [].concat(replace);
    } else if (type == 2) {
        for (let i = 0; i < retData.length; i++) {
            replace.length > i && (retData[i] += replace[i]);
        }
    } else if (type == 3) {
        for (let i = 0; i < retData.length; i++) {
            replace.length && (retData[i] *= replace[i]);
        }
    } else if (type == 4) {
        retData = retData.concat(replace);
    }
    return retData;
}

export type summonParm = {
    // A = 定位方式
    //  0 = 以自身为圆心
    //  1 = 以VIP为圆心
    // B = 召唤的最小半径
    // C = 召唤的最大半径。召唤兽一定只会在B和C之间的距离内出现
    // D = 召唤方位
    //  0 = 无特定方位，360°均可
    //  1 = 只能在画面的上半场或下半场内出现
    // E = 召唤兽表的配置ID
    monId: number,      // 召唤者 E
    wPos: cc.Vec3,        // 召唤位置
    sourceTag: GameObjectType, // 召唤者类型
    shootAck: number,   // 发射者 攻击力
}

export type shootBagParm = {
    shootObj: BattleAckObject, // 发射者
    shootWPos: cc.Vec3,        // 发射位置
    endPos: cc.Vec3,           // 目标位置
    ackTaget: BattleAckObject,// 攻击目标
    isAoe: boolean,         // 是否aoe
    eDir: ETurretDir,      // 发射方向
    ackPower: number,  // 攻击力 
    damAppend: number, // 伤害追加
    damLv: number, // 攻击等级
    reviveAttack: number, // 复活攻击力
    damMul: number, // 百分比修改伤害
    attackMul: number, // 百分比修改攻击
    damAdd: number, // 按加法修改伤害
    shootTurretId: number, // 发射者id
    shootRadius: number, // 射程
    tHitCriticalAdd: number, // 调整后 提高命中暴击概率
    tHitCriticalHurtAdd: number, // 调整后 提高命中暴击伤害 倍率
    tAoeCriticalAdd: number, // 调整后 提高aoe暴击概率
    tAoeCriticalHurtAdd: number, // 调整后 提高aoe暴击伤害 倍率
    shootInfo: IShootInfo,
    extAckObj: BattleAckObject[], // 排除攻击对象
    extShoot?: boolean,         // 是否发射2包
    actMan?: BattleAckObject, // 行动者
}

export type TagHurt = {
    tag: number,  // 标签
    preAdd: number, // %加成
    mulAdd: number, // 值加成
}

export type hurtParm = {
    power: number,  // 命中攻击力
    shootObj: BattleAckObject, // 发射者
    // powerPer: number,// 命中伤害百分比
    // damLv: number, // 攻击等级
    ackMul: number,  //伤害倍率
    critical: number,  // 暴击率
    criticalDam: number,      //暴击倍率
    buffCritical: number,  // 暴击率
    buffCriticalDam: number,      //暴击倍率
    // damAppend: number,        // 伤害追加
    // reviveAttack: number, // 复活攻击力
    damageCorrection: number, // 子弹伤害修正
    hurtPer: number,  // - C=【子弹表|bullet】的【hitHurtPer】或【aoeHurtPer】
    tags: TagHurt[], // 标签
    // damMul: number, // 百分比修改伤害
    // attackMul: number, // 百分比修改攻击
    // damAdd: number, // 强化 伤害
}


export abstract class IShootInfo {

    protected _fixHitCriticalAdd: number = 0; // 调整后 提高命中暴击概率
    fixHitCriticalHurtAdd: number = 0; // 调整后 提高命中暴击伤害
    fixAoeCriticalAdd: number = 0; // 调整后 提高aoe暴击概率
    fixAoeCriticalHurtAdd: number = 0; // 调整后 提高aoe暴击伤害

    state: BtAckObjState = BtAckObjState.Init;   // 怪物状态

    protected _damAppend: number = 0;  // 伤害追加
    protected _damMul: number = 0; // 百分比修改伤害
    protected _attackMul: number = 0; // 百分比增加攻击力

    // protected _fireInterval: number = 0; // 攻击间隔
    protected _damAdd: number = 0; // 强化 伤害
    protected _def: number = 0;     //  防御值
    protected _defLv: number = 0; // 防御等级

    protected _buffect: BuffEffectInfo[] = []; // buff效果
    protected _objType: GameObjectType = GameObjectType.None;

    protected _curHp: number = 0;   // 当前血量
    protected _curShield: number = 0;   // 当前护盾

    protected abstract updateBuffValue();
    protected abstract resetValue();    // 重置 强化值
    abstract isLiving(): boolean;      // 是否存活
    abstract getBuffScale(): number;    // 获取buff缩放
    abstract getID(): number;
    abstract getObjType(): GameObjectType;  // 对象类型
    abstract getMaxHp(): number;   // 最大生命值
    abstract getAttack(ext: boolean): number;  // 攻击力
    abstract getFixFireInterval(): number; // 调整后 攻击间隔
    abstract getDamAppend(): number; // 伤害追加 
    abstract getDefLv(): number; // 防御等级
    abstract getDamLv(): number; // 伤害等级
    abstract getDamMul(): number; //百分比修改伤害
    abstract getAttackMul(): number; //百分比修改攻击
    abstract getDamAdd(): number; // 强化 按加法修改伤害
    abstract getDef(): number; // 防御值
    abstract getShootBagInfo(parm: shootBagParm, sId: number, ext?: boolean): ShootBagInfo; // 获取发射信息




    constructor() {
        // this._buffEffcts = [];
    }

    public get fixHitCriticalAdd(): number {
        return this._fixHitCriticalAdd;
    }

    /**
     *  获取buff列表
     * @returns 
     */
    public getBuffEffect(): BuffEffectInfo[] {
        return this._buffect;
    }

    // 添加 buff
    public addBuffEffect(effect: BuffEffectInfo): void {
        this._buffect.push(effect);
        this.updateBuffValue();
    }

    // 移除 buff
    public cleanBuffEffect(): void {
        this._buffect = [];
        this.resetValue(); // 重置值
    }

    // 刷新buff
    public updateBuffEffect(dt: number): void {
        for (let i = this._buffect.length - 1; i >= 0; i--) {
            let effect = this._buffect[i];
            if (effect) {
                // effect.doUpdate(dt);
                if (effect.isEnd()) {
                    this._buffect.splice(i, 1);
                    this.refrushPowUpEffect();
                }
            }
        }
    }

    // // 更新 强化效果 3选1 更新
    public refrushPowUpEffect() {
        this.updateBuffValue();
    }

    public setEffectSkill(sIds: number[]) {
    }

    public doLevelUp(nextID: number): boolean {
        return false;
    }

    public hpProgress(): number {
        return this._curHp / this.getMaxHp();
    }

    // 获取当前hp
    public getCurHp(): number {
        return this._curHp;
    }

    public resetCurHp(hp: number) {
        this._curHp = hp;
    }

    public getCurShield(): number {
        return this._curShield;
    }

    public changeHp(value: number, realyHP: boolean): number {
        if (value < 0 && this._curShield > 0) {
            // 减盾
            value = this.changeShield(value);
        }
        let oldV = Math.ceil(this._curHp);
        this._curHp += value;
        // this._curHp = Math.floor(this._curHp)
        let iRet: number = 0;
        if (this._curHp > this.getMaxHp()) {
            iRet = this._curHp - this.getMaxHp();
            this._curHp = this.getMaxHp();
        } else if (this._curHp <= 0) {
            iRet = this._curHp;
            this._curHp = 0;
        }
        let cVal = Math.ceil(this._curHp) - oldV;
        return iRet;
    }

    public changeShield(value: number): number {
        let oldV = Math.ceil(this._curShield);
        this._curShield += value;

        let iRet: number = 0;
        let sy = 0;//实际减少量
        if (this._curShield <= 0) {
            iRet = this._curShield;
            sy = this._curShield;
            this._curShield = 0;
        }

        iRet = Math.ceil(this._curShield) - oldV;
        return sy;
    }

    public getShootRang(): number {
        return 0;
    }

    public getTag(): number[] {
        return [];
    }

    public clean() {
        for (const element of this._buffect) {
            element.clean(); // 清理
        }
    }
}

export type mapIndex = {
    index: number,  // 坐标
    reverse: boolean, // 是否反向
}


export class MapConfigInfo {
    data: MapConfigData = null;   // 怪物数据
    blockPoss: cc.Vec2[] = [];   // 障碍物坐标

    path: number[] = []; // 路径索引
    realPath: cc.Vec2[] = [];   // 路径坐标

    mode: PathMode = PathMode.Loop;
    blockInfoList: number[] = []; // 地基信息
    stickMaxNum: number = 0; // 可携带英雄最大数量
    levelBlockCount: number = 8;
    // reverse: boolean = false;

    constructor(mid: number) {
        this.data = ConfigMgr.getInstance().getById(mid, MapConfigData);
        if (!this.data) {
            console.error("not find monster ID：", mid);
            return;
        }

        for (let i = 0; i < this.data.block.length; i += 2) {
            this.blockPoss.push(cc.v2(this.data.block[i], this.data.block[i + 1]));
        }

        for (let i = 0; i < this.data.block.length; i++) {
            this.blockInfoList.push(this.data.block[i]);
        }

        for (let i = 0; i < this.data.path.length; i++) {
            this.path.push(this.data.path[i]);
        }

        this.path.reverse();

        for (let i = 0; i < this.path.length - 1; i++) {
            this.realPath.push(this.blockPoss[this.path[i]]);
        }

        this.mode = this.data.circulate;
        this.stickMaxNum = this.data.stickMaxNum;
    }

    resetMapInfo(mid) {
    }

    public getIndexPos(index: number): cc.Vec2 {
        return this.realPath[index];
    }

    public getBlockIndex(idx: number): number {
        return this.path[idx];
    }

    public getBlockIDListByIndex(idx: number, level): number[] {
        let blockIDList: number[] = [];
        for (let i = 0; i < this.blockInfoList.length; i++) {
            if (i % this.levelBlockCount == idx && level > Math.floor(i / this.levelBlockCount)) {
                blockIDList.push(i);
            }
        }
        return blockIDList;
    }

    public getNextIndex(idx: mapIndex): mapIndex {
        let rIdx: mapIndex = {
            index: idx.index,
            reverse: idx.reverse,
        }
        if (rIdx.reverse) {
            rIdx.index--;
            if (rIdx.index < 0) {
                rIdx = this.handlePathEnd(rIdx);
            }
        } else {
            rIdx.index++;
            if (rIdx.index >= this.realPath.length) {
                rIdx = this.handlePathEnd(rIdx);
            }
        }
        return rIdx;
    }

    private handlePathEnd(eIdx: mapIndex): mapIndex {

        switch (this.mode) {
            case PathMode.Loop:
                if (eIdx.reverse) {
                    if (eIdx.index < 0) {
                        eIdx.index = this.realPath.length - 1;
                    } else if (eIdx.index >= this.realPath.length) {
                        eIdx.index = 0;
                    }
                } else {
                    if (eIdx.index >= this.realPath.length) {
                        eIdx.index -= this.realPath.length;
                    } else if (eIdx.index < 0) {
                        eIdx.index = -eIdx.index
                    }

                }

                break;
            case PathMode.PingPong:
                eIdx.reverse = !eIdx.reverse;
                eIdx.index = eIdx.reverse ? this.realPath.length - 2 : 1;
                break;
            default:
                eIdx.index = -1;
                break;
        }
        return eIdx;
    }

    public getStickStartAngleByIndex(index: number): number {
        return index / this.stickMaxNum * 360;
    }

    public getCurIndexByAngle(angle: number): number {
        let startAngle = (360 / this.levelBlockCount) / 2;//index是0的格子的位置
        let step = 360 / this.levelBlockCount
        if (angle < startAngle) {
            return this.levelBlockCount - 1;
        }
        for (let i = this.levelBlockCount - 1; i >= 0; i--) {
            let tempAngle = startAngle + (i * step);
            if (angle >= tempAngle) {
                return i;
            }
        }
    }

    public getAngleByIndex(index: number): number {
        let startAngle = (360 / this.levelBlockCount) / 2;//index是0的格子的位置
        let step = 360 / this.levelBlockCount
        return startAngle + (index * step);
    }

    public getNextAngleIndex(idx: mapIndex): mapIndex {
        let rIdx: mapIndex = {
            index: idx.index,
            reverse: idx.reverse,
        }
        if (rIdx.reverse) {
            rIdx.index--;
            if (rIdx.index < 0) {
                rIdx = this.handleAnglePathEnd(rIdx);
            }
        } else {
            rIdx.index++;
            if (rIdx.index >= this.levelBlockCount) {
                rIdx = this.handleAnglePathEnd(rIdx);
            }
        }
        return rIdx;
    }

    private handleAnglePathEnd(eIdx: mapIndex): mapIndex {

        switch (this.mode) {
            case PathMode.Loop:
                if (eIdx.reverse) {
                    if (eIdx.index < 0) {
                        eIdx.index = this.levelBlockCount - 1;
                    } else if (eIdx.index >= this.levelBlockCount) {
                        eIdx.index = 0;
                    }
                } else {
                    if (eIdx.index >= this.levelBlockCount) {
                        eIdx.index -= this.levelBlockCount;
                    } else if (eIdx.index < 0) {
                        eIdx.index = -eIdx.index
                    }

                }

                break;
            case PathMode.PingPong:
                eIdx.reverse = !eIdx.reverse;
                eIdx.index = eIdx.reverse ? this.levelBlockCount - 2 : 1;
                break;
            default:
                eIdx.index = -1;
                break;
        }
        return eIdx;
    }
}

export type PathMoveData = {
    dir: cc.Vec2,
    jump: boolean,
    endPos: cc.Vec2,
}

export class MonsterInfo extends IShootInfo {

    data: MonsterData = null;   // 怪物数据
    // resUrl: string = "prefabs/monster_001";   // 怪物资源路径

    actionSt: MonsterActionStatue = MonsterActionStatue.Move;  // 行动状态
    moveDir: cc.Vec2 = cc.v2(0, 0);   // 移动方向
    outType: number = 0;   // 出现类型 
    // attackType: MonsterAttackType = MonsterAttackType.Normal;  // 攻击类型
    toucheCart: boolean = false;   // 是否碰到小车
    // touCheing: boolean = false;   // 是否碰到小车
    standed: boolean = false;   // 是否站立

    ackPower: number = 0;   // 攻击力
    hp: number = 0;   // 血量
    // mp: number = 0;   // 能量
    // exp: number = 0;   // 经验值
    // coin: number = 0;   // 铜钱
    // curHp: number = 0;   // 当前血量
    nextAtkTime: number = 0;   // 攻击间隔
    lastActObj: BattleAckObject = null; // 最后攻击对象

    liveTime: number = 0;   // 存活时间
    randomCenter: cc.Vec2 = cc.v2(0, 0); // 随机中心点
    randomEndPos: cc.Vec2 = cc.v2(0, 0); // 随机结束点
    damLv: number = 0; // 伤害等级
    defLv: number = 0; // 防御等级

    birthPos: MonsterBrithType = MonsterBrithType.Loc0; // 出生位置
    startPos: cc.Vec3 = cc.v3(0, 0); // 起始位置
    birthAlignment: MonsterBrithAlignment = MonsterBrithAlignment.Center; // 出生对齐
    waveNum: number = 0; // 波次
    waveIDNum: number = 0; // 波次内ID索引
    mPath = null; // 怪物路径
    dir: ETurretDir = ETurretDir.None;

    passMoveMul: number = 1; // 关卡移动速度倍数

    dropItem: ItemVo[] = [];//波次随机掉落

    endlessHp: number = 0; // 无尽模式血量

    money: number = 0; // 投放银币

    basePos: cc.Vec3 = cc.v3(0, 0); // 基础位置


    constructor(mid: number) {
        super();
        this.data = ConfigMgr.getInstance().getById(mid, MonsterData);
        this.money = this.data.money;
        if (!this.data) {
            console.error("not find monster ID：", mid);
        }
        // this.state = BtAckObjState.Init;
        // this.liveTime = 0; // 存活时间
        // this.resetValue();
        if (this.data.hp == 0) {
            this.endlessHp = 1;
        }
        this.relife();
    }

    setMoney(money: number) {
        this.money = money;
    }

    //设置掉落物品
    setDropItem(itemVO: ItemVo[]) {
        this.dropItem = itemVO;
    }

    getDropItem(): ItemVo[] {
        return JSON.parse(JSON.stringify(this.dropItem));
    }

    // 【关卡表|pass】的【atkMul】
    public setAckMul(ackMul: number) {
        this._attackMul = ackMul;
    }

    public relife() {
        this.state = BtAckObjState.Init;
        this.liveTime = 0; // 存活时间
        this.toucheCart = false;
        this.actionSt = MonsterActionStatue.Move;
        this.lastActObj = null;
        this.resetValue();
    }


    // 修正后移动速度
    public getFixSpeed(buffsp: number): number {
        // - A=基础移动//来自【怪物】
        // - B=1+C/100
        //   - C=怪物移速修正//来自【强化效果】
        //   - 若B＜0.25，则B=0.25
        // - D=1+E/100
        //   - E=BUFF导致的移动效果修改//来自【BUFF】
        //   - 若D＜0.25，则D=0.25
        let A = this.data.moveSpeed;
        let B = 0;
        let C = 0;
        let D = this.passMoveMul;
        for (const element of this._buffect) {
            if (element.getDurationType() == 0) {
                B += element.data.moveMul;
            } else if (element.getDurationType() == 1) {
                C += element.data.moveMul;
            }
        }
        // let B = 1 + PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.MonsterMoveSpeed) / 100;
        // B = Math.max(B, 0.25);
        // let D = 1 + buffsp / 100;
        // D = Math.max(D, 0.25);
        return A * (1 + B / 100) * (1 + C / 100) * D;
    }

    // 修正后攻击间隔
    public getFixFireInterval(): number {
        let A = this.data.atkInterval;
        let B = 1 + PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.MonsterShoot) / 100;
        B = Math.max(B, 0.25);
        return A * B;
    }

    // 获取发射包信息
    public getShootBagInfo(parm: shootBagParm, sId: number, ext: boolean = false): ShootBagInfo {
        // let sId = this.data.shootBagId;
        let info: ShootBagInfo = null;
        if (sId > 0) {
            info = new ShootBagInfo(sId, GameObjectType.Monster_Bullet, parm);
        }
        return info;
    }

    // 资源名称
    public getImgPath(): string {
        return this.data.img;
    }

    public isEnterAtkTime(): boolean {
        return this.liveTime >= this.data.firstAtkInterval;
    }

    public getMonsterType(): MonsterType {
        return this.data.type;
    }

    public hasDeathType(type: MonsterDeathType): number {
        let dList = this.data.dead;
        for (let i = 0; i < dList.length;) {
            if (dList[i] == type) {
                return dList[i + 1];
            }
            i += 2;
        }
        return 0;
    }

    // 获取出生发射
    public hasBornShoot(): number[] {
        return this.data.born;
    }

    // 获取死亡事件 hp<0 时调用
    public HpDeathEvent(): number[] {
        let rIds = [];
        for (let i = 0; i < this.data.deadEvent.length; i += 2) {
            if (this.data.deadEvent[i] == 1) {
                rIds.push(this.data.deadEvent[i + 1]);
            }
        }
        return rIds;
    }

    // 获取出生buff
    public getBrothBuffs(): number[] {
        return this.data.bornBuff;
    }

    // public setMovePath(pId: number) {
    //     this.mPath = new MonsterPathInfo(pId)
    // }

    public getStartPos(): cc.Vec3 {
        return this.startPos;
    }

    public getScale(): number {
        return this.data.scale;
    }

    public deathSound(): string {
        return this.data.deathSe;
    }

    public getMoney(): number {
        return this.money;
    }

    // 获取标签
    public getTag(): number[] {

        return this.data.tag;
    }

    //-------------- IShootInfo --------------
    isLiving(): boolean {
        return this.state == BtAckObjState.Run;
    }

    // buff 缩放
    getBuffScale(): number {
        return this.data.buffEff / 100;
    }

    protected updateBuffValue() {
        // throw new Error('Method not implemented.');
    }
    protected resetValue() {
        this.ackPower = this.data.atk;
    }

    getID(): number {
        return this.data.id;
    }
    getObjType(): GameObjectType {
        return GameObjectType.Monster;
    }

    public changeHp(value: number, realyHP: boolean): number {

        if (this.endlessHp == 1) {
            this._curHp += value;
            return value;
        }

        let ret = super.changeHp(value, realyHP);

        return ret;
    }


    getMaxHp(): number {
        return this.hp;
    }

    /**
     * 
     * @returns 防御等级
     */
    public getDefLv(): number {
        return this.defLv;
    }

    public getDamLv(): number {
        return this.damLv;
    }

    // 炮台攻击
    public getAttack(ext: boolean = false): number {
        return this.ackPower;
    }


    getDamAppend(): number {
        // throw new Error('Method not implemented.');
        return 0; //TODO
    }
    getDamMul(): number {
        // throw new Error('Method not implemented.');
        return 0; //TODO
    }
    getAttackMul(): number {
        // let a = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.Monster_attackMul);
        // return a;
        return this._attackMul;
    }
    getDamAdd(): number {
        // throw new Error('Method not implemented.');
        return 0; //TODO
    }
    getDef(): number {
        // throw new Error('Method not implemented.');
        return 0; //TODO
    }

    /// --------------------IShootInfo end --------------------
}

export class TripodInfo extends IShootInfo {

    private _maxHp: number = 0;   // 最大血量
    protected _maxHpAddPer: number = 0;   // 最大血量增加百分比

    constructor() {
        super();
        this.state = BtAckObjState.Run;

        this._maxHp = GameControl.getInstance().getHpDefule();

        // GameControl.getInstance().getHpAddByOutside() //+ this.data.hp;
        this._curHp = this._maxHp;
        //SP=(A)*(1+C/100)+B 初始护盾
        let A = GameControl.getInstance().getShieldDefule();
        let B = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_SPAdd);
        let C = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_SPMul);

        this._curShield = A + B + (this._curHp * C / 100);


        if (GameControl.getInstance().isTeamBaid()) {
            let list = ConfigMgr.getInstance().getById(4, TeamCopyKvData).val.split(",").map((v) => { return parseInt(v) })
            this._curHp = this._maxHp = list[0];
            this._curShield = list[1];
        }
        //- 初始SP（护盾）最大值=初始HP最大值
        // A+B+（初始SP最大值*C/100）
        console.log("初始护盾", this._curShield, A, B, C, this._curHp);

    }

    // 修改 当前护盾
    public changeShield(value: number): number {
        let oldV = Math.ceil(this._curShield);
        this._curShield += value;

        let iRet: number = 0;
        let sy = 0;//实际减少量
        if (this._curShield <= 0) {
            iRet = this._curShield;
            sy = this._curShield;
            this._curShield = 0;
        }

        iRet = Math.ceil(this._curShield) - oldV;
        GlobalEventMgr.getInstance().emit(GlobalEventID.show_change_shield, iRet); // 血量恢复
        return sy;
    }

    // 获取当前护盾
    public getCurShield(): number {
        return this._curShield;
    }

    // 护盾上限
    // public getMaxShield(): number {
    //     return this._maxHp;
    // }

    // 修改当前hp
    public override  changeHp(value: number, realyHP: boolean = false): number {
        if (!realyHP && value < 0 && this._curShield > 0) {
            // 减盾
            value = this.changeShield(value);
        }
        let oldV = Math.ceil(this._curHp);
        this._curHp += value;
        // this._curHp = Math.floor(this._curHp)
        let iRet: number = 0;
        if (this._curHp > this.getMaxHp()) {
            iRet = this._curHp - this.getMaxHp();
            this._curHp = this.getMaxHp();
        } else if (this._curHp <= 0) {
            iRet = this._curHp;
            this._curHp = 0;
        }
        let cVal = Math.ceil(this._curHp) - oldV;
        GlobalEventMgr.getInstance().emit(GlobalEventID.show_change_hp, value); // 血量恢复
        return iRet;
    }

    // public hpProgress(): number {
    //     return this._curHp / this.getMaxHp();
    // }


    public doUpdate(dt: number) {
    }

    relife() {
        this.changeHp(this.getMaxHp());
        for (let i = 0; i < this._buffect.length; i++) {
            this._buffect[i].toEnd()
        }
    }

    // 获取发射包信息
    public getShootBagInfo(parm: shootBagParm, sId: number, ext: boolean = false): ShootBagInfo {
        let info: ShootBagInfo = null;
        if (sId > 0) {
            info = new ShootBagInfo(sId, GameObjectType.Turret, parm);
        }
        return info;
    }

    //-------------- IShootInfo --------------
    isLiving(): boolean {
        return this.state == BtAckObjState.Run;
    }

    // buff 缩放
    getBuffScale(): number {
        return 1.0;
    }

    protected updateBuffValue() {
    }

    protected resetValue() {
    }

    getID(): number {
        return 1;
    }

    getObjType(): GameObjectType {
        return GameObjectType.Cart;
    }

    // hp 上限
    public getMaxHp(): number {
        return this._maxHp * (1 + this._maxHpAddPer / 100);
    }

    fixHpMax(varlue): number {
        let change = this._maxHp * (varlue - this._maxHpAddPer) / 100;
        this._maxHpAddPer = varlue;
        this.changeHp(change); // 血量修改
        return change;
    }

    public getMaxSp(): number {
        return this.getMaxHp();
    }

    // 防御等级
    public getDefLv(): number {
        return this._defLv;
    }

    public getDef(): number {
        return this._def;
    }

    getAttack(ext: boolean = false): number {
        throw new Error('Method not implemented.');
    }
    getFixFireInterval(): number {
        throw new Error('Method not implemented.');
    }
    getDamAppend(): number {
        throw new Error('Method not implemented.');
    }

    getDamLv(): number {
        throw new Error('Method not implemented.');
    }
    getDamMul(): number {
        throw new Error('Method not implemented.');
    }
    getAttackMul(): number {
        throw new Error('Method not implemented.');
    }
    getDamAdd(): number {
        throw new Error('Method not implemented.');
    }

}

/**波次掉落 */
export interface MonsterWaveInfo {
    /** 掉落波次*/
    waveIndex: number,//
    /** 怪物波次内编号*/
    index: number,//
    /** 怪物ID*/
    monsterId: number,//
    /** 怪物类型,//0 普通怪物 1精英怪物2Boss*/
    monsterType: number,//
}


/**波次掉落 */
export interface WaveDropInfo {
    waveIndex: number,//掉落波次
    dropList: DropInfo[]//掉落列表
}

export interface DropInfo {

    index: number,//怪物波次内编号
    itemVo: ItemVo[]//掉落物品
}


// 关卡信息
export class PassInfo {
    data: PassData = null;   // 路线数据
    mapConfig: MapConfigInfo = null; // 地图配置

    startTime: number = 0;   // 开始时间
    gameSpeed: number = 1;   // 游戏速度
    speedAD: boolean = false;
    runTime: number = 0;   // 游戏运行时间
    nextWave: number = 0;   // 下一个波数
    curWaveInfos: WaveInfo[] = [];   // 波次信息

    protected _gameCoin: number = 0;   // 游戏金币

    coin_refrush: number = 0;   // 金币刷新
    drawTimes: number = 0;   // 抽卡次数

    video3in1Max: number = 10; // 视频3选1 最大 次数
    video3in1Cur: number = 0; // 视频3选1 当前次数
    videoAllPowupMax: number = 3; // 视频 强化全都要 最大 次数
    videoAllPowupCur: number = 0; // 视频 全都要 当前次数

    videoAllWapenCur: number = 0; // 视频 强化全都要 当前次数
    videoAllWapenMax: number = 10; // 视频 强化全都要 最大 次数

    videoFreeCoinMax: number = 3; // 视频 免费金币 最大 次数
    videoFreeCoinCur: number = 0; // 视频 免费金币 当前次数

    // costMp: number = 0;
    // heroList: RoleInfo[] = []; // 英雄列表

    reliveCount: number = 0; // 复活次数
    reliveBuff: BuffEffectInfo = null; // 复活buff

    passWaveCount: number = 0; // 通关波数
    maxPassWave: number = 0; // 最大波数

    hpDeath: number = 0; // hp<0 死亡
    stickList: number[][] = []; // 关卡初始棍子列表第一个参数是棍子ID，第二个是等级
    // private _monsterTotalNum: number = 0; // 总怪物数量

    private _allWaveInfos: WaveInfo[] = []; // 所有波次信息

    protected _allMonsterWaveInfo: MonsterWaveInfo[] = [];//所有波次怪物信息
    protected _waveDorp: WaveDropInfo[] = [];//波次掉落

    protected _DropAwardList: ItemVo[] = [];//玩家收集的真实掉落的道具列表

    protected yuanbaoDropNum: number = 0;//元宝掉落数量
    protected yuanbaoDropMaxNum: number = 0;//元宝掉落最大数量

    public get gameCoin(): number {
        return this._gameCoin;
    }   // 游戏金币
    public set gameCoin(value: number) {
        this._gameCoin = value;

        GlobalEventMgr.getInstance().emit(GlobalEventID.GAME_COIN_CHANGE, this._gameCoin);
    }

    public get allWaveInfos(): WaveInfo[] {
        return this._allWaveInfos;
    }

    constructor(pid: number) {
        this.data = ConfigMgr.getInstance().getById(pid, PassData);

        this.startTime = Date.now();

        // this.video3in1Max = parseInt(ConfigMgr.getInstance().getById(27, KvData).val);
        // this.videoAllPowupMax = parseInt(ConfigMgr.getInstance().getById(28, KvData).val);
        this.reSetWaveDropInfo();
        let hpResult = CommonUtils.divideInterval(this.data.wavesHP[0], this.data.wavesHP[1], this.data.waves.length);
        for (let i = 0; i < this.data.waves.length; i++) {
            let tempWave = this.createWaveInfo(this.data.waves[i], i, hpResult[i], this.data.atkMul);
            tempWave.atkMul = this.data.atkMul; // 攻击倍率
            tempWave.weather1 = this.data.weather1[i];
            tempWave.weather2 = this.data.weather2[i];
            this._allWaveInfos.push(tempWave);
        }
        // this.maxPassWave = GameControl.getInstance().maxPassWave;
        this.mapConfig = new MapConfigInfo(this.data.battleField);
        this.resetYuanBaoDrop();
        this.drawTimes = 0;
        this.gameCoin = this.data.startMoney; // 初始化金币

        this.videoAllWapenMax = this.data.needAll;
        this.videoFreeCoinCur = 0;
        for (let i = 0; i < this.data.stickList.length; i += 2) {
            this.stickList.push([this.data.stickList[i], this.data.stickList[i + 1]]);
        }
        this.resetDrawCoin();

    }


    resetYuanBaoDrop() {

        this.yuanbaoDropMaxNum = 0;
        this.yuanbaoDropNum = 0;
        let dropList = PassiveSkillMgr.getInstance().getDropList();
        if (dropList.length > 0) {
            this.yuanbaoDropMaxNum = dropList[3] * this.data.item1;
        }

    }

    getYuanBaoDropNum(): number[] {
        return [this.yuanbaoDropNum, this.yuanbaoDropMaxNum];
    }

    addYuanBaoNum(num) {
        this.yuanbaoDropNum += num;
    }


    getAward(itemId: number) {
        // console.error("this._DropAwardList", this._DropAwardList)
        for (let i = 0; i < this._DropAwardList.length; i++) {
            if (this._DropAwardList[i].itemID == itemId) {
                return this._DropAwardList[i];
            }
        }
        return null;
    }

    pushDropAwardList(itemVo: ItemVo) {
        let item = this.getAward(itemVo.itemID);
        if (item) {
            item.num += itemVo.num;
        } else {
            this._DropAwardList.push(itemVo)
        }
    }

    getDropAwardList(): ItemVo[] {
        return this._DropAwardList;
    }

    setAllMonsterWaveInfo() {
        this._allMonsterWaveInfo = [];
        let passData = this.data;
        for (let i = 0; i < passData.waves.length; i++) {
            let waveId = passData.waves[i];
            let monsterIdList = ConfigMgr.getInstance().getById(waveId, WaveTimesData)?.monsterID;
            for (let j = 0; j < monsterIdList.length; j++) {
                let monsterId = monsterIdList[j];
                let monsterData = ConfigMgr.getInstance().getById(monsterId, MonsterData);
                this._allMonsterWaveInfo.push({ waveIndex: i, index: j, monsterId: monsterId, monsterType: monsterData.type });
            }
        }

    }
    /**0,小怪，1精英怪，2，boss */
    getMonsterWaveInfoByType(type): MonsterWaveInfo[] {
        let list: MonsterWaveInfo[] = [];
        for (let i = 0; i < this._allMonsterWaveInfo.length; i++) {
            let item = this._allMonsterWaveInfo[i];
            if (item.monsterType == type) {
                list.push(item);
            }
        }
        return list;
    }

    protected reSetWaveDropInfo() {
        this.setAllMonsterWaveInfo();
        this._waveDorp = [];
        let passData = this.data;
        let dropList = [];
        if (passData) {
            dropList = (passData?.drop || []).concat(passData?.drop2 || []);
        }
        //dropList=[1,24,10,2,24,20,2,24,30,-4,24,3];
        if (!passData || dropList.length == 0) {
            return;
        }

        let waves = passData.waves.length - 1;
        for (let i = 0; i < dropList.length; i = i + 3) {
            let index = dropList[i];
            let waveId;
            let waveIndex
            if (index == -4) {//boss随机掉落
                let list = this.getMonsterWaveInfoByType(2);
                if (list.length == 0) {
                    continue;
                }
                let rewardList = GameHelp.getInstance().getDataList(dropList[i + 1], dropList[i + 2]);
                rewardList.forEach((val, idx) => {
                    let monsterInfo = list[Random.range(0, list.length - 1)];
                    waveIndex = monsterInfo.waveIndex;
                    index = monsterInfo.index;
                    this._waveDorp.push({ waveIndex: waveIndex, dropList: [{ index: index, itemVo: [val] }] });
                });
            } else if (index == -3) {//精英怪随机掉落
                let list = this.getMonsterWaveInfoByType(1);
                if (list.length == 0) {
                    continue;
                }
                let rewardList = GameHelp.getInstance().getDataList(dropList[i + 1], dropList[i + 2]);
                rewardList.forEach((val, idx) => {
                    let monsterInfo = list[Random.range(0, list.length - 1)];
                    waveIndex = monsterInfo.waveIndex;
                    index = monsterInfo.index;
                    this._waveDorp.push({ waveIndex: waveIndex, dropList: [{ index: index, itemVo: [val] }] });
                });
            } else if (index == -2) {//小怪随机掉落
                let list = this.getMonsterWaveInfoByType(0);
                if (list.length == 0) {
                    continue;

                }
                let rewardList = GameHelp.getInstance().getDataList(dropList[i + 1], dropList[i + 2]);
                rewardList.forEach((val, idx) => {
                    let monsterInfo = list[Random.range(0, list.length - 1)];
                    waveIndex = monsterInfo.waveIndex;
                    index = monsterInfo.index;
                    this._waveDorp.push({ waveIndex: waveIndex, dropList: [{ index: index, itemVo: [val] }] });
                });
            } else if (index == -1) {//-1=全随机
                let rewardList = GameHelp.getInstance().getDataList(dropList[i + 1], dropList[i + 2]);
                rewardList.forEach((val, idx) => {
                    waveIndex = Random.range(0, waves);
                    waveId = passData.waves[waveIndex];
                    this._waveDorp.push({ waveIndex: waveIndex, dropList: this.getWaveDropInfo([val], waveId) });
                });
            } else {
                if (index == 0) {//0=随机某一波掉落
                    waveIndex = Random.range(0, waves);
                } else {
                    waveIndex = index - 1;//固定波次
                }
                waveId = passData.waves[waveIndex];
                let rewardList = GameHelp.getInstance().getDataList(dropList[i + 1], dropList[i + 2]);
                this._waveDorp.push({ waveIndex: waveIndex, dropList: this.getWaveDropInfo(rewardList, waveId) });
            }

        }
        // console.log("波次掉落未整理数据:", this._waveDorp, "string:", JSON.stringify(this._waveDorp));
        this._waveDorp = this.mergeWaveDropData(this._waveDorp);
        // console.warn("波次掉落整理数据:", this._waveDorp, "string:", JSON.stringify(this._waveDorp));
    }



    /**
 * 合并波次掉落数据，去除重复项
 * @param waveDropArray 待合并的波次掉落数组
 * @returns 合并后的 WaveDropInfo 数组
 */
    mergeWaveDropData(waveDropArray: WaveDropInfo[]): WaveDropInfo[] {
        const waveMap = new Map<number, WaveDropInfo>();

        waveDropArray.forEach(waveDrop => {
            const { waveIndex, dropList } = waveDrop;

            if (!waveMap.has(waveIndex)) {
                // 新波次，直接创建
                waveMap.set(waveIndex, {
                    waveIndex,
                    dropList: [...dropList]
                });
            } else {
                // 合并相同波次的掉落列表
                const existingWave = waveMap.get(waveIndex)!;
                const mergedDropList = this.mergeDropList(existingWave.dropList, dropList);
                waveMap.set(waveIndex, {
                    waveIndex,
                    dropList: mergedDropList
                });
            }
        });

        return Array.from(waveMap.values());
    }

    /**
     * 合并怪物掉落列表
     */
    mergeDropList(list1: DropInfo[], list2: DropInfo[]): DropInfo[] {
        const dropMap = new Map<number, DropInfo>();

        // 先处理第一个列表
        list1.forEach(drop => {
            dropMap.set(drop.index, { ...drop });
        });

        // 合并第二个列表
        list2.forEach(drop => {
            if (!dropMap.has(drop.index)) {
                // 新怪物编号，直接添加
                dropMap.set(drop.index, { ...drop });
            } else {
                // 合并相同怪物的掉落物品
                const existingDrop = dropMap.get(drop.index)!;
                const mergedItemVo = this.mergeItemVo(existingDrop.itemVo, drop.itemVo);
                dropMap.set(drop.index, {
                    index: drop.index,
                    itemVo: mergedItemVo
                });
            }
        });

        return Array.from(dropMap.values());
    }

    /**
     * 合并掉落物品，累加数量
     */
    mergeItemVo(list1: ItemVo[], list2: ItemVo[]): ItemVo[] {
        const itemMap = new Map<number, ItemVo>();

        // 合并两个列表的所有物品
        [...list1, ...list2].forEach(item => {
            if (!itemMap.has(item.itemID)) {
                // 新物品ID
                itemMap.set(item.itemID, {
                    itemID: item.itemID,
                    num: item.num
                });
            } else {
                // 相同物品ID，累加数量
                const existingItem = itemMap.get(item.itemID)!;
                itemMap.set(item.itemID, {
                    itemID: item.itemID,
                    num: existingItem.num + item.num
                });
            }
        });

        return Array.from(itemMap.values());
    }

    getDropInfoByWaveId(waveIndex: number): WaveDropInfo {
        let dropInfo = null;
        for (let i = 0; i < this._waveDorp.length; i++) {
            if (this._waveDorp[i].waveIndex == waveIndex) {
                dropInfo = this._waveDorp[i];
                break;
            }
        }
        return dropInfo;
    }


    public getWaveDropInfo(rewardList: { itemID: number, num: number }[], waveId: number): DropInfo[] {
        let dropInfo: DropInfo[] = [];
        let itemList = [];//道具列表,名字，数量都是1
        let waveTimes: number[] = ConfigMgr.getInstance().getById(waveId, WaveTimesData).monsterID;
        let monsterNum = waveTimes.length;
        rewardList.forEach((val, index) => {
            let realItemVo = UserItemsData.getInstance().getRealItemVo(val.itemID, val.num);
            for (let i = 0; i < realItemVo.num; i++) {
                let index = Random.range(0, itemList.length);
                itemList.splice(index, 0, realItemVo.itemID);
            }
        })
        let fpList: { index: number, itemId: number }[] = []
        itemList.forEach((itemId, index) => {
            let item = { index: Random.range(0, monsterNum - 1), itemId: itemId };
            fpList.push(item);
        })

        function getDropInfoByIndex(index): DropInfo {
            let info = null;
            for (let i = 0; i < dropInfo.length; i++) {
                if (dropInfo[i].index == index) {
                    info = dropInfo[i];
                    break;
                }
            }
            return info
        }

        function getItemVo(itemId: number, itemVoList: ItemVo[]): ItemVo {
            let itemVo = null;
            for (let i = 0; i < itemVoList.length; i++) {
                if (itemVoList[i].itemID == itemId) {
                    itemVo = itemVoList[i];
                    break;
                }
            }
            return itemVo
        }

        fpList.forEach((val, index) => {
            if (getDropInfoByIndex(val.index) == null) {
                dropInfo.push({ index: val.index, itemVo: [{ itemID: val.itemId, num: 1 }] });
            } else {
                let info = getDropInfoByIndex(val.index);
                let itemData = getItemVo(val.itemId, info.itemVo);
                if (itemData) {
                    itemData.num++;
                } else {
                    info.itemVo.push({ itemID: val.itemId, num: 1 });
                }
            }
        })

        return dropInfo

    }


    // 重置刷新金币
    protected resetDrawCoin() {
        let allCoin = ConfigMgr.getInstance().getAll(RefreshCostData);
        if (this.drawTimes >= allCoin.length) {
            this.coin_refrush = allCoin[allCoin.length - 1].num
        } else {
            this.coin_refrush = allCoin[this.drawTimes].num;
        }
    }

    // 创建一个波次信息
    protected createWaveInfo(wid: number, index: number, passHp: number, atkMul: number): WaveInfo {
        let tempWave = new WaveInfo(wid, index, this.getDropInfoByWaveId(index), atkMul, this.data.dropMoney);
        tempWave.passHp = passHp;
        tempWave.hpFix = this.data.hpMul; // hp倍率
        tempWave.passMoveMul = this.data.moveMul;

        return tempWave;
    }

    // 创建一个波次信息
    protected createSummonWaveInfo(wid: number, index: number, passHp: number, atkMul: number): SummonWaveInfo {
        let tempWave = new SummonWaveInfo(wid, cc.v3(0, 0));
        tempWave.passHp = passHp;
        tempWave.hpFix = this.data.hpMul; // hp倍率
        tempWave.passMoveMul = this.data.moveMul;
        return tempWave;
    }


    public doUpdate(dt: number, curMst: number) {
        this.runTime += dt * 1000;    // console.log(this._runTime)
    }

    protected newWave() {
        let tempInfo = this._allWaveInfos[this.nextWave];
        this.curWaveInfos.push(tempInfo);
        // tempInfo.summonMonsterNum = 0
        tempInfo.deadMonsterNum = 0
        tempInfo.cordCleanTime = 0;
        this.nextWave++;
        this.drawTimes = 0;
    }

    public relife() {
        this.reliveCount += 1;
    }

    // 复活buff
    public getReliveBuff(): BuffEffectInfo {
        return this.reliveBuff;
    }

    // 金币刷新
    public doCoinRefush(): number {
        this.gameCoin -= this.coin_refrush;
        this.drawTimes += 1;
        this.resetDrawCoin();
        return this.gameCoin;
    }

    public go2NextWave(): WaveInfo[] {
        if (this.nextWave >= this.data.waves.length) {
            return null;
        }
        // this.curWaveInfos.push(this._allWaveInfos[this.nextWave]);//= new WaveInfo(this.data.waves[this.nextWave], this.nextWave);
        // this.nextWave++;
        console.log("前进波次", this.nextWave, this.passWaveCount);
        this.newWave();
        let wt = this.curWaveInfos[this.curWaveInfos.length - 1].waveTimes;
        // this.passWaveCount += 1;
        GameControl.getInstance().setCurWave(wt); // 设置当前波数
        console.log("new wave", this.curWaveInfos[this.curWaveInfos.length - 1].waveTimes);
        // GlobalEventMgr.getInstance().emit(GlobalEventID.game_wave_parogress, this.curWaveInfos[this.curWaveInfos.length - 1].waveTimes, 0);

        return this.curWaveInfos;
    }

    public setNewPassWave(wave: number) {
        this.passWaveCount = wave;
        let passinfo = GameControl.getInstance().getPassInfo();
        if (passinfo && passinfo.data.id > 1 && this.passWaveCount > this.maxPassWave) {
            this.maxPassWave = this.passWaveCount;
            const point = this.data.id * 100 + this.maxPassWave;
            console.log(`排行更新-最新分数 point:${point}`);
            if (window["wx"] && cc.sys.platform == cc.sys.WECHAT_GAME) {
                window["wx"]?.postMessage({
                    event: 'setScore',
                    score: point
                });
            }
        }
    }

    public getBattleMap(): string {
        return "GMap_" + this.data.secne1;
    }

    public getCurWave(): WaveInfo[] {
        return this.curWaveInfos;
    }

    public getWaveCount(): number {
        return this.data.waves.length;
    }

    public hasNextWave(): boolean {
        return this.curWaveInfos[this.nextWave - 1].waveTimes < this.data.waves.length - 1;
    }


    // 关卡 视频武器
    public canShowVideoWapen(): boolean {
        return this.data.advLv3 == 1; // return false;
    }


    /**
     * @ 最大复活次数
     * @returns 
     */
    maxReliveCount(): number {
        return this.data.revive;
    }

    /**
     * @deprecated 初始能量值百分比
     * @returns 
     */
    engryStartPer(): number {
        // return this.data.engryStart / 100;
        return 0;
    }

    /**
     * @deprecated 3级合成引导次数
     * @returns 
     */
    lv3WapenLine(): number {
        // return this.data.lv3Wapen;
        return 0;
    }

    isNextAreaWave(): boolean {
        // return this.data.interval[this.nextWave] == -1;
        return false;
    }

    // // 起火系数
    // public getFireFactor(): number {
    //     return this.data.fireFactor;
    // }

}


// 召唤波次信息
export class SummonWaveInfo {
    data: WaveTimesData; // 波数数据
    waveTimes: number; // 当前波数
    waveRunTime: number; // 波次运行时间
    addMonsterTime: number = 0; // 添加怪物时间
    curMonsterNum: number; // 当前怪物数量
    sameWaveMonsterTime: number[] = []; // 同波次怪物时间

    mInfos: MonsterInfo[] = []; // 怪物信息
    canAddMonster: boolean = true; // 是否可以添加怪物
    // bossCount: number = 0; // boss数量
    hpFix: number = 1; // 血量修正
    passHp: number = 1; // 关卡血量
    passMoveMul: number = 1;

    atkFix: number = 1; // 攻击修正

    // passMp: number = 0; // 关卡能量值
    passAtk: number = 0; // 关卡攻击
    // waveCoin: number = 0; // 波次经验
    waveHpWeight: number = 0; // 波次权重
    // waveCoinWeight: number = 0; // 波次权重
    copyInfos: Set<MonsterInfo> = new Set(); // 复制怪物信息-用作计算

    livingMonsterNum: number = 0; // 存活怪物数量
    deadMonsterNum: number = 0; // 死亡怪物数量

    atkMul: number = 1; // 攻击倍数

    baseWPos: cc.Vec3 = cc.v3(0, 0, 0); // 基础位置

    constructor(wid: number, bWpos: cc.Vec3) {
        this.data = ConfigMgr.getInstance().getById(wid, WaveTimesData);
        this.waveTimes = -1;
        this.waveRunTime = 0;
        this.curMonsterNum = 0;

        this.addMonsterTime = 0;
        let monsterIndex = 0;
        this.baseWPos = bWpos;

        let index = 0, id = 0, nums = 0, mstIndex = 0;
        const mstIDS = this.getMonsterID(), mstNUMS = this.getMonsterNum();
        for (index = 0; index < mstIDS.length; index++) {
            id = mstIDS[index];
            nums = mstNUMS[index];
            for (mstIndex = 0; mstIndex < nums; mstIndex++) {
                let mInfo = new MonsterInfo(id);
                mInfo.basePos = this.baseWPos.clone();
                monsterIndex++;
                if (!mInfo.data) {
                    console.error(`not find monster id=${id}`);
                    continue;
                }
                mInfo.waveNum = index;
                // mInfo.damLv = this.damLv;
                // mInfo.defLv = this.defLv;
                mInfo.setAckMul(this.atkMul);
                this.mInfos.push(mInfo);
                // this.waveHpWeight += mInfo.data.hpWeight;
                // this.waveCoinWeight += mInfo.data.coinWeight;
            }
        }
    }

    getMonsterInfo(): MonsterInfo {
        if (this.curMonsterNum >= this.mInfos.length) {
            return null;
        }
    }

    checkWaveEnd(): boolean {
        if (this.curMonsterNum >= this.getMonsterID().length) {
            return true;
        }
        return false;
    }

    checkCanAddMons(): void {
        if (this.livingMonsterNum >= this.data.limit1) {
            this.canAddMonster = false;
        }

        if (this.livingMonsterNum <= this.data.limit2) {
            this.canAddMonster = true;
        }

    }

    // public haveBoss(): boolean {
    //     return this.bossCount > 0;
    // }

    needCreateMonster(dt: number, curNum: number): MonsterInfo[] {
        if (!this.canAddMonster) return [];
        this.waveRunTime += dt * 1000;
        let mInfos: MonsterInfo[] = [];
        let allMonsterNum = this.getAllMonsterNum();
        if (this.curMonsterNum > allMonsterNum) return mInfos;
        if (this.canAddMonster) this.addMonsterTime += dt * 1000;

        // 当场上没有怪物时，尽量快进 addMonsterTime 以减少开局延迟（保留原行为）
        if (curNum <= 0) {
            const first = this.mInfos.find(mi => !this.copyInfos.has(mi));
            if (first) {
                const startIdx = first.waveNum;
                if (!this.sameWaveMonsterTime[startIdx]) this.sameWaveMonsterTime[startIdx] = Utils.getNowSecondTime();
                if (this.addMonsterTime < (this.data.loc3[startIdx] || 0) - 1000) {
                    this.addMonsterTime = (this.data.loc3[startIdx] || 0) - 500;
                }
            }
        }

        const now = Utils.getNowSecondTime();

        // 为保证同波次内顺序，先找到每个波次的下一个待刷怪物（waveIdx -> next MonsterInfo）
        const nextPerWave: Map<number, MonsterInfo> = new Map();
        for (let i = 0; i < this.mInfos.length; i++) {
            const mi = this.mInfos[i];
            if (!mi) continue;
            if (this.copyInfos.has(mi)) continue;
            const w = mi.waveNum;
            const exist = nextPerWave.get(w);
            if (!exist || mi.waveIDNum < exist.waveIDNum) nextPerWave.set(w, mi);
        }

        const _this = this;
        // 遍历每个波次的下一个待刷怪，判断是否满足该波次的开放时间与间隔
        nextPerWave.forEach((mi, waveIdx) => {
            if (_this.curMonsterNum >= allMonsterNum) return;

            // 波次开放判断（使用 waveRunTime 与 loc3 对齐）
            const waveOpen = (this.waveRunTime >= (_this.data.loc3 ? _this.data.loc3[waveIdx] : 0));
            if (waveOpen) {
                // 初始化同波次计时器
                if (!_this.sameWaveMonsterTime[waveIdx]) _this.sameWaveMonsterTime[waveIdx] = now;

                const offsetSec = now - _this.sameWaveMonsterTime[waveIdx];
                const interval = (_this.data.intervalTime && _this.data.intervalTime[waveIdx]) ? _this.data.intervalTime[waveIdx] : 0;
                const allowFirstImmediately = mi.waveIDNum === 0;
                const canSpawn = offsetSec > 0 ? (offsetSec * 1000 >= interval) : allowFirstImmediately;
                if (canSpawn) {
                    // 生成该怪物
                    _this.copyInfos.add(mi);
                    _this.sameWaveMonsterTime[waveIdx] = now;

                    // 出生位置
                    if (waveIdx >= _this.data.loc1.length) mi.birthPos = MonsterBrithType.Loc0;
                    else mi.birthPos = _this.data.loc1[waveIdx] || MonsterBrithType.Loc0;

                    if (mi.birthPos == MonsterBrithType.RealyPos) {
                        mi.startPos = cc.v3(_this.data.loc2[waveIdx], _this.data.loc2[waveIdx + 1]);
                    } else {
                        if (waveIdx >= _this.data.loc2.length) mi.birthAlignment = MonsterBrithAlignment.Center
                        else mi.birthAlignment = _this.data.loc2[waveIdx] || MonsterBrithAlignment.Center
                    }

                    // 血量与移动倍数
                    const db = _this.data.hp || 1;
                    mi.hp = mi.data.hp * db * _this.passHp * _this.hpFix;
                    mi.resetCurHp(mi.hp);
                    mi.passMoveMul = _this.passMoveMul;

                    mInfos.push(mi);
                    try { (mi as any)._originWave = this; } catch (e) { }
                    _this.curMonsterNum++;
                    _this.livingMonsterNum++;
                }
            }
        })

        return mInfos;
    }

    /**
   * 获取怪物id
   * @returns 怪物id
   */
    public getMonsterID(): number[] {
        return this.data.monsterID;
    }

    /**获取怪物数量*/
    public getMonsterNum(): number[] {
        return this.data.monsterCount;
    }

    public getAllMonsterNum(): number {
        let allMonsterNum = 0;
        const nums = this.getMonsterNum();
        for (let i = 0; i < this.getMonsterID().length; i++) {
            let result = i > (nums.length - 1) ? 0 : nums[i];
            allMonsterNum += result;
        }
        // console.error(` WaveInfo.curMstNum:${this.curMonsterNum}, allMstNum ${this.allMonsterNum} , summonMstNum:${this.summonMonsterNum}    `);
        return allMonsterNum;
    }

    /**
  * 怪物死亡
  */
    public deadMonster() {
        // 防御性检查：避免重复/超出计数
        if (this.livingMonsterNum > 0) {
            this.deadMonsterNum++;
            this.livingMonsterNum--;
        } else {
            console.warn(`warn: WaveInfo.deadMonster called but livingMonsterNum <= 0 (wave=${this.waveTimes})`);
        }
        // console.error(` WaveInfo.deadMonster called but livingMonsterNum ${this.livingMonsterNum} , deadMonsterNum:${this.deadMonsterNum}, summonMonsterNum:${this.summonMonsterNum}    `);
        GlobalEventMgr.getInstance().emit(GlobalEventID.game_wave_parogress, this.waveTimes, this.mInfos.length > 0 ? this.deadMonsterNum / this.mInfos.length : 0);
    }

    public cordCleanTime: number = 0;
    public hasClean(): boolean {
        if (this.deadMonsterNum >= this.getAllMonsterNum()) {
            this.cordCleanTime = 0;
            return true;
        }
        // if (this.livingMonsterNum <= 0) {
        //     //当场面怪都清完了，还有召唤怪出去了。
        //     let newTime = (new Date()).getTime();
        //     if (!this._cordCleanTime) this._cordCleanTime = newTime;
        //     if (newTime - this._cordCleanTime >= 5000) {
        //         this._cordCleanTime = 0;
        //         return true;
        //     }
        // }
        return false;
    }
}


// 波次信息
export class WaveInfo {
    data: WaveTimesData; // 波数数据
    waveTimes: number; // 当前波数
    waveRunTime: number; // 波次运行时间
    sameWaveMonsterTime: number[] = []; // 同波次怪物时间
    addMonsterTime: number = 0; // 添加怪物时间
    curMonsterNum: number = 0; // 当前怪物数量
    allMonsterNum: number = 0; // 总怪物数量

    hpFix: number = 1; // 血量修正
    passHp: number = 0; // 关卡血量
    passMoveMul: number = 1;

    atkFix: number = 1; // 攻击修正

    // passMp: number = 0; // 关卡能量值
    passAtk: number = 0; // 关卡攻击
    // waveCoin: number = 0; // 波次经验
    waveHpWeight: number = 0; // 波次权重
    // waveCoinWeight: number = 0; // 波次权重
    mInfos: MonsterInfo[] = []; // 怪物信息
    copyInfos: Set<MonsterInfo> = new Set(); // 复制怪物信息-用作计算
    canAddMonster: boolean = true; // 是否可以添加怪物
    // bossCount: number = 0; // boss数量

    livingMonsterNum: number = 0; // 存活怪物数量
    deadMonsterNum: number = 0; // 死亡怪物数量
    summonMonsterNum: number = 0; // 召唤怪物数量
    damLv: number = 1; // 怪物伤害等级
    defLv: number = 1; // 怪物防御等级
    atkMul: number = 1; // 攻击倍数

    weather1: number = 0;   // 天气
    weather2: number = 0;  // 雾



    constructor(wid: number, wTime: number, dropInfo: WaveDropInfo, atkMul: number, dropMoney: number) {
        this.data = ConfigMgr.getInstance().getById(wid, WaveTimesData);
        this.waveTimes = wTime;
        this.waveRunTime = 0;
        this.curMonsterNum = 0;
        this.waveHpWeight = 0;
        // this.waveCoinWeight = 0;
        this.addMonsterTime = 0;
        let monsterIndex = 0;
        this.copyInfos.clear();
        function getWaveIdDropInfoByIndex(waveId: number, index: number): ItemVo[] {
            let itemList = [];
            if (dropInfo) {
                for (let i = 0; i < dropInfo.dropList.length; i++) {
                    if (dropInfo.dropList[i].index == index) {
                        itemList = dropInfo.dropList[i].itemVo;
                        break;
                    }
                }
            }
            return itemList;
        }
        this.summonMonsterNum = 0;
        //console.log("dropInfo", dropInfo, wTime)
        let totalMoney = 0, index = 0, id = 0, nums = 0, mstIndex = 0;
        const mstIDS = this.getMonsterID(), mstNUMS = this.getMonsterNum();
        for (index = 0; index < mstIDS.length; index++) {
            id = mstIDS[index];
            nums = mstNUMS[index];
            for (mstIndex = 0; mstIndex < nums; mstIndex++) {
                let mInfo = new MonsterInfo(id);
                if (totalMoney > dropMoney) {
                    mInfo.setMoney(0)
                } else {
                    totalMoney += mInfo.getMoney();
                }
                if (dropInfo) {
                    let dropAward = getWaveIdDropInfoByIndex(wTime, monsterIndex);
                    mInfo.setDropItem(dropAward);
                }

                monsterIndex++;
                if (!mInfo.data) {
                    console.error(`not find monster id=${id}`);
                    continue;
                }
                mInfo.waveNum = index;
                mInfo.waveIDNum = mstIndex;
                mInfo.damLv = this.damLv;
                mInfo.defLv = this.defLv;
                mInfo.setAckMul(atkMul);
                this.mInfos.push(mInfo);
                this.waveHpWeight += mInfo.data.hpWeight;
                // this.waveCoinWeight += mInfo.data.coinWeight;
                if (mInfo && mInfo.getMonsterType() == MonsterType.Boss) {
                    // this.bossCount += 1;
                    // console.log(`bossCount=${this.bossCount}`);
                }
            }
            // getSummonMonsterNum(id);
        }

        // if (this.getMonsterID().length != this.data.loc1.length || this.getMonsterID().length != this.data.loc2.length || this.getMonsterID().length != this.data.loc3.length) {
        //     console.error(`wavetime error, monster=${this.getMonsterID().length}, loc1=${this.data.loc1.length}, loc2=${this.data.loc2.length}, loc3=${this.data.loc3.length}`);
        // }

    }

    relife() {
        this.waveRunTime = 0;
        this.curMonsterNum = 0;
        this.addMonsterTime = 0;
        this.livingMonsterNum = 0;
        this.deadMonsterNum = 0;
        // this.summonMonsterNum = 0;
        this.canAddMonster = true;

        for (const mInfo of this.mInfos) {
            mInfo.relife();
        }
    }

    // fixPassMp(per: number) {
    //     this.passMp = this.passMp + this.passMp * per / 100; // 加成
    // }

    getMonsterInfo(): MonsterInfo {
        if (this.curMonsterNum >= this.mInfos.length) {
            return null;
        }
    }

    checkWaveEnd(): boolean {
        if (this.curMonsterNum >= this.getAllMonsterNum()) {
            return true;
        }
        return false;
    }

    checkCanAddMons(): void {
        if (this.livingMonsterNum >= this.data.limit1) {
            this.canAddMonster = false;
        }

        if (this.livingMonsterNum <= this.data.limit2) {
            this.canAddMonster = true;
        }

    }


    // 遍历每个波次的下一个待刷怪，判断是否满足该波次的开放时间与间隔
    needCreateMonster(dt: number, curNum: number): MonsterInfo[] {
        if (!this.canAddMonster)
            return [];
        this.waveRunTime += dt * 1000;
        let mInfos: MonsterInfo[] = [];
        let allMonsterNum = this.getAllMonsterNum();
        if (this.curMonsterNum > allMonsterNum)
            return mInfos;
        if (this.canAddMonster) this.addMonsterTime += dt * 1000;

        // 当场上没有怪物时，尽量快进 addMonsterTime 以减少开局延迟（保留原行为）
        if (curNum <= 0) {
            const first = this.mInfos.find(mi => !this.copyInfos.has(mi));
            if (first) {
                const startIdx = first.waveNum;
                if (!this.sameWaveMonsterTime[startIdx]) this.sameWaveMonsterTime[startIdx] = Utils.getNowSecondTime();
                if (this.addMonsterTime < (this.data.loc3[startIdx] || 0) - 1000) {
                    this.addMonsterTime = (this.data.loc3[startIdx] || 0) - 500;
                }
            }
        }

        const now = Utils.getNowSecondTime();

        // 为保证同波次内顺序，先找到每个波次的下一个待刷怪物（waveIdx -> next MonsterInfo）
        const nextPerWave: Map<number, MonsterInfo> = new Map();
        for (let i = 0; i < this.mInfos.length; i++) {
            const mi = this.mInfos[i];
            if (!mi) continue;
            if (this.copyInfos.has(mi)) continue;
            const w = mi.waveNum;
            const exist = nextPerWave.get(w);
            if (!exist || mi.waveIDNum < exist.waveIDNum) nextPerWave.set(w, mi);
        }

        const _this = this;
        // 遍历每个波次的下一个待刷怪，判断是否满足该波次的开放时间与间隔
        nextPerWave.forEach((mi, waveIdx) => {
            if (_this.curMonsterNum >= allMonsterNum) return;

            // 波次开放判断（使用 waveRunTime 与 loc3 对齐）
            const waveOpen = (this.waveRunTime >= (_this.data.loc3 ? _this.data.loc3[waveIdx] : 0));
            if (waveOpen) {
                // 初始化同波次计时器
                if (!_this.sameWaveMonsterTime[waveIdx]) _this.sameWaveMonsterTime[waveIdx] = now;

                const offsetSec = now - _this.sameWaveMonsterTime[waveIdx];
                const interval = (_this.data.intervalTime && _this.data.intervalTime[waveIdx]) ? _this.data.intervalTime[waveIdx] : 0;
                const allowFirstImmediately = mi.waveIDNum === 0;
                const canSpawn = offsetSec > 0 ? (offsetSec * 1000 >= interval) : allowFirstImmediately;
                if (canSpawn) {
                    // 生成该怪物
                    _this.copyInfos.add(mi);
                    _this.sameWaveMonsterTime[waveIdx] = now;

                    // 出生位置
                    if (waveIdx >= _this.data.loc1.length) mi.birthPos = MonsterBrithType.Loc0;
                    else mi.birthPos = _this.data.loc1[waveIdx] || MonsterBrithType.Loc0;

                    if (mi.birthPos == MonsterBrithType.RealyPos) {
                        mi.startPos = cc.v3(_this.data.loc2[waveIdx], _this.data.loc2[waveIdx + 1]);
                    } else {
                        if (waveIdx >= _this.data.loc2.length) mi.birthAlignment = MonsterBrithAlignment.Center
                        else mi.birthAlignment = _this.data.loc2[waveIdx] || MonsterBrithAlignment.Center
                    }

                    // 血量与移动倍数
                    const db = _this.data.hp || 1;
                    mi.hp = mi.data.hp * db * _this.passHp * _this.hpFix;
                    mi.resetCurHp(mi.hp);
                    mi.passMoveMul = _this.passMoveMul;

                    mInfos.push(mi);
                    try { (mi as any)._originWave = this; } catch (e) { }
                    _this.curMonsterNum++;
                    _this.livingMonsterNum++;
                }
            }
        })

        return mInfos;
    }

    /**
     * 获取怪物id
     * @returns 怪物id
     */
    public getMonsterID(): number[] {
        return this.data.monsterID;
    }

    /**获取怪物数量*/
    public getMonsterNum(): number[] {
        return this.data.monsterCount;
    }

    public getAllMonsterNum(): number {
        this.allMonsterNum = 0;
        const nums = this.getMonsterNum();
        for (let i = 0; i < this.getMonsterID().length; i++) {
            let result = i > (nums.length - 1) ? 0 : nums[i];
            this.allMonsterNum += result;
        }
        // console.error(` WaveInfo.curMstNum:${this.curMonsterNum}, allMstNum ${this.allMonsterNum} , summonMstNum:${this.summonMonsterNum}    `);
        return this.allMonsterNum + this.summonMonsterNum;
    }

    public getWavesNumIndex(curMst: number = 0): number {
        const nums = this.getMonsterNum();
        let allMst = 0;
        for (let i = 0; i < nums.length; i++) {
            allMst += nums[i];
            if (curMst < allMst) return i;
        }
        return 0;
    }

    /**
     * 怪物死亡
     */
    public deadMonster() {
        // 防御性检查：避免重复/超出计数
        if (this.livingMonsterNum > 0) {
            this.deadMonsterNum++;
            this.livingMonsterNum--;
        } else {
            console.warn(`warn: WaveInfo.deadMonster called but livingMonsterNum <= 0 (wave=${this.waveTimes})`);
        }
        // console.error(` WaveInfo.deadMonster called but livingMonsterNum ${this.livingMonsterNum} , deadMonsterNum:${this.deadMonsterNum}, summonMonsterNum:${this.summonMonsterNum}    `);
        GlobalEventMgr.getInstance().emit(GlobalEventID.game_wave_parogress, this.waveTimes, this.mInfos.length > 0 ? this.deadMonsterNum / this.mInfos.length : 0);
    }

    public cordCleanTime: number = 0;
    public hasClean(): boolean {
        if (this.deadMonsterNum >= this.getAllMonsterNum()) {
            return true;
        }
        if (this.deadMonsterNum >= this.allMonsterNum) {
            //当场面怪都清完了，还有召唤怪出去了。
            let newTime = (new Date()).getTime();
            if (!this.cordCleanTime) this.cordCleanTime = newTime;
            if (newTime - this.cordCleanTime >= 2500) {
                if (this.deadMonsterNum + this.summonMonsterNum >= this.getAllMonsterNum())
                    return true;
            }
        }
        return false;
    }
}


export class ShootBagInfo {
    // 子弹包信息
    data: ShootBagData = null;   // 子弹包数据
    public parm: shootBagParm = null; // 参数
    public sourceTag: GameObjectType = GameObjectType.None;   // 发射者类型
    ext: boolean = false; // 发射包2
    shootIndex: number = 0; //发射序列

    protected sData: EquipSkillExData[] = null; // 特殊数据

    constructor(sid: number, sTag: GameObjectType, parm: shootBagParm, index: number = 0) {
        this.data = ConfigMgr.getInstance().getById(sid, ShootBagData);
        this.sData = PowUpEffectMgr.getInstance().getShootBagSpecial(sid);
        this.sourceTag = sTag; // 炮台发射的子弹来源标记
        this.parm = parm;
        this.ext = parm.extShoot || false;
        this.shootIndex = index;
    }

    // 子弹id
    public getBulletIds(): number[] {
        let rData = this.data?.bulletIds || [];
        let newData = [].concat(rData)

        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newData = getSpecialV(newData, element.shootBagType1, element.shootBagValue1)
            }
        }
        return newData;
    }

    // 波次间隔
    public getShootInterval(): number[] {
        let rInterval = this.data?.interval || [0];
        let newInterval = [].concat(rInterval)

        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newInterval = getSpecialV(newInterval, element.shootBagType2, element.shootBagValue2)
            }
        }
        return newInterval;
    }

    // 子弹数量
    public getNum(): number[] {
        let rNum = this.data?.num || 0;
        let newNum = [].concat(rNum)
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newNum = getSpecialV(newNum, element.shootBagType4, element.shootBagValue4)
            }
        }
        return newNum;
    }

    // 子弹夹角
    public getAngle(): number[] {
        let rAngle = this.data?.angle || [0];
        let newAngle = [].concat(rAngle)
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newAngle = getSpecialV(newAngle, element.shootBagType5, element.shootBagValue5)
            }
        }
        return newAngle;
    }

    // 伤害许可
    public getTGT(): number[] {
        let tgt = this.data.tgt;
        let newNum = [].concat(tgt)
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newNum = getSpecialV(newNum, element.shootBagType6, element.shootBagValue6)
            }
        }
        return newNum;
    }

    // 技能id
    public getSkills(): number[] {
        let tgt = this.data?.skill || [];
        let newNum = [].concat(tgt)
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newNum = getSpecialV(newNum, element.shootBagType7, element.shootBagValue7)
            }
        }
        return newNum;
    }

    public getEnemySearch(): number[] {
        let tgt = this.data?.enemySearch || [-2];
        let newNum = [].concat(tgt)
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newNum = getSpecialV(newNum, element.shootBagType3, element.shootBagValue3)
            }
        }
        return newNum;
    }
}

export class BulletInfo {
    // 子弹信息
    data: BulletData = null;   // 子弹数据
    bulletSP: BulltetSpEffData = null;   // 子弹特效数据


    movDir: cc.Vec2 = null;                   // 移动方向
    sourceTag: GameObjectType = GameObjectType.None;        // 发射者类型

    liveTime: number = 0;                                  // 存活时间
    state: GameBulletState = GameBulletState.None;          // 子弹状态
    currHitTimes: number = 0;                              // 子弹击中次数
    endCDTime: number = 0;                                  // 子弹结束时间

    fixMovDir: cc.Vec2 = null;                              // 调整移动方向
    fixAngel: number = 0;                               // 调整角度
    imgRadio: number = 0;                               // 子弹旋转角度
    currBouncesTime: number = 0;                              // 子弹反弹次数

    tgt: number[] = null; // 伤害许可

    protected _discrete: number = 0; // 子弹离散角度

    parm: shootBagParm = null; // 子弹包参数
    protected sData: EquipSkillExData[] = null; // 特殊强化数据
    protected shake: number = 0; // 震动

    get targetObj(): BattleAckObject {
        return this.parm.ackTaget;
    };   // 目标对象

    get startWPos(): cc.Vec3 {
        return this.parm.shootWPos;
    };   // 发射位置

    get endPos(): cc.Vec3 {
        return this.parm.endPos;
    };                 // 结束位置

    get isAoe(): boolean {
        return this.parm.isAoe;
    };  // 是否AOE

    // get atk(): number {
    //     return this.parm.turretAtk;
    // }                // 发射位置

    get turretID(): number {
        return this.parm.shootTurretId;
    }

    // get turretEffectPowup(): number {
    //     return this.parm.turretEffectPowup;
    // }

    get firePoewer(): number {
        return this.parm.damAppend;
    }

    // protected sbagInfo: ShootBagInfo = null; // 子弹包信息

    constructor(bid: number,) {
        this.data = ConfigMgr.getInstance().getById(bid, BulletData);

        this.bulletSP = ConfigMgr.getInstance().getById(this.getBulletImg(), BulltetSpEffData);

        if (!this.data) {
            // console.error('子弹数据 is null, 子弹id =', bid);
            debugger;
        }

        if (!this.bulletSP) {
            // console.error('子弹资源 is null, 子弹id =', this.data.id);
        }
        this.imgRadio = 0;
        this._discrete = this.getDiscrete();
        // this.tgt = bagInfo.getTGT();
    }

    public setShootInfo(bagInfo: ShootBagInfo, ackTarget: BattleAckObject, endPos: cc.Vec3) {

        this.sourceTag = bagInfo.sourceTag;
        this.parm = {
            shootObj: bagInfo.parm.shootObj,
            ackTaget: ackTarget, //bagInfo.parm.ackTaget,
            shootWPos: bagInfo.parm.shootWPos,
            endPos: endPos,//bagInfo.parm.endPos,
            isAoe: bagInfo.parm.isAoe,
            eDir: bagInfo.parm.eDir,
            reviveAttack: bagInfo.parm.reviveAttack,
            ackPower: bagInfo.parm.ackPower,
            shootTurretId: bagInfo.parm.shootTurretId,
            damLv: bagInfo.parm.damLv,
            damMul: bagInfo.parm.damMul,
            attackMul: bagInfo.parm.attackMul,
            damAdd: bagInfo.parm.damAdd,
            damAppend: bagInfo.parm.damAppend,
            shootRadius: bagInfo.parm.shootRadius,
            tHitCriticalAdd: bagInfo.parm.tHitCriticalAdd, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: bagInfo.parm.tHitCriticalHurtAdd, // 调整后 提高命中暴击伤害,
            tAoeCriticalAdd: bagInfo.parm.tAoeCriticalAdd, // 调整后 提高aoe暴击概率, 
            tAoeCriticalHurtAdd: bagInfo.parm.tAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
            shootInfo: bagInfo.parm.shootInfo,
            extAckObj: bagInfo.parm.extAckObj,
        }

        let tDir = (this.endPos.sub(this.startWPos).normalize());
        this.movDir = cc.v2(tDir.x, tDir.y);
        this.tgt = bagInfo.getTGT();
        this.sData = PowUpEffectMgr.getInstance().getBulletSpecial(this.data.id);
    }

    public getRealMovDir(): cc.Vec2 {
        return this.fixMovDir;
    }

    public fixMovDirNow(): void {
        this.fixMovDir = Utils.convertAngle(this.movDir, this.getRealAngel())
    }

    public getFixSpeed(): number {
        return this.getBulletSpeed();
    }

    public addBouncesTime() {
        this.currBouncesTime += 1;
    }

    // 角度离散
    public getDiscrete(): number {
        if (this.data.discrete > 0) {
            return Math.random() * this.data.discrete * 2 - this.data.discrete;
        }
        return 0;
    }

    public getRealAngel(): number {
        return this.fixAngel + this._discrete;
    }

    public getFixHurt(): hurtParm {

        // 命中攻击力
        let power = this.parm.ackPower;
        // 暴击伤害倍率
        let criticalMul = 1;
        // 暴击率
        let critical = 0;

        // 伤害追加
        let damAppend = this.parm.damAppend;

        // 伤害修正
        let damageCorrect = this.getBulletHurt();

        let powerPer = 0;

        let buffCritical = 0;
        let buffCriticalDam = 0;

        if (this.isAoe) {
            criticalMul = this.getBulletAoeCritMul()
            buffCritical = this.parm.tAoeCriticalHurtAdd;
            critical = this.getBulletAoeCritPer()
            buffCriticalDam = this.parm.tAoeCriticalAdd;
            powerPer = this.getBulletAoeHurtPer();

        } else {
            criticalMul = this.getBulletHitCritMul();
            buffCritical = this.parm.tHitCriticalHurtAdd;
            critical = this.getBulletHitCritPer()
            buffCriticalDam = this.parm.tHitCriticalAdd;
            powerPer = this.getBulletHitHurtPer();
        }

        let tags: TagHurt[] = [];
        let gTags = this.getTag();
        if (gTags.length % 3 != 0) {
            console.error('子弹id =', this.data.id, '的tag数据错误', gTags);
            debugger
        }
        for (let i = 0; i < gTags.length;) {

            tags.push({ tag: gTags[i], preAdd: gTags[i + 1], mulAdd: gTags[i + 2] });
            i += 3
        }

        let ret: hurtParm = {
            power: power,
            shootObj: this.parm.shootObj,
            criticalDam: criticalMul,
            critical: critical,
            buffCritical: buffCritical,
            buffCriticalDam: buffCriticalDam, // buff暴击伤害
            ackMul: this.parm.attackMul,
            damageCorrection: damageCorrect,
            hurtPer: powerPer,
            tags: tags

            // damAppend: damAppend,
            // powerPer: powerPer,
            // damLv: this.parm.damLv,
            // reviveAttack: this.parm.reviveAttack,
            // damageCorrect: damageCorrect,
            // damMul: this.parm.damMul,
            // attackMul: this.parm.attackMul,
            // damAdd: this.parm.damAdd
        }
        return ret;

    }

    // public hasTrajectory(): boolean {
    //     return this.data.trajectory == 1;
    // }

    // 震屏规则
    public vibrateCheck(type: BulletVibrateType): number[] {
        let v = this.data.vibrate;
        if (!v || v.length < 3 || v[0] != type) return []; // 没有震动规则
        if (v.length >= 3 && this.shake < 1) {
            this.shake += 1;
            GlobalEventMgr.getInstance().emit(GlobalEventID.shakeCamera, v[2] / 1000, v[1]);
        }
    }

    // 子弹类型
    public getBulletType(): number {
        let rType = [this.data.type];
        // if (this.sData && this.sData.length > 0) {
        //     for (const element of this.sData) {
        //         rType = getSpecialV(rType, element.bulletType1, element.bulletValue1);
        //     }
        // }
        return rType[0];
    }

    // 子弹外观
    public getBulletImg(): number {
        let rImg = [parseInt(this.data.img)];

        return rImg[0];
    }

    // 子弹外观缩放比
    public getBulletScale(): number {
        let rScale = [this.data.scale];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rScale = getSpecialV(rScale, element.bulletType1, element.bulletValue1);
            }
        }
        return rScale[0];
    }

    // 子弹朝向
    public getBulletDir(): number {

        let rDir = [this.data.dir];
        // if (this.sData && this.sData.length > 0) {
        //     for (const element of this.sData) {
        //         rDir = getSpecialV(rDir, element.bulletType2, element.bulletValue2);
        //     }
        // }
        return rDir[0];
    }

    // 子弹宽度
    public getBulletWidth(): number {
        let rWidth = [this.data.width];
        // if (this.sData && this.sData.length > 0) {
        //     for (const element of this.sData) {
        //         rWidth = getSpecialV(rWidth, element.bulletType3, element.bulletValue3);
        //     }
        // }
        return rWidth[0];
    }

    public getRadioSpeed(): number {
        return this.data.round / 60;
    }

    // 子弹伤害 修正
    public getBulletHurt(): number {
        let rHurt = [this.data.damageCorrection];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rHurt = getSpecialV(rHurt, element.bulletType2, element.bulletValue2);
            }
        }
        return rHurt[0];
    }

    // 反弹类型
    public getBulletBounceType(): number {
        let rNum = [this.data.bouncesType];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rNum = getSpecialV(rNum, element.bulletType3, element.bulletValue3);
            }
        }
        return rNum[0];
    }

    // 反弹次数
    public getBulletBounceTimes(): number {
        return 100; // TODO
    }

    // 命中次数
    public getBulletHitTimes(): number {
        let rNum = [this.data.hitTimes];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rNum = getSpecialV(rNum, element.bulletType4, element.bulletValue4);
            }
        }
        return rNum[0];
    }

    // 子弹速度
    public getBulletSpeed(): number {
        let rSpeed = [this.data.speed];
        // if (this.sData && this.sData.length > 0) {
        //     for (const element of this.sData) {
        //         rSpeed = getSpecialV(rSpeed, element.bulletType8, element.bulletValue8);
        //     }
        // }
        return rSpeed[0];
    }

    // 子弹寿命
    public getBulletLife(): number {
        let rLife = [this.data.lifeTime];
        // if (this.sData && this.sData.length > 0) {
        //     for (const element of this.sData) {
        //         rLife = getSpecialV(rLife, element.bulletType9, element.bulletValue9);
        //     }
        // }
        return rLife[0];
    }

    // 命中伤害百分比
    public getBulletHitHurtPer(): number {
        let rHurt = [this.data.hitHurtPer];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rHurt = getSpecialV(rHurt, element.bulletType5, element.bulletValue5);
            }
        }
        return rHurt[0];
    }

    // 命中暴击率
    public getBulletHitCritPer(): number {
        let rCrit = [this.data.hitCritical1];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rCrit = getSpecialV(rCrit, element.bulletType6, element.bulletValue6);
            }
        }
        return rCrit[0];
    }

    // 命中暴击倍率
    public getBulletHitCritMul(): number {
        let rMul = [this.data.hitCritical2];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rMul = getSpecialV(rMul, element.bulletType7, element.bulletValue7);
            }
        }
        return rMul[0];
    }

    // 命中激活技能
    public getBulletHitSkill(): number {
        let rSkill = [this.data.skillId1];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rSkill = getSpecialV(rSkill, element.bulletType8, element.bulletValue8);
            }
        }
        return rSkill[0];
    }

    // Aoe类型
    public getBulletAoeType(): number {
        let rDir = [this.data.aoeType];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rDir = getSpecialV(rDir, element.bulletType9, element.bulletValue9);
            }
        }
        return rDir[0];
    }

    // Aoe 范围
    public getBulletAoeRadius(): number {
        let rRadius = [this.data.aoeRadius];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rRadius = getSpecialV(rRadius, element.bulletType10, element.bulletValue10);
            }
        }
        return rRadius[0];
    }

    // Aoe 伤害百分比
    public getBulletAoeHurtPer(): number {
        let rHurt = [this.data.aoeHurtPer];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rHurt = getSpecialV(rHurt, element.bulletType11, element.bulletValue11);
            }
        }
        return rHurt[0];
    }

    // Aoe 暴击率
    public getBulletAoeCritPer(): number {
        let rCrit = [this.data.aoeCritical1];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rCrit = getSpecialV(rCrit, element.bulletType12, element.bulletValue12);
            }
        }
        return rCrit[0];
    }

    // Aoe 暴击伤害倍率
    public getBulletAoeCritMul(): number {
        let rMul = [this.data.aoeCritical2];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rMul = getSpecialV(rMul, element.bulletType13, element.bulletValue13);
            }
        }
        return rMul[0];
    }

    // Aoe 激活技能
    public getBulletAoeSkill(): number {
        let rSkill = [this.data.skillId2]
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rSkill = getSpecialV(rSkill, element.bulletType14, element.bulletValue14);
            }
        }
        return rSkill[0];
    }

    public getOffset(): number {
        let rOffset = [this.data.offset];
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                rOffset = getSpecialV(rOffset, element.bulletType15, element.bulletValue15);
            }
        }
        return rOffset[0];
    }

    // 获取标签
    public getTag(): number[] {
        // a,b,c ..... a:标签id b:百分比+ c:标签 固定值加
        return this.data.tag;
    }
}


export class SummonTurretInfo extends IShootInfo {

    suData: SummonData = null;   // 召唤数据
    data: MonsterData = null;   // 怪物数据
    sourceTag: GameObjectType = GameObjectType.None; // 来源

    liveTime: number = 0; // 存活时间
    nextAtkTime: number = 0; // 下次攻击时间
    moveDir: cc.Vec2 = cc.Vec2.ZERO; // 移动方向
    actionSt: MonsterActionStatue = MonsterActionStatue.Move;  // 行动状态
    lastActObj: BattleAckObject = null; // 最后攻击对象

    dir: ETurretDir = ETurretDir.None;

    private _summonParm: summonParm = null;

    constructor(mid: number, param: summonParm) {
        super();
        this.suData = ConfigMgr.getInstance().getById(mid, SummonData);

        this.setSourceTag(param.sourceTag);

        this._summonParm = param;
        if (!this.suData) {
            console.error("not find summon ID：", mid);
        }
        this.data = ConfigMgr.getInstance().getById(this.suData.monID, MonsterData);
        if (!this.data) {
            console.error("not find summon monster ID：", this.suData.monID);
        }

        this.resetCurHp(this.getMaxHp());
    }

    protected setSourceTag(tag: GameObjectType) {
        // -1=发起召唤者的阵营
        // -2=敌人阵营
        // -3=玩家阵营
        // 正数=指定特定阵营（目前用不到，为以后可能存在的多阵营做预留）
        if (this.suData.camp == -1) {
            this.sourceTag = tag;
        } else if (this.suData.camp == -2) {
            this.sourceTag = GameObjectType.Monster;
        } else if (this.suData.camp == -3) {
            this.sourceTag = GameObjectType.Turret;
        } else if (this.suData.camp > 0) {
            this.sourceTag = this.suData.camp;
        } else {
            this.sourceTag = tag;
        }
    }

    public getScale(): number {
        return this.data.scale;
    }

    public isEnterAtkTime(): boolean {
        return this.liveTime >= this.data.firstAtkInterval;
    }

    public getFixSpeed(buffsp: number): number {
        return this.data.moveSpeed;
    }

    public checkOutTime(): boolean {
        return this.liveTime >= this.suData.time;
    }


    // 获取出生buff
    public getBrothBuffs(): number[] {
        return this.data.bornBuff;
    }

    // 获取出生发射
    public hasBornShoot(): number[] {
        return this.data.born;
    }

    public deathSound(): string {
        return this.data.deathSe;
    }

    public getShootRang(): number {
        return this.suData.range;
    }

    public delEndWave(): boolean {
        return this.suData.overWave == 0; // 1=不删除 0=删除
    }

    public hasDeathType(type: MonsterDeathType): number {
        let dList = this.data.dead;
        for (let i = 0; i < dList.length;) {
            if (dList[i] == type) {
                return dList[i + 1];
            }
            i += 2;
        }
        return 0;
    }

    // 获取死亡事件 hp<0 时调用
    public HpDeathEvent(): number[] {
        let rIds = [];
        for (let i = 0; i < this.data.deadEvent.length; i += 2) {
            if (this.data.deadEvent[i] == 1) {
                rIds.push(this.data.deadEvent[i + 1]);
            }
        }
        return rIds;
    }

    // 资源名称
    public getImgPath(): string {
        return this.data.img;
    }

    ///IShootInfo
    protected updateBuffValue() {
        throw new Error('Method not implemented.');
    }
    protected resetValue() {
        throw new Error('Method not implemented.');
    }
    isLiving(): boolean {
        return this.state == BtAckObjState.Run;
    }
    getBuffScale(): number {
        return this.data.buffEff / 100;
    }
    getID(): number {
        return this.suData.id;
    }

    getObjType(): GameObjectType {
        return this.sourceTag;
    }

    getMaxHp(): number {
        return this.data.hp;
    }

    public override changeHp(value: number, realyHP: boolean): number {
        // 0 = 不可被攻击，也不会受到伤害
        // 1 = 每次受伤 - 1HP
        // 2 = 按照正常的伤害计算HP

        if (this.suData.hitType == 0) {
            return 0;
        } else if (this.suData.hitType == 1) {
            this._curHp -= 1;
            return super.changeHp(1, realyHP);
        } else if (this.suData.hitType == 2) {
            return super.changeHp(value, realyHP);
        }
    }

    getAttack(ext: boolean): number {
        // throw new Error('Method not implemented.');
        // -1=调用此功能的装备的【装备的原始攻击】
        // 0=怪物表中的值
        // 正数=手填攻击
        let rAttack = 0;
        if (this.suData.attType > 0) {
            rAttack = this.suData.attType;
        } else if (this.suData.attType == 0) {
            rAttack = this.data.atk;
        } else {
            rAttack = this._summonParm.shootAck;
        }
        return rAttack * this.suData.attMul;
    }
    getFixFireInterval(): number {
        let A = this.data.atkInterval;
        // let B = 1 + PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.MonsterShoot) / 100;
        // B = Math.max(B, 0.25);
        return A;
    }
    getDamAppend(): number {
        return this._damAppend;
    }
    getDefLv(): number {
        throw new Error('Method not implemented.');
    }
    getDamLv(): number {
        return 0;
    }

    getDamMul(): number {
        // throw new Error('TurretInfo Method not implemented.');
        return this._damMul;
    }
    getAttackMul(): number {
        return 100;
    }
    getDamAdd(): number {
        // throw new Error('TurretInfo Method not implemented.');
        return this._damAdd;
    }
    getDef(): number {
        // throw new Error('TurretInfo Method not implemented.');
        return this._def;
    }

    getShootBagInfo(parm: shootBagParm, sId: number, ext?: boolean): ShootBagInfo {
        let info: ShootBagInfo = null;
        if (sId > 0) {
            info = new ShootBagInfo(sId, this.sourceTag, parm);
        }
        return info;
    }
}


// 炮台信息
export class TurretInfo extends IShootInfo {

    data: WapenFusionData = null;   // 炮台数据

    state: BtAckObjState = BtAckObjState.Run; // 状态

    damLv: number = 0;

    protected _fireInterval: number = 0; // 攻击间隔

    protected _curAmm: number = 0; // 使用条件
    protected _curCDTime: number = 0; // 冷却时间

    // fusionInput: number;
    // fusionOutput: number;

    protected _power: number = 0; // 攻击力

    protected _power2: number = 0; // 攻击力


    needVideo: boolean = false;
    locked: boolean = true; // 列表中
    buyed: boolean = false; // 购买

    outLv: number = 0;
    telentAck: number = 0;

    isUnLock5: boolean = false;


    isTeamer: boolean = false;//队友炮塔 只在团队副本中生效

    // 方向
    public get dir(): ETurretDir {
        // return this.dataExt.dir;
        return ETurretDir.None;
    }

    setTeamerTurret(isTeamer: boolean) {
        if (GameControl.getInstance().isTeamBaid()) {
            this.isTeamer = isTeamer;
        }

    }

    constructor(tId: number) {
        super();

        this.data = ConfigMgr.getInstance().getById(tId, WapenFusionData);
        // this.dataExt = dataExt;
        this._damAppend = 0;//this.dataExt.damAppend;
        this.damLv = GameControl.getInstance().getTurretDamLv(); // GameAttrCalcMgr.getInstance().getTurretDamLv();
        this.resetData();
    }

    protected resetData() {
        this.resetValue();

        this.outLv = GameControl.getInstance().getTurretOutLv(this.data.typeId);
        let atk = GameControl.getInstance().getTurretAck(this.data.typeId)  //100; /// wData.wapenUp > 0 ? upData['atk' + wData.wapenUp] : 0;
        let F = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_heroAtkMul);

        this.telentAck = GameControl.getInstance().getTelentAck();
        let telentNum = GameControl.getInstance().getTelentAckNum();
        /**组队模式每日装备随机提升，其他模式不提升 */
        let ext = GameControl.getInstance().getTurretHurtExt(this.data.typeId);
        //装备的基础攻击力=(A)*(1+D/100)*E*(1+F/100)  
        this._power = atk * (1 + this.telentAck / 100) * this.data.firePower * (1 + F / 100) * ext + telentNum;
        this._power2 = atk * (1 + this.telentAck / 100) * this.data.firePower2 * (1 + F / 100) * ext + telentNum;

        this._buffect = [];

        this.updateBuffValue();
        this.isUnLock5 = GameControl.getInstance().isLock5(this.data.typeId);

        console.log('atk', this._power, this._power2, this.getID());
    }

    public getshootBagID(ext: boolean = false): number {
        if (ext) {
            return this.data.shootBagId2[0];
        }
        return this.data.shootBagId[0];
    }

    //合成等级
    public getCompLevel(): number {
        return this.data.level;
    }

    // 合成id
    public getFusionOutput(): number {
        if (!this.isUnLock5 && this.data.level == 4) {
            return 0;
        }
        return this.data.fusionOutput;
    }

    // 合成需要id
    public getFusionInput(): number {
        if (!this.isUnLock5 && this.data.level == 4) {
            return 0;
        }
        return this.data.fusionInput == -1 ? this.getID() : this.data.fusionInput;
    }


    protected updatePowupExtData() {
        // this.sData = PowUpEffectMgr.getInstance().getTurretSpecial(this.data.id);
    }

    public getTurretPath(): string {
        //test
        let id = this.getID();
        id = 1;
        return `wapen_${id}_${this.dir}`;
    }

    public getTurretAName(): string {
        return this.data.animation;
    }

    public getWapenName(): string {
        return this.data.name;
    }

    public getWapenNote2(): string {
        return this.data.note2;
    }

    public getDesc(): string {
        return this.data.note;
    }

    public getWapenPrice(): number {
        return this.data.cost;
    }

    public addAmm(num: number): boolean {
        this._curAmm += num;
        if (this._curAmm >= this.data.amm) {
            this._curAmm = 0; // this.data.amm;
            return true;
        }
        return false;
    }

    public getAmm(): number {
        return this._curAmm;
    }

    public getAmmMax(): number {
        return this.data.amm;
    }

    public reSetCdTime(num: number): void {
        this._curCDTime = num;
    }

    public getCurCDTime(): number {
        return this._curCDTime;
    }

    public getCDTimeMax(): number {
        // A*（1+B/100）
        let B = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_cdChange);
        return this.data.cd * (1 + B / 100);
    }

    // 视频合成
    public canVideoOutput(): boolean {
        return this.data.adv == 1;
    }


    public getDelPrice(): number {
        return this.data.sell;
    }

    public needLvIcon(): boolean {
        return this.data.lvIcon > 0;
    }



    // 更新 强化效果 3选1 更新
    public refrushPowUpEffect() {
        super.refrushPowUpEffect();
        this.updatePowupExtData(); // 更新强化数据
        this._fireInterval = this.upPowUpInterval();
    }


    // 获取发射包信息
    public getShootBagInfo(param: shootBagParm, sid: number, ext: boolean = false): ShootBagInfo {
        let sId = this.getshootBagID();
        if (ext) {
            sId = this.getshootBagID(ext);
        } else {

        }
        let info: ShootBagInfo = null;
        if (sId > 0) {
            info = new ShootBagInfo(sId, GameObjectType.Turret, param);
        }
        return info;
    }

    // 强化效果的攻击力百分比
    public upPowupAckPer(): number {
        return this.getDamMul();
    }

    // 更新强化后的发射间隔
    protected upPowUpInterval(): number {
        let v = this.getDefualInterval(); //this.data.interval; // 基础间隔
        let b = 1 + PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_AtkSpeed) / 100;
        b = Math.max(b, 0.25);
        if (b < 1) {
            console.log("getFixFireInterval", b);
        }
        if (this.data) { return v * b; }
        return v;
    }


    // 射击间隔
    protected getDefualInterval(): number {
        // let rRet = [this.dataExt.interval];
        return 0;
        // return rRet[0];
    }


    //----------- IShootInfo ------------

    public doLevelUp(nextID: number): boolean {
        // TODO
        let newData = ConfigMgr.getInstance().getById(nextID, WapenFusionData);
        if (newData) {
            this.data = newData;
            this.resetData();
            return true
        }
        return false;
    }

    updateBuffEffect(dt: number) {
        super.updateBuffEffect(dt);
        // if (this._skillShootTime > 0) {
        //     this._skillShootTime -= dt * 1000;
        //     if (this._skillShootTime <= 0) {
        //         this._skillShootTime = 0;
        //         this._skillShootID = 0;
        //     }
        // }
    }

    isLiving(): boolean {
        return true;
    }

    getBuffScale(): number {
        return 1;
    }

    public getShootRang(): number {
        return this.data.shootRang;
    }

    // 更新buff值
    protected updateBuffValue() {
        this.resetValue();
        let intervalPer = 0;
        let atkMul = 0;
        let def = 0;
        for (const element of this._buffect) {
            // this._damAdd += element.getConditionHurtDamAdd();
            // ackPer += element.getAttackMul();
            // intervalPer += element.getConditionIntervalPer();
            this._fixHitCriticalAdd += element.getConditionCritical();
            this.fixHitCriticalHurtAdd += element.getConditionCriticalHurt();
            this.fixAoeCriticalAdd += element.getConditionAoeCritical();
            this.fixAoeCriticalHurtAdd += element.getConditionAoeCriticalHurt();

            atkMul += element.data.atkMul;
            def += element.data.def
        }
        // let pa = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.Player_attackMul);

        let H = 100 + atkMul + def;
        this._attackMul = H

        let sp = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_AtkSpeed);
        this._fireInterval += this._fireInterval * (intervalPer + sp) / 100;
        console.log("更新buff值", `炮塔id=${this.getID()}, 命中暴击率=${this.fixHitCriticalAdd}, 暴击伤害=${this.fixHitCriticalHurtAdd}, aoc暴击率=${this.fixAoeCriticalAdd}, aoc暴击伤害=${this.fixAoeCriticalHurtAdd} , 攻击间隔=${this._fireInterval}`);
    }

    protected resetValue() {
        this._fireInterval = 0; // this.dataExt.interval;
        this._attackMul = 0;
        this._fixHitCriticalAdd = 0;
        this.fixHitCriticalHurtAdd = 0;
        this.fixAoeCriticalAdd = 0;
        this.fixAoeCriticalHurtAdd = 0;
    }


    getID(): number {
        return this.data.id;
    }

    getShootRadius(): number {
        return 1000;
    }

    getObjType(): GameObjectType {
        return GameObjectType.Turret;
    }

    getMaxHp(): number {
        return 1;
    }

    public getDamLv(): number {
        return this.damLv;
    }

    /**
    * 
    * @returns 炮台攻击力
    */
    public getAttack(ext: boolean = false): number {
        // let rPower = [this.dataExt.power];
        // // let sData = this.sData;// PowUpEffectMgr.getInstance().getTurretSpecial(this.data.id);
        // // if (sData && sData.length > 0) {
        // //     for (const element of sData) {
        // //         rPower = getSpecialV(rPower, element.vageFusionType1, [element.vageFusionValue1]);
        // //     }
        // // }
        // return rPower[0];
        if (ext) {
            return this._power2;
        }
        return this._power;
    }

    public getAttack2(): number {
        return this._power2;
    }

    getTurretBasePower() {
        return this._power / this.data.amm;
    }

    public getFixFireInterval(): number {
        return this._fireInterval;
    }

    getDamAppend(): number {
        return this._damAppend;
    }

    getDefLv(): number {
        ///  throw new Error('TurretInfo Method not implemented.');
        return this._defLv;
    }
    getDamMul(): number {
        // throw new Error('TurretInfo Method not implemented.');
        return this._damMul;
    }
    getAttackMul(): number {
        return this._attackMul;
    }
    getDamAdd(): number {
        // throw new Error('TurretInfo Method not implemented.');
        return this._damAdd;
    }
    getDef(): number {
        // throw new Error('TurretInfo Method not implemented.');
        return this._def;
    }

    //----------------------end IShootInfo----------------------
}

// buff效果 buff
export class BuffEffectInfo {
    data: BuffData = null;

    shootTurretId: number = 0;
    shootObj: BattleAckObject = null;
    turrerWPos: cc.Vec3 = cc.v3(); // 炮塔世界坐标 TODO
    maxLiveTime: number = 0;  // 最大持续时间
    liveTime: number = 0;  // 持续时间
    hurtSpace: number = 0;    // 按百分比缩短攻击间隔
    tHurt: number = 0;      // 炮塔伤害
    dir: cc.Vec2 = cc.v2();   // 击退方向

    protected _effectViews: BuffEffect[] = [];

    protected sData: EquipSkillExData[] = null; // 特殊强化数据

    constructor(bid: number | string, shootTurrerId: number, dir: cc.Vec2, hurt: number, shootObj?: BattleAckObject) {
        this.data = ConfigMgr.getInstance().getById(bid, BuffData);
        if (!this.data) {
            console.error("BuffEffectInfo error bid = " + bid);
            return;
        }
        this.shootTurretId = shootTurrerId;
        this.shootObj = shootObj;
        this.liveTime = 0;
        this.hurtSpace = this.data.dotTime;
        this.maxLiveTime = this.getDurationTime();
        this.dir.x = dir.x;
        this.dir.y = dir.y;
        this.tHurt = hurt;
        this.sData = PowUpEffectMgr.getInstance().getBuffSpecial(this.data.id);
    }

    // 命中率
    public checkRate(): boolean {
        let newData = [this.data.rate]
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newData = getSpecialV(newData, element.buffType1, element.buffValue1);
            }
        }
        return Math.random() * 100 <= newData[0];
    }

    //持续方式
    public getDurationType(): number {
        let newData = [this.data.durationType]
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newData = getSpecialV(newData, element.buffType2, element.buffValue2);
            }
        }
        return newData[0];
    }

    // 持续时间
    public getDurationTime(): number {
        let newData = [this.data.duration]
        if (this.sData && this.sData.length > 0) {
            for (const element of this.sData) {
                newData = getSpecialV(newData, element.buffType3, element.buffValue3);
            }
        }
        return newData[0];
    }

    public upDateBuffectByBlock() {
        if (this.getDurationType() == 1) {
            this.liveTime += 1;
        }
    }

    public doUpdate(dt: number) {
        let fCd = dt * 1000;
        if (this.getDurationType() == 0) {
            this.liveTime += fCd;
            this.hurtSpace += fCd;

            if (this.data.spRes.length > 0 && this.sp_cdTime) {
                this.sp_cdTime -= fCd;
                if (this.sp_cdTime <= 0) {
                    this.addBuffSp(this.data.spRes);
                }
            }

            if (this.data.hpRes.length > 0 && this.hp_cdTime) {
                this.hp_cdTime -= fCd;
                if (this.hp_cdTime <= 0) {
                    this.addBuffHp(this.data.hpRes);
                }
            }
        }

        // console.log("liveTime = " + this.liveTime + " maxLiveTime = " + this.maxLiveTime);
    }

    //是否血条
    public isXt(): boolean {
        if (this.data.id >= 1301 || this.data.id <= 1304) return true;
        return false
    }

    public isEnd(): boolean {
        if (this.getDurationTime() < 0) { // 永久buff
            return false;
        }
        let end = this.liveTime >= this.getDurationTime();
        if (end) {
            this.removeAllEffectView();
        }
        return end;
    }

    public toEnd() {
        this.liveTime = this.getDurationTime();
    }

    // buff 伤害
    public getHurt(maxHp: number): number {
        let dot = 0;
        if (this.data.dotTime > 0 && (this.data.dot > 0 || this.data.dot2 > 0 || this.data.dot3.length > 0) && this.hurtSpace >= this.data.dotTime) {
            this.hurtSpace = this.hurtSpace - this.data.dotTime;
            dot = this.data.dot;
            let perHurt = this.data.dot2 * maxHp / 100;


            let dot3 = 0;
            (this.data.dot3.length > 0) && (dot3 = Utils.getRandNumberOfArrayTwo(this.data.dot3))
            // console.error("dot2 = " + this.data.dot2 + " perHurt = " + perHurt);
            return Math.floor(dot * this.tHurt / 100 + perHurt + dot3);
        }
        return 0;
    }


    // buff效果
    public getBuffMedium(): number {
        // 0=循环播放，直到BUFF时间结束
        // 同ID的BUFF叠加时，特效只会播放一个
        // 1=只播放一次
        // 同ID的BUFF叠加时，各播各的
        return this.data.medium;
    }

    public isStunPos(): boolean {
        return this.data.dizz == 1;
    }

    clean() {
        this.removeAllEffectView();
    }

    // buff资源
    public getBuffRes(): string {
        return this.data.visual;
    }

    public addEffectView(view: BuffEffect) {
        this._effectViews.push(view);
    }

    public removeAllEffectView() {
        for (const element of this._effectViews) {
            element.stopLoop();
        }
        this._effectViews = [];
    }

    public getEffectViews(): BuffEffect[] {
        return this._effectViews;
    }

    //按加法修改伤害
    public getDamAdd(): number {
        let rRet = [this.data.firePower2];
        return rRet[0];
    }


    //按百分比缩短攻击间隔
    public getConditionIntervalPer(): number {
        let rRet = [this.data.intervalPer];
        return rRet[0];
    }

    // 按加法增加伤害
    public getConditionHurtDamAdd(): number {
        let rRet = [this.data.firePower2];
        return rRet[0];
    }


    // aoe 暴击概率
    public getConditionAoeCritical(): number {
        return this.data.aoeCritical1;
    }

    // aoe 暴击伤害
    public getConditionAoeCriticalHurt(): number {
        return this.data.aoeCritical2;
    }

    //命中 暴击概率
    public getConditionCritical(): number {
        return this.data.hitCritical1;
    }

    //命中 暴击伤害
    public getConditionCriticalHurt(): number {
        return this.data.hitCritical2;
    }

    public getAddBuff(): number[] {
        return this.data.addBuff;
    }

    sp_cdTime: number = 0;
    public addBuffSp(v: number[]) {
        if (v.length != 3) {
            console.error("addBuffSp error length != 3");
            return;
        }
        this.sp_cdTime = v[2];
        GlobalEventMgr.getInstance().emit(GlobalEventID.game_sp_add, v[0], v[1]);
    }

    hp_cdTime: number = 0;
    public addBuffHp(v: number[]) {
        if (v.length != 3) {
            console.error("addBuffHp error length != 3");
            return;
        }
        this.hp_cdTime = v[2];
        GlobalEventMgr.getInstance().emit(GlobalEventID.game_hp_add, v[0], v[1]);
    }

    // 锁定格子
    public isLockBlock(): boolean {
        return this.data.cell == 1;
    }

    // 附加buff
    public getBlockExtBuffs(): number[] {
        return this.data.cellGit;
    }
}


/**战员信息*/
export default class CharHeroInfo extends TripodInfo {

    data: HeroData = null;
    /**当前状态 */
    private _curState: eCharState = eCharState.idle;
    /**当前执行的事件 */
    // curDoingEvent: crewEvent = null;

    /**当前位置,格子数x,格子数y */
    curPos: cc.Vec2;

    speedAttr: number = 1; // 速度加成

    needVideo: boolean = false;
    buyed: boolean = false;
    locked: boolean = true; // 列表中

    private _carryNum: number = 0; // 船员搬运数量

    private _moveSpeed: number = 0; // 移动速度

    // private _outFireSpeed: number = 0; // 灭火速度

    clickNum: number = 0; // 起跳
    maxLiveTime: number = -1
    liveTime: number = 0;
    // curLiveTime: number = 0;
    teamID: number = -1;

    private _skillData: ActSkillData = null;
    curShootTime: number = 0;
    //技能剩余冷缺时间
    _skillCdTime: number = 0;
    curLevel: number = 1;
    idx: number = 0;

    constructor(cid: number, level: number = 1) {
        super();
        // this.curPos = pos;
        this.data = ConfigMgr.getInstance().getById(cid, HeroData);
        if (!this.data) {
            console.error("CrewInfo data is null cid = ", cid);
        }

        if (this.data.skill1 > 0) {
            this._skillData = ConfigMgr.getInstance().getById(this.data.skill1, ActSkillData);
        }

        // if (!this._skillData) {
        //     console.error("CrewInfo skill data is null cid = ", cid);
        // }
        this.curLevel = level;
        this.resetMoveSpeed();
        this.state = BtAckObjState.Run; // 默认是运行状态
    }

    public get curState(): eCharState {
        return this._curState;
    }


    public getFixCarryNum(): number {
        return this._carryNum;
    }

    protected _tempAtk: number = 0;
    protected _tempFollowAdd: number = 0;

    /**移动速度 */
    public get moveBase(): number {
        return this._moveSpeed;
    }

    /**移动倍率  */
    public get moveMul(): number {
        //(1+B/100)*(1+C/100)*(1+D/100)
        let c = 0;
        let b = 0;
        for (const element of this._buffect) {
            if (element.getDurationType() == 0) {
                b += element.data.moveMul;
            } else if (element.getDurationType() == 1) {
                c += element.data.moveMul;
            }
        }
        let D = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_heroSpeed);
        return (1 + b / 100) * (1 + c / 100) * (1 + D / 100);
    }

    public getCrewID(): number {
        return this.data.id;
    }

    // // 获取动画名
    public getPrefabName() {
        // return this.data.res;
        return 'stick_' + this.data.id;//'char_' + this.data.id;
    }

    public getPrice(): number {
        return this.data.cost;
    }

    public getName(): string {
        return this.data.name;
    }

    // 移动速度
    protected resetMoveSpeed() {
        let rNum = [this.data.move];
        this._moveSpeed = rNum[0];
    }


    public getMaxHp(): number {
        // return 100; //TODO
        return super.getMaxHp();
    }

    // 获取技能数据
    public getSKillData(): ActSkillData {
        return this._skillData;
    }

    public getSkillCdTime(): number {
        return this._skillCdTime || 0;
    }

    useSkill() {
        this._skillCdTime = this._skillData.cd;
    }

    public deleteSkillCdTime(deleteTime) {
        this._skillCdTime -= deleteTime;
        if (this._skillCdTime < 0) {
            this._skillCdTime = 0;
        }
    }

    /**
     * 
     * @param state 设置状态
     */
    public changeCharState(state: eCharState) {
        this._curState = state;
    }

    // // 获取发射包信息
    public getShootBagInfo(parm: shootBagParm, sId: number, ext: boolean = false): ShootBagInfo {
        let info: ShootBagInfo = null;
        if (sId > 0) {
            info = new ShootBagInfo(sId, GameObjectType.Turret, parm);
        }
        return info;
    }

    /** ishoot */
    protected updateBuffValue() {
        // throw new Error('CrewInfo updateBuffValue Method not implemented.');
        // super.updateBuffValue();
    }

    protected resetValue() {
        // super.resetValue();
    }

    isLiving(): boolean {
        return super.isLiving();
        // return true;
    }

    getBuffScale(): number {
        // throw new Error('CrewInfo getBuffScale Method not implemented.');
        return 1.0;
    }

    getID(): number {
        return this.data.id;
    }

    getObjType(): GameObjectType {
        // throw new Error('CrewInfo getObjType Method not implemented.');
        return GameObjectType.Hero;
    }

    getDef(): number {
        // throw new Error('CrewInfo getDef Method not implemented.');
        // return 0;
        return super.getDef();
    }

    getDefLv(): number {
        // return 0;
        return super.getDefLv()
    }


    getAttack(ext: boolean = false): number {
        return 0; // TODO
    }

    public getFixFireInterval(): number {
        return 0; // TODO
    }

    getDamAppend(): number {
        // throw new Error('CrewInfo getDamAppend Method not implemented.');
        return 0;
    }

    getDamLv(): number {
        // throw new Error('CrewInfo getDamLv Method not implemented.');
        return 0;
    }
    getDamMul(): number {
        // throw new Error('CrewInfo getDamMul Method not implemented.');
        return 0;
    }
    getAttackMul(): number {
        // throw new Error('CrewInfo getAttackMul Method not implemented.');
        return 0;
    }
    getDamAdd(): number {
        // throw new Error('CrewInfo getDamAdd Method not implemented.');
        return 0;
    }

}

