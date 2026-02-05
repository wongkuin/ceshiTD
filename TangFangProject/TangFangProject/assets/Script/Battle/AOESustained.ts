import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { QTBox, QTCircle } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import { AOESustainedInfo } from "../config/AOEInfo";
import ConfigMgr from "../config/ConfigMgr";
import { BulletData, BulletSkillData } from "../config/DataDef";
import { BuffEffectInfo, hurtParm, ShootBagInfo, shootBagParm } from "../config/DataInfo";
import { ETurretDir, GameAOEState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BattleBase, { IPoolComponent } from "./BattleBase";
import BulletEffect from "./BulletEffect";
import GameResLoad from "./GameResLoad";
import ShootBagUI from "./ShootBagUI";
import SpatialHashGrid from "./SpatialHashGrid";
import BatchEventProcessor, { DamageEvent } from "./BatchEventProcessor";
import GameControl from "./GameControl";
const { ccclass, property } = cc._decorator;




@ccclass
/**持续性aoe  */
export default class AOESustained extends BattleBase implements IPoolComponent {
    /**aoe 触发间隔 */
    _checkHurtInterval: number = 0;


    _aoeInfo: AOESustainedInfo = null;

    protected anims: cc.Animation = null;
    protected particles: cc.ParticleSystem[] = [];
    protected spAnim: sp.Skeleton = null;


    protected onLoad(): void {
        this.anims = this.node.getComponent(cc.Animation);
        this.particles = this.node.getComponentsInChildren(cc.ParticleSystem);
        this.spAnim = this.node.getComponentInChildren(sp.Skeleton);
    }


    reuse(): void {
        this._checkHurtInterval = 0;

    }

    unuse(): void {

    }



    isWaitRemove() {
        return this._aoeInfo.state == GameAOEState.Del;
    }

    public init(bInfo: AOESustainedInfo) {

        this._aoeInfo = bInfo;
        this.node.opacity = 255;
        this.playBombSpine();
        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(this._aoeInfo.startWPos));
        this.doAOEHurt();
    }

    public doUpdate(dt: number): void {

        // this.node.getwo

        super.doUpdate(dt);

        this._aoeInfo.liveTime += dt * 1000; // 子弹存活时间
        if (this._aoeInfo.liveTime >= this._aoeInfo.maxLiveTime && this._aoeInfo.state == GameAOEState.Running) {
            this.playDeathAni();
        } else {
            this.checkHurt(dt);
        }

    }

    public play(loop: boolean = false): void {
        this.node.active = true;

        let rTime = 0.5;
        if (this.anims && this.anims.getClips().length > 0) {
            let clip = this.anims.getClips()[0];
            let name = clip.name;
            rTime = Math.max(clip.duration);
            this.anims.play(name);
        }

        if (this.spAnim) {
            let mName = this.spAnim.animation;
            console.log("mName", mName, this.node.x, this.node.y);
            let anim = this.spAnim.findAnimation(mName);
            rTime = Math.max(anim.duration, rTime);
            this.spAnim.setToSetupPose();
            this.spAnim.setAnimation(0, this.spAnim.animation, loop);
        }

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].resetSystem();
            rTime = Math.max(this.particles[i].duration + 0.1, rTime);
        }

        if (!loop) {
            this.scheduleOnce(() => {
                this.playDeathAni();
            }, rTime);
        }
    }



    public stopLoop(): void {
        // this.anims && this.anims.stop();
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].stopSystem();
        }
        this.scheduleOnce(() => {
            this.playDeathAni();
        }, 0.15)
    }


    playBombSpine() {
        this.play(true);
    }

    playDeathAni() {
        this._aoeInfo.state = GameAOEState.End;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this._aoeInfo.state = GameAOEState.Del;
            })
            .start()

    }
    num = 0;
    checkHurt(dt) {
        if (this._aoeInfo.state != GameAOEState.Running)
            return;
        this._checkHurtInterval += dt * 1000;
        if (this._checkHurtInterval >= this._aoeInfo.hurtInterval) {
            this._checkHurtInterval = 0;

            this.doAOEHurt();
        }
    }



    // 触发aoe 伤害（优化版本）
    protected doAOEHurt(ackObj: BattleAckObject = null) {
        let cPos = this.node.getPosition();
        let scene = this._battleScene;
        if (!scene) return;

        let targets: BattleAckObject[] = [];
        if (this._aoeInfo.sourceTag == GameObjectType.Turret || this._aoeInfo.sourceTag == GameObjectType.Hero) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);

            // 使用空间分区优化查找目标
            targets = this.getTargetsInAreaOptimized(cc.v2(wPos.x, wPos.y), this._aoeInfo.data.aoeRadius);

        } else if (this._aoeInfo.sourceTag == GameObjectType.Monster_Bullet) {
            targets.push(scene.getPassControl().getGameTripod());
        }

        if (ackObj && targets.indexOf(ackObj) < 0) {
            targets.push(ackObj);
        }

        let targetLength = targets.length;
        if (targetLength > 0) {
            // 限制最大处理数量，避免性能问题
            if (targetLength > 20) {
                targets = CommonUtils.shuffleArray(targets);
                targetLength = 20;
            }

            // 批量处理伤害事件
            this.processBatchDamage(targets);
        }
    }

    /**
     * 优化版本的区域目标查找
     */
    private getTargetsInAreaOptimized(center: cc.Vec2, radius: number): BattleAckObject[] {
        // 尝试获取空间分区管理器
        const spatialGrid = this.getSpatialGrid();
        if (spatialGrid) {
            return spatialGrid.getMonstersInArea(center, radius);
        }

        // 回退到原始方法
        if (this._battleScene && this._battleScene.getPassControl) {
            return this._battleScene.getPassControl().getTargetsInArea(center, this._aoeInfo.sourceTag, radius, ETurretDir.None);
        }
        return [];
    }

    /**
     * 获取空间分区管理器
     */
    private getSpatialGrid(): SpatialHashGrid {
        // 尝试从场景获取空间分区管理器
        if (this._battleScene && this._battleScene.getComponent) {
            return this._battleScene.getComponent(SpatialHashGrid);
        }
        return null;
    }

    /**
     * 批量处理伤害（优化版本）
     */
    private processBatchDamage(targets: BattleAckObject[]): void {
        // 尝试获取批量事件处理器
        const batchProcessor = this.getBatchEventProcessor();

        if (batchProcessor) {
            // 使用批量处理器
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i];
                let hObj = target.doHurt(this._aoeInfo.fixHurt);
                let hurt = hObj.hurt;

                // 添加到批量处理队列
                const damageEvent: DamageEvent = {
                    pos: cc.v2(target.getAckwPos()),
                    hurt: hurt,
                    isCritical: hObj.isCritical,
                    color: this._aoeInfo.sourceTag == GameObjectType.Monster_Bullet ? "#FF0000" : undefined
                };

                batchProcessor.addDamageEvent(damageEvent);
                this.checkAoeSkill(target, hurt, i);
            }

            // 立即处理批量事件
            batchProcessor.flushEvents();
        } else {
            // 回退到原始处理方式
            this.processDamageOriginal(targets);
        }
    }

    /**
     * 获取批量事件处理器
     */
    private getBatchEventProcessor(): BatchEventProcessor {
        // 尝试从场景获取批量事件处理器
        if (this._battleScene && this._battleScene.getComponent) {
            return this._battleScene.getComponent(BatchEventProcessor);
        }
        return null;
    }

    /**
     * 原始伤害处理方式（回退用）
     */
    private processDamageOriginal(targets: BattleAckObject[]): void {
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            let hObj = target.doHurt(this._aoeInfo.fixHurt);
            let hurt = hObj.hurt;
            this.checkAoeSkill(target, hurt, i);

            if (this._aoeInfo.sourceTag == GameObjectType.Monster_Bullet) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, {
                    pos: this.node.parent.convertToWorldSpaceAR(this.node.position),
                    hurt: hurt,
                    color: "#FF0000",
                    isCritical: hObj.isCritical,
                    block: hObj.block
                });
            } else {
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, {
                    pos: target.getAckwPos(),
                    hurt: hurt,
                    isCritical: hObj.isCritical
                });
            }
        }
    }

    // 触发技能
    protected checkAoeSkill(target: BattleAckObject, hurt: number, index: number = 0) {
        if (!target || !target.canAck()) return;
        if (this._aoeInfo.data.skillId2 > 0) {
            // console.log("BattleBulletUI checkAoeSkill");
            let skID = this._aoeInfo.data.skillId2;
            let bsk = ConfigMgr.getInstance().getById(skID, BulletSkillData);
            if (!bsk) {
                console.error('BulletSkillData aoe id = ' + skID + ' not found');
                return;
            }

            this.addBulletSKill(bsk, target, true, hurt, index);
        }
    }



    // 添加子弹技能 和 buff
    protected addBulletSKill(bsk: BulletSkillData, target: BattleAckObject, isAoe: boolean, hurt: number, index: number = 0) {

        if (bsk.shootBagId > 0) {
            let sId = bsk.shootBagId;
            let bagInfo: ShootBagInfo = null;

            let targets: BattleAckObject[] = [];
            if (this._aoeInfo.sourceTag == GameObjectType.Turret || this._aoeInfo.sourceTag == GameObjectType.Hero) {
                let scene = this._battleScene;// SceneMgr.getCurrScene() as UISceneBattle;
                targets = scene.getPassControl().getAllLiveMonster().filter((m) => {
                    return m != target;
                });
            }

            let ackTaget = null; //target.getFinalyTarget(targets, bsk.enemySearch, null);
            let endPos = null;
            // if (ackTaget) {
            //     endPos = ackTaget.getAckwPos();
            // } else
            {
                endPos = this.node.parent.convertToWorldSpaceAR(this.node.position.add(cc.v3(this._aoeInfo.moveDir.x * 200, this._aoeInfo.moveDir.y * 200, 0)));
            }

            let startPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            if (isAoe) {
                startPos = target.getAckwPos();
            }
            // 缺少锁敌方式
            if (sId > 0) {
                // aoe 生成新发射 丢弃aoe
                let param = this.getShootParm(sId, ackTaget, startPos, endPos, false, target);
                // if (bsk.enemySearchFail != 0 || ackTaget != null) {
                bagInfo = new ShootBagInfo(sId, this._aoeInfo.sourceTag, param, index);
                // }
            }

            if (bagInfo) {
                let shootbag = new ShootBagUI(bagInfo);
                this._battleScene.addShootBag2Game(shootbag);
            }
        }

        // 添加buff
        if (bsk.buffId > 0) {

            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
            if (!isAoe) {
                let bWpos = GameControl.getInstance().getBaseWpos(); // 获取基地位置
                wPos = cc.v2(bWpos.x, bWpos.y);
            }

            let rDir = cc.v2(target.getAckwPos().x - wPos.x, target.getAckwPos().y - wPos.y).normalize();
            let buff = new BuffEffectInfo(bsk.buffId, this._aoeInfo.parm.shootTurretId, rDir, hurt, this._aoeInfo.parm.shootObj);
            target.canAck() && target.addBuffect(buff);
        }

        // 召唤波次
        if (bsk.waveId > 0) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
            let data = {
                waveId: bsk.waveId,
                pos: wPos,
                sourceTag: this._aoeInfo.sourceTag,
            };
            GlobalEventMgr.getInstance().emit(GlobalEventID.wave_summon, data);
        }
    }

    protected getShootParm(sId: number, ackTaget: BattleAckObject, startPos: cc.Vec3, endPos: cc.Vec3, isAoe: boolean, target: BattleAckObject): shootBagParm {
        let bParam: shootBagParm = this._aoeInfo.parm;
        let shootPos = startPos;
        let param: shootBagParm = {
            shootObj: target,
            shootWPos: shootPos,
            ackTaget: ackTaget,// 缺少锁敌方式 TODO
            endPos: endPos,
            isAoe: isAoe,         // 是否aoe
            eDir: bParam.eDir,
            ackPower: bParam.ackPower, // 攻击力
            damAppend: bParam.damAppend, // 伤害追加
            shootTurretId: bParam.shootTurretId, // 发射者id
            shootRadius: bParam.shootRadius, // 发射半径
            tHitCriticalAdd: bParam.tHitCriticalAdd, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: bParam.tHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
            tAoeCriticalAdd: bParam.tAoeCriticalAdd, // 调整后 提高aoe暴击概率
            tAoeCriticalHurtAdd: bParam.tAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
            reviveAttack: bParam.reviveAttack,
            shootInfo: bParam.shootInfo,
            extAckObj: [target],
            damLv: bParam.damLv,
            damMul: bParam.damMul, // 百分比修改伤害
            attackMul: bParam.attackMul, // 百分比修改攻击
            damAdd: bParam.damAdd, // 强化 伤害
            actMan: bParam.actMan, //行动者

        }
        return param;
    }











}