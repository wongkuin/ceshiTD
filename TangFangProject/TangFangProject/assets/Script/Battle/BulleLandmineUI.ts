

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import MotionTrail from "../../TRFrameWork/Common/Components/MotionTrail";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { QTBox } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import { BulletInfo } from "../config/DataInfo";
import { GameBulletState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulleCurveUI from "./BulleCurveUI";
import BulletBase from "./BulletBase";
import BulletBombUI from "./BulletBombUI";
import GameControl from "./GameControl";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletLandmineUI extends BulletBase {


    protected t: number = 0; // run time 

    protected totalTime: number = 0; // total time

    protected previousPosition = cc.v2();  // 起点

    protected p1Pos: cc.Vec2 = cc.v2();
    protected p2Pos: cc.Vec2 = cc.v2();

    protected endPos: cc.Vec2 = cc.v2();


    protected setMoveDir(): void {
        super.setMoveDir();
        this.setBezierMove();
    }


    /**
     * 计算从起点指向目标点的方向上，指定距离的位置
     * @param pos1 起始位置 (cc.Vec2 或 cc.Vec3)
     * @param pos2 目标位置 (cc.Vec2 或 cc.Vec3)
     * @param distance 想要的距离
     * @param out 可选，用于存储结果的位置对象
     * @returns 计算出的位置
     */
    calculatePositionTowards(pos1: cc.Vec3, pos2: cc.Vec3, distance: number, out?: cc.Vec3): cc.Vec3 {
        // 检查参数类型，决定使用 cc.Vec2 还是 cc.Vec3 计算

        return this._calculatePositionTowardsVec3(pos1, pos2, distance, out as cc.Vec3);

    }



    // cc.Vec3 版本的实现
    private _calculatePositionTowardsVec3(pos1: cc.Vec3, pos2: cc.Vec3, distance: number, out?: cc.Vec3): cc.Vec3 {
        // 创建方向向量：从 pos1 指向 pos2
        const direction = new cc.Vec3();
        cc.Vec3.subtract(direction, pos2, pos1);

        // 计算两点间的实际距离
        const actualDistance = cc.Vec3.distance(pos1, pos2);

        // 如果实际距离为0（两点重合），或者目标距离大于实际距离，直接返回目标点
        if (actualDistance === 0 || distance >= actualDistance) {
            return out ? cc.Vec3.copy(out, pos2) : pos2.clone();
        }

        // 标准化方向向量（使其长度为1）
        cc.Vec3.normalize(direction, direction);

        // 计算最终位置：起点 + 方向 * 目标距离
        const result = out || new cc.Vec3();
        cc.Vec3.scaleAndAdd(result, pos1, direction, distance);

        return result;
    }

    protected setBezierMove(): void {
        // console.log("setBezierMove")
        let startPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.startWPos);
        let length = this._bulletInfo.data.width;
        //let realEndPos = this.calculatePositionTowards(this._bulletInfo.startWPos, this._bulletInfo.endPos, length);
        // let endPos = this.node.parent.convertToNodeSpaceAR(realEndPos);
        let endPos = this.node.parent.convertToNodeSpaceAR(this._bulletInfo.endPos);

        let dist = Utils.vt2distance(startPos.x, startPos.y, endPos.x, endPos.y);
        this.totalTime = dist / this._bulletInfo.getFixSpeed();
        this.previousPosition = cc.v2(startPos.x, startPos.y);
        let pos1 = this.calcPos(this.totalTime / 3);
        let pos2 = this.calcPos(this.totalTime / 2);
        // this.p1Pos = cc.v2(pos1.x + Random.range(0, 50), pos1.y);

        this.p2Pos = cc.v2(pos2.x + Random.range(0, 100) * (Math.random() > 0.5 ? 1 : -1), startPos.y + (endPos.y - startPos.y) / 2);
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


        this.updateBulletPositionAndAngle(dt);
        super.doUpdate(dt);
        this.node.angle = 0;
        for (const element of this._qtShapes) {
            element.setRotation(0);
        }
    }


    protected updateBulletPositionAndAngle(dt: number) {
        if (this.t < 0) return;
        let t = Math.min(this.t / this.totalTime, 1);
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

            // 更新炮弹角度
            // bulletNode.angle = Utils.vector2ToAngle(cc.v2(dx, dy)) - 90;
            this._bulletInfo.movDir = cc.v2(dx, dy).normalize();
            // if (this._bulletInfo.getBulletDir() == 0) {
            //     this.resetRationt(this._bulletInfo.movDir);
            //     for (const element of this._qtShapes) {
            //         element.setRotation(bulletNode.angle);
            //     }
            // }

        }

        // 更新炮弹位置
        bulletNode.setPosition(x, y);
        // 更新时间参数
        this.t += dt;

        this.node.scale = this.getScaleByTimeParabolic(Math.min(t, 1), 1.6) * this._bulletInfo.getBulletScale(); // 子弹缩放

        // 如果炮弹到达终点，停止更新
        if (t >= 1) {
            this.t = -1;
            // console.log("到达终点")
            this.onMoveCallBack(this.node);
        }
    }

    /**
 * 使用抛物线函数实现缩放动画
 * @param t 时间比例 [0, 1]
 * @param peakScale 峰值缩放比例，默认1.5
 * @returns 计算出的缩放值
 */
    getScaleByTimeParabolic(t: number, peakScale: number = 1.5): number {
        // 抛物线方程：y = -a(x-0.5)² + b
        // 当x=0.5时，y=peakScale；当x=0或1时，y=1
        const a = 4 * (peakScale - 1);  // 计算抛物线系数
        let result = -a * Math.pow(t - 0.5, 2) + peakScale;
        // console.error("缩放比例",t,result,this._bulletInfo.getBulletScale())

        return result;
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
        this.addQTBoxCollider();
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




    public init(bInfo: BulletInfo) {

        this._bulletInfo = bInfo;
        this.node.name = `Bullet_${bInfo.data.id}_${bInfo.sourceTag}_${bInfo.getOffset()}`

        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(this.getStartWPos()));

        // 拖尾
        // let mtRoot = this.node.getChildByName('montion');
        this._motion = this.node.getComponentInChildren(MotionTrail);
        if (this._motion) {
            // this._bulletInfo.hasTrajectory() && 
            this.scheduleOnce(() => {
                this._motion.active = true;
            })
        }
        //  else {
        //     if (mtRoot && this._bulletInfo.hasTrajectory()) {
        //         let self = this;
        //         GameResLoad.loadBulletMotion().then((node: cc.Node) => {
        //             if (cc.isValid(mtRoot)) {
        //                 mtRoot.addChild(node);
        //                 self._motion = node.getComponent(MotionTrail);
        //                 if (self._motion) {
        //                     self.scheduleOnce(() => {
        //                         self._motion.active = true;
        //                     })
        //                 }
        //             } else {
        //                 GameResLoad.putNode(node);
        //             }
        //         });
        //     }
        // }


        this.node.scale = this._bulletInfo.getBulletScale(); // 子弹缩放
        // qtBox.setScale(this._imgNode.scale);
        let sps = this.node.getComponentInChildren(sp.Skeleton);
        sps && sps.setAnimation(0, 'animation', true);

        this.setMoveDir();
        SoundMgr.getInstance().playSound(this._bulletInfo.bulletSP.seLaunch); // 播放音效
    }



    addQTBoxCollider() {
        let collider = this.node.getComponentInChildren(cc.BoxCollider)
        let box = collider
        let qtBox = new QTBox(box.offset.x - box.size.width / 2, box.offset.y - box.size.height / 2, box.size.width, box.size.height, this._bulletInfo.sourceTag);
        qtBox.node = this.node;
        this._qtShapes.push(qtBox);
        GameControl.getInstance().getQuadTree().insert(qtBox);

        qtBox.setScale(this.node.scale);

    }



    protected onCollisionEnterQT(other: QTShape): void {

        if (!this._bulletInfo) {
            console.error("this._bulletInfo is null")
        }

        let ackObj = other.node.getComponent(BattleAckObject);

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
            this._bulletInfo.parm.isAoe = true
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
        }
        super.onCollisionEnterQT(other);
    }




}
