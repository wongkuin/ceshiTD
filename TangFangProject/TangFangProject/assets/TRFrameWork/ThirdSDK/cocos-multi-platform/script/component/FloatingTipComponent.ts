// 飘字提示组件

const {ccclass, property} = cc._decorator;

@ccclass
export default class FloatingTipComponent extends cc.Component {

    @property
    defaultLayerOrder: number = 2;

    private labelTip: cc.Label;
    private srcY: number;

    onLoad () {
        this.init();
    }

    public init()
    {
        this.labelTip = this.node.getComponentInChildren(cc.Label);
        this.srcY = 0;
        this.node.zIndex = this.defaultLayerOrder;
    }

    public show(tip: string)
    {
        if (!this.labelTip)
        {
            this.init();
        }
        this.labelTip.string = tip;

        this.node.opacity = 0;
        this.node.y = this.srcY;
        this.node.stopAllActions();
        this.node.active = true;
        cc.tween(this.node)
            .show()
            .to(0.2, {opacity: 255})
            .delay(2)
            .to(0.5, {opacity: 0, y: this.srcY + 100})
            .hide()
            .start();
    }

}
