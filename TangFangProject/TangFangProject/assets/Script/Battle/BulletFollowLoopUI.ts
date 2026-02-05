

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { BulletInfo } from "../config/DataInfo";
import { GameBulletState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulletBase from "./BulletBase";
import GameControl from "./GameControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletFollowLoopUI extends BulletBase {

    rotationSpeed: number = 320; // 转向速度（度/秒）
    maxPredictionTime: number = 0.5; // 最大预测时间（秒）

    lastPosition: cc.Vec2 = cc.Vec2.ZERO; // 上一次位置

    protected _findSpace: number = 0.5; // 查找范围

    // protected hasC: boolean = false;
    // 初始化子弹
    public init(bInfo: BulletInfo) {
        super.init(bInfo);
        this._findSpace = 0;
    }

    protected setMoveDir() {
        // 初始方向随机
        super.setMoveDir()

        if (!this._bulletInfo.parm.ackTaget || !cc.isValid(this._bulletInfo.parm.ackTaget) || !this._bulletInfo.parm.ackTaget.canAck()) {
            return;
        }

        let angle = (Math.random() * 50 + 30) * (Math.random() > 0.5 ? 1 : -1);
        // const angle = Math.random() * 360;

        const currentPos = this.node.convertToWorldSpaceAR(cc.v3(0, 0));
        const targetPos = this._bulletInfo.parm?.ackTaget?.getAckwPos() || cc.v3(0, 0);
        // 计算基础跟随方向
        const desiredDirection = targetPos.sub(currentPos).normalize();
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

    doUpdate(dt: number) {

        if (this._bulletInfo.targetObj && cc.isValid(this._bulletInfo.targetObj) && this._bulletInfo.targetObj.canAck()) {
            this.doUpdate2(dt);
            // this.checkLog() && cc.warn("子弹目标前进");
        } else {
            // this.checkLog() && cc.warn("子弹没有目标");
            this.doMove(dt);
            this._findSpace -= dt;
            if (this._findSpace <= 0) {
                this.findNewTarget();
            }
        }
        super.doUpdate(dt);
        // 
        // 检查是否超出屏幕范围
    }

    protected doUpdate2(dt: number) {

        let target = this._bulletInfo.parm.ackTaget;
        let moveSpeed = this._bulletInfo.getFixSpeed();
        let currentVelocity = this._bulletInfo.movDir;
        // 获取当前位置和目标位置
        const currentPos = this.node.convertToWorldSpaceAR(cc.v3(0, 0));
        const targetPos = target.getAckwPos();

        // 计算基础跟随方向
        const desiredDirection = targetPos.sub(currentPos).normalize();

        // 简单预测目标位置（基础预测）
        // const targetVelocity = this.getTargetVelocity(target);
        // const predictionTime = Math.min(
        //     currentPos.sub(targetPos).mag() / moveSpeed,
        //     this.maxPredictionTime
        // );
        const predictedTargetPos = targetPos; //.add(targetVelocity.mul(predictionTime));

        // 计算最终跟随方向（带预测）
        const finalDirection = predictedTargetPos.sub(currentPos).normalize();

        // 平滑转向当前方向
        if (currentVelocity.mag() > 0) {
            const currentDirection = currentVelocity.normalize();
            const angleDiff = this.getAngleDifference(currentDirection, cc.v2(finalDirection.x, finalDirection.y));
            const maxRotation = cc.misc.degreesToRadians(this.rotationSpeed) * dt;
            const rotationAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxRotation);

            const newDirection = currentDirection.rotate(rotationAmount);
            currentVelocity = newDirection;
        } else {
            currentVelocity = cc.v2(finalDirection.x, finalDirection.y); // finalDirection.mul(moveSpeed);
        }

        // 更新位置
        const newPos = currentPos.add(cc.v3(currentVelocity).mul(dt * moveSpeed));
        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(newPos));

        this._bulletInfo.movDir.x = currentVelocity.x
        this._bulletInfo.movDir.y = currentVelocity.y
        this.resetRationt(this._bulletInfo.movDir);
    }




    protected doMove(dt: number): void {
        dt = dt / 2; // 减少移动速度
        let moveDir = this._bulletInfo.movDir.normalize();
        const delta = moveDir.mul(this._bulletInfo.getFixSpeed() * dt); //   cc.v2(moveDir.x, moveDir.y).multiplyScalar(this.bulletInfo.moveSpeed * dt);
        this.node.x += delta.x;
        this.node.y += delta.y;
        // 更新旋转（指向移动方向）
        // const angle = cc.misc.radiansToDegrees(Math.atan2(delta.y, delta.x));
        // this.node.angle = angle - 90;
    }

    // // 获取目标速度（简单估算）
    // private getTargetVelocity(target: BattleAckObject): cc.Vec3 {
    //     return cc.v3(0, 0);

    //     if (!target.node['lastPosition']) {
    //         target.node['lastPosition'] = target.getAckwPos();
    //         return cc.v3(0, 0);
    //     }

    //     const currentPos = target.getAckwPos();
    //     const lastPos = target.node['lastPosition'];
    //     const velocity = currentPos.sub(lastPos).mul(1 / cc.director.getDeltaTime());

    //     target.node['lastPosition'] = currentPos.clone();
    //     return velocity;
    // }

    // 计算两个方向的角度差（弧度）
    private getAngleDifference(dir1: cc.Vec2, dir2: cc.Vec2): number {
        const angle1 = Math.atan2(dir1.y, dir1.x);
        const angle2 = Math.atan2(dir2.y, dir2.x);
        let diff = angle2 - angle1;

        // 确保角度差在 -π 到 π 之间
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;

        return diff;
    }

    protected onCollisionEnterQT(other: QTShape): void {

        if (!this._bulletInfo) {
            console.error("this._bulletInfo is null")
        }

        let ackObj = other.node.getComponent(BattleAckObject);

        let newTarget: BattleAckObject = null;
        if (ackObj && ackObj.canAck()) {
            let fd = this._bulletInfo.parm.extAckObj.find((item) => {
                if (item == ackObj) {
                    return true;
                }
            });
            if (fd) {  // 已经攻击过
                return;
            }

            // 只允许攻击id
            if (this._bulletInfo.tgt.length > 0) {
                let mId = ackObj.getShootInfo().getID();
                if (this._bulletInfo.tgt.indexOf(mId) < 0) {
                    return;
                }
            }

            this._bulletInfo.currHitTimes += 1;
            this.showHitEffect();

            let fixHurt = this._bulletInfo.getFixHurt();
            let hObj = ackObj.doHurt(fixHurt);
            let hurt = hObj.hurt;
            this.hitTimesCheck(ackObj, hObj.isCritical);
            this.checkHitSkill(ackObj, hurt, hObj.isCritical);
            if (this._bulletInfo.sourceTag == GameObjectType.Monster_Bullet) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.node.parent.convertToWorldSpaceAR(this.node.position), hurt: hurt, color: "#FF0000", isCritical: hObj.isCritical, block: hObj.block });
            } else {
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: ackObj.getAckwPos(), hurt: hurt, isCritical: hObj.isCritical });
            }
            // this.calcAOE(BulletAoeType.Hit);

            if (this._bulletInfo.parm.ackTaget == ackObj) {
                this.findNewTarget()
            }
        }
        super.onCollisionEnterQT(other);
        // this.hasC = true;
    }

    private checkLog(): boolean {
        let id = this._bulletInfo.data.id;
        return id === 305;
    }

    // 寻找新的目标
    protected findNewTarget(): BattleAckObject {
        if (this._bulletInfo.sourceTag == GameObjectType.Turret || this._bulletInfo.sourceTag == GameObjectType.Hero) {
            let scene = this._battleScene;// SceneMgr.getCurrScene() as UISceneBattle;
            let allLive = scene.getPassControl().getAllLiveMonster();
            let targets = allLive.filter((m) => {
                return m != this._bulletInfo.parm.ackTaget;
            });



            // this.checkLog() && console.log("找新目标，id，找到，活着：", this._bulletInfo.data.id, targets.length, allLive.length);
            if (targets.length > 0) {
                CommonUtils.shuffleArray(targets);
                let newTarget = targets[0];
                // this.checkLog() && console.log('更换tartet', this._bulletInfo.parm.shootObj.node.uuid, newTarget.node.uuid, newTarget.canAck(), newTarget.getShootInfo().state);
                this._findSpace = 0;
                this._bulletInfo.parm.ackTaget = newTarget;
                return newTarget;
            } else {
                this._findSpace = 0.05 + Math.random() * 0.05;
                // this.checkLog() && console.log('更换tartet', this._bulletInfo.parm.shootObj.node.uuid, '没有找到', allLive.length);
            }
        } else {
            console.error("findNewTarget", this._bulletInfo.sourceTag);
        }

        return null;

    }

    unuse(): void {
        super.unuse();
    }



}
