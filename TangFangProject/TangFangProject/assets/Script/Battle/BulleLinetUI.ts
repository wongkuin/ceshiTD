
import GlobalEventMgr from '../../TRFrameWork/cocos-module/mgr/GlobalEventMgr';
import { GlobalEventID } from '../../TRFrameWork/cocos-module/utils/GlobalEvent';
import { QTShape } from '../../TRFrameWork/QuadTree/quadtree/QTShape';
import { BulletInfo } from '../config/DataInfo';
import {
    BulletAoeType,
    GameBulletState,
    GameObjectType,
} from '../config/GameEnum';
import BattleAckObject from './BattleAckObjet';
import BulletBase from './BulletBase';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulleLinetUI extends BulletBase {
    private _data: Date = null;
    //碰撞得时间记录
    protected _collisionTimeCord: Map<string, number> = new Map();
    public init(bInfo: BulletInfo): void {
        super.init(bInfo);
        this._data = new Date();
    }

    public doUpdate(dt: number): void {
        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }
        this.doMove(dt);
        super.doUpdate(dt);
    }

    protected doMove(dt: number): void {
        let moveDir = this._bulletInfo.getRealMovDir();
        const delta = moveDir.mul(this._bulletInfo.getFixSpeed() * dt); //   cc.v2(moveDir.x, moveDir.y).multiplyScalar(this.bulletInfo.moveSpeed * dt);
        this.node.x += delta.x;
        this.node.y += delta.y;
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

            //大于100数据清空一次
            if (this._collisionTimeCord.size > 100) {
                this._collisionTimeCord.clear();
            }
            let bulletID = this._bulletInfo.data.id;
            let ackID = ackObj.getShootInfo().getID();
            let hitTimes = this._data.getTime();
            if (this._collisionTimeCord.has(`${bulletID}_${ackID}`)) {
                let lastHitTime = this._collisionTimeCord.get(`${bulletID}_${ackID}`);
                if (lastHitTime && (hitTimes - lastHitTime) < 1000) {
                    //子弹类型为0得情况 一秒之内同一个目标只能被同一个子弹攻击一次
                    return;
                }
            } else
                this._collisionTimeCord.set(`${bulletID}_${ackID}`, hitTimes);

            this._bulletInfo.currHitTimes += 1;
            this.showHitEffect();

            let fixHurt = this._bulletInfo.getFixHurt();
            let hObj = ackObj.doHurt(fixHurt);
            let hurt = hObj.hurt;
            // if (!this.hitTimesCheck(ackObj, hObj.isCritical)) return;
            this.hitTimesCheck(ackObj, hObj.isCritical);
            // console.warn("onCollisionEnterQT", this.node.uuid, ackObj.uuid, this.currentFrameCollisions, this.lastFrameCollisions);
            this.checkHitSkill(ackObj, hurt, hObj.isCritical);
            if (this._bulletInfo.sourceTag == GameObjectType.Monster_Bullet) {
                let hPos = ackObj.getAckwPos();
                hPos.addSelf(cc.v3(10 - Math.random() * 20, 10 - Math.random() * 20, 0));
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: hPos, hurt: hurt, color: "#FF0000", isCritical: hObj.isCritical, block: hObj.block });
            } else {
                GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: ackObj.getAckwPos(), hurt: hurt, isCritical: hObj.isCritical });
            }
            // this.calcAOE(BulletAoeType.Hit);
        }
        super.onCollisionEnterQT(other);
    }



}
