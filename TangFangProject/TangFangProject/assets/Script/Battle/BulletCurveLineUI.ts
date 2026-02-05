

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { BulletInfo } from "../config/DataInfo";
import { GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulleCurveUI from "./BulleCurveUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletCurveLineUI extends BulleCurveUI {

    protected _isRecived: boolean = false;

    public init(bInfo: BulletInfo): void {
        super.init(bInfo);
    }

    protected setMoveDir(): void {
        super.setMoveDir();
    }

    public doUpdate(dt: number): void {
        super.doUpdate(dt);
    }

    protected updateBulletPositionAndAngle(dt: number): void {
        if (!this._isRecived) {
            super.updateBulletPositionAndAngle(dt);
        } else {
            this.doMvove(dt);
        }
    }

    protected doMvove(dt: number): void {
        // super.doMove();
        let moveDir = this._bulletInfo.getRealMovDir();
        const delta = moveDir.mul(this._bulletInfo.getFixSpeed() * dt); //   cc.v2(moveDir.x, moveDir.y).multiplyScalar(this.bulletInfo.moveSpeed * dt);
        this.node.x += delta.x;
        this.node.y += delta.y;
    }

    protected onMoveCallBack(bulletNode: cc.Node): void {
        this._isRecived = true;
        if (this._bulletInfo.liveTime >= this._bulletInfo.getBulletLife()) {
            this.change2End();
        }
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

    unuse(): void {
        super.unuse();
        this._isRecived = false;
    }

}
