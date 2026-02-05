
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { QTBox } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import ConfigMgr from "../config/ConfigMgr";
import { KvData } from "../config/DataDef";
import { BulletInfo, shootBagParm } from "../config/DataInfo";
import { BulletAoeType, GameBulletState, GameObjectType } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";
import BattleAckObject from "./BattleAckObjet";
import BulletBase from "./BulletBase";
import GameControl from "./GameControl";
import GameResLoad from "./GameResLoad";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletLaser extends BulletBase {

    @property(cc.Node)
    mask: cc.Node = null; // 遮罩

    @property(cc.BoxCollider)
    boxCollider: cc.BoxCollider = null;

    @property(cc.Node)
    laser: cc.Node = null;

    hitPos: cc.Node = null;

    protected _colliderNodes: BattleAckObject[] = [];

    protected _target: BattleAckObject = null;

    public atkInterval: number = 100;  //攻击间隔

    protected _atkTime: number = 0;

    protected _spAnim: sp.Skeleton = null;

    protected _imgAnim: cc.Animation = null; // 动画

    protected _anState: number = 0; // 0:未开始 1:开始 2: 循环 3:结束
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        super.onLoad();
        this.mask = this.node.getChildByName("box");
        this.hitPos = this.mask.getChildByName('hitPos');
        // this.node.addComponent(cc.Graphics);
    }


    public init(bInfo: BulletInfo) {
        this._target = bInfo.targetObj;
        super.init(bInfo);
        if (!cc.isValid(this._target)) {
            this.resetTarget();
        }
        this.addAckObj(this._target);
        // this.mask.scaleX = this._bulletInfo.data.width / this.boxCollider.size.width;
        // this._bulletInfo.state = GameBulletState.Running;
        this.changeBulletState(GameBulletState.Running);

        this._spAnim = this.laser.getComponent(sp.Skeleton);

        this._imgAnim = this.mask.getComponent(cc.Animation);

        this.hitPos.removeAllChildren();

        this.atkInterval = parseInt(ConfigMgr.getInstance().getById(16, KvData).val);

        let box = this.node.getComponentInChildren(cc.BoxCollider);
        let qtBox = new QTBox(-box.size.width / 2, 0, box.size.width, box.size.height, this._bulletInfo.sourceTag);
        qtBox.node = this.node;
        this._qtShapes.push(qtBox);
        GameControl.getInstance().getQuadTree().insert(qtBox);

    }

    protected addAckObj(otherObj: BattleAckObject) {
        if (otherObj && otherObj.canAck() && this._colliderNodes.indexOf(otherObj) < 0) {
            let fd = this._bulletInfo.parm.extAckObj.find((item) => {
                if (item == otherObj) {
                    return true;
                }
            });
            if (fd) {  // 已经攻击过
                return;
            }
            this._colliderNodes.push(otherObj);
        }
    }

    protected setMoveDir() {

        if (!cc.isValid(this._target)) {
            return;
        }

        // 获取目标节点的世界坐标
        let endPos = this.node.parent.convertToNodeSpaceAR(this._target.getAckwPos());

        let stPos = this.node.parent.convertToNodeSpaceAR(this.getStartWPos());

        // 计算子弹起始位置和目标位置之间的向量
        let ds = endPos.sub(stPos);
        let len = ds.len();
        this.mask.height = len;
        this.boxCollider.size.height = len;
        this.boxCollider.offset = cc.v2(0, len / 2);

        // this.laser.height = len;

        this.laser.scaleX = this._bulletInfo.data.width / this.laser.width;
        this.laser.scaleY = len / 1000;
        this.resetRationt(cc.v2(ds.x, ds.y));

        if (this._anState > 0) {
            // hit effect
            GlobalEventMgr.getInstance().emit(GlobalEventID.createCombatBombLoop, {
                pos: this.hitPos.parent.convertToWorldSpaceAR(this.hitPos.position),
                url: this._bulletInfo.bulletSP.spHit,
                scale: this._bulletInfo.bulletSP.spHitVal,
                uuid: this.node.uuid, // 唯一标识符
                node: this.node,
            });
        }

        this.node.setPosition(stPos);

        for (const element of this._qtShapes) {
            element.setPosition(stPos.x, stPos.y);
            element.setRotation(this.node.angle);

            this.laser.scaleY

            let box = this.node.getComponentInChildren(cc.BoxCollider);
            let size = cc.size(box.size.width * this.laser.scaleX, len);

            (element as QTBox).resetPoints(-size.width / 2, 0, size.width, size.height)
        }

        cc.isValid(this._bulletInfo.parm.shootObj) && this._bulletInfo.parm.shootObj.lookAtWPos(this._target.getAckwPos());

    }


    public doUpdate(dt: number): void {
        // super.doUpdate(dt);
        if (!this._bulletInfo) return;

        switch (this._bulletInfo.state) {
            case GameBulletState.Running:
                this.doRunning(dt);
                break;
            case GameBulletState.End:
                this.doEnd(dt);
                break;
            case GameBulletState.Del:
                break;
            default:
                break;
        }
    }

    protected doEnd(dt: number) {
        this._bulletInfo.endCDTime -= dt;
        if (this._bulletInfo.endCDTime <= 0) {
            this.toDel();
        }
    }

    protected doRunning(dt: number) {
        this._bulletInfo.liveTime += dt * 1000; // 子弹存活时间

        this.doRefrush();
        this._atkTime -= dt * 1000;
        this.calcHurt(); // 计算伤害
        if (this._bulletInfo.liveTime >= this._bulletInfo.getBulletLife() && this._bulletInfo.state == GameBulletState.Running) {
            this.change2End();
        }

        // 炮塔死亡 激光消失
        if (!this._bulletInfo.parm.shootObj || !this._bulletInfo.parm.shootObj.isLiving()) {
            // this._bulletInfo.state = GameBulletState.Del;
            // GlobalEventMgr.getInstance().emit(GlobalEventID.endCombatBombLoop, {
            //     uuid: this.node.uuid, // 唯一标识符
            // });
            // this._bulletInfo.state = GameBulletState.End;
            this.changeBulletState(GameBulletState.End);
            this._bulletInfo.endCDTime = 0.01;
        }
        this.resetZIndex(); // 重置z轴
        this.checkQTCollision();

    }



    onCollisionEnterQT(other: QTShape): void {
        let otherObj = other.node.getComponent(BattleAckObject);
        if (otherObj && otherObj.canAck()) {
            this.addAckObj(otherObj);

        }
        super.onCollisionEnterQT(other);
    }

    onCollisionExitQT(other: QTShape): void {
        let otherObj = other.node.getComponent(BattleAckObject);
        let fIndx = this._colliderNodes.indexOf(otherObj);
        if (fIndx >= 0) {
            this._colliderNodes.splice(fIndx, 1);
        }
    }

    protected doRefrush() {
        if (cc.isValid(this._target) && this._target.canAck()) {
            this.setMoveDir();

            if (this._anState == 0) {
                this._anState = 1;
                if (this._spAnim) {
                    this._spAnim.setAnimation(0, 'kaishi', false);
                    let self = this;
                    this._spAnim.setCompleteListener(() => {
                        if (this._bulletInfo.state == GameBulletState.Running) {
                            self._spAnim.setAnimation(0, 'xunhuan', true);
                            self._anState = 2;
                        }
                    });

                } else if (this._imgAnim) {
                    this._anState = 2;
                    let aName = this._imgAnim.getClips()[0].name
                    this._imgAnim.play(aName);
                } else {
                    console.log("no laser anim");
                }
            }

        } else {
            // console.error("target is null or target can't ack");
            //this._bulletInfo.state = GameBulletState.Del;
            this._target = this.getNextTarget();
            if (!this._target) {
                // this.change2End();
                this.toDel();
            }
        }
    }

    // 获取下一个目标
    protected getNextTarget(): BattleAckObject {
        // in collider
        let bRet: BattleAckObject = null;
        for (const element of this._colliderNodes) {
            if (cc.isValid(element) && element.canAck()) {
                bRet = element;
                break;
            }
        }
        // in map
        if (!bRet) {
            if (this._bulletInfo.sourceTag == GameObjectType.Turret || this._bulletInfo.sourceTag == GameObjectType.Hero) {
                let scene = this._battleScene;
                let targets = scene.getPassControl().getTargetsInArea(cc.v2(this._bulletInfo.parm.shootWPos.x, this._bulletInfo.parm.shootWPos.y), this._bulletInfo.sourceTag, this._bulletInfo.parm.shootRadius, this._bulletInfo.parm.eDir);
                if (targets.length > 0) {
                    bRet = targets[0];
                }
            }
        }

        if (bRet) {
            this._target = bRet;
            this.addAckObj(bRet);

            // console.log("BattleLaserUI get next target", this._target.uuid);
        }
        return bRet;
    }


    protected toDel() {
        // this._bulletInfo.state = GameBulletState.Del;
        this.changeBulletState(GameBulletState.Del);
        // console.log("BattleLaserUI Del", this.node.uuid);
        GlobalEventMgr.getInstance().emit(GlobalEventID.endCombatBombLoop, {
            uuid: this.node.uuid, // 唯一标识符
        });
    }

    protected change2End() {
        // console.log("BattleBulletUI toDel", this._bulletInfo.state);
        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }
        // this._bulletInfo.state = GameBulletState.End;
        this.changeBulletState(GameBulletState.End);
        this.calcAOE(BulletAoeType.End);
        if (this._anState == 2) {
            this._anState = 3;
            // console.log("BattleLaserUI End", this.node.uuid);
            let self = this;
            let dTime = 0.2;

            if (this._spAnim) {
                this._spAnim.addAnimation(0, 'jieshu', false);
                let an = this._spAnim.findAnimation('jieshu');
                an && (dTime = an.duration + 0.1);
                this._bulletInfo.endCDTime = dTime;
                this._spAnim.setCompleteListener(() => {

                })
            } else if (this._imgAnim) {
                this._imgAnim.stop();
            }
        }
    }


    public getStartWPos(): cc.Vec3 {
        return this._bulletInfo.parm.shootObj.getFireWPos() || this._bulletInfo.parm.shootWPos;
    }

    calcHurt() {
        if (this._atkTime <= 0) {
            this._atkTime = this.atkInterval;
            let tmpTargets: Array<BattleAckObject> = this._colliderNodes;

            for (const obj of tmpTargets) {
                if (cc.isValid(obj) && obj.canAck()) {
                    let hObj = obj.doHurt(this._bulletInfo.getFixHurt());
                    let hurt = hObj.hurt;
                    if (obj == this._target && !obj.canAck()) {
                        // this.delete(this.node, nowMilli);
                        this.resetTarget();
                    }
                    // this.calcSkill1(tmpTargetNode, nowMilli);
                    // this.calcAOE(AOEType.type2, nowMilli);
                    if (this._bulletInfo.currHitTimes < 1) {
                        this.checkHitSkill(obj, hurt, hObj.isCritical);
                        this.calcAOE(BulletAoeType.Hit);
                    }
                    this._bulletInfo.currHitTimes += 1;

                    let ackObj = obj; // 获取被击中的对象
                    if (this._bulletInfo.sourceTag == GameObjectType.Monster_Bullet) {
                        GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.hitPos.parent.convertToWorldSpaceAR(this.hitPos.position), hurt: hurt, isCritical: hObj.isCritical, color: "#FF0000", block: hObj.block });
                    } else {
                        GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.hitPos.parent.convertToWorldSpaceAR(this.hitPos.position), hurt: hurt, isCritical: hObj.isCritical });
                    }
                }

            }
        }
    }

    /** 击中效果 */
    protected showHitEffect() {

    }

    protected getShootParm(sId: number, ackTaget: BattleAckObject, startPos: cc.Vec3, endPos: cc.Vec3, isAoe: boolean, target: BattleAckObject): shootBagParm {
        let bParam: shootBagParm = this._bulletInfo.parm;
        let shootPos = this.hitPos.parent.convertToWorldSpaceAR(this.hitPos.position);
        let param: shootBagParm = {
            shootObj: target,
            shootWPos: shootPos,
            ackTaget: ackTaget, // 缺少锁敌方式 TODO
            endPos: endPos,
            isAoe: isAoe, // 是否aoe
            eDir: bParam.eDir,
            // turretAtk: bParam.turretAtk, // 炮台攻击力
            ackPower: bParam.ackPower, // 攻击力
            damAppend: bParam.damAppend, // 伤害追加
            shootTurretId: bParam.shootTurretId, // 发射者id
            shootRadius: bParam.shootRadius, // 发射半径
            tHitCriticalAdd: bParam.tHitCriticalAdd, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: bParam.tHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
            tAoeCriticalAdd: bParam.tAoeCriticalAdd, // 调整后 提高aoe暴击概率
            tAoeCriticalHurtAdd: bParam.tAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
            shootInfo: bParam.shootInfo,
            reviveAttack: bParam.reviveAttack,
            extAckObj: [target],
            damLv: bParam.damLv,
            damMul: bParam.damMul, // 百分比修改伤害
            attackMul: bParam.attackMul, // 百分比修改攻击
            damAdd: bParam.damAdd, // 强化 伤害
            actMan: bParam.actMan, //行动者

        }
        return param;
    }

    protected resetTarget() {
        this._target = null;
    }

    unuse(): void {
        super.unuse();
        this._colliderNodes = []; // 清空碰撞列表
        this._target = null;
        this._anState = 0;
        this.laser.scale = 1; // 重置激光长度
        // console.log("BattleLaserUI unuse");
    }

    reuse(): void {
        this._anState = 0; // 初始化状态
        super.reuse();

    }
}
