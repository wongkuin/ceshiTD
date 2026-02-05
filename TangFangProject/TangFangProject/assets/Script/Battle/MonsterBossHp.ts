import MonsterHp from "./MonsterHp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterBossHp extends MonsterHp {

    // 血条显示相关属性
    @property(cc.Sprite)
    healthBarSprite: cc.Sprite = null;

    @property(cc.Sprite)
    tempSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    healthBarFrames: cc.SpriteFrame[] = [];

    // 血条数量显示
    @property(cc.Label)
    remainingBarsLabel: cc.Label = null;

    // 动画参数
    @property(cc.Float)
    transitionDuration: number = 0.1; // 过渡动画持续时间

    @property(cc.Float)
    fillAnimationDuration: number = 0.1; // 填充动画持续时间

    fastAnimationDuration: number = 0.05; // 快速动画时间

    // 私有变量
    private curHp: number = 0;
    private totalBars: number = 0;  // 总血条数量
    private remainingBars: number = 0; // 剩余血条数量
    private currentBarIndex: number = 0; // 当前血条索引


    public setHpProgress(hp: number) {
        // console.log("progress", progress);
        this.curHp = hp;
        if (this._endLess) {
            this.updateHealthBarEndLess();
        } else {
            this.updateHealthBar();
        }
        if (hp <= 0) {
            this.onDefeated();
        }
    }

    public reuse() {
        this.remainingBarsLabel.node.scale = 1.0;
    }

    protected initHealthBar() {
        this.curHp = this.maxHealth;
        this.totalBars = Math.ceil(this.maxHealth / this.healthPerBar);
        this.currentBarIndex = 0;
        if (this._endLess) {
            this.updateHealthBarEndLess();
        } else {
            this.updateHealthBar();
        }
    }

    private updateHealthBarEndLess() {

        //TODO
        // const oldBarIndex = this.currentBarIndex; // 保存旧的血条索引
        // const newBarIndex = Math.ceil((this.curHp) / this.healthPerBar);
        // // 计算当前血条的填充比例
        // let curRatio = (this.curHp % this.healthPerBar) / this.healthPerBar; // 计算当前血条的填充比例
        // this.playStandardBarTransition(oldBarIndex, newBarIndex, curRatio, true);

        // 计算当前血条索引（基于当前血量）
        const newBarIndex = Math.ceil(this.curHp / this.healthPerBar);
        const oldBarIndex = this.currentBarIndex;

        // 计算当前血条的填充比例
        const curRatio = (this.curHp % this.healthPerBar) / this.healthPerBar;
        const isFullBar = curRatio === 0 && this.curHp > 0;
        const displayRatio = isFullBar ? 1 : curRatio;

        // 停止所有动画
        cc.Tween.stopAllByTarget(this.healthBarSprite);
        cc.Tween.stopAllByTarget(this.tempSprite);

        // 判断是否需要切换血条图片
        if (newBarIndex !== oldBarIndex) {
            // 播放血条切换动画
            this.playEndlessBarTransition(oldBarIndex, newBarIndex, displayRatio);
        } else {
            // 仅更新填充比例
            cc.tween(this.healthBarSprite)
                .to(this.fillAnimationDuration, { fillRange: displayRatio })
                .start();
        }

        this.currentBarIndex = newBarIndex;
    }


    /**
 * 播放无尽模式的血条切换动画
 */
    private playEndlessBarTransition(oldIndex: number, newIndex: number, fillRatio: number) {
        // 保存旧的血条图片
        const oldFrame = this.healthBarSprite.spriteFrame;

        // 设置新血条图片（循环使用血条图片数组）
        const frameIndex = (newIndex) % this.healthBarFrames.length;
        this.healthBarSprite.spriteFrame = this.healthBarFrames[frameIndex];

        const tempIdx = (newIndex + 1) % this.healthBarFrames.length;
        this.tempSprite.spriteFrame = this.healthBarFrames[tempIdx];
        this.tempSprite.fillRange = 1;

        // 创建临时节点用于过渡动画
        const tempNode = new cc.Node();
        const tempSprite = tempNode.addComponent(cc.Sprite);
        tempSprite.spriteFrame = oldFrame;
        tempSprite.type = cc.Sprite.Type.FILLED;
        tempSprite.fillType = cc.Sprite.FillType.HORIZONTAL;
        tempSprite.fillRange = 1;

        tempNode.parent = this.healthBarSprite.node.parent;
        tempNode.setPosition(this.healthBarSprite.node.position);
        tempNode.zIndex = this.healthBarSprite.node.zIndex - 1;

        // 动画序列
        cc.tween(tempNode)
            .to(this.transitionDuration, { opacity: 0 })
            .removeSelf()
            .start();

        // 主血条填充动画
        this.healthBarSprite.fillRange = 0;
        cc.tween(this.healthBarSprite)
            .to(this.fillAnimationDuration, { fillRange: fillRatio })
            .start();

        // // 每10条血条播放一次特效
        // if (newIndex % 10 === 0) {
        //     this.playMilestoneEffect(newIndex);
        // }
    }

    private updateHealthBar() {
        // 计算新的血条索引
        const newBarIndex = Math.ceil((this.curHp) / this.healthPerBar);
        const oldBarIndex = this.currentBarIndex; // 保存旧的血条索引

        let hasNext = newBarIndex > 1; // 判断是否还有下一个血条

        let perBar = this.healthPerBar;

        let isFirst = newBarIndex === this.totalBars;
        if (isFirst) {
            perBar = this.maxHealth % this.healthPerBar;
            if (perBar === 0) perBar = this.healthPerBar;
        }

        // 计算当前血条的填充比例
        let curRatio = (this.curHp % this.healthPerBar) / perBar; // 计算当前血条的填充比例
        if (isFirst && this.curHp === this.maxHealth) {
            curRatio = 1; // 满血状态
        }
        // 停止所有正在进行的动画
        cc.Tween.stopAllByTarget(this.healthBarSprite);
        cc.Tween.stopAllByTarget(this.tempSprite);

        // 判断是否跨越多条血条
        const barDiff = oldBarIndex - newBarIndex;
        const isMultiBarChange = Math.abs(barDiff) > 1;

        // if (isMultiBarChange) {
        //     // 多条血条切换的特殊动画
        //     this.playMultiBarTransition(oldBarIndex, newBarIndex, curRatio, hasNext);
        //     // 更新剩余血条数量显示
        //     this.updateRemainingBarsDisplay();
        // } else {
        // 单条血条切换的标准动画
        this.playStandardBarTransition(oldBarIndex, newBarIndex, curRatio, hasNext);
        // 更新剩余血条数量显示
        this.updateRemainingBarsDisplay();
        // }

        this.currentBarIndex = newBarIndex;

        // this.healthBarSprite.spriteFrame = this.healthBarFrames[newBarIndex - 1];

        // if (hasNext) {
        //     this.tempSprite.spriteFrame = this.healthBarFrames[newBarIndex - 2];
        //     this.tempSprite.fillRange = 1;
        // } else {
        //     this.tempSprite.fillRange = 0;
        // }
        // cc.Tween.stopAllByTarget(this.healthBarSprite);
        // cc.tween(this.healthBarSprite)
        //     .to(0.1, { fillRange: curRatio })
        //     .start();
    }



    /**
     * 播放标准血条切换动画
     */
    private playStandardBarTransition(oldBarIndex: number, newBarIndex: number, curRatio: number, hasNext: boolean) {


        // // 设置临时血条（下一个血条）
        // if (hasNext) {
        //     // 设置主血条图片
        //     // this.healthBarSprite.spriteFrame = this.healthBarFrames[(newBarIndex - 1) % this.healthBarFrames.length];
        //     // this.tempSprite.spriteFrame = this.healthBarFrames[(newBarIndex - 2) % this.healthBarFrames.length];
        //     this.tempSprite.fillRange = 1;
        //     this.tempSprite.node.opacity = 255;
        // } else {
        //     this.tempSprite.fillRange = 0;
        //     this.tempSprite.node.opacity = 0;
        // }

        if (oldBarIndex === newBarIndex) {
            // 如果当前血条索引没有变化，直接播放填充动画
            this.healthBarSprite.node.opacity = 255;
            this.healthBarSprite.fillRange = curRatio;
        } else {
            // 如果当前血条索引有变化，播放切换动画
            this.healthBarSprite.node.opacity = 0;
            this.healthBarSprite.fillRange = 0;
            cc.tween(this.healthBarSprite)
                .to(this.fastAnimationDuration, { fillRange: 0 })
                .set({ fillRange: 1, spriteFrame: this.healthBarFrames[(newBarIndex - 1) % this.healthBarFrames.length] })
                .call(() => {
                    if (hasNext) {
                        this.tempSprite.spriteFrame = this.healthBarFrames[(newBarIndex - 2) % this.healthBarFrames.length];
                        this.tempSprite.node.opacity = 255;
                        this.tempSprite.fillRange = 1;
                    } else {
                        this.tempSprite.node.opacity = 0;
                    }
                })
                .to(this.transitionDuration, { fillRange: curRatio })
                .start();
        }

        // 主血条填充动画
        cc.tween(this.healthBarSprite)
            .to(this.fastAnimationDuration * 3, { fillRange: curRatio })
            .start();

        // 如果是从满血开始减少，播放初始闪烁效果
        // if (curRatio === 1 && this.curHp < this.maxHealth) {
        //     this.playInitialHitEffect();
        // }
    }

    /**
     * 播放多条血条切换的动画
     */
    private playMultiBarTransition(oldIndex: number, newIndex: number, finalRatio: number, hasNext: boolean) {
        const barDiff = oldIndex - newIndex;
        const isHealing = barDiff < 0; // 是否是治疗恢复

        this.healthBarSprite.node.opacity = 0;
        this.healthBarSprite.fillRange = 1.0;

        let newSp = new cc.Node().addComponent(cc.Sprite);
        newSp.node.parent = this.tempSprite.node;

        let animationSequence = cc.tween(newSp);
        let tempBarSprite = newSp;
        let tempBarNode = newSp.node;

        for (let i = oldIndex; i > newIndex; i--) {
            const barIndex = i;
            animationSequence = animationSequence
                // 设置血条图片
                .call(() => {
                    this.tempSprite.spriteFrame = this.healthBarFrames[(barIndex - 2) % this.healthBarFrames.length];
                    tempBarSprite.spriteFrame = this.healthBarFrames[(barIndex - 1) % this.healthBarFrames.length];
                    tempBarSprite.fillRange = 1;
                    tempBarNode.opacity = 255;
                    // 设置 血条数量
                    this.animateBarCountChange(barIndex + 1, barIndex);
                })
                // 清空当前血条
                .to(0.1, { fillRange: 0 })
                // 短暂停留
                .delay(0.05);

        }

        // 动画完成后的处理
        animationSequence
            .call(() => {
                // 设置最终血条状态
                this.healthBarSprite.spriteFrame = this.healthBarFrames[(newIndex - 1) % this.healthBarFrames.length];
                this.healthBarSprite.fillRange = finalRatio;
                this.healthBarSprite.node.opacity = 255;
                // set nextbar
                this.playStandardBarTransition(oldIndex, newIndex, 1.0, hasNext);
                tempBarNode.destroy();

            })
            .start();
    }


    /**
     * 播放初始受击效果
     */
    private playInitialHitEffect() {
        // 血条闪烁
        cc.tween(this.healthBarSprite.node)
            .to(0.05, { color: cc.Color.RED })
            .to(0.05, { color: cc.Color.WHITE })
            .repeat(2)
            .start();

        // 轻微震动
        // cc.tween(this.node)
        //     .by(0.05, { position: cc.v3(5, 0, 0) })
        //     .by(0.05, { position: cc.v3(-5, 0, 0) })
        //     .repeat(2)
        //     .start();
    }


    /**
     * 更新剩余血条数量显示
     */
    private updateRemainingBarsDisplay() {
        const newRemainingBars = Math.ceil(this.curHp / this.healthPerBar);
        // 播放数量变化动画
        if (this.remainingBars !== newRemainingBars) {
            this.animateBarCountChange(this.remainingBars, newRemainingBars);
            this.remainingBars = newRemainingBars;
        }
    }


    /**
     * 血条数量变化动画
     * @param oldValue 旧值
     * @param newValue 新值
     * @returns 
     */
    private animateBarCountChange(oldValue: number, newValue: number) {
        if (!this.remainingBarsLabel) return;
        if (this._endLess) {
            this.remainingBarsLabel.node.active = false;
            return;
        }

        let value = newValue; // 初始值为新值
        this.remainingBarsLabel.string = `X${value}`;
        // 停止之前的动画
        cc.Tween.stopAllByTarget(this.remainingBarsLabel.node);
        // 缩放动画
        cc.tween(this.remainingBarsLabel.node)
            .set({ scale: 2.0 })
            .to(0.1, { scale: 1.0 })
            .start();
    }


    private onDefeated() {
        // this.node.emit('boss-defeated');
        // 停止所有动画
        cc.Tween.stopAllByTarget(this.remainingBarsLabel.node);
        cc.Tween.stopAllByTarget(this.healthBarSprite.node);

        // // 播放击败动画
        // cc.tween(this.healthBarSprite.node)
        //     .to(0.5, { opacity: 0, scale: 1.5 })
        //     .start();

        // // 隐藏血条数量显示
        // if (this.remainingBarsLabel) {
        //     this.remainingBarsLabel.node.active = false;
        // }

        // if (this.totalBarsLabel) {
        //     this.totalBarsLabel.node.active = false;
        // }
    }


}
