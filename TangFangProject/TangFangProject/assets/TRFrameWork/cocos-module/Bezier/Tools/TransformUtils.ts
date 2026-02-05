

export default class TransformUtils {
    public static _positionType: string;
    public static get positionType(): string {
        if (this._positionType == null) {
            let node = new cc.Node()
            this._positionType = node.position.constructor.name
            node.destroy()
        }
        return this._positionType
    }

    // 兼容低版本(2.0 以下position类型是Vec2, 2.0以上是Vec3)
    public static TransformPosition(pos: any, type: string = this.positionType): any {
        if (type == cc.Vec2.name) {
            return new cc.Vec2(pos.x, pos.y) as any
        } else if (type == cc.Vec3.name) {
            return new cc.Vec3(pos.x, pos.y, 0) as any
        }
        return new cc.Vec3(0)
    }
}