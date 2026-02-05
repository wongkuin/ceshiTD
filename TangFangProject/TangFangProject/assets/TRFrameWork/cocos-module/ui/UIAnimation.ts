
//移动方向
enum Direction {
    UP = 1,
    Down = 2,
    Left = 3,
    Right = 4,
};


enum AnimationType {
    /**移动 */
    Move
    /**透明度 */
    , Opacity
    /**缩放 */
    , Scale
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class UIAnimation extends cc.Component {

    public static readonly EventType = { Start: "UIAnimation_Start", End: "UIAnimation_End" };
    public static readonly

    @property({ tooltip: "动画时间" })
    protected duration = 0.5;

    @property({ tooltip: "延迟时间" })
    protected delay = 0;

    @property({ tooltip: "进入缓动曲线" })
    protected inEasing = "backOut";

    @property({ tooltip: "出去缓动曲线" })
    protected outEasing = "backIn";

    @property({ type: cc.Node, tooltip: "目标" })
    protected target: cc.Node = null;

    @property({ type: cc.Enum(AnimationType), tooltip: "动画类型" })
    protected type = AnimationType.Move;



    @property({ tooltip: "移动方向", type: cc.Enum(Direction), visible() { return this.type == AnimationType.Move; } })
    protected direction = Direction.Down;



    @property({ tooltip: "目标透明度", visible() { return this.type == AnimationType.Opacity; } })
    protected opacity = 255;

    @property({ tooltip: "初始透明度", visible() { return this.type == AnimationType.Opacity; } })
    protected initOpacity = 0;



    @property({ tooltip: "目标缩放", visible() { return this.type == AnimationType.Scale; } })
    protected scale = 1;

    @property({ tooltip: "初始缩放", visible() { return this.type == AnimationType.Scale; } })
    protected initScale = 0;

    protected onLoad(): void {
        this.popIn();
    }


    protected getTween(isPopIn: boolean): cc.Tween<cc.Node> {

        let props: { x: number, y: number } | { scale: number } | { opacity: number } = null;

        if (this.type == AnimationType.Move) {

            let targetX = 0;
            let targetY = 0;

            if (isPopIn) {

                let widget = this.target.getComponent(cc.Widget);
                if (widget) {
                    widget.updateAlignment();
                    widget.enabled = false;
                }

                targetX = this.target.x;
                targetY = this.target.y;

                if (this.direction == Direction.UP) {
                    this.target.y = cc.winSize.height;
                } else if (this.direction == Direction.Down) {
                    this.target.y = -cc.winSize.height;
                } else if (this.direction == Direction.Left) {
                    this.target.x = -cc.winSize.width;
                } else {
                    this.target.x = cc.winSize.width;
                }


            } else {

                let widget = this.target.getComponent(cc.Widget);
                if (widget) widget.enabled = false;

                targetX = this.target.x;
                targetY = this.target.y;

                if (this.direction == Direction.UP) {
                    targetY = cc.winSize.height;
                } else if (this.direction == Direction.Down) {
                    targetY = -cc.winSize.height;
                } else if (this.direction == Direction.Left) {
                    targetX = -cc.winSize.width;
                } else {
                    targetX = cc.winSize.width;
                }


            }
            props = { x: targetX, y: targetY };

        } else if (this.type == AnimationType.Opacity) {

            this.target.opacity = isPopIn ? this.initOpacity : this.opacity;
            props = { opacity: isPopIn ? this.opacity : this.initOpacity };

        } else {
            this.target.scale = isPopIn ? this.initScale : this.scale;
            props = { scale: isPopIn ? this.scale : this.initScale };
        }

        return cc.tween(this.target).delay(this.delay).to(this.duration, props, { easing: isPopIn ? this.inEasing : this.outEasing });
    }


    public popIn(): Promise<void> {

        return new Promise(resolve => {

            this.node.emit(UIAnimation.EventType.Start, true);

            this.getTween(true).call(() => {

                if (this.type == AnimationType.Move) {
                    const widget = this.target.getComponent(cc.Widget);
                    if (widget) {
                        widget.enabled = true;
                        widget.updateAlignment();
                    }
                }

                this.node.emit(UIAnimation.EventType.End, true);

                resolve();
            }).start();
        });

    }


    public popOut(): Promise<void> {

        return new Promise(resolve => {
            this.node.emit(UIAnimation.EventType.Start, false);
            this.getTween(false).call(() => {
                this.node.emit(UIAnimation.EventType.End, false);
                resolve()
            }).start();
        });

    }

}