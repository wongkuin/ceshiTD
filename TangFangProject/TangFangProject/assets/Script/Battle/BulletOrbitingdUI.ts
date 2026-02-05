
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { BulletInfo } from "../config/DataInfo";
import { GameBulletState, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import BulletBase from "./BulletBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletOrbitingdUI extends BulletBase {


    protected orbitRadius = 100;

    private currentAngle: number = 0; // 当前角度（弧度）
    private initialAngle: number = 0; // 新增：存储初始角度

    public init(bInfo: BulletInfo): void {
        super.init(bInfo);
        this.initialAngle = cc.misc.degreesToRadians(bInfo.fixAngel);
        this.currentAngle = this.initialAngle;
        this.updateMoveDir(0);
    }

    protected setMoveDir(): void {
        // super.setMoveDir();
        this.changeBulletState(GameBulletState.Running);
        this.orbitRadius = this._bulletInfo.data.surroundingRadius;
        // this.currentAngle = this._bulletInfo.fixAngel;
        this.currentAngle = cc.misc.degreesToRadians(this._bulletInfo.fixAngel);

        console.log("BulletOrbitingdUI setMoveDir", this._bulletInfo.fixAngel);
    }


    public doUpdate(dt: number): void {
        this.updateMoveDir(dt);
        super.doUpdate(dt);
    }

    protected updateMoveDir(dt: number): void {
        const speed = this._bulletInfo.getFixSpeed();
        // 更新角度（保持一致的旋转方向）
        this.currentAngle += cc.misc.degreesToRadians(speed) * dt;
        this.updatePosition();
    }

    // 提取位置更新逻辑
    private updatePosition() {
        const target = this._bulletInfo.parm.shootObj;
        if (!cc.isValid(target) || !cc.isValid(target.node) || !cc.isValid(target.node.parent)) {
            this.change2End();
            return;
        }

        // 使用世界坐标计算确保精度
        const targetWorldPos = target.getAckwPos();
        const targetPos = this.node.parent.convertToNodeSpaceAR(targetWorldPos);

        // 计算新位置
        const newPos = cc.v3(
            targetPos.x + Math.cos(this.currentAngle) * this.orbitRadius,
            targetPos.y + Math.sin(this.currentAngle) * this.orbitRadius,
            0
        );

        this.node.setPosition(newPos);
        this.updateRotation();
    }


    // 更新子弹朝向（指向运动方向）
    private updateRotation() {
        // 计算切线方向（垂直于半径方向）
        const tangentDirection = cc.v2(
            -Math.sin(this.currentAngle),
            Math.cos(this.currentAngle)
        );

        // 计算角度（度）
        // const angle = cc.misc.radiansToDegrees(Math.atan2(tangentDirection.y, tangentDirection.x)) - 90;
        // this.node.angle = angle;
        this.resetRationt(tangentDirection);
        this._bulletInfo.movDir = tangentDirection;
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

}
