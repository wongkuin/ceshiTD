
import { BulletInfo } from "../config/DataInfo";
import { GameBulletState } from "../config/GameEnum";
import BulletBase from "./BulletBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletThrowUI extends BulletBase {

    gravity: number = 500; // 重力加速度

    minScale: number = 0.8; // 最低点缩放比例

    maxScale: number = 2.4; // 最高点缩放比例

    private velocity: cc.Vec2 = cc.v2(0, 0);
    private startPos: cc.Vec3 = cc.v3(0, 0);
    private targetPos: cc.Vec3 = cc.v3(0, 0);
    private currentHeight: number = 0;
    private totalDistance: number = 0;
    // private travelProgress: number = 0;
    private maxHeight: number = 0;

    /**
     * 初始化子弹
     */
    public init(bInfo: BulletInfo) {
        super.init(bInfo);
    }

    protected setMoveDir(): void {

        // super.setMoveDir();

        this.startPos = this.node.convertToNodeSpaceAR(this._bulletInfo.startWPos);
        this.targetPos = this.node.convertToNodeSpaceAR(this._bulletInfo.endPos);

        // 计算总距离
        this.totalDistance = this.startPos.sub(this.targetPos).mag();

        let dir = this.targetPos.sub(this.startPos).normalize();
        this._bulletInfo.movDir = cc.v2(dir.x, dir.y);

        // 计算初始速度（抛物线轨迹）
        this.calculateInitialVelocity();

        this.currentHeight = 0;
        // this.travelProgress = 0;

        // 初始缩放
        this.node.scale = this.minScale;
        this.delQTShape();

        this.changeBulletState(GameBulletState.Running);

        this.resetRationt(this._bulletInfo.movDir);

    }

    /**
     * 计算初始速度（实现抛物线轨迹）
     */
    private calculateInitialVelocity() {
        const dx = this.targetPos.x - this.startPos.x;
        const dy = this.targetPos.y - this.startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 计算需要的飞行时间（基于速度和距离）
        const flightTime = distance / this._bulletInfo.getFixSpeed();

        // 计算需要的垂直初速度（考虑重力）
        const requiredVy = (dy + 0.5 * this.gravity * flightTime * flightTime) / flightTime;

        // 计算水平速度
        const vx = dx / flightTime;

        // 设置初始速度
        this.velocity = cc.v2(vx, requiredVy);

        // 计算最大高度（用于缩放）
        this.maxHeight = this.startPos.y + (requiredVy * requiredVy) / (2 * this.gravity);
    }

    doUpdate(dt: number) {
        // 应用重力
        this.velocity.y -= this.gravity * dt;

        // 更新位置
        const newPos = this.node.position.add(cc.v3(this.velocity).mul(dt));
        this.node.setPosition(newPos);

        // 计算当前高度（相对于起始点）
        this.currentHeight = newPos.y - this.startPos.y;

        // 根据高度调整缩放
        this.updateScaleByHeight();

        if (this.startPos.sub(newPos).mag() >= this.totalDistance) {
            this.onReachTarget();
        }
        // 检查是否到达目标
        // this.checkReachTarget(newPos);
    }

    /**
     * 根据高度更新子弹缩放
     */
    private updateScaleByHeight() {
        // 计算高度比例 (0-1)
        let heightRatio = this.currentHeight / (this.maxHeight - this.startPos.y);

        // 限制在0-1范围内
        heightRatio = cc.misc.clamp01(heightRatio);

        // 使用二次函数使缩放变化更明显
        heightRatio = Math.pow(heightRatio, 0.5);

        // 计算当前缩放
        const scale = this.minScale + (this.maxScale - this.minScale) * heightRatio;
        this.node.scale = scale;

        // // 根据高度调整透明度（可选）
        // const opacity = 150 + 105 * heightRatio;
        // this.node.opacity = opacity;
    }


    /**
     * 在到达目标时调用
     */
    private onReachTarget() {
        this.change2End();
    }
}
