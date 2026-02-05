import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { QTBox } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { BulletInfo, ShootBagInfo, shootBagParm } from "../config/DataInfo";
import { ETurretDir, GameAOEState, GameBulletState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulletBase from "./BulletBase";
import GameControl from "./GameControl";
import GameHelp from "../Mgr/GameHelp";
import { AOESustainedInfo } from "../config/AOEInfo";
import ConfigMgr from "../config/ConfigMgr";
import { BulletSkillData } from "../config/DataDef";
import { BuffEffectInfo } from "../config/DataInfo";
import ShootBagUI from "./ShootBagUI";
const { ccclass, property } = cc._decorator;

// 旋风轮 - 原地旋转持续AOE伤害
@ccclass
export default class BulletWhirlUI extends BulletBase {

    protected _bulletInfo: BulletInfo = null;
    protected _checkSpace: number = 0.1;
    protected _imgNode: cc.Node = null;
    protected _aoeInfo: AOESustainedInfo = null;
    protected _whirlAngle: number = 0;
    protected _rotationSpeed: number = 360;
    protected _checkHurtInterval: number = 0;
    protected _liveTime: number = 0;
    protected _maxLiveTime: number = 0;

    private _canMove = true;

    public init(bInfo: BulletInfo) {
        this._bulletInfo = bInfo;
        this._canMove = true;
        this._checkHurtInterval = 0;
        this.node.name = `Bullet_${bInfo.data.id}_${bInfo.sourceTag}_${bInfo.getOffset()}`;

        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(this.getStartWPos()));

        let collider = this.node.getComponentInChildren(cc.BoxCollider);
        if (collider) {
            let qtBox = new QTBox(collider.offset.x - collider.size.width / 2, collider.offset.y - collider.size.height / 2, collider.size.width, collider.size.height, this._bulletInfo.sourceTag);
            qtBox.node = this.node;
            this._qtShapes.push(qtBox);
            GameControl.getInstance().getQuadTree().insert(qtBox);
            this.resetQTPos();
        }

        this._imgNode = this.node.getChildByName('img');
        if (this._imgNode) {
            this._imgNode.scale = this._bulletInfo.getBulletScale();
            let sps = this._imgNode.getComponent(sp.Skeleton);
            sps && sps.setAnimation(0, 'animation', true);
        }

        this._maxLiveTime = bInfo.data.aoeTime; // 秒
        this._bulletInfo.state = GameBulletState.Running;

        if (bInfo.data.aoeType > 0) {
            this.initAOE();
        }
    }

    protected setMoveDir() {
        // 初始方向随机
        super.setMoveDir()

        let angle = (Math.random() * 50 + 30) * (Math.random() > 0.5 ? 1 : -1);
        // const angle = Math.random() * 360;

        const currentPos = this.node.convertToWorldSpaceAR(cc.v3(0, 0));
        const targetPos = this._bulletInfo.parm?.ackTaget?.getAckwPos() || cc.v3(0, 0);
        // 计算基础跟随方向
        const desiredDirection = targetPos.sub(currentPos)
            .normalize();
        this._bulletInfo.movDir = this.addRandomAngleToVector(cc.v2(desiredDirection.x, desiredDirection.y), angle).normalizeSelf();
        this.resetRationt(this._bulletInfo.movDir);
    }

    /**
   * 为向量添加随机角度偏移
   * @param vector 原始向量
   * @param maxAngle 最大偏移角度（度）
   * @returns 添加随机角度后的新向量
   */
    private addRandomAngleToVector(vector: cc.Vec2, maxAngle: number): cc.Vec2 {
        if (vector.mag() <= 0) return vector;

        // 生成随机角度（-maxAngle到+maxAngle之间）
        const randomAngle = (Math.random() * 2 - 1) * maxAngle;
        const radians = cc.misc.degreesToRadians(randomAngle);

        // 计算旋转后的向量
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const x = vector.x * cos - vector.y * sin;
        const y = vector.x * sin + vector.y * cos;

        return cc.v2(x, y);
    }

    public getStartWPos(): cc.Vec3 {
        return this._bulletInfo.startWPos;
    }

    protected initAOE(): void {
        let startWPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        let aoeInfo = new AOESustainedInfo(
            cc.v3(startWPos.x, startWPos.y),
            this._bulletInfo.sourceTag,
            this._bulletInfo.parm,
            this._bulletInfo.data,
            this._bulletInfo.getFixHurt(),
            this._bulletInfo.movDir
        );
        this._aoeInfo = aoeInfo;
    }

    public doUpdate(dt: number): void {
        // 调用父类的doUpdate方法
        super.doUpdate(dt);

        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }

        this._whirlAngle += this._rotationSpeed * dt;
        this.node.angle = this._whirlAngle;

        for (const element of this._qtShapes) {
            element.setRotation(this._whirlAngle);
            element.setPosition(this.node.x, this.node.y);
        }
        this.doMove(dt);
        if (!this._canMove) this.checkHurt(dt);
        this.checkLiveTime(dt);
    }

    protected checkLiveTime(dt: number): void {
        if (this._maxLiveTime <= 0) return;

        this._liveTime += dt; // dt是秒
        if (this._liveTime >= this._maxLiveTime) {
            this.playDeathAni();
        }
    }

    protected doMove(dt: number): void {
        if (!this._canMove) return;
        let moveDir = this._bulletInfo.movDir.normalize();
        // let moveDir = this._bulletInfo.getRealMovDir() || cc.v2(0, 1);
        const delta = moveDir.mul(this._bulletInfo.getFixSpeed() * dt); //   cc.v2(moveDir.x, moveDir.y).multiplyScalar(this.bulletInfo.moveSpeed * dt);
        this.node.x += delta.x;
        this.node.y += delta.y;
    }

    protected checkHurt(dt: number): void {
        if (!this._aoeInfo || this._aoeInfo.data.aoeType <= 0) return;
        if (!this._checkHurtInterval) this.doAOEHurt()
        this._checkHurtInterval += dt; // dt是秒
        if (this._checkHurtInterval >= this._aoeInfo.data.aoeInterval / 1000) {
            this._checkHurtInterval = 0.1;
            this.doAOEHurt();
        }
    }

    protected doAOEHurt(): void {
        let cPos = this.node.getPosition();
        let scene = this._battleScene;
        if (!scene) return;

        let targets: BattleAckObject[] = [];
        if (this._aoeInfo.sourceTag == GameObjectType.Turret || this._aoeInfo.sourceTag == GameObjectType.Hero) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            targets = scene.getPassControl().getTargetsInArea(cc.v2(wPos.x, wPos.y), this._aoeInfo.sourceTag, this._aoeInfo.data.aoeRadius, ETurretDir.None);
        } else if (this._aoeInfo.sourceTag == GameObjectType.Monster_Bullet) {
            targets.push(scene.getPassControl().getGameTripod());
        }

        let tlenght = targets.length;
        if (tlenght > 0) {
            if (tlenght > 20) {
                targets = CommonUtils.shuffleArray(targets);
                tlenght = 20;
            }
            for (let i = 0; i < tlenght; i++) {
                let target = targets[i];
                let hObj = target.doHurt(this._aoeInfo.fixHurt);
                let hurt = hObj.hurt;
                this.checkAoeSkill(target, hurt, i);
                if (this._aoeInfo.sourceTag == GameObjectType.Monster_Bullet) {
                    GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.node.parent.convertToWorldSpaceAR(this.node.position), hurt: hurt, color: "#FF0000", isCritical: hObj.isCritical, block: hObj.block });
                } else {
                    GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: target.getAckwPos(), hurt: hurt, isCritical: hObj.isCritical });
                }
            }
        }
    }

    protected checkAoeSkill(target: BattleAckObject, hurt: number, index: number = 0): void {
        if (!target || !target.canAck()) return;
        if (this._aoeInfo.data.skillId2 > 0) {
            let skID = this._aoeInfo.data.skillId2;
            let bsk = ConfigMgr.getInstance().getById(skID, BulletSkillData);
            if (!bsk) {
                console.error('BulletSkillData aoe id = ' + skID + ' not found');
                return;
            }
            this.addBulletSKill(bsk, target, true, hurt, index);
        }
    }

    protected addBulletSKill(bsk: BulletSkillData, target: BattleAckObject, isAoe: boolean, hurt: number, index: number = 0): void {
        if (bsk.shootBagId > 0) {
            let sId = bsk.shootBagId;
            let targets: BattleAckObject[] = [];
            if (this._aoeInfo.sourceTag == GameObjectType.Turret || this._aoeInfo.sourceTag == GameObjectType.Hero) {
                targets = this._battleScene.getPassControl().getAllLiveMonster().filter((m) => {
                    return m != target;
                });
            }

            let startPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            if (isAoe) {
                startPos = target.getAckwPos();
            }

            let endPos = this.node.parent.convertToWorldSpaceAR(this.node.position.add(cc.v3(this._aoeInfo.moveDir.x * 200, this._aoeInfo.moveDir.y * 200, 0)));

            let param = this.getShootParm(sId, null, startPos, endPos, false, target);
            let bagInfo = new (ShootBagInfo as any)(sId, this._aoeInfo.sourceTag, param, index);

            let shootbag = new (ShootBagUI as any)(bagInfo);
            this._battleScene.addShootBag2Game(shootbag);
        }

        if (bsk.buffId > 0) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
            let rDir = cc.v2(target.getAckwPos().x - wPos.x, target.getAckwPos().y - wPos.y).normalize();
            let buff = new BuffEffectInfo(bsk.buffId, this._aoeInfo.parm.shootTurretId, rDir, hurt, this._aoeInfo.parm.shootObj);
            target.canAck() && target.addBuffect(buff);
        }
    }

    protected getShootParm(sId: number, ackTaget: BattleAckObject, startPos: cc.Vec3, endPos: cc.Vec3, isAoe: boolean, target: BattleAckObject): shootBagParm {
        let bParam = this._aoeInfo.parm;
        let param: shootBagParm = {
            shootObj: target,
            shootWPos: startPos,
            ackTaget: ackTaget,
            endPos: endPos,
            isAoe: isAoe,
            eDir: bParam.eDir,
            ackPower: bParam.ackPower,
            damAppend: bParam.damAppend,
            shootTurretId: bParam.shootTurretId,
            shootRadius: bParam.shootRadius,
            tHitCriticalAdd: bParam.tHitCriticalAdd,
            tHitCriticalHurtAdd: bParam.tHitCriticalHurtAdd,
            tAoeCriticalAdd: bParam.tAoeCriticalAdd,
            tAoeCriticalHurtAdd: bParam.tAoeCriticalHurtAdd,
            reviveAttack: bParam.reviveAttack,
            shootInfo: bParam.shootInfo,
            extAckObj: [target],
            damLv: bParam.damLv,
            damMul: bParam.damMul,
            attackMul: bParam.attackMul,
            damAdd: bParam.damAdd,
            actMan: bParam.actMan,
        }
        return param;
    }

    protected onCollisionEnterQT(other: QTShape): void {
        let bullet = other.node.getComponent(BulletBase);
        if (bullet) {
            if (this.getBulletOffset() == 1 && bullet.getBulletOffset() != 2) {
                this.doOffset();
            }
            // this._canMove = false;
        } else {
            //不是子弹才能停止移动。
            this._canMove = false;
        }
        // let monster = other.node.getComponent(BattleMonsterUI);
        // if (monster) {
        //     this._canMove = false;
        // }
    }

    protected doOffset(): void {
        this.showHitEffect();
        this._bulletInfo.state = GameBulletState.End;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this._bulletInfo.state = GameBulletState.Del;
            })
            .start()
    }

    protected showHitEffect(): void {
    }

    public isWaitRemove(): boolean {
        return this._bulletInfo.state == GameBulletState.Del;
    }

    protected playDeathAni(): void {
        this._bulletInfo.state = GameBulletState.End;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this._bulletInfo.state = GameBulletState.Del;
            })
            .start()
    }

    // 碰撞检测 - 从BulletBase复制
    lastFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 上一帧碰撞的对象
    currentFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 当前帧碰撞的对象

    protected checkQTCollision(): void {
        if (this.lastFrameCollisions.size != 0 || this.currentFrameCollisions.size != 0) {
            this.lastFrameCollisions = this.currentFrameCollisions;
            this.currentFrameCollisions = new Set<QTShape>();
        }

        for (const element of this._qtShapes) {
            let cList = GameControl.getInstance().getQuadTree().collide(element, GameHelp.getInstance().getCollisionTag(this._bulletInfo.sourceTag));
            let calced: cc.Node[] = [];
            for (const element of cList) {
                if (calced.indexOf(element.node) < 0) {
                    calced.push(element.node);
                    this.currentFrameCollisions.add(element);
                }
            }
        }

        // 碰撞开始：当前帧有，上一帧没有
        this.currentFrameCollisions.forEach(other => {
            if (!this.lastFrameCollisions.has(other)) {
                this.onCollisionEnterQT(other);
            }
        });

        // 碰撞结束：上一帧有，当前帧没有
        this.lastFrameCollisions.forEach(other => {
            if (!this.currentFrameCollisions.has(other)) {
                this.onCollisionExitQT(other);
            }
        });
    }

    protected onCollisionExitQT(other: QTShape): void {
        // 碰撞离开的逻辑，可以空实现
        // this._canMove = false;
    }

    reuse(): void {
        this._checkSpace = 0.1;
        this._checkHurtInterval = 0;
        this._liveTime = 0;
        this._whirlAngle = 0;
        this._aoeInfo = null;
    }

    unuse(): void {
    }

}