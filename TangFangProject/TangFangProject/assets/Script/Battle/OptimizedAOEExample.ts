// 性能优化集成示例 - 展示如何在战斗场景中使用优化系统
import { GameObjectType } from "../config/GameEnum";
import PerformanceOptimizationManager from "./PerformanceOptimizationManager";
import AOESustained from "./AOESustained";

const { ccclass, property } = cc._decorator;

/**
 * 优化后的AOE系统 - 集成所有性能优化
 */
@ccclass
export default class OptimizedAOEExample extends cc.Component {
    optimizationManager: PerformanceOptimizationManager = null;

    onLoad(): void {
        // 初始化性能优化管理器
        this.optimizationManager = this.node.getComponent(PerformanceOptimizationManager);
        if (!this.optimizationManager) {
            this.optimizationManager = this.node.addComponent(PerformanceOptimizationManager);
        }

        // 应用优化设置
        this.optimizationManager.applyOptimizationSettings();
    }

    /**
     * 创建优化后的雷电术AOE
     */
    public createOptimizedLightningAOE(position: cc.Vec2, radius: number, damage: number, level: number = 1): void {
        // 1. 获取优化后的雷电术特效
        // const lightningType = this.getLightningTypeByLevel(level);
        // const lightningEffect = this.optimizationManager ?
        //     this.optimizationManager.getLightningEffect(lightningType) : null;

        // if (lightningEffect) {
        //     lightningEffect.setPosition(position);

        //     // 2. 创建优化的AOE组件
        //     const aoeNode = new cc.Node("OptimizedAOE");
        //     const aoeComponent = aoeNode.addComponent(OptimizedAOEComponent);

        //     // 设置AOE参数
        //     aoeComponent.init({
        //         position,
        //         radius,
        //         damage,
        //         effectType: lightningType,
        //         optimizationManager: this.optimizationManager
        //     });

        //     this.node.addChild(aoeNode);
        // }
    }

    /**
     * 模拟大量怪物场景进行性能测试
     */
    public simulateMassiveMonsterScene(): void {
        console.log("开始模拟大量怪物场景...");

        // 创建大量怪物
        const monsterCount = 300;
        for (let i = 0; i < monsterCount; i++) {
            this.createTestMonster(i);
        }

        // 更新怪物数量到优化管理器
        if (this.optimizationManager) {
            this.optimizationManager.updateMonsterCount(monsterCount);
        }

        // 创建多个雷电术AOE
        this.scheduleOnce(() => {
            for (let i = 0; i < 10; i++) {
                const pos = cc.v2(
                    (Math.random() - 0.5) * 800,
                    (Math.random() - 0.5) * 600
                );
                this.createOptimizedLightningAOE(pos, 150, 100, (i % 5) + 1);
            }
        }, 1000);

        // 定期输出性能统计
        this.schedule(() => {
            const stats = this.optimizationManager.getPerformanceStats();
            console.log("性能统计:", stats);
        }, 2000);
    }

    /**
     * 创建测试怪物
     */
    private createTestMonster(index: number): void {
        const monster = new cc.Node(`Monster_${index}`);
        monster.setPosition(
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 800
        );

        // 添加到空间分区
        if (this.optimizationManager) {
            this.optimizationManager.addMonsterToSpatialGrid(monster);
        }

        this.node.addChild(monster);
    }

    /**
     * 手动触发性能优化测试
     */
    public runPerformanceTest(): void {
        console.log("开始性能优化测试...");

        // 测试1: 空间分区性能
        this.testSpatialHashingPerformance();

        // 测试2: 批量事件处理性能
        this.testBatchProcessingPerformance();

        // 测试3: 对象池性能
        this.testObjectPoolingPerformance();

        // 测试4: LOD性能
        this.testLODPerformance();
    }

    /**
     * 测试空间分区性能
     */
    private testSpatialHashingPerformance(): void {
        console.log("测试空间分区性能...");

        const startTime = Date.now();
        const testCount = 1000;

        // 测试区域查询性能
        for (let i = 0; i < testCount; i++) {
            const center = cc.v2(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 800
            );
            // 确保optimizationManager存在
            if (this.optimizationManager) {
                this.optimizationManager.getMonstersInArea(center, 200);
            }
        }

        const endTime = Date.now();
        console.log(`空间分区测试完成: ${testCount}次查询耗时 ${endTime - startTime}ms`);
    }

    /**
     * 测试批量事件处理性能
     */
    private testBatchProcessingPerformance(): void {
        console.log("测试批量事件处理性能...");

        const startTime = Date.now();
        const testCount = 500;

        // 测试批量事件处理
        for (let i = 0; i < testCount; i++) {
            const event = {
                pos: cc.v2(Math.random() * 1000, Math.random() * 800),
                hurt: Math.floor(Math.random() * 1000),
                isCritical: Math.random() > 0.8
            };

            this.optimizationManager.addDamageEvent(event);
        }

        // 立即处理所有事件
        this.optimizationManager.flushBatchEvents();

        const endTime = Date.now();
        console.log(`批量事件处理测试完成: ${testCount}次事件耗时 ${endTime - startTime}ms`);
    }

    /**
     * 测试对象池性能
     */
    private testObjectPoolingPerformance(): void {
        console.log("测试对象池性能...");

        const startTime = Date.now();
        const testCount = 100;

        // // 测试对象获取和回收
        // const effects = [];
        // for (let i = 0; i < testCount; i++) {
        //     const effect = this.optimizationManager.getLightningEffect(LightningEffectType.Lightning);
        //     if (effect) {
        //         effects.push(effect);
        //     }
        // }

        // // 回收所有对象
        // for (const effect of effects) {
        //     if (effect) {
        //         this.optimizationManager.recycleLightningEffect(effect);
        //     }
        // }

        const endTime = Date.now();
        console.log(`对象池测试完成: ${testCount}次获取/回收耗时 ${endTime - startTime}ms`);
    }

    /**
     * 测试LOD性能
     */
    private testLODPerformance(): void {
        console.log("测试LOD性能...");

        const startTime = Date.now();

        // 测试不同质量等级的性能
        const qualityLevels = [1, 2, 3, 4, 5];

        for (const level of qualityLevels) {
            this.optimizationManager.setQualityLevel(level);
            this.optimizationManager.updateMonsterCount(300);

            // 模拟一帧的渲染
            this.simulateFrameRender();
        }

        const endTime = Date.now();
        console.log(`LOD测试完成: 耗时 ${endTime - startTime}ms`);
    }

    /**
     * 模拟一帧的渲染
     */
    private simulateFrameRender(): void {
        // 这里可以添加具体的渲染测试逻辑
        // 例如测试粒子数量、动画帧率等
    }

    // /**
    //  * 输出性能优化建议
    //  */
    // public getOptimizationRecommendations(): string[] {
    //     const stats = this.optimizationManager.getPerformanceStats();
    //     const recommendations: string[] = [];

    //     if (stats.systems.spatialGrid) {
    //         const gridStats = stats.systems.spatialGrid;
    //         if (gridStats.occupiedCells > gridStats.totalCells * 0.8) {
    //             recommendations.push("建议增加网格大小以提高空间分区效率");
    //         }
    //     }

    //     if (stats.systems.effectPool) {
    //         const poolStats = stats.systems.effectPool;
    //         const totalActive = Object.values(poolStats).reduce((sum, stat) => sum + stat.active, 0);
    //         const totalPooled = Object.values(poolStats).reduce((sum, stat) => sum + stat.pool, 0);

    //         if (totalActive < totalPooled * 0.3) {
    //             recommendations.push("建议减少预创建的对象数量以节省内存");
    //         }
    //     }

    //     if (stats.systems.qualityManager) {
    //         const qualityStats = stats.systems.qualityManager;
    //         if (qualityStats.qualityLevel < 3) {
    //             recommendations.push("当前质量等级较低，建议升级硬件或减少同时显示的特效数量");
    //         }
    //     }

    //     return recommendations;
    // }
}