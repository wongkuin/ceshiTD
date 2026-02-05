


const { ccclass, property, requireComponent, menu } = cc._decorator;

export enum LoopingBgType {
    None = 0,
    MoveFromTopToBottom = 1,
    MoveFromTopLeftToBottomRight = 2,
    MoveFromTopRightToBottomLeft = 3,
}

@ccclass
@requireComponent(cc.Sprite)
@menu('Tiny/LoopingSprite')
export default class LoopingSprite extends cc.Component {

    @property(cc.Material)
    loopMaterial: cc.Material = null;  // UVOffsetAngle

    private _sprite: cc.Sprite = null;
    onLoad() {
        this._sprite = this.node.getComponent(cc.Sprite);
        this._sprite.setMaterial(0, this.loopMaterial);
    }

    start() {

    }


    public async changeBg(res: cc.SpriteFrame, type: LoopingBgType, _speed: number = 0.04, repeat: number = 2.0) {
        if (!res) return;
        if (!cc.isValid(this.node)) {
            return;
        }
        this._sprite.spriteFrame = res;
        let sp = this._sprite;
        let _material = sp.getMaterial(0);
        switch (type) {
            case LoopingBgType.None://不移动
                _material.setProperty("uOffset", new cc.Vec4(0, 0, repeat, 0.0));
                break;
            case LoopingBgType.MoveFromTopToBottom://从上到下角度，速度，重复度
                _material.setProperty("uOffset", new cc.Vec4(0, -_speed, repeat, 0.0));
                break;

            case LoopingBgType.MoveFromTopLeftToBottomRight://从左上到右下
                _material.setProperty("uOffset", new cc.Vec4(135, _speed, repeat, 0.0));
                break;
            case LoopingBgType.MoveFromTopRightToBottomLeft://从右上到左下
                _material.setProperty("uOffset", new cc.Vec4(225, _speed, repeat, 0.0));
                break;
        }


    }
}
