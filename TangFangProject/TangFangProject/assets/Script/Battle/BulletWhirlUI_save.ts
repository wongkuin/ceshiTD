import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { BulletInfo } from "../config/DataInfo";
import { GameBulletState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulletBombUI from "./BulletBombUI";

const { ccclass, property } = cc._decorator;

// 回旋子弹
@ccclass
export default class BulletWhirlUI extends BulletBombUI {

    protected _lastMonWpos: cc.Vec3 = cc.v3(0, 0, 0);

    public init(bInfo: BulletInfo) {
        super.init(bInfo);
    }

    setMoveDir() {
        super.setMoveDir();
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
            this._bulletInfo.parm.extAckObj = [ackObj];
        }
        super.onCollisionEnterQT(other);
    }

    doUpdate(dt: number) {
        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }

        if (this._totalPathLength <= 0) return;
        this._lastTargetUpdateTime += dt;

        // 更新位置
        const velocity = dt * this._bulletInfo.getFixSpeed();
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

        // 更新特效位置
        // this._trailEffect.position = this.node.position;

        for (const element of this._qtShapes) {
            // element.setRotation(angle);
            element.setPosition(this.node.x, this.node.y);
        }

        this.setImgRadio();
        this.resetZIndex();
        this.checkQTCollision();
    }



    // 路径完成后处理
    onPathComplete() {
        if (this._isReturning) {
            // 返回完成，销毁子弹
            this.change2End();
        } else {
            // 到达目标点但未返回
            // 根据需要扩展其他逻辑
        }
    }

    unuse(): void {
        super.unuse();
    }


}
