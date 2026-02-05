

const { ccclass, property } = cc._decorator;

@ccclass
export default class SwitchBtn extends cc.Button {

    @property(cc.Node)
    onNode: cc.Node = null;

    @property(cc.Node)
    offNode: cc.Node = null;

    @property(cc.Node)
    btnNode: cc.Node = null;

    @property
    onLen: number = 40;

    protected _isOn: boolean = false;
    protected _callback: Function = null;
    protected _animTime: number = 0.12;

    start() {
        this.btnNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on('click', this.onBtnClick, this);
    }

    public init(isOn: boolean, callback?: Function) {
        this._isOn = isOn;
        // this.switchAnim();
        this._callback = callback;

        this.btnNode.x = this._isOn ? this.onLen : -this.onLen;
        this.onNode.opacity = this._isOn ? 255 : 0;
        this.offNode.opacity = this._isOn ? 0 : 255;
    }

    // 当触摸结束时调用
    protected onTouchEnd(e?: cc.Event.EventTouch) {
        // console.log("onTouchEnd", e);
        if (e) {
            e.stopPropagation();
        }
        this._isOn = !this._isOn;
        this.switchAnim();
        if (this._callback) {
            this._callback(this._isOn);
        }
    }

    protected onBtnClick() {
        this.onTouchEnd();
    }

    protected switchAnim() {
        cc.Tween.stopAllByTarget(this.btnNode);
        cc.Tween.stopAllByTarget(this.onNode);
        cc.Tween.stopAllByTarget(this.offNode);
        cc.tween(this.btnNode).to(this._animTime, { x: this._isOn ? this.onLen : -this.onLen }).start();
        cc.tween(this.onNode).to(this._animTime, { opacity: this._isOn ? 255 : 0 }).start();
        cc.tween(this.offNode).to(this._animTime, { opacity: this._isOn ? 0 : 255 }).start();
    }

    // update (dt) {}
}
