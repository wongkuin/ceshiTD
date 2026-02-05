const { ccclass, property } = cc._decorator;

/**
 * 伤害事件数据结构
 */
export interface DamageEvent {
    pos: cc.Vec2;
    hurt: number;
    isCritical: boolean;
    color?: string;
    block?: number;
    sourceType?: number;
}

/**
 * 批量事件处理器 - 将多个事件合并处理，减少性能开销
 */
@ccclass
export default class BatchEventProcessor extends cc.Component {
    @property
    batchDelay: number = 0.016; // 批量处理延迟（秒）

    private pendingDamageEvents: DamageEvent[] = [];
    private batchTimer: number = 0;
    private isProcessing: boolean = false;
    private damageNumberPool: cc.Node[] = []; // 伤害数字对象池

    onLoad(): void {
        // 预创建一些伤害数字对象
        this.preCreateDamageNumbers();
    }

    /**
     * 添加伤害事件到批量处理队列
     */
    addDamageEvent(event: DamageEvent): void {
        this.pendingDamageEvents.push(event);

        if (this.batchTimer <= 0 && !this.isProcessing) {
            this.scheduleOnce(() => {
                this.processBatch();
            }, this.batchDelay);
            this.batchTimer = this.batchDelay;
        }
    }

    /**
     * 立即处理所有待处理事件（用于特殊情况）
     */
    flushEvents(): void {
        if (this.pendingDamageEvents.length > 0) {
            this.processBatch();
        }
    }

    /**
     * 批量处理事件
     */
    private processBatch(): void {
        if (this.pendingDamageEvents.length === 0) return;

        this.isProcessing = true;

        // 按位置分组事件，优化渲染
        const eventsByPosition = this.groupEventsByPosition();

        // 处理每个位置组的事件
        eventsByPosition.forEach((events, posKey) => {
            this.processPositionGroup(events, posKey);
        });

        // 清空待处理事件
        this.pendingDamageEvents = [];
        this.isProcessing = false;
        this.batchTimer = 0;
    }

    /**
     * 按位置分组事件（相近位置的事件合并处理）
     */
    private groupEventsByPosition(): Map<string, DamageEvent[]> {
        const groupedEvents = new Map<string, DamageEvent[]>();
        const groupDistance = 50; // 分组距离阈值

        for (const event of this.pendingDamageEvents) {
            let addedToGroup = false;

            // 尝试添加到现有组
            groupedEvents.forEach((groupEvents, posKey) => {
                const [x, y] = posKey.split(',').map(Number);
                const distance = cc.Vec2.distance(cc.v2(x, y), event.pos);

                if (distance <= groupDistance) {
                    groupEvents.push(event);
                    addedToGroup = true;
                }
            })

            // 如果没有合适的组，创建新组
            if (!addedToGroup) {
                const posKey = `${Math.floor(event.pos.x)},${Math.floor(event.pos.y)}`;
                if (!groupedEvents.has(posKey)) {
                    groupedEvents.set(posKey, []);
                }
                groupedEvents.get(posKey).push(event);
            }
        }

        return groupedEvents;
    }

    /**
     * 处理同一位置组的事件
     */
    private processPositionGroup(events: DamageEvent[], posKey: string): void {
        if (events.length === 0) return;

        // 计算总伤害
        let totalHurt = 0;
        let hasCritical = false;
        let criticalCount = 0;

        for (const event of events) {
            totalHurt += event.hurt;
            if (event.isCritical) {
                hasCritical = true;
                criticalCount++;
            }
        }

        // 创建伤害数字
        const damageNumber = this.getDamageNumber();
        const pos = cc.v2(parseFloat(posKey.split(',')[0]), parseFloat(posKey.split(',')[1]));

        // 设置伤害数字内容和样式
        this.setupDamageNumber(damageNumber, totalHurt, hasCritical, events[0].color);

        // 添加到场景
        this.node.addChild(damageNumber);
        damageNumber.setPosition(pos);

        // 播放合并后的音效（只播放一次）
        if (events.length > 0) {
            this.playDamageSound(events[0]);
        }

        // 设置回收动画
        this.setupRecycleAnimation(damageNumber);
    }

    /**
     * 获取伤害数字对象（从对象池）
     */
    private getDamageNumber(): cc.Node {
        if (this.damageNumberPool.length > 0) {
            const damageNumber = this.damageNumberPool.pop();
            damageNumber.active = true;
            return damageNumber;
        }

        // 池为空时创建新对象
        return this.createDamageNumber();
    }

    /**
     * 创建新的伤害数字对象
     */
    private createDamageNumber(): cc.Node {
        const damageNumber = new cc.Node();
        const label = damageNumber.addComponent(cc.Label);
        label.string = "0";
        label.fontSize = 24;
        label.fontFamily = "Arial";
        label.lineHeight = 30;

        // 添加阴影效果
        const shadow = damageNumber.addComponent(cc.Label);
        shadow.string = "0";
        shadow.fontSize = 24;
        shadow.fontFamily = "Arial";
        shadow.node.color = cc.Color.BLACK;
        shadow.node.setPosition(1, -1);

        return damageNumber;
    }

    /**
     * 设置伤害数字内容和样式
     */
    private setupDamageNumber(damageNumber: cc.Node, hurt: number, isCritical: boolean, color?: string): void {
        const label = damageNumber.getComponent(cc.Label);
        const shadow = damageNumber.children[0].getComponent(cc.Label);

        label.string = Math.floor(hurt).toString();
        shadow.string = Math.floor(hurt).toString();

        // 设置颜色
        if (color) {
            label.node.color = new cc.Color().fromHEX(color);
        } else {
            label.node.color = isCritical ? cc.Color.YELLOW : cc.Color.RED;
        }

        // 设置暴击效果
        if (isCritical) {
            label.node.scale = 1.5;
            shadow.node.scale = 1.5;

            // 添加暴击特效
            this.addCriticalEffect(damageNumber);
        } else {
            label.node.scale = 1;
            shadow.node.scale = 1;
        }
    }

    /**
     * 添加暴击特效
     */
    private addCriticalEffect(damageNumber: cc.Node): void {
        const effect = new cc.Node();
        effect.scale = 0.5;

        const sprite = effect.addComponent(cc.Sprite);
        sprite.spriteFrame = null; // 这里需要加载暴击特效资源

        damageNumber.addChild(effect);
        effect.setPosition(0, 20);

        // 播放动画
        cc.tween(effect)
            .to(0.3, { scale: 1.2 })
            .to(0.2, { scale: 0.8 })
            .call(() => {
                effect.removeFromParent();
            })
            .start();
    }

    /**
     * 播放伤害音效
     */
    private playDamageSound(event: DamageEvent): void {
        // 这里可以根据事件类型播放不同音效
        // SoundMgr.getInstance().playSound("hit_sound");
    }

    /**
     * 设置回收动画
     */
    private setupRecycleAnimation(damageNumber: cc.Node): void {
        cc.tween(damageNumber)
            .by(0.5, { y: 50 })
            .by(0.3, { opacity: 0 })
            .call(() => {
                this.recycleDamageNumber(damageNumber);
            })
            .start();
    }

    /**
     * 回收伤害数字对象
     */
    private recycleDamageNumber(damageNumber: cc.Node): void {
        if (!cc.isValid(damageNumber)) return;

        damageNumber.removeFromParent();
        damageNumber.active = false;
        damageNumber.opacity = 255;
        damageNumber.scale = 1;
        damageNumber.y = 0;

        // 清除暴击特效
        while (damageNumber.children.length > 1) {
            const child = damageNumber.children[1];
            child.removeFromParent();
        }

        // 添加回对象池
        if (this.damageNumberPool.length < 50) { // 限制池大小
            this.damageNumberPool.push(damageNumber);
        } else {
            damageNumber.destroy();
        }
    }

    /**
     * 预创建伤害数字对象
     */
    private preCreateDamageNumbers(): void {
        for (let i = 0; i < 10; i++) {
            const damageNumber = this.createDamageNumber();
            damageNumber.active = false;
            this.damageNumberPool.push(damageNumber);
        }
    }

    /**
     * 清理对象池
     */
    clearPool(): void {
        for (const damageNumber of this.damageNumberPool) {
            damageNumber.destroy();
        }
        this.damageNumberPool = [];
    }

    onDestroy(): void {
        this.clearPool();
        this.pendingDamageEvents = [];
    }
}