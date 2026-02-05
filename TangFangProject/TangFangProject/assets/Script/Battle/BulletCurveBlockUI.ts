

import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { BulletAoeType, GameBulletState, GameObjectType } from "../config/GameEnum";
import BulleCurveUI from "./BulleCurveUI";
import BulletBase from "./BulletBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletCurveBlockUI extends BulletBase {
    protected t: number = 0; // run time 

    protected totalTime: number = 0; // total time

    protected previousPosition = cc.v2();  // 起点

    protected p1Pos: cc.Vec2 = cc.v2();
    protected p2Pos: cc.Vec2 = cc.v2();

    protected endPos: cc.Vec2 = cc.v2();

    start() {

    }

    protected setMoveDir(): void {
        super.setMoveDir();
        this.setBezierMove();
    }

    protected setBezierMove(): void {
        // console.log("setBezierMove")
        let startPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.startWPos);
        let endPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.endPos);

        let dist = Utils.vt2distance(startPos.x, startPos.y, endPos.x, endPos.y);
        this.totalTime = dist / this._bulletInfo.getFixSpeed();
        this.previousPosition = cc.v2(startPos.x, startPos.y);
        let pos1 = this.calcPos(this.totalTime / 3);
        let pos2 = this.calcPos(this.totalTime / 2);
        // this.p1Pos = cc.v2(pos1.x + Random.range(0, 50), pos1.y);

        this.p2Pos = cc.v2(pos2.x + Random.range(180, 300) * (Math.random() > 0.5 ? 1 : -1), startPos.y + (endPos.y - startPos.y) / 2);
        this.p1Pos = this.p2Pos;
        this.endPos = cc.v2(endPos.x, endPos.y);
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
        //super.doUpdate(dt);
        this.setImgRadio();
        this.resetZIndex();
        // if (this._motion && this._motion.active) {
        //     this._motion.doUpdate();
        // }
        this.updateBulletPositionAndAngle(dt);
        this.checkQTCollision();

        this._bulletInfo.liveTime += dt * 1000; // 子弹存活时间
    }


    protected updateBulletPositionAndAngle(dt: number) {
        if (this.t < 0) return;
        let t = this.t / this.totalTime;
        let p0 = this.previousPosition;
        let p1 = this.p1Pos;
        let p2 = this.p2Pos;
        let p3 = this.endPos;
        let bulletNode = this.node;
        // 计算贝塞尔曲线上的点
        const x = (1 - t) ** 3 * p0.x + 3 * (1 - t) ** 2 * t * p1.x + 3 * (1 - t) * t ** 2 * p2.x + t ** 3 * p3.x;
        const y = (1 - t) ** 3 * p0.y + 3 * (1 - t) ** 2 * t * p1.y + 3 * (1 - t) * t ** 2 * p2.y + t ** 3 * p3.y;

        // 计算炮弹角度
        if (t > 0) {
            const dx = x - this.node.x;
            const dy = y - this.node.y;
            this._bulletInfo.movDir = cc.v2(dx, dy).normalize();
            // 更新炮弹角度
            this.resetRationt(this._bulletInfo.movDir); //Utils.vector2ToAngle(cc.v2(dx, dy)) - 90;
            for (const element of this._qtShapes) {
                element.setRotation(bulletNode.angle);
            }

        }

        // 更新炮弹位置
        bulletNode.setPosition(x, y);
        // 更新时间参数
        this.t += dt;
        // 如果炮弹到达终点，停止更新
        if (t >= 1) {
            this.t = -1;
            // console.log("到达终点")
            this.onMoveCallBack(this.node);
        }
    }

    protected onCollisionEnterQT(shape: QTShape): void {
        // super.onCollisionEnterQT(shape);
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
        this.checkHitSkill(this._bulletInfo.targetObj, 0, false);
        this.hitTimesCheck(null);

        console.log("onMoveCallBack", this._bulletInfo.targetObj.node.name);
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
