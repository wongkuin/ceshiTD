import BattleAckObject from "../Battle/BattleAckObjet";

export class MonsterManager {
   
    
    // 根据位置信息找到最集中的怪物群
    static findMostConcentratedGroup(monsters: BattleAckObject[]): BattleAckObject {
        if (monsters.length === 0) return null;
        
        // 1. 对怪物进行聚类
        const clusters = this.clusterMonsters(monsters);
        
        // 2. 找到数量最多的集群
        let largestCluster = clusters[0];
        for (let i = 1; i < clusters.length; i++) {
            if (clusters[i].length > largestCluster.length) {
                largestCluster = clusters[i];
            }
        }
        
        // 3. 找到集群的中心怪物（距离中心点最近的怪物）
        return this.findCenterMonster(largestCluster);
    }
    
    // 聚类算法
    private static clusterMonsters(monsters: BattleAckObject[], maxDistance: number = 100): BattleAckObject[][] {
        const clusters: BattleAckObject[][] = [];
        const visited = new Set<BattleAckObject>();
        
        for (const monster of monsters) {
            if (visited.has(monster)) continue;
            
            const cluster: BattleAckObject[] = [];
            this.expandCluster(monster, monsters, cluster, visited, maxDistance);
            clusters.push(cluster);
        }
        
        return clusters;
    }
    
    // 扩展集群
    private static expandCluster(
        monster: BattleAckObject, 
        allMonsters: BattleAckObject[], 
        cluster: BattleAckObject[], 
        visited: Set<BattleAckObject>, 
        maxDistance: number
    ): void {
        cluster.push(monster);
        visited.add(monster);
        
        for (const otherMonster of allMonsters) {
            if (visited.has(otherMonster)) continue;
            
            const distance = monster.node.position.sub(otherMonster.node.position).mag();
            if (distance <= maxDistance) {
                this.expandCluster(otherMonster, allMonsters, cluster, visited, maxDistance);
            }
        }
    }
    
    // 找到距离集群中心最近的怪物
    private static findCenterMonster(cluster: BattleAckObject[]): BattleAckObject {
        if (cluster.length === 0) return null;
        
        // 计算集群的中心点
        const center = cluster.reduce((sum, monster) => {
            return sum.add(monster.node.position);
        }, cc.v3(0, 0,0)).div(cluster.length);
        
        // 找到距离中心点最近的怪物
        let centerMonster = cluster[0];
        let minDistance = centerMonster.node.position.sub(center).mag();
        
        for (let i = 1; i < cluster.length; i++) {
            const distance = cluster[i].node.position.sub(center).mag();
            if (distance < minDistance) {
                minDistance = distance;
                centerMonster = cluster[i];
            }
        }
        
        return centerMonster;
    }
}