// 性能优化管理器 - 统一管理所有性能优化系统
import { GameObjectType } from "../config/GameEnum";
import SpatialHashGrid from "./SpatialHashGrid";
import BatchEventProcessor from "./BatchEventProcessor";
import LightningEffectPool from "./LightningEffectPool";
import AdaptiveQualityManager, { QualityLevel } from "./AdaptiveQualityManager";
import GameControl from "./GameControl";

const { ccclass, property } = cc._decorator;

/**
 * 性能优化管理器 - 统一管理空间分区、批量事件、对象池、LOD等优化
 */
@ccclass
export default class PerformanceOptimizationManager extends cc.Component {
    @property
    enableSpatialHashing: boolean = true; // 启用空间分区

    @property
    enableBatchProcessing: boolean = true; // 启用批量处理

    @property
    enableObjectPooling: boolean = true; // 启用对象池

    @property
    enableLOD: boolean = true; // 启用LOD

    @property
    gridSize: number = 100; // 网格大小

    @property
    maxTargetsPerAOE: number = 20; // 每个AOE最大目标数

    private spatialGrid: SpatialHashGrid = null;
    private batchProcessor: BatchEventProcessor = null;
    private effectPool: LightningEffectPool = null;
    private qualityManager: AdaptiveQualityManager = null;

    private initialized: boolean = false;

    onLoad(): void {
        this.initializeSystems();
    }

    /**
     * 初始化所有优化系统
     */
    private initializeSystems(): void {
        if (this.initialized) return;

        console.log("初始化性能优化系统...");

        // 初始化空间分区系统
        if (this.enableSpatialHashing) {
            this.spatialGrid = this.node.getComponent(SpatialHashGrid);
            if (!this.spatialGrid) {
                this.spatialGrid = this.node.addComponent(SpatialHashGrid);
                this.spatialGrid.node.setPosition(0, 0);
                this.spatialGrid.cellSize = this.gridSize;
            }
        }

        // 初始化批量事件处理器
        if (this.enableBatchProcessing) {
            this.batchProcessor = this.node.getComponent(BatchEventProcessor);
            if (!this.batchProcessor) {
                this.batchProcessor = this.node.addComponent(BatchEventProcessor);
            }
        }

        // 初始化对象池
        if (this.enableObjectPooling) {
            this.effectPool = this.node.getComponent(LightningEffectPool);
            if (!this.effectPool) {
                this.effectPool = this.node.addComponent(LightningEffectPool);
            }
        }

        // 初始化LOD管理器
        if (this.enableLOD) {
            this.qualityManager = this.node.getComponent(AdaptiveQualityManager);
            if (!this.qualityManager) {
                this.qualityManager = this.node.addComponent(AdaptiveQualityManager);
            }
        }

        this.initialized = true;
        console.log("性能优化系统初始化完成");
    }

    /**
     * 添加怪物到空间分区
     */
    public addMonsterToSpatialGrid(monster: any): void {
        if (this.spatialGrid && monster && monster.node) {
            this.spatialGrid.addMonster(monster);
        }
    }

    /**
     * 从空间分区移除怪物
     */
    public removeMonsterFromSpatialGrid(monster: any): void {
        if (this.spatialGrid && monster && monster.node) {
            this.spatialGrid.removeObject(monster);
        }
    }

    /**
     * 更新怪物在空间分区中的位置
     */
    public updateMonsterInSpatialGrid(monster: any, oldPosition: cc.Vec3): void {
        if (this.spatialGrid && monster && monster.node) {
            this.spatialGrid.updateObjectPosition(monster, oldPosition);
        }
    }

    /**
     * 获取指定区域内的怪物
     */
    public getMonstersInArea(center: cc.Vec2, radius: number): any[] {
        if (this.spatialGrid) {
            return this.spatialGrid.getMonstersInArea(center, radius);
        }
        return [];
    }

    /**
     * 添加伤害事件到批量处理器
     */
    public addDamageEvent(event: any): void {
        if (this.batchProcessor) {
            this.batchProcessor.addDamageEvent(event);
        }
    }

    /**
     * 立即处理所有批量事件
     */
    public flushBatchEvents(): void {
        if (this.batchProcessor) {
            this.batchProcessor.flushEvents();
        }
    }

    /**
     * 获取雷电术特效
     */
    public getLightningEffect(type: number): any {
        if (this.effectPool) {
            return this.effectPool.getLightningEffect(type);
        }
        return null;
    }

    /**
     * 回收雷电术特效
     */
    public recycleLightningEffect(effect: any): void {
        if (this.effectPool) {
            this.effectPool.recycleLightningEffect(effect);
        }
    }

    /**
     * 更新怪物数量并调整LOD
     */
    public updateMonsterCount(count: number): void {
        if (this.qualityManager) {
            this.qualityManager.updateMonsterCount(count);
        }
    }

    /**
     * 获取当前质量等级
     */
    public getCurrentQualityLevel(): QualityLevel {
        if (this.qualityManager) {
            return this.qualityManager.getCurrentQualityLevel();
        }
        return QualityLevel.VeryHigh;
    }

    /**
     * 手动设置质量等级
     */
    public setQualityLevel(level: QualityLevel): void {
        if (this.qualityManager) {
            this.qualityManager.setQualityLevel(level);
        }
    }

    /**
     * 启用/禁用LOD
     */
    public setLODEnabled(enabled: boolean): void {
        if (this.qualityManager) {
            this.qualityManager.setLODEnabled(enabled);
        }
    }

    /**
     * 获取性能统计信息
     */
    public getPerformanceStats(): any {
        const stats: any = {
            enabled: {
                spatialHashing: this.enableSpatialHashing,
                batchProcessing: this.enableBatchProcessing,
                objectPooling: this.enableObjectPooling,
                lod: this.enableLOD
            },
            systems: {
                spatialGrid: null,
                batchProcessor: null,
                effectPool: null,
                qualityManager: null
            },
            stats: {}
        };

        // 收集各系统的统计信息
        if (this.spatialGrid) {
            stats.systems.spatialGrid = this.spatialGrid.getGridStats();
        }

        if (this.batchProcessor) {
            // 这里可以添加批量处理器的统计信息
            stats.systems.batchProcessor = {
                pendingEvents: 0 // 需要在BatchEventProcessor中实现
            };
        }

        if (this.effectPool) {
            stats.systems.effectPool = this.effectPool.getPoolStats();
        }

        if (this.qualityManager) {
            stats.systems.qualityManager = this.qualityManager.getPerformanceStats();
        }

        return stats;
    }

    /**
     * 应用优化设置
     */
    public applyOptimizationSettings(): void {
        if (!this.initialized) {
            this.initializeSystems();
        }

        // 根据当前怪物数量调整优化策略
        const currentMonsterCount = this.getCurrentMonsterCount();
        this.adjustOptimizationStrategy(currentMonsterCount);
    }

    /**
     * 根据怪物数量调整优化策略
     */
    private adjustOptimizationStrategy(monsterCount: number): void {
        console.log(`当前怪物数量: ${monsterCount}，调整优化策略`);

        // 低数量时启用所有优化
        if (monsterCount < 100) {
            this.setAllOptimizationsEnabled(true);
        }
        // 中等数量时禁用部分高消耗优化
        else if (monsterCount < 200) {
            this.setAllOptimizationsEnabled(true);
            // 可以考虑降低某些优化的强度
            if (this.qualityManager) {
                this.qualityManager.setQualityLevel(QualityLevel.High);
            }
        }
        // 高数量时采用激进优化
        else if (monsterCount < 300) {
            this.setAllOptimizationsEnabled(true);
            if (this.qualityManager) {
                this.qualityManager.setQualityLevel(QualityLevel.Medium);
            }
        }
        // 极高数量时采用最激进优化
        else {
            this.setAllOptimizationsEnabled(true);
            if (this.qualityManager) {
                this.qualityManager.setQualityLevel(QualityLevel.Low);
            }
        }
    }

    /**
     * 设置所有优化系统的启用状态
     */
    private setAllOptimizationsEnabled(enabled: boolean): void {
        this.enableSpatialHashing = enabled;
        this.enableBatchProcessing = enabled;
        this.enableObjectPooling = enabled;
        this.enableLOD = enabled;

        console.log(`优化系统状态更新: 空间分区=${enabled}, 批量处理=${enabled}, 对象池=${enabled}, LOD=${enabled}`);
    }

    /**
     * 重置所有优化系统
     */
    public resetAllOptimizations(): void {
        if (this.spatialGrid) {
            this.spatialGrid.clear();
        }

        if (this.batchProcessor) {
            // 这里需要添加重置方法到BatchEventProcessor
        }

        if (this.effectPool) {
            this.effectPool.clearAllPools();
        }

        if (this.qualityManager) {
            this.qualityManager.setQualityLevel(QualityLevel.VeryHigh);
        }

        console.log("所有优化系统已重置");
    }

    /**
     * 获取当前怪物数量
     */
    private getCurrentMonsterCount(): number {
        try {
            let battle = GameControl.getInstance().sceneBattle; //SceneMgr.getCurrScene() as UISceneBattle;
            if (battle && battle.getPassControl) {
                const monsters = battle.getPassControl().getAllLiveMonster();
                return monsters ? monsters.length : 0;
            }
        } catch (error) {
            console.error("获取怪物数量失败:", error);
            return 0;
        }

        return 0;
    }

    onDestroy(): void {
        this.resetAllOptimizations();
        this.initialized = false;
    }
}