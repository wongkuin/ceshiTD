// 空间分区优化系统 - 用于提升大量怪物时的性能
import { GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";

const { ccclass, property } = cc._decorator;

/**
 * 空间分区网格 - 将游戏世界划分为网格，快速查找附近对象
 */
@ccclass
export default class SpatialHashGrid extends cc.Component {
    @property
    cellSize: number = 100; // 网格大小

    private grid: Map<string, BattleAckObject[]> = new Map();
    private monsterGrid: Map<string, BattleAckObject[]> = new Map();
    private turretGrid: Map<string, BattleAckObject[]> = new Map();
    
    /**
     * 获取网格键值
     */
    private getGridKey(position: cc.Vec3): string {
        const x = Math.floor(position.x / this.cellSize);
        const y = Math.floor(position.y / this.cellSize);
        return `${x},${y}`;
    }
    
    /**
     * 添加怪物到空间分区
     */
    addMonster(monster: BattleAckObject): void {
        const gridKey = this.getGridKey(monster.node.position);
        if (!this.monsterGrid.has(gridKey)) {
            this.monsterGrid.set(gridKey, []);
        }
        this.monsterGrid.get(gridKey).push(monster);
    }
    
    /**
     * 添加炮塔到空间分区
     */
    addTurret(turret: BattleAckObject): void {
        const gridKey = this.getGridKey(turret.node.position);
        if (!this.turretGrid.has(gridKey)) {
            this.turretGrid.set(gridKey, []);
        }
        this.turretGrid.get(gridKey).push(turret);
    }
    
    /**
     * 从空间分区移除对象
     */
    removeObject(obj: BattleAckObject): void {
        const gridKey = this.getGridKey(obj.node.position);
        
        // 从怪物网格移除
        if (this.monsterGrid.has(gridKey)) {
            const monsters = this.monsterGrid.get(gridKey);
            const index = monsters.indexOf(obj);
            if (index >= 0) {
                monsters.splice(index, 1);
            }
        }
        
        // 从炮塔网格移除
        if (this.turretGrid.has(gridKey)) {
            const turrets = this.turretGrid.get(gridKey);
            const index = turrets.indexOf(obj);
            if (index >= 0) {
                turrets.splice(index, 1);
            }
        }
    }
    
    /**
     * 更新对象位置（当对象移动时调用）
     */
    updateObjectPosition(obj: BattleAckObject, oldPosition: cc.Vec3): void {
        const oldGridKey = this.getGridKey(oldPosition);
        const newGridKey = this.getGridKey(obj.node.position);
        
        if (oldGridKey === newGridKey) return;
        
        // 从旧网格移除
        this.removeObjectFromGrid(obj, oldGridKey);
        
        // 添加到新网格
        if (obj.getShootInfo().getObjType() === GameObjectType.Monster) {
            this.addMonsterToGrid(obj, newGridKey);
        } else {
            this.addTurretToGrid(obj, newGridKey);
        }
    }
    
    /**
     * 从指定网格移除对象
     */
    private removeObjectFromGrid(obj: BattleAckObject, gridKey: string): void {
        if (this.monsterGrid.has(gridKey)) {
            const monsters = this.monsterGrid.get(gridKey);
            const index = monsters.indexOf(obj);
            if (index >= 0) {
                monsters.splice(index, 1);
            }
        }
        
        if (this.turretGrid.has(gridKey)) {
            const turrets = this.turretGrid.get(gridKey);
            const index = turrets.indexOf(obj);
            if (index >= 0) {
                turrets.splice(index, 1);
            }
        }
    }
    
    /**
     * 添加怪物到指定网格
     */
    private addMonsterToGrid(monster: BattleAckObject, gridKey: string): void {
        if (!this.monsterGrid.has(gridKey)) {
            this.monsterGrid.set(gridKey, []);
        }
        this.monsterGrid.get(gridKey).push(monster);
    }
    
    /**
     * 添加炮塔到指定网格
     */
    private addTurretToGrid(turret: BattleAckObject, gridKey: string): void {
        if (!this.turretGrid.has(gridKey)) {
            this.turretGrid.set(gridKey, []);
        }
        this.turretGrid.get(gridKey).push(turret);
    }
    
    /**
     * 获取指定区域内的所有怪物（优化版本）
     */
    getMonstersInArea(center: cc.Vec2, radius: number): BattleAckObject[] {
        const results: BattleAckObject[] = [];
        const minX = Math.floor((center.x - radius) / this.cellSize);
        const maxX = Math.floor((center.x + radius) / this.cellSize);
        const minY = Math.floor((center.y - radius) / this.cellSize);
        const maxY = Math.floor((center.y + radius) / this.cellSize);
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const key = `${x},${y}`;
                if (this.monsterGrid.has(key)) {
                    const monsters = this.monsterGrid.get(key);
                    for (const monster of monsters) {
                        if (cc.isValid(monster.node) && monster.canAck()) {
                            const distance = cc.Vec2.distance(center, cc.v2(monster.node.x, monster.node.y));
                            if (distance <= radius) {
                                results.push(monster);
                            }
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    /**
     * 获取指定区域内的所有炮塔（优化版本）
     */
    getTurretsInArea(center: cc.Vec2, radius: number): BattleAckObject[] {
        const results: BattleAckObject[] = [];
        const minX = Math.floor((center.x - radius) / this.cellSize);
        const maxX = Math.floor((center.x + radius) / this.cellSize);
        const minY = Math.floor((center.y - radius) / this.cellSize);
        const maxY = Math.floor((center.y + radius) / this.cellSize);
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const key = `${x},${y}`;
                if (this.turretGrid.has(key)) {
                    const turrets = this.turretGrid.get(key);
                    for (const turret of turrets) {
                        if (cc.isValid(turret.node) && turret.canAck()) {
                            const distance = cc.Vec2.distance(center, cc.v2(turret.node.x, turret.node.y));
                            if (distance <= radius) {
                                results.push(turret);
                            }
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    /**
     * 清空所有网格
     */
    clear(): void {
        this.grid.clear();
        this.monsterGrid.clear();
        this.turretGrid.clear();
    }
    
    /**
     * 获取网格统计信息（用于调试）
     */
    getGridStats(): { totalCells: number, occupiedCells: number, totalObjects: number } {
        let occupiedCells = 0;
        let totalObjects = 0;
        
        this.monsterGrid.forEach((monsters) => {
            if (monsters.length > 0) {
                occupiedCells++;
                totalObjects += monsters.length;
            }
        });
        
        this.turretGrid.forEach((turrets) => {
            if (turrets.length > 0) {
                occupiedCells++;
                totalObjects += turrets.length;
            }
        });
        
        return {
            totalCells: this.monsterGrid.size + this.turretGrid.size,
            occupiedCells,
            totalObjects
        };
    }
}