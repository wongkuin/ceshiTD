// 监听 stick 与格子的碰撞，并回调 owner
const { ccclass, property } = cc._decorator;

@ccclass
export default class StickColliderListener extends cc.Component {
    // 设置为 any 避免循环引用
    public owner: any = null;

    onLoad() {
        // nothing
    }

    onEnable() {
        // ensure collision manager enabled
        try {
            const cm = cc.director.getCollisionManager();
            if (cm && !cm.enabled) cm.enabled = true;
        } catch (e) { }
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        try {
            const n = other.node;
            // 尝试查找 SectorBlockItem 组件（使用字符串名以避免循环导入）
            const block = n.getComponent && (n.getComponent('SectorBlockItem') || n.parent && n.parent.getComponent && n.parent.getComponent('SectorBlockItem'));
            if (block) {
                if (this.owner && this.owner.onStickCollisionEnter) {
                    this.owner.onStickCollisionEnter(block, other, self);
                }
            }
        } catch (e) { }
    }

    onCollisionExit(other: cc.Collider, self: cc.Collider) {
        try {
            const n = other.node;
            const block = n.getComponent && (n.getComponent('SectorBlockItem') || n.parent && n.parent.getComponent && n.parent.getComponent('SectorBlockItem'));
            if (block) {
                if (this.owner && this.owner.onStickCollisionExit) {
                    this.owner.onStickCollisionExit(block, other, self);
                }
            }
        } catch (e) { }
    }
}
