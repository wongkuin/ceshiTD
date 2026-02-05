// 雷电术特效对象池 - 优化大量特效时的性能
import { GameObjectType } from "../config/GameEnum";
import GameResLoad from "./GameResLoad";
import { GameBundle } from "../config/GameEnum";

const { ccclass, property } = cc._decorator;

/**
 * 雷电术特效类型
 */
export enum LightningEffectType {
    Lightning = 2910,  // 雷电术
    Lightning2 = 2920, // 雷电术2重
    Lightning3 = 2930, // 雷电术3重
    Lightning4 = 2940, // 雷电术4重
    Lightning5 = 2950, // 雷电术5重
}

/**
 * 雷电术特效数据
 */
export interface LightningEffectData {
    type: LightningEffectType;
    node: cc.Node;
    inUse: boolean;
    lastUsedTime: number;
}

/**
 * 雷电术特效对象池管理器
 */
@ccclass
export default class LightningEffectPool extends cc.Component {
    @property
    maxPoolSize: number = 30; // 最大池大小

    @property
    recycleTime: number = 1000; // 回收时间（毫秒）

    private effectPools: Map<LightningEffectType, LightningEffectData[]> = new Map();
    private activeEffects: LightningEffectData[] = [];
    private bundleName: string = GameBundle.Bundle_bullet;

    onLoad(): void {
        this.initPools();
    }

    /**
     * 初始化对象池
     */
    private initPools(): void {
        // 为每种雷电术类型创建对象池
        Object.values(LightningEffectType).forEach(type => {
            this.effectPools.set(Number(type), []);
        });
        // 预创建一些特效对象
        this.preCreateEffects();
    }

    /**
     * 预创建特效对象
     */
    private async preCreateEffects(): Promise<void> {
        for (const type of Object.values(LightningEffectType)) {
            const preCreateCount = 5; // 每种类型预创建5个
            for (let i = 0; i < preCreateCount; i++) {
                await this.createEffectToPool(Number(type));
            }
        }
    }

    /**
     * 创建特效对象并添加到池中
     */
    private async createEffectToPool(type: LightningEffectType): Promise<void> {
        try {
            const prefabPath = `hit_${type}`;
            const effectNode = await GameResLoad.loadAOEPrefab(prefabPath);

            if (effectNode) {
                effectNode.active = false;
                effectNode.setPosition(9999, 9999); // 移到屏幕外

                const effectData: LightningEffectData = {
                    type,
                    node: effectNode,
                    inUse: false,
                    lastUsedTime: 0
                };

                const pool = this.effectPools.get(type);
                if (pool.length < this.maxPoolSize) {
                    pool.push(effectData);
                } else {
                    // 池满时销毁对象
                    effectNode.destroy();
                }
            }
        } catch (error) {
            console.error(`创建雷电术特效失败: ${type}`, error);
        }
    }

    /**
     * 获取雷电术特效
     */
    public getLightningEffect(type: LightningEffectType): cc.Node | null {
        const pool = this.effectPools.get(type);
        if (!pool || pool.length === 0) {
            // 池为空时动态创建
            this.createEffectToPool(type);
            return null;
        }

        // 从池中获取可用对象
        for (let i = pool.length - 1; i >= 0; i--) {
            const effectData = pool[i];
            if (!effectData.inUse) {
                effectData.inUse = true;
                effectData.lastUsedTime = Date.now();
                effectData.node.active = true;
                this.activeEffects.push(effectData);
                return effectData.node;
            }
        }

        return null;
    }

    /**
     * 回收雷电术特效
     */
    public recycleLightningEffect(node: cc.Node): void {
        if (!cc.isValid(node)) return;

        // 查找对应的特效数据
        let effectData: LightningEffectData = null;
        for (const data of this.activeEffects) {
            if (data.node === node) {
                effectData = data;
                break;
            }
        }

        if (!effectData) return;

        // 从活跃列表中移除
        const index = this.activeEffects.indexOf(effectData);
        if (index >= 0) {
            this.activeEffects.splice(index, 1);
        }

        // 重置状态并添加回池
        effectData.inUse = false;
        node.active = false;
        node.setPosition(9999, 9999); // 移到屏幕外

        // 停止所有动画和粒子
        this.stopEffectAnimations(node);

        // 添加回池
        const pool = this.effectPools.get(effectData.type);
        if (pool && pool.length < this.maxPoolSize) {
            pool.push(effectData);
        } else {
            // 池满时销毁对象
            node.destroy();
        }
    }

    /**
     * 停止特效动画
     */
    private stopEffectAnimations(node: cc.Node): void {
        // 停止动画
        const animation = node.getComponent(cc.Animation);
        if (animation) {
            animation.stop();
        }

        // 停止粒子系统
        const particles = node.getComponentsInChildren(cc.ParticleSystem);
        for (const particle of particles) {
            particle.stopSystem();
        }

        // 停止Spine动画
        const spine = node.getComponentInChildren(sp.Skeleton);
        if (spine) {
            spine.clearTracks();
        }
    }

    /**
     * 自动回收长时间未使用的特效
     */
    private autoRecycleEffects(): void {
        const currentTime = Date.now();

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effectData = this.activeEffects[i];
            if (currentTime - effectData.lastUsedTime > this.recycleTime) {
                this.recycleLightningEffect(effectData.node);
            }
        }
    }

    /**
     * 获取池统计信息
     */
    public getPoolStats(): { [key: string]: { total: number, active: number, pool: number } } {
        const stats: { [key: string]: { total: number, active: number, pool: number } } = {};

        this.effectPools.forEach((pool, type) => {
            const activeCount = this.activeEffects.filter(e => e.type === type).length;
            stats[`Lightning${type}`] = {
                total: pool.length + activeCount,
                active: activeCount,
                pool: pool.length
            };
        })

        return stats;
    }

    /**
     * 清空所有对象池
     */
    public clearAllPools(): void {
        // 回收所有活跃特效
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            this.recycleLightningEffect(this.activeEffects[i].node);
        }

        // 清空所有池
        this.effectPools.clear();
        this.initPools();
    }

    /**
     * 更新（每帧调用）
     */
    update(dt: number): void {
        // 自动回收长时间未使用的特效
        this.autoRecycleEffects();
    }

    onDestroy(): void {
        // 清理所有资源
        for (const effectData of this.activeEffects) {
            if (cc.isValid(effectData.node)) {
                effectData.node.destroy();
            }
        }

        this.effectPools.forEach((pool) => {
            for (const effectData of pool) {
                if (cc.isValid(effectData.node)) {
                    effectData.node.destroy();
                }
            }
        })
        this.activeEffects = [];
        this.effectPools.clear();
    }
}