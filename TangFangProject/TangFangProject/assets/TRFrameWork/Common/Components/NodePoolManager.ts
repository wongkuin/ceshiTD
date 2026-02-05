import BattleMonsterUI from "../../../Script/Battle/BattleMonsterUI";
import { EventCenter } from "../../EventCenter/EventCenter";
import { EventType } from "../../EventCenter/EventType";
import FromResMgr from "../../UIFrame/FromResMgr";
// import SceneMgr from "../../UIFrame/SceneMgr";
import Singleton from "../../UIFrame/Singleton";


export default class NodePoolManager extends Singleton<NodePoolManager> {

    private _nodePools: { [key: string]: cc.NodePool } = {};

    constructor() {
        super();
        EventCenter.on(EventType.SceneClosed, this.onSceneClosed, this);
    }

    public async getNode<T extends cc.Node>(prefabUrl: string, bundleName: string, poolHandlerComp: string = ''): Promise<{ err?: Error, node?: T }> {
        let pool = this._nodePools[prefabUrl];
        if (!pool) {
            pool = new cc.NodePool(poolHandlerComp);
            this._nodePools[prefabUrl] = pool;
        }
        let node = pool.get();
        if (!node) {
            // let tag = SceneMgr.getCurrScene().fid;
            let res = await FromResMgr.getInstance().loadDynamicRes(prefabUrl, cc.Prefab, bundleName, prefabUrl);
            if (!res) {
                Promise.resolve({ err: 'load prefab error: ' + prefabUrl });
            } else {
                node = cc.instantiate(res);
                node['poolUrl'] = prefabUrl;
            }

        }
        return Promise.resolve({ node: node as T });
    }

    public async getPreloadNode<T extends cc.Node>(prefabUrl: string, bundleName: string, poolHandlerComp: string = '', initCount = 10): Promise<{ err?: Error, node?: T }> {
        let pool = this._nodePools[prefabUrl];
        if (!pool) {
            pool = new cc.NodePool(poolHandlerComp);
            this._nodePools[prefabUrl] = pool;
        }
        let node = pool.get();
        if (!node) {
            // let tag = SceneMgr.getCurrScene().fid;
            let res = await FromResMgr.getInstance().loadDynamicRes(prefabUrl, cc.Prefab, bundleName, prefabUrl);
            if (!res) {
                Promise.resolve({ err: 'load prefab error: ' + prefabUrl });
            } else {
                node = cc.instantiate(res);
                node['poolUrl'] = prefabUrl;
                let pool = this._nodePools[prefabUrl];
                if (pool && pool.size() <= 0) {
                    for (let i = 0; i < initCount; i++) {
                        let nNode = cc.instantiate(res);
                        pool.put(nNode);
                    }
                }
            }

        }
        return Promise.resolve({ node: node as T });
    }


    public putNode<T extends cc.Node>(node: T) {
        let fid = node['poolUrl'];
        if (!fid) {
            console.warn("NodePoolManager putNode error: node is not from pool");
            // 检查节点是否还在场景中，如果在则移除而不是销毁
            if (node.parent) {
                node.removeFromParent();
            } else {
                node.destroy();
            }
            return;
        }
        let pool = this._nodePools[fid];
        if (!pool) {
            pool = new cc.NodePool();
            this._nodePools[fid] = pool;
        }
        pool.put(node);
    }

    //场景关闭时，清理所有节点池
    private onSceneClosed() {
        this.clearAll();
    }

    public clearAll() {
        // console.log("NodePoolManager clearAll");
        for (let key in this._nodePools) {
            FromResMgr.getInstance().destoryDynamicRes(key);
            this._nodePools[key].clear();
        }
        this._nodePools = {};
    }
}
