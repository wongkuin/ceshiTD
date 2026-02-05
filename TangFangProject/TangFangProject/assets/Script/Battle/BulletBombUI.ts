

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { RAD_TO_DEG } from "../AppDefual";
import { BulletInfo } from "../config/DataInfo";
import { GameBulletState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulletBase from "./BulletBase";

const { ccclass, property } = cc._decorator;

// 爆炸弹
@ccclass
export default class BulletBombUI extends BulletBase {


    // 椭圆高度系数（控制椭圆形状）
    @property
    ellipseHeight: number = 200;

    // 路径计算精度
    pathResolution: number = 30;

    // 动态目标最大更新时间间隔
    targetUpdateInterval: number = 0.1;

    // 返回时间点（0-1表示在路径上的位置）
    returnPoint: number = 1.0;

    protected _currentPosition: number = 0;
    protected _totalPathLength: number = 0;
    protected _pathPoints: cc.Vec3[] = [];
    protected _pathDistances: number[] = [];
    protected _isReturning: boolean = false;
    protected _lastTargetUpdateTime: number = 0;
    protected _endX: number = 0;
    protected _endY: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // onLoad() {
    // }

    public init(bInfo: BulletInfo) {
        super.init(bInfo);

        this._currentPosition = 0;
        this._isReturning = false;
        // 初始化路径
        this.generatePath();
        this._lastTargetUpdateTime = 0; // 初始化目标更新时间
    }

    setMoveDir() {
        this.changeBulletState(GameBulletState.Running);
    }


    // 生成椭圆路径
    generatePath() {


        const startPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.startWPos);
        let endPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.endPos);

        let angle = this._bulletInfo.getRealAngel()

        if (angle != 0) {
            // 转换为弧度
            const radians = angle * Math.PI / 180;

            // 计算相对向量并旋转
            const relativeVec = endPos.sub(startPos);
            const rotatedVec = relativeVec.rotate(radians);

            // 返回绝对坐标
            endPos = startPos.add(cc.v3(rotatedVec.x, rotatedVec.y));
        }

        this._endX = endPos.x;
        this._endY = endPos.y;
        console.log("endPos", this._endX, this._endY);


        this._pathPoints = [];
        this._pathDistances = [];
        const distance = startPos.sub(endPos).mag();

        // 椭圆参数
        const a = distance / 2; // 半长轴
        const b = Math.max(this.ellipseHeight, 10); // 半短轴

        // 椭圆中心
        const center = startPos.add(endPos).mul(0.5);

        // 旋转角度（两点连线的角度）
        const angleRad = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);

        let totalLength = 0;
        let previousPoint = cc.Vec3.ZERO;

        // 生成路径点
        for (let i = 0; i <= this.pathResolution; i++) {
            const t = i / this.pathResolution;

            // 椭圆参数方程（在局部坐标系）
            const x0 = -a * Math.cos(t * Math.PI);
            const y0 = b * Math.sin(t * Math.PI);

            // 旋转和平移
            const x = center.x + x0 * cosAngle - y0 * sinAngle;
            const y = center.y + x0 * sinAngle + y0 * cosAngle;

            const point = cc.v3(x, y);
            this._pathPoints.push(point);

            // 计算距离累计
            if (i > 0) {
                const segmentLength = point.sub(previousPoint).mag();
                totalLength += segmentLength;
                this._pathDistances.push(totalLength);
            }

            previousPoint = point;
        }

        this._totalPathLength = totalLength;

    }

    // 更新路径点
    updatePath(startwPos: cc.Vec3, endwPos: cc.Vec3) {
        // if (!cc.isValid(this._bulletInfo.targetObj) || !this._bulletInfo.targetObj.isLiving()) return;

        const newPathPoints = [];
        const newPathDistances = [];

        // 获取当前位置对应的点
        const currentPoint = this.node.parent.convertToNodeSpaceAR(startwPos);  // this.calculatePosition(this._currentPosition);

        // 计算当前路径的剩余部分
        // let remainingPathPoints = this._pathPoints.slice(
        //     Math.floor(this._pathPoints.length * this._currentPosition)
        // );

        // 计算当前点到新终点的椭圆路径
        const midPoints = this.generatePointsFromTo(
            currentPoint,
            this.node.parent.convertToNodeSpaceAR(endwPos),
            this.ellipseHeight,
            this.pathResolution // 只生成10个点，因为剩余段很短
        );

        // 合并路径
        newPathPoints.push(currentPoint);
        newPathPoints.push(...midPoints);

        // 重新计算距离
        let totalLength = 0;
        let prevPoint = currentPoint;

        for (let i = 0; i < midPoints.length; i++) {
            const point = midPoints[i];
            const segmentLength = point.sub(prevPoint).mag();
            totalLength += segmentLength;
            newPathDistances.push(totalLength);
            prevPoint = point;
        }

        // 更新路径
        this._pathPoints = newPathPoints;
        this._pathDistances = newPathDistances;
        this._totalPathLength = totalLength;
        // this._currentPosition = 0;
        // this.drawDebugPath(); // 调试绘制路径
    }

    // 生成两点间的椭圆路径点
    generatePointsFromTo(start: cc.Vec3, end: cc.Vec3, height: number, numPoints: number): cc.Vec3[] {
        const points = [];
        const distance = start.sub(end).mag();
        const a = distance / 2; // 半长轴
        const b = Math.max(height, 10); // 半短轴

        // 椭圆中心
        const center = start.add(end).mul(0.5);

        // 旋转角度
        const angleRad = Math.atan2(end.y - start.y, end.x - start.x);
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);

        for (let i = 1; i <= numPoints; i++) {
            const t = i / numPoints;

            // 椭圆参数方程（在局部坐标系）
            const x0 = -a * Math.cos(t * Math.PI);
            const y0 = b * Math.sin(t * Math.PI);

            // 旋转和平移
            const x = center.x + x0 * cosAngle - y0 * sinAngle;
            const y = center.y + x0 * sinAngle + y0 * cosAngle;

            points.push(cc.v2(x, y));
        }

        return points;
    }

    // 计算路径上的位置
    calculatePosition(progress: number): cc.Vec3 {
        if (progress >= 1 || this._pathPoints.length < 2) {
            return this._pathPoints[this._pathPoints.length - 1];
        }
        const targetDistance = progress * this._totalPathLength;
        // 找到当前在哪个段
        let segmentStart = 0;
        let segmentEnd = 0;

        for (let i = 0; i < this._pathDistances.length; i++) {
            if (this._pathDistances[i] >= targetDistance) {
                segmentEnd = i;
                segmentStart = i > 0 ? i - 1 : 0;
                break;
            }
        }

        // 线性插值
        const segmentDistance = segmentStart === 0 ?
            this._pathDistances[segmentStart] :
            this._pathDistances[segmentStart] - this._pathDistances[segmentStart - 1];

        const remainingDistance = targetDistance -
            (segmentStart === 0 ? 0 : this._pathDistances[segmentStart - 1]);

        const t = remainingDistance / segmentDistance;

        const p0 = this._pathPoints[segmentStart];
        const p1 = this._pathPoints[segmentStart + 1];

        return p0.add(p1.sub(p0).mul(t));
    }

    // 计算路径上的方向
    calculateDirection(position: number): number {
        if (position >= 0.99 || this._pathPoints.length < 2) {
            return this.node.angle;
        }

        const targetDistance = position * this._totalPathLength;
        // 找到当前在哪个段
        let segmentIndex = 0;

        for (let i = 0; i < this._pathDistances.length; i++) {
            if (this._pathDistances[i] >= targetDistance) {
                segmentIndex = i > 0 ? i : 0;
                break;
            }
        }

        if (segmentIndex >= this._pathPoints.length - 1) {
            segmentIndex = this._pathPoints.length - 2;
        }

        const p0 = this._pathPoints[segmentIndex];
        const p1 = this._pathPoints[segmentIndex + 1];

        const direction = p1.sub(p0);
        return Math.atan2(direction.y, direction.x) * RAD_TO_DEG;
    }

    doUpdate(dt: number) {
        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }

        if (this._totalPathLength <= 0) return;
        // this._lastTargetUpdateTime += dt;
        // // 更新目标点位置（如果目标点移动）
        // // const now = Date.now();
        // if (this._lastTargetUpdateTime > this.targetUpdateInterval && !this._isReturning) {
        //     if (cc.isValid(this._bulletInfo.targetObj) && this._bulletInfo.targetObj.isLiving()) {
        //         this.updatePath(this._bulletInfo.startPos, this._bulletInfo.targetObj.getAckPos());
        //         this._lastTargetUpdateTime = 0;
        //     }
        // }

        // 更新位置
        const velocity = this._bulletInfo.getFixSpeed() * dt;
        this._currentPosition += velocity / this._totalPathLength;

        // 检查返回点
        if (!this._isReturning && this._currentPosition >= this.returnPoint) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            // 返回起点
            this.updatePath(wPos, this._bulletInfo.startWPos);
            this.onPathComplete();
            this._isReturning = true;
            this._currentPosition = 0;
        }

        // 结束检查
        if (this._isReturning && this._currentPosition >= 1) {
            this.onPathComplete();
            return;
        }

        // 设置位置和旋转
        const newPos = this.calculatePosition(this._currentPosition);
        this.node.setPosition(newPos)

        // 设置旋转方向
        const angle = this.calculateDirection(this._currentPosition) - 90;
        this.node.angle = angle;

        for (const element of this._qtShapes) {
            // element.setRotation(angle);
            element.setPosition(this.node.x, this.node.y);
        }

        this.setImgRadio();
        this.resetZIndex();

        // 更新特效位置
        // this._trailEffect.position = this.node.position;
    }



    // 路径完成后处理
    onPathComplete() {
        if (this._isReturning) {
            // 返回完成，销毁子弹
            this.change2End();
        } else {
            // console.log("爆炸特效播放");
            this._bulletInfo.currHitTimes += 1; // 命中次数
            this.showHitEffect();
            this.hitTimesCheck(null);
        }
    }

    unuse(): void {
        super.unuse();
        this._isReturning = false;
        this._currentPosition = 0;
        this._totalPathLength = 0;
        this._pathPoints = [];
        this._pathDistances = [];
        this._lastTargetUpdateTime = 0;
    }

    // 在场景中可视化路径（调试用）
    drawDebugPath() {
        if (this._pathPoints.length < 2) return;

        let graphics = this.node.getComponent(cc.Graphics);
        if (!graphics) {
            const graphicsNode = new cc.Node('PathDebug');
            graphicsNode.setPosition(cc.Vec2.ZERO);
            const graphicsComp = graphicsNode.addComponent(cc.Graphics);
            this.node.parent.addChild(graphicsNode);
            graphics = graphicsComp;
        }

        graphics.clear();
        graphics.strokeColor = cc.Color.RED;
        graphics.lineWidth = 2;

        // 绘制路径
        graphics.moveTo(this._pathPoints[0].x, this._pathPoints[0].y);
        for (let i = 1; i < this._pathPoints.length; i++) {
            graphics.lineTo(this._pathPoints[i].x, this._pathPoints[i].y);
        }
        graphics.stroke();

        // 5秒后清除
        this.scheduleOnce(() => {
            if (graphics) graphics.clear();
        }, 5);
    }
}
