

import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { BulletAoeType, GameBulletState, GameObjectType } from "../config/GameEnum";
import BulletBase from "./BulletBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulleCurveUI extends BulletBase {
    protected t: number = 0; // run time 

    protected totalTime: number = 0; // total time

    protected previousPosition = cc.v2();  // 起点

    protected p1Pos: cc.Vec2 = cc.v2();
    protected p2Pos: cc.Vec2 = cc.v2();

    protected endPos: cc.Vec2 = cc.v2();

    // 继承射线检测需要的属性
    protected _lastPosition: cc.Vec2 = cc.v2();

    start() {

    }

    protected setMoveDir(): void {
        super.setMoveDir();
        this.setBezierMove();
    }

    protected setBezierMove(): void {
        let startPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.startWPos);
        let endPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.endPos);
        this.previousPosition = cc.v2(startPos.x, startPos.y);
        this.endPos = cc.v2(endPos.x, endPos.y);

        // 先计算控制点
        let pos1 = this.calcPos(this.totalTime / 3);
        let pos2 = this.calcPos(this.totalTime / 2);

        // 优化控制点计算，让曲线更自然
        const curveOffset = Random.range(180, 300) * (Math.random() > 0.5 ? 1 : -1);
        this.p2Pos = cc.v2(pos2.x + curveOffset, startPos.y + (endPos.y - startPos.y) / 2);
        this.p1Pos = this.p2Pos;

        // 使用贝塞尔曲线的实际路径长度来计算更准确的飞行时间
        let dist = this.calculateBezierLength(cc.v2(startPos.x, startPos.y), cc.v2(endPos.x, endPos.y));
        this.totalTime = dist / this._bulletInfo.getFixSpeed();

        // 确保最小飞行时间，避免过快导致的穿透问题
        this.totalTime = Math.max(this.totalTime, 0.5);
    }

    /**
     * 计算贝塞尔曲线的近似长度
     */
    protected calculateBezierLength(startPos: cc.Vec2, endPos: cc.Vec2): number {
        // 使用分段直线近似计算贝塞尔曲线长度
        const segments = 20; // 分段数，越多越精确但计算量越大
        let totalLength = 0;
        let prevPoint = startPos.clone();

        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const point = this.getBezierPoint(startPos, this.p1Pos, this.p2Pos, endPos, t);
            totalLength += cc.Vec2.distance(prevPoint, point);
            prevPoint = point;
        }

        return totalLength;
    }

    /**
     * 计算贝塞尔曲线上指定t值的点
     */
    protected getBezierPoint(p0: cc.Vec2, p1: cc.Vec2, p2: cc.Vec2, p3: cc.Vec2, t: number): cc.Vec2 {
        const oneMinusT = (1 - t);
        const oneMinusTSquared = oneMinusT * oneMinusT;
        const tSquared = t * t;

        const x = oneMinusTSquared * oneMinusT * p0.x +
            3 * oneMinusTSquared * t * p1.x +
            3 * oneMinusT * tSquared * p2.x +
            t * tSquared * p3.x;
        const y = oneMinusTSquared * oneMinusT * p0.y +
            3 * oneMinusTSquared * t * p1.y +
            3 * oneMinusT * tSquared * p2.y +
            t * tSquared * p3.y;

        return cc.v2(x, y);
    }

    protected tmpPos2: cc.Vec2 = cc.v2();
    public calcPos(dt: number): cc.Vec2 {
        const currPos = this.node.getPosition();
        const delta = cc.Vec2.multiplyScalar(this.tmpPos2, this._bulletInfo.movDir, this._bulletInfo.getFixSpeed() * dt);
        currPos.addSelf(delta);
        return currPos;
    }

    public doUpdate(dt: number): void {

        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }

        if (this._bulletInfo.liveTime >= this._bulletInfo.getBulletLife() && this._bulletInfo.state == GameBulletState.Running) {
            this.onMoveCallBack(this.node);
        }

        // 记录当前帧位置
        const currentPos = cc.v2(this.node.x, this.node.y);

        this.setImgRadio();
        this.resetZIndex();
        this.updateBulletPositionAndAngle(dt);

        // 每帧检测碰撞，提高精度
        this.checkQTCollision();

        // 更新位置记录
        this._lastPosition = currentPos;
        this._bulletInfo.liveTime += dt * 1000;
    }


    protected updateBulletPositionAndAngle(dt: number) {
        if (this.t < 0) return;

        // 记录上一帧位置，用于碰撞检测
        const lastPos = cc.v2(this.node.x, this.node.y);

        let t = Math.min(this.t / this.totalTime, 1);
        let p0 = this.previousPosition;
        let p1 = this.p1Pos;
        let p2 = this.p2Pos;
        let p3 = this.endPos;
        let bulletNode = this.node;

        // 计算贝塞尔曲线上的点，使用更高精度的计算
        const oneMinusT = (1 - t);
        const oneMinusTSquared = oneMinusT * oneMinusT;
        const tSquared = t * t;

        const x = oneMinusTSquared * oneMinusT * p0.x +
            3 * oneMinusTSquared * t * p1.x +
            3 * oneMinusT * tSquared * p2.x +
            t * tSquared * p3.x;
        const y = oneMinusTSquared * oneMinusT * p0.y +
            3 * oneMinusTSquared * t * p1.y +
            3 * oneMinusT * tSquared * p2.y +
            t * tSquared * p3.y;

        // 计算炮弹角度和方向
        if (t > 0) {
            const dx = x - this.node.x;
            const dy = y - this.node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 只有当移动距离足够大时才更新方向，避免精度问题
            if (distance > 0.1) {
                this._bulletInfo.movDir = cc.v2(dx, dy).normalize();
                this.resetRationt(this._bulletInfo.movDir);

                for (const element of this._qtShapes) {
                    element.setRotation(bulletNode.angle);
                }
            }
        }

        // 更新炮弹位置
        bulletNode.setPosition(x, y);

        // 贝塞尔曲线子弹也需要射线检测，防止高速移动时穿透
        const currentPos = cc.v2(x, y);
        const moveDistance = currentPos.sub(lastPos).mag();
        const bulletSpeed = this._bulletInfo.getFixSpeed();
        const expectedDistance = bulletSpeed * dt;

        if (moveDistance < expectedDistance * 0.8 && expectedDistance > 3) {
            this.checkRayCollision(lastPos, currentPos);
        }

        // 更新时间参数
        this.t += dt;

        // 如果炮弹到达终点，停止更新
        if (t >= 1) {
            this.t = -1;
            this.onMoveCallBack(this.node);
        }
    }

    protected onCollisionEnterQT(shape: QTShape): void {
        super.onCollisionEnterQT(shape);
    }

    // /** 开始碰撞 */
    // protected onCollisionEnter(evt: cc.Event.EventCustom): void {
    //     evt.stopPropagation();
    //     let other: cc.Collider = evt.getUserData()['other'];
    //     let self: cc.Collider = evt.getUserData()['self'];
    //     // console.log("onCollisionEnter bulletUI", other.node.name, self.node.name);
    //     if (self.tag == other.tag) {
    //         return; // 同阵营不碰撞
    //     }
    //     if ((self.tag == GameObjectType.Turret && other.tag == GameObjectType.Hero) || (self.tag == GameObjectType.Hero && other.tag == GameObjectType.Turret)) return;
    //     super.onCollisionEnter(evt);
    // }


    protected doOffset(): void {
        this.t = 1; // 碰到子弹，子弹抵消
    }


    /**回调 */
    protected onMoveCallBack(bulletNode: cc.Node): void {
        this._bulletInfo.currHitTimes += 1; // 命中次数
        // this.calcAOE();
        this.showHitEffect();
        this.checkHitSkill(null, 0, false);
        this.hitTimesCheck(null);
        // this.calcAOE(BulletAoeType.Hit);
    }

    // 子弹AOE效果
    // protected calcAOE() {
    //     super.calcAOE();
    // }

    unuse(): void {
        // console.log("BattleBulletUI unuse");
        // delete this._bulletInfo;
        // this._bulletInfo = null;
        super.unuse();
        this.t = 0;

    }


    // update (dt) {}
}
