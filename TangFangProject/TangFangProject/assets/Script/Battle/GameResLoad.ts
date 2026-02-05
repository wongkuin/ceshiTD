

import NodePoolManager from "../../TRFrameWork/Common/Components/NodePoolManager";
// import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
// import PackageLine from "../BattlePackage/PackageLine";
// import PackageNode, { PackageNodeType } from "../BattlePackage/PackageNode";
import { GameBundle } from "../config/GameEnum";
// import BattleMonsterUI from "./BattleMonsterUI";
// import TurretBaseUI from "./TurretBaseUI";
// import BulletBase from "./BulletBase";
// import BulletEffect from "./BulletEffect";
// import BuffEffect from "./BuffEffect";
// import HurtEffectUI from "./HurtEffectUI";
// import CrewView from "../module/Crew/CrewView";
// import BattleFlyBoxUI from "../UI/BattleFlyBoxUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameResLoad {

    // 加载角色
    public static async LoadCharPrefab(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefab/${path}`, GameBundle.Bundle_Stick, "BattleCharUI");
        return Promise.resolve(res.node);
    }

    // 加载鼎
    public static async LoadTropidPrefab(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_commonRes, "BattleTripodUI");
        return Promise.resolve(res.node);
    }

    // 加载鼎 血条
    public static async LoadCartHpPrefab(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_commonRes, null);
        return Promise.resolve(res.node);
    }

    // 加载游戏地图
    public static async LoadGameMapPrefab(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_GameMap, "GameMap");
        return Promise.resolve(res.node);
    }

    // public static async loadRolePrefab(path: string): Promise<cc.Node> {
    //     let res = await NodePoolManager.getInstance().getNode(`prefab/${path}`, GameBundle.Bundle_Crew, "BattleCharUI");
    //     return Promise.resolve(res.node);
    // }

    // 加载怪物预制体
    public static async loadMonsterPrefab(path: string): Promise<cc.Node> {
        // console.log('loadMonsterPrefab', path);
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_monster, "BattleMonsterUI");
        return Promise.resolve(res.node);
    }

    public static async preloadMonsterPrefab(path: string, initCount: number = 10): Promise<cc.Node> {
        // console.log('loadMonsterPrefab', path);
        let res = await NodePoolManager.getInstance().getPreloadNode(`prefabs/${path}`, GameBundle.Bundle_monster, "BattleMonsterUI", initCount);
        return Promise.resolve(res.node);
    }

    //加载召唤物
    public static async loadSummonTurretPrefab(path: string): Promise<cc.Node> {
        // console.log('loadMonsterPrefab', path);
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_monster, "BattleSummonTurretUI");
        return Promise.resolve(res.node);
    }

    // 加载炮塔
    public static async loadTurretPrefab(path: string): Promise<cc.Node> {
        path = `wapen`
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_commonRes, "TurretBaseUI");
        return Promise.resolve(res.node);
    }

    public static async preloadTurretPrefab(path: string, initCount: number = 3): Promise<cc.Node> {
        path = 'wapen'
        let res = await NodePoolManager.getInstance().getPreloadNode(`prefabs/${path}`, GameBundle.Bundle_commonRes, "TurretBaseUI", initCount);
        return Promise.resolve(res.node);
    }

    // 加载子弹
    public static async loadBulletPrefab(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_bullet, "BulletBase");
        return Promise.resolve(res.node);
    }

    // 预加载子弹
    public static async preloadBulletPrefab(path: string, initCount: number = 10): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getPreloadNode(`prefabs/${path}`, GameBundle.Bundle_bullet, "BulletBase", initCount);
        return Promise.resolve(res.node);
    }

    // 预加载击中预制体
    public static async preloadHitPrefab(path: string, initCount: number = 10): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getPreloadNode(`prefabs/${path}`, GameBundle.Bundle_commonRes, "", initCount);
        return Promise.resolve(res.node);
    }

    // 加载aoe
    public static async loadAOEPrefab(path: string, initCount: number = 10): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getPreloadNode(`effect/prefabs/${path}`, GameBundle.Bundle_commonRes, "BulletEffect", initCount);
        return Promise.resolve(res.node);
    }



    // // 加载 炮塔框
    // public static async loadPackageNode(type: PackageNodeType): Promise<cc.Node> {
    //     let res = await NodePoolManager.getInstance().getNode(`package/pType${type}`, GameBundle.Bundle_common, PackageNode);
    //     return Promise.resolve(res.node);
    // }

    // 加载 背包升级引导线
    public static async loadPackageLine(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`package/${path}`, GameBundle.Bundle_commonRes, "PackageLine");
        return Promise.resolve(res.node);
    }

    // 加载受击特效
    public static async loadBulletEffect(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`effect/prefabs/${path}`, GameBundle.Bundle_commonRes, "BulletEffect");
        return Promise.resolve(res.node);
    }

    // 加载 buff 效果
    public static async loadBuffEffect(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`effect/prefabs/${path}`, GameBundle.Bundle_commonRes, "BuffEffect");
        return Promise.resolve(res.node);
    }

    // 加载 hp
    public static async loadHurtEffect(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_commonRes, "HurtEffectUI");
        return Promise.resolve(res.node);
    }

    // public static async loadHeroArrow(path: string = 'hero_arrow'): Promise<cc.Node> {
    //     let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_common, null);
    //     return Promise.resolve(res.node);
    // }

    // uplevel effect
    public static async loadUpleveEffect(path: string): Promise<cc.Node> {
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_bullet, null);
        return Promise.resolve(res.node);
    }

    // 加载 拖尾
    public static async loadBulletMotion(path?: string): Promise<cc.Node> {
        path = path || 'bullet_motion';
        let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_bullet, null);
        return Promise.resolve(res.node);
    }
    // 飞行宝箱
    // public static async loadBattleFlyBox(path: string) {
    //     let res = await NodePoolManager.getInstance().getNode(`prefabs/${path}`, GameBundle.Bundle_common, BattleFlyBoxUI);
    //     return Promise.resolve(res.node);
    // }

    // 回收节点
    public static putNode(node: cc.Node) {
        NodePoolManager.getInstance().putNode(node);
    }

    /**
     * 预加载特效资源并设置对象池初始容量
     * @param path 特效路径
     * @param poolSize 对象池初始容量
     */
    public static async preloadEffect(path: string, poolSize: number = 5): Promise<void> {
        try {
            // 先加载一次获取资源
            let res = await this.loadBulletEffect(path);
            if (res) {
                // 获取对象池并设置初始容量
                let poolUrl = `effect/prefabs/${path}`;
                let pool = NodePoolManager.getInstance()['_nodePools'][poolUrl];
                if (pool) {
                    // 增加对象池容量
                    for (let i = 0; i < poolSize - 1; i++) {
                        let newNode = cc.instantiate(res);
                        NodePoolManager.getInstance().putNode(newNode);
                    }
                    console.log(`特效 ${path} 预加载完成，对象池容量: ${poolSize}`);
                }
                this.putNode(res);
            }
        } catch (error) {
            console.warn(`预加载特效 ${path} 失败:`, error);
        }
    }

    /**
     * 预加载子弹资源并设置对象池初始容量
     * @param path 子弹路径
     * @param poolSize 对象池初始容量
     */
    public static async preloadBullet(path: string, poolSize: number = 10): Promise<void> {
        try {
            // 先加载一次获取资源
            let res = await this.loadBulletPrefab(path);
            if (res) {
                // 获取对象池并设置初始容量
                let poolUrl = `prefabs/${path}`;
                let pool = NodePoolManager.getInstance()['_nodePools'][poolUrl];
                if (pool) {
                    // 增加对象池容量
                    for (let i = 0; i < poolSize - 1; i++) {
                        let newNode = cc.instantiate(res);
                        NodePoolManager.getInstance().putNode(newNode);
                    }
                    console.log(`子弹 ${path} 预加载完成，对象池容量: ${poolSize}`);
                }
                this.putNode(res);
            }
        } catch (error) {
            console.warn(`预加载子弹 ${path} 失败:`, error);
        }
    }

}
