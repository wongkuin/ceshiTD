
import { SetField } from '../../TRFrameWork/behavior3/nodes/actions/set-field';
import GlobalEventMgr from '../../TRFrameWork/cocos-module/mgr/GlobalEventMgr';
import { GlobalEventID } from '../../TRFrameWork/cocos-module/utils/GlobalEvent';
import ConfigMgr from '../config/ConfigMgr';
import { KvData, MonsterData, WapenTableData } from '../config/DataDef';
import { BuffEffectInfo, hurtParm, IShootInfo, MonsterInfo, TurretInfo } from '../config/DataInfo';
import { BtAckObjState, GameObjectType, GamePassiveSkillEffect, GamePowupEffect, HurtFontAnimType, MonsterType } from '../config/GameEnum';
import GameUserData from '../Data/GameUserData';
import GameHelp from '../Mgr/GameHelp';
import BattleBase from './BattleBase';
import BattleMonsterUI from './BattleMonsterUI';
import BuffEffect from './BuffEffect';
import GameResLoad from './GameResLoad';
import PassiveSkillMgr from './PassiveSkillMgr';
import PowUpEffectMgr from './PowUpEffectMgr';
import ShootBagUI from './ShootBagUI';
import TurretBaseUI from './TurretBaseUI';
// import BuffEffect from './BuffEffect';
// import GameResLoad from './GameResLoad';

const { ccclass, property } = cc._decorator;

export type FColorConfig = {
    color: cc.Color,
    time: number, // 持续时间
    name: string
}

export const FlashColors: FColorConfig[] = [
    { color: cc.color().fromHEX("#96FFFF"), time: 0.1, name: "WhiteFlash" },
    { color: cc.color().fromHEX("#FF00FF"), time: 0.35, name: "VenomDebuff" },
    { color: cc.color().fromHEX("#FFFF00"), time: 0.4, name: "FrostDebuff" },
    { color: cc.color().fromHEX("#FFFFFF0A"), time: 0.2, name: "ThunderStrike" }
]

@ccclass
export default class BattleAckObject extends BattleBase {

    // protected _buffect: BuffEffectInfo[] = [];
    protected _freeze: number = 0;
    // protected _defCount: number = 0; // 防御系数
    protected _silent: number = 0; // 沉默 攻击
    protected _invincible: number = 0; // 无敌
    protected _shootInfo: IShootInfo = null;
    protected _buffRoot: cc.Node = null;
    protected _stunRoot: cc.Node = null;

    protected _spine: sp.Skeleton = null;

    protected _hitTween: cc.Tween = null; // 受击动画

    protected _spineColor: cc.Color = cc.Color.WHITE.clone(); // spine 颜色
    protected _hiting: boolean = false;

    protected _fixScale: number = 1;

    onLoad() {
        super.onLoad();
        this._buffRoot = this.node;
        this._stunRoot = this.node;
    }

    start() {
        super.start();
        /// test 
    }

    // update (dt) {}

    getAckwPos(): cc.Vec3 {
        // return this.node.position;
        return this.node.parent.convertToWorldSpaceAR(this.node.position);
    }

    // 发射位置
    public getFireWPos(): cc.Vec3 {
        return this.getAckwPos();
    }

    public lookAtWPos(wPos: cc.Vec3): void {
    }

    // 角色使用
    // 反向
    public doReverse() {

    }

    // 双击
    public doubleClick() {

    }

    public relife() {

    }

    // getNode(): cc.Node {
    //     return this.node;
    // }

    doHurt(param: hurtParm): { hurt: number, isCritical: boolean, block?: boolean } {
        //        - 最终伤害=A*B*C*(D/100)*(1+E/100)*(1+F/100)
        //   - A=装备的原始攻击
        //   - B=【子弹表|bullet】的【damageCorrection】
        //   - C=【子弹表|bullet】的【hitHurtPer】或【aoeHurtPer】
        //     - 若现在是计算碰撞伤害，取【hitHurtPer】
        //     - 若现在是计算AOE伤害，取【aoeHurtPer】
        //   - D=暴击伤害修正
        //     - 若当前未发生暴击，则D=100
        //     - 若有发生修正，取暴击修正
        //   - E=【BUFF|buff】的【atkMul】之和
        //   - F=【强化效果|powUp】的【heroAtkMul】之和
        // - 若A=0，则跳过计算，连伤害结果都不显示（不显示伤害数值，不显示命中闪红的效果）
        //   - 若A>0，造成的伤害最小值=1
        if (param.power <= 0) {
            return { hurt: 0, isCritical: false };
        }

        let hurt = 1;
        // 击中怪物伤害计算
        if (this.getGameObjectType() == GameObjectType.Monster) {
            const turInfo = (param?.shootObj as TurretBaseUI)?.turretInfo
            if (turInfo) {
                let wapenData = ConfigMgr.getInstance().getById(turInfo.data?.typeId, WapenTableData);
                if (wapenData && (wapenData.atType == 2 || wapenData.atType == 3)) {
                    //@ts-ignore
                    if (this?.getMonsterInfo()) {
                        // @ts-ignore
                        const mData = ConfigMgr.getInstance().getById(this.getMonsterInfo()?.data?.id, MonsterData);
                        if (mData && (mData.moveType != wapenData.atType - 1)) {
                            return { hurt: 0, isCritical: false };
                        }
                    }
                }
            }
        }

        // 怪物伤害计算
        if (this.getGameObjectType() == GameObjectType.Cart || this.getGameObjectType() == GameObjectType.Hero) {

            let block: boolean = false;
            let pBlock = Math.min(90, PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_Block) / 100 + PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_block) / 100);
            if (Math.random() * 100 < pBlock) {
                block = true;
                hurt = 0;
                // console.log(`doAck monster 格挡`);
            } else {
                let A = param.power;
                let B = param.ackMul
                let C = Math.min(PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_def), 90);

                hurt = A * B * (1 - C / 100);
                // console.warn(`怪物伤害doAck monster A=${A} B=${B} C=${C} `)
            }
            if (hurt > 0) {
                this.showHit();
            }
            hurt = this.subHp(hurt, false);
            if (this._shootInfo.getCurHp() <= 0) {
                this.afterDeathEvent(param);
            }
            return { hurt: hurt, isCritical: false, block: block };
        }

        let isCritical = false;

        // this 被攻击对象
        // let shootInfo = this.getShootInfo();
        let A = param.power;
        let B = param.damageCorrection;
        let C = param.hurtPer;
        let D = 100;

        let E = 0
        let F = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.Player_attackMul);
        let G = 0;
        let H = param.ackMul;
        //console.log(this.getGameObjectType() == GameObjectType.Monster, this.getMonsterType());
        if (this.getGameObjectType() == GameObjectType.Monster && this.getMonsterType() >= 0) {
            G = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_bossKill)
        }
        let criticalProbabilityAdd = 0;
        let CriticalDamAdd = 0;
        if (this.getGameObjectType() == GameObjectType.Monster) {
            criticalProbabilityAdd = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_CriticalProbabilityAdd);
            CriticalDamAdd = PassiveSkillMgr.getInstance().getPowUpEffectByType(GamePassiveSkillEffect.player_CriticalDamAdd);
            const turInfo = (param.shootObj?._shootInfo) as TurretInfo
            if (turInfo) {
                let wapenTable = ConfigMgr.getInstance().getById(turInfo.data.typeId, WapenTableData);
                if (wapenTable?.enDam && wapenTable.enDam.length) {
                    const mstInfo = this.getShootInfo() as MonsterInfo;
                    const enDamLen = wapenTable.enDam.split(",");
                    const enDamData = Number(enDamLen[0]);
                    if (mstInfo.data.raceType == enDamData) {
                        A = A * (1 + Number(enDamLen[1]));
                    } else if (enDamData == 9 && mstInfo.data.type == MonsterType.Elite) {
                        A = A * (1 + Number(enDamLen[1]));
                    }
                    else if (enDamData == 8) {
                        const tq = GameUserData.getInstance().getcurPassData()?.weather3 || 0;
                        if (tq == 2 || tq == 3) {
                            A = A * (1 + Number(enDamLen[1]));
                        }
                    }
                }
            }
        }

        let criticalProbability = param.critical * (1 + (PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_Critical) + criticalProbabilityAdd) / 100) + param.buffCritical / 100;
        if (Math.random() * 100 < criticalProbability) {

            //          
            // - α=【子弹表|bullet】的【hitCritical2】或【aoeCritical2】
            // - β=【被动技能|passiveSkill】的【CriticalDamAdd】之和
            // - γ=【强化效果|powUp】的【CriticalDamAdd】之和
            let a1 = param.criticalDam;
            let b1 = CriticalDamAdd;
            let c1 = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_CriticalDam);
            D = a1 * (1 + (b1 + c1) / 100) + param.buffCriticalDam / 100;
            //A*(1+(B+C)/100)
            // D = param.criticalDam * (1 + PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_CriticalDam) + CriticalDamAdd)
            isCritical = true;

            // console.warn(`暴击效果 a=${a1},b=${b1},c=${c1},D=${D}`);
        }


        hurt = A * B * C * D / 1000000 * (1 + E / 100) * (1 + F / 100) * (1 + G / 100) * (H / 100);
        // console.log("criticalProbability:" , "最终暴击率 ",criticalProbability,"自带暴击率",param.critical, "被动技能暴击率",PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_Critical) ,"CriticalProbabilityAdd",criticalProbabilityAdd);
        // console.log("doAck", hurt, isCritical);
        // if (this.getGameObjectType() == GameObjectType.Cart) {
        console.log(`doAck cart A=${A} B=${B} C=${C} D=${D} E=${E} F=${F},G=${G}, H=${H}, hurt=${hurt},isCritical=${isCritical}`)
        // }

        // set tag value
        let mTags = this._shootInfo.getTag();
        let addPre: number = 0
        let addMul: number = 0
        for (const element of mTags) {
            let vv = param.tags.filter((value) => {
                if (value.tag == element) {
                    return true;
                }
                return false;
            });

            for (const v of vv) {
                addPre += v.preAdd;
                addMul += v.mulAdd;
            }
        }


        console.log('tag addPre', addPre, 'addMul', addMul, 'hurt', hurt);
        hurt = hurt * (1 + addPre / 100) + addMul; // 加上附加伤害
        if (hurt > 0) {
            this.showHit(); // 受击效果
        }
        console.log('tag finle hurt', hurt);
        hurt = this.subHp(hurt, isCritical);

        let turretInfo = param.shootObj.getShootInfo() as TurretInfo;
        //  cc.error(turretInfo.isTeamer)
        if (turretInfo?.isTeamer) {
            GlobalEventMgr.getInstance().emit(GlobalEventID.teamer_hurt, hurt)
        } else {
            GlobalEventMgr.getInstance().emit(GlobalEventID.myself_hurt, hurt)
        }




        if (this._shootInfo.getCurHp() <= 0) {
            this.afterDeathEvent(param);
        }
        // GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.getAckPos(), hurt: hurt, type: this.getGameObjectType() });

        return { hurt: hurt, isCritical: isCritical };
    }



    /**处理死亡之后的事件
     * shootObj：攻击者
     */
    afterDeathEvent(hurtParm: hurtParm) {
        let BuffectkillResHp = this.getBuffectkillResHp(); // 获取击杀怪物的加血
        if (BuffectkillResHp > 0 && cc.isValid(hurtParm.shootObj) && hurtParm.shootObj.isLiving()) {
            hurtParm.shootObj.addHpByBuffkillResHp(0, BuffectkillResHp);
        }

    }
    /**0是数值，1百分比 */
    addHpByBuffkillResHp(type: 0 | 1, hp: number) {


    }

    public isWaitRemove(): boolean {
        return this._shootInfo && this._shootInfo.state == BtAckObjState.End;
    }

    protected cloneFColor(color: FColorConfig): FColorConfig {
        return { color: color.color.clone(), time: color.time, name: color.name };
    }

    // 受击 效果
    protected showHit() {
        if (!this._spine) {
            return;
        }

        this._spine.node.parent.scale = this._fixScale;
        if (this._hitTween) {
            this._hitTween.stop();
        }
        this.unschedule(this.normalColor);
        let config: FColorConfig = this.cloneFColor(FlashColors[0]);
        const color = config.color;
        const time = config.time;
        this._spine.node.color = color;

        let fScale = this._fixScale;
        let nScale = fScale * 0.92 * Math.random();

        // if (this.getGameObjectType() == GameObjectType.Cart) {
        nScale = fScale - 0.04 * Math.random();
        // }

        this._hitTween = cc.tween(this._spine.node.parent).to(time, { scale: nScale }).to(time * 0.5, { scale: fScale }).call(() => {
            this._hitTween = null;
        }).start();
        this._hiting = true;
        this.scheduleOnce(this.normalColor, config.time);
        if (this._hiting) {
            // this._spine.getMaterial(0).setProperty('uFlash', 1.0);
        }
    }

    protected normalColor() {
        if (!this._spine || !this.canAck()) {
            return;
        }
        this._spine.node.color = this._spineColor;
        this._spine.node.parent.scale = this._fixScale
        this._hiting = false;
        // this._spine.getMaterial(0).setProperty('uFlash', 0.0);
    }

    public getDistanceWithTarget(): number {
        return 0;
    }


    // getDefCount(): number {
    //     return this._defCount;
    // }

    subHp(v: number, isCritical: boolean = false, realyHP: boolean = false): number {
        console.log("subHp");
        return 0
    }

    // 被攻击
    canAck(): boolean {
        return false;
    }

    isLiving(): boolean {
        return true;
    }

    // 获取怪物类型 boss  精英  普通
    getMonsterType(): number {
        return 0;
    }

    // 对象类型
    getGameObjectType(): GameObjectType {
        return GameObjectType.None;
    }

    // data info
    getShootInfo(): IShootInfo {
        return this._shootInfo;
    }

    public doUpdate(dt: number): void {
        super.doUpdate(dt);
        this.updateBuffect(dt);
    }

    // 添加一个buff
    public addBuffect(buffect: BuffEffectInfo): void {
        if (!this._shootInfo) {
            debugger;
        }
        if (!buffect.checkRate()) {
            return;
        }

        // 0=无法被相同ID组的BUFF覆盖
        // 1=相同ID组时，后来顶替先到的
        // 2=可以叠加相同ID的BUFF
        // 3=只有相同ID时，延长持续时间。同ID组但不同ID时，后来的BUFF直接抛
        if (buffect.data.overlayType == 1) {
            let b = this._shootInfo.getBuffEffect().filter((v) => v.data?.buffGroup[0] == buffect.data?.buffGroup[0]);
            if (b.length > 0) {
                b[0].liveTime = 0;
            }
        } else if (buffect.data.overlayType == 3) {
            let b = this._shootInfo.getBuffEffect().filter((v) => v.data.id == buffect.data.id);
            if (b.length > 0) {
                b[0].maxLiveTime += buffect.maxLiveTime;
            } else {
                let nb = this._shootInfo.getBuffEffect().filter((v) => v.data?.buffGroup[0] == buffect.data?.buffGroup[0]);
                if (nb.length > 0) {
                    return;
                }
            }

        } else if (buffect.data.overlayType == 0) {
            let b = this._shootInfo.getBuffEffect().filter((v) => v.data?.buffGroup[0] == buffect.data?.buffGroup[0]);
            if (b.length > 0) {
                return;
            }
        }

        // 叠加 上限
        if (buffect.data.stacking > 0) {
            let b = this._shootInfo.getBuffEffect().filter((v) => v.data.id == buffect.data.id);
            if (b.length >= buffect.data.stacking) {
                return;
            }
        }

        // 冻结
        if (buffect.data.cold == 1) {
            this._freeze += 1;
        }

        // 防御
        // this._defCount += buffect.data.def;

        // 击退
        if (buffect.data.move > 0) {
            this.doRepel(buffect.dir, buffect.data.move);
        }

        if (buffect.data.reMove > 0) {
            let mDir = this.node.convertToWorldSpaceAR(cc.v3()).sub(buffect.shootObj?.getAckwPos());
            let mLen = mDir.mag();
            mDir = mDir.normalize();
            this.doRepel(cc.v2(-mDir.x, -mDir.y), Math.min(buffect.data.reMove, mLen));
            console.log("反向击退", mDir.x, mDir.y, mLen, buffect.data.reMove);
        }

        if (buffect.data.spRes.length > 0) {
            buffect.addBuffSp(buffect.data.spRes);
        }

        if (buffect.data.hpRes.length > 0) {
            buffect.addBuffHp(buffect.data.hpRes);
        }

        // if (buffect.data.mpRes.length > 0) {
        //     buffect.addBuffMp(buffect.data.mpRes);
        // }

        // 嘲讽
        if (buffect.data.ridicule == 1) {
            this.doRidicule(buffect.shootObj)
        }
        // 禁止攻击
        if (buffect.data.silent == 1) {
            this._silent += 1;
        }

        //死亡召唤
        if (buffect.data.deadSummon.length > 0) {
            this._invincible += 1;
        }
        //碰撞召唤
        if (buffect.data.hitSummon.length > 0) {
            this._invincible += 1;
        }

        this.showBuffEffect(buffect);
        // this._shootInfo.getBuffEffect().push(buffect);
        this._shootInfo.addBuffEffect(buffect);
    }

    // 显示buff效果
    protected showBuffEffect(buff: BuffEffectInfo): void {
        let res = buff.getBuffRes();
        if (res.length <= 1) {
            return;
        }
        let medium = buff.getBuffMedium();
        let fd = this._shootInfo.getBuffEffect().find(v => v.data.id == buff.data.id);
        let self = this;
        if (medium == 0 && !fd) {
            GameResLoad.loadBuffEffect(res).then((eNode) => {
                if (!eNode) {
                    console.warn(`buff effect ${res} is null`)
                    return;
                }

                if (!cc.isValid(self) || !self.canAck() || !self._shootInfo) {
                    return;
                }
                let be = eNode.getComponent(BuffEffect);
                if (!be) {
                    be = eNode.addComponent(BuffEffect);
                }
                // this._buffRoot.addChild(node);
                if (buff.isStunPos()) {
                    self._stunRoot.addChild(eNode);
                } else {
                    if (self._buffRoot) self._buffRoot.addChild(eNode);
                    else self.node.addChild(eNode);
                }

                eNode.active = true;
                eNode.scale = self?._shootInfo?.getBuffScale() || 1;
                buff.addEffectView(be);
                be.play(true);
            })
        } else if (medium == 1) {
            GameResLoad.loadBuffEffect(res).then((eNode) => {
                if (!eNode) {
                    console.warn(`buff effect ${res} is null`)
                    return;
                }
                if (!cc.isValid(self) || !self.canAck() || !self._shootInfo) {
                    return;
                }
                let be = eNode.getComponent(BuffEffect);
                if (!be) {
                    be = eNode.addComponent(BuffEffect);
                }
                self._buffRoot.addChild(eNode);
                eNode.active = true;
                eNode.scale = self._shootInfo.getBuffScale();
                be.play();
            })
        }
    }

    protected upDateBuffectByBlock() {
        for (let i = this._shootInfo.getBuffEffect().length - 1; i >= 0; i--) {
            const buff = this._shootInfo.getBuffEffect()[i];
            buff.upDateBuffectByBlock();
        }
    }

    protected updateBuffect(dt: number): void {
        let endColor = "#FFFFFF";
        for (let i = this._shootInfo.getBuffEffect().length - 1; i >= 0; i--) {
            const buff = this._shootInfo.getBuffEffect()[i];
            buff.doUpdate(dt);

            if (buff.data.colour.length > 2) {
                endColor = buff.data.colour;
            }

            let v = buff.getHurt(this._shootInfo.getMaxHp());
            if (v > 0) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.getAckwPos(), hurt: v, type: HurtFontAnimType.Slowup, isCritical: false, color: "#a926f5ff" });
                this.subHp(v, false, buff.data.dotType == 1);  //  ==1 直接扣血
            }
            if (buff.isEnd()) {
                //冰冻
                if (buff.data.cold == 1) {
                    this._freeze -= 1;
                }
                // 防御
                // this._defCount -= buff.data.def;
                // 禁止攻击
                if (buff.data.silent == 1) {
                    this._silent -= 1;
                }

                //死亡召唤后无敌取消
                if (buff.data.deadSummon.length > 0) {
                    this._invincible -= 1;
                }

                if (buff.data.hitSummon.length > 0) {
                    this._invincible -= 1;
                }

                // 清理buff特效视图
                buff.removeAllEffectView();

                // 添加buff
                for (const bid of buff.getAddBuff()) {
                    let newBf = new BuffEffectInfo(bid, buff.shootTurretId, buff.dir, buff.tHurt, buff.shootObj);
                    this.addBuffect(newBf);
                }
                this._shootInfo.getBuffEffect().splice(i, 1);

            }
        }
        this._spineColor.fromHEX(endColor);
        if (!this._hiting) {
            this._spine && (this._spine.node.color = this._spineColor);
        }
        this._shootInfo.updateBuffEffect(dt);
    }

    // buff 移动速度
    public getBuffectMoveSpeed(): number {
        let speed = 0;
        // for (let i = 0; i < this._shootInfo.getBuffEffect().length; i++) {
        //     const buff = this._shootInfo.getBuffEffect()[i];
        //     speed += buff.data.move;
        // }
        return speed;
    }

    // buff 击杀回血
    public getBuffectkillResHp(): number {
        let killResHp = 0;
        for (let i = 0; i < this._shootInfo.getBuffEffect().length; i++) {
            const buff = this._shootInfo.getBuffEffect()[i];
            killResHp += buff.data.killResHp;
        }
        return killResHp;
    }
    // 是否被冰冻
    public isFreeze(): boolean {
        return this._freeze > 0;
    }

    // 击退
    public doRepel(dir: cc.Vec2, distance: number): void {

    }

    // 死亡添加技能buff
    public addDeathSkillBuff(): void {

    }

    // 被攻击添加buff
    public addBeAttackedBuff(): void {

    }

    // 嘲讽
    public doRidicule(obj: BattleAckObject): void {

    }

    public getFinalyTarget(targets: BattleAckObject[], enemySearch: number, lastActObj: BattleAckObject, search1Taget?: BattleAckObject): BattleAckObject {
        return GameHelp.getInstance().getFinalyTarget(targets, enemySearch, lastActObj, [search1Taget]);
    }

    protected doReliveShoot(): void {
        let sid = parseInt(ConfigMgr.getInstance().getById(28, KvData).val);
        let liveMonster = this._battleScene.getPassControl().getAllLiveMonster();
        let ackTarget = liveMonster[0] || null;
        let shootPos = this.getFireWPos();
        let power = 0;
        let param = GameHelp.getInstance().getShootParm(sid, this, ackTarget, ackTarget?.getAckwPos() || cc.v3(0, 400, 0), shootPos, power);
        let bagInfo = this._shootInfo.getShootBagInfo(param, sid);
        let shootbag = new ShootBagUI(bagInfo);
        let scene = this._battleScene;
        scene.addShootBag2Game(shootbag);
    }

    protected clean(): void {
        this._freeze = 0;
        // this._defCount = 0;
        this._silent = 0;
        if (this._shootInfo) {
            this._shootInfo.clean();
            delete this._shootInfo;
        }
        this._shootInfo = null;
        this._hitTween = null;
        this._spineColor = cc.Color.WHITE.clone();
        this._hiting = false;
        //
    }
}
