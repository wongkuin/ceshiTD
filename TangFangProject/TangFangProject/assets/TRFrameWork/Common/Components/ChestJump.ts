

const { ccclass, property } = cc._decorator;

// 宝箱跳动动画
@ccclass
export default class ChestJump extends cc.Component {

    // 动画参数 
    @property({ tooltip: "跳跃高度" })

    JUMP_HEIGHT: number = 40;       // 跳跃高度

    @property({ tooltip: "总时长" })
    JUMP_DURATION: number = 0.8;    // 总时长

    @property({ tooltip: "跳跃压缩比例" })
    SQUASH_X: number = 1.3;          // 起跳横向压缩

    @property({ tooltip: "起跳纵向拉伸" })
    private SQUASH_Y: number = 0.7;
    @property({ tooltip: "落地横向拉伸" })
    private LAND_SQUASH_X: number = 1.2;     // 落地横向拉伸

    @property({ tooltip: "落地纵向拉伸" })
    private LAND_SQUASH_Y: number = 0.6;     // 落地纵向压缩


    private readonly STRETCH_X: number = 0.9;      // 下落横向拉伸
    private readonly STRETCH_Y: number = 1.1;      // 下落纵向压缩

    @property
    originPos: cc.Vec2 = cc.v2(0, 0);
    private originScaleX: number = 1;
    private originScaleY: number = 1;

    onLoad() {
    }

    start() {
        // this.playJumpAnimation();
        // this.originPos = cc.v2(this.node.x, this.node.y);
        console.log('cc', this.node.x, this.node.y);
        this.originScaleX = this.node.scaleX;
        this.originScaleY = this.node.scaleY;
    }

    /**
     * 分拆控制 scaleX/Y 的跳跃动画
     */
    public playJumpAnimation() {
        this.stop();

        let ld1 = this.JUMP_DURATION * 0.1 / 1.4
        let ld3 = this.JUMP_DURATION * 0.3 / 1.4
        let ld22 = this.JUMP_DURATION * 0.22 / 1.4

        // 1. 起跳挤压阶段
        cc.tween(this.node)
            .to(ld1, {
                scaleX: this.SQUASH_X,
                scaleY: this.SQUASH_Y
            }, { easing: "backIn" })
            // 2. 起跳上升 + 恢复形状
            .parallel(
                cc.tween().to(ld3, { y: this.originPos.y + this.JUMP_HEIGHT }, { easing: "sineOut" }),
                cc.tween().to(ld3, {
                    scaleX: this.originScaleX,
                    scaleY: this.originScaleY
                }, { easing: "quadOut" })
            )
            // 3. 下落阶段 + 拉伸形变
            .parallel(
                cc.tween().to(ld3, { y: this.originPos.y }, { easing: "sineIn" }),
                cc.tween().to(ld1, {
                    scaleX: this.STRETCH_X,
                    scaleY: this.STRETCH_Y
                }, { easing: "sineInOut" })
            )
            // 4. 触地挤压 + 弹性恢复
            .to(ld1, {
                scaleX: this.LAND_SQUASH_X,
                scaleY: this.LAND_SQUASH_Y
            })
            .to(ld22, {
                scaleX: this.originScaleX,
                scaleY: this.originScaleY
            }, { easing: "elasticOut" })
            .delay(0.4)
            .call(() => this.playJumpAnimation())
            .start();
    }

    /**
     * 停止动画
     */
    public stop() {
        cc.Tween.stopAllByTarget(this.node);
        // 强制恢复到初始状态
        this.node.setPosition(this.originPos);
        this.node.scaleX = this.originScaleX;
        this.node.scaleY = this.originScaleY;
    }

    protected onDisable(): void {
        this.stop(); // 确保组件销毁时停止动画
    }
}
