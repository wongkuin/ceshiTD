

import GameHelp from "../Mgr/GameHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CollisionExt extends cc.Component {

    /** 开始碰撞 */
    protected onCollisionEnter(other: cc.Collider, self: cc.Collider): void {
        if (!GameHelp.getInstance().checkCanCollision(self.tag, other.tag)) {
            return;
        }
        let cEvt = new cc.Event.EventCustom("onCollisionEnter", true)
        cEvt.setUserData({ 'other': other, 'self': self });
        this.node.dispatchEvent(cEvt)
        // console.log("onCollisionEnter", other.node.name, self.node.name);
    }

    /** 碰撞中 */
    protected onCollisionStay(other: cc.Collider, self: cc.Collider): void {
        if (!GameHelp.getInstance().checkCanCollision(self.tag, other.tag)) {
            return;
        }
        let cEvt = new cc.Event.EventCustom("onCollisionStay", true)
        cEvt.setUserData({ 'other': other, 'self': self });
        this.node.dispatchEvent(cEvt)
        // console.log("onCollisionStay", other.node.name, self.node.name);
    }

    /** 离开碰撞 */
    protected onCollisionExit(other: cc.Collider, self: cc.Collider): void {
        if (!GameHelp.getInstance().checkCanCollision(self.tag, other.tag)) {
            return;
        }
        let cEvt = new cc.Event.EventCustom("onCollisionExit", true)
        cEvt.setUserData({ 'other': other, 'self': self });
        this.node.dispatchEvent(cEvt)
        // console.log("onCollisionExit", other.node.name, self.node.name);
    }
}
