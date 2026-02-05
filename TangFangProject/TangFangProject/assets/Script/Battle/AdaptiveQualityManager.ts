// LOD（细节层次）优化系统 - 根据怪物数量动态调整渲染质量
import { GameObjectType } from "../config/GameEnum";

const { ccclass, property } = cc._decorator;

/**
 * 质量等级枚举
 */
export enum QualityLevel {
    VeryLow = 1,    // 最低质量
    Low = 2,        // 低质量
    Medium = 3,      // 中等质量
    High = 4,        // 高质量
    VeryHigh = 5     // 最高质量
}

/**
 * 渲染配置
 */
export interface RenderConfig {
    particleCount: number;       // 粒子数量
    animationFPS: number;       // 动画帧率
    renderDistance: number;     // 渲染距离
    effectQuality: number;      // 特效质量
    updateFrequency: number;    // 更新频率
}

/**
 * LOD管理器 - 根据怪物数量动态调整渲染质量
 */
@ccclass
export default class AdaptiveQualityManager extends cc.Component {
    @property
    monsterThresholds: number[] = [50, 100, 200, 300]; // 怪物数量阈值

    @property
    enableLOD: boolean = true; // 是否启用LOD

    private currentMonsterCount: number = 0;
    private currentQualityLevel: QualityLevel = QualityLevel.VeryHigh;
    private lastUpdateTime: number = 0;
    private updateInterval: number = 500; // 更新间隔（毫秒）

    // 质量配置映射
    private qualityConfigs: Map<QualityLevel, RenderConfig> = new Map([
        [QualityLevel.VeryLow, {
            particleCount: 5,
            animationFPS: 15,
            renderDistance: 300,
            effectQuality: 0.2,
            updateFrequency: 0.5
        }],
        [QualityLevel.Low, {
            particleCount: 8,
            animationFPS: 20,
            renderDistance: 400,
            effectQuality: 0.4,
            updateFrequency: 0.7
        }],
        [QualityLevel.Medium, {
            particleCount: 12,
            animationFPS: 30,
            renderDistance: 500,
            effectQuality: 0.6,
            updateFrequency: 1.0
        }],
        [QualityLevel.High, {
            particleCount: 18,
            animationFPS: 45,
            renderDistance: 700,
            effectQuality: 0.8,
            updateFrequency: 1.0
        }],
        [QualityLevel.VeryHigh, {
            particleCount: 25,
            animationFPS: 60,
            renderDistance: 1000,
            effectQuality: 1.0,
            updateFrequency: 1.0
        }]
    ]);

    onLoad(): void {
        this.updateQuality();
    }

    /**
     * 更新怪物数量并调整质量
     */
    public updateMonsterCount(count: number): void {
        if (!this.enableLOD) return;

        if (Math.abs(count - this.currentMonsterCount) < 10) return;

        this.currentMonsterCount = count;
        this.updateQuality();
    }

    /**
     * 更新质量等级
     */
    private updateQuality(): void {
        const newQualityLevel = this.calculateQualityLevel(this.currentMonsterCount);

        if (newQualityLevel !== this.currentQualityLevel) {
            this.currentQualityLevel = newQualityLevel;
            this.applyQualitySettings();
            console.log(`LOD质量调整: ${this.getQualityLevelName(newQualityLevel)} (怪物数量: ${this.currentMonsterCount})`);
        }
    }

    /**
     * 计算质量等级
     */
    private calculateQualityLevel(monsterCount: number): QualityLevel {
        for (let i = 0; i < this.monsterThresholds.length; i++) {
            if (monsterCount < this.monsterThresholds[i]) {
                return QualityLevel.VeryHigh - i;
            }
        }
        return QualityLevel.VeryLow;
    }

    /**
     * 应用质量设置
     */
    private applyQualitySettings(): void {
        const config = this.qualityConfigs.get(this.currentQualityLevel);
        if (!config) return;

        // 应用到所有相关组件
        this.applyToParticleSystems(config);
        this.applyToAnimations(config);
        this.applyToEffects(config);
        this.applyToUpdateFrequency(config);
    }

    /**
     * 应用到粒子系统
     */
    private applyToParticleSystems(config: RenderConfig): void {
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        for (const particle of particleSystems) {
            particle.totalParticles = config.particleCount;
            particle.emissionRate = config.particleCount * 10; // 调整发射率
        }
    }

    /**
     * 应用到动画系统
     */
    private applyToAnimations(config: RenderConfig): void {
        const animations = this.node.getComponentsInChildren(cc.Animation);
        for (const anim of animations) {
            // 调整动画播放速度
            const clips = anim.getClips();
            for (const clip of clips) {
                clip.speed = config.animationFPS / 60; // 相对于60FPS的速度
            }
        }
    }

    /**
     * 应用到特效系统
     */
    private applyToEffects(config: RenderConfig): void {
        // 调整特效透明度
        const effectNodes = this.node.children;
        for (const node of effectNodes) {
            node.opacity = 255 * config.effectQuality;
        }
    }

    /**
     * 应用到更新频率
     */
    private applyToUpdateFrequency(config: RenderConfig): void {
        // 这里可以调整组件的更新频率
        // 例如降低某些组件的update调用频率
    }

    /**
     * 获取当前质量等级
     */
    public getCurrentQualityLevel(): QualityLevel {
        return this.currentQualityLevel;
    }

    /**
     * 获取当前渲染配置
     */
    public getCurrentRenderConfig(): RenderConfig {
        return this.qualityConfigs.get(this.currentQualityLevel) || this.qualityConfigs.get(QualityLevel.Medium);
    }

    /**
     * 获取质量等级名称
     */
    private getQualityLevelName(level: QualityLevel): string {
        switch (level) {
            case QualityLevel.VeryLow: return "极低";
            case QualityLevel.Low: return "低";
            case QualityLevel.Medium: return "中";
            case QualityLevel.High: return "高";
            case QualityLevel.VeryHigh: return "极高";
            default: return "未知";
        }
    }

    /**
     * 手动设置质量等级
     */
    public setQualityLevel(level: QualityLevel): void {
        this.currentQualityLevel = level;
        this.applyQualitySettings();
    }

    /**
     * 启用/禁用LOD
     */
    public setLODEnabled(enabled: boolean): void {
        this.enableLOD = enabled;
        if (enabled) {
            this.updateQuality();
        } else {
            // 恢复到最高质量
            this.currentQualityLevel = QualityLevel.VeryHigh;
            this.applyQualitySettings();
        }
    }

    /**
     * 获取性能统计信息
     */
    public getPerformanceStats(): {
        monsterCount: number,
        qualityLevel: QualityLevel,
        qualityName: string,
        config: RenderConfig
    } {
        return {
            monsterCount: this.currentMonsterCount,
            qualityLevel: this.currentQualityLevel,
            qualityName: this.getQualityLevelName(this.currentQualityLevel),
            config: this.getCurrentRenderConfig()
        };
    }

    update(dt: number): void {
        this.lastUpdateTime += dt * 1000;

        // 定期更新质量
        if (this.lastUpdateTime >= this.updateInterval) {
            this.lastUpdateTime = 0;

            // 获取当前怪物数量
            const currentMonsterCount = this.getCurrentMonsterCount();
            this.updateMonsterCount(currentMonsterCount);
        }
    }

    /**
     * 获取当前怪物数量
     */
    private getCurrentMonsterCount(): number {
        try {
            // 通过全局事件获取当前怪物数量，避免直接依赖GameControl
            let monsterCount = 0;

            // 这里可以通过其他方式获取怪物数量
            // 例如通过场景管理器或全局变量

            return monsterCount;
        } catch (error) {
            console.error("获取怪物数量失败:", error);
            return 0;
        }

        return 0;
    }
}