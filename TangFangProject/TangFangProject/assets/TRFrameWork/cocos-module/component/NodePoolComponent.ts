//预制对象池管理组件

import CocosHelper from "../../UIFrame/CocosHelper";


const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass("NodePoolData")
class PrefabData {
    @property(cc.Integer)
    poolSize: number = 0;

    @property(cc.Node)
    node: cc.Node = null;

    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    // public model: any = null;

    public get model() {
        return this.node ? this.node : this.prefab;
    }

    //实例化节点集合(配合poolSize实现实例化总数的管理)
    public allNodes: Array<cc.Node> = [];
}

@ccclass
@menu("Other/NodePoolComponent")
export default class NodePoolComponent extends cc.Component {

    @property([PrefabData])
    prefabs: Array<PrefabData> = [];

    private pool = {};

    onLoad() {
        this.prefabs.forEach(p => { if (p.node) p.node.active = false });
        // for (var i = this.prefabs.length - 1; i >= 0; i--)
        // {
        //     let data = this.prefabs[i];
        //     if (data.node != null) { data.model = data.node; data.node.active = false; continue; }
        //     if (data.prefab != null) { data.model = data.prefab; continue; }
        //     this.prefabs.splice(i, 1);
        // }
    }

    public initWithPrefab(prefab: cc.Prefab) {
        let data = new PrefabData();
        // data.model = prefab;
        data.prefab = prefab;
        this.prefabs.push(data);
    }

    public initWithPrefabByUrl(url: string, finishCall?: Function, bundle?: string) {
        CocosHelper.loadRes(url, cc.Prefab, bundle, (err, asset) => {
            if (!err) {
                if (asset.shift) {
                    asset.forEach(t => this.initWithPrefab(t));
                }
                else
                    this.initWithPrefab(asset);

                if (finishCall) finishCall();
            }
        }, this)

        // ResManager.getInstance().loadRes(url, bundle, (err, asset) => {
        //     if (!err) {
        //         if (asset.shift) {
        //             asset.forEach(t => this.initWithPrefab(t));
        //         }
        //         else
        //             this.initWithPrefab(asset);

        //         if (finishCall) finishCall();
        //     }
        // }, this, cc.Prefab);
    }

    private equal(str1: string, str2: string) {
        return str1 == str2 || str1.indexOf(str2) == 0;
    }

    private instantiate(prefab: any, parent?: cc.Node) {
        let node = cc.instantiate(prefab);
        node.active = false;
        node.parent = parent;
        return node;
    }

    public get(name: string, parent?: cc.Node): cc.Node {
        let data = this.getPrefabData(name);
        if (!data) return;

        if (!this.pool[name]) this.pool[name] = [];
        this.clearInvalidNode();
        let node: cc.Node = this.pool[name].find((t) => { return t.active == false; });
        parent = parent ? parent : (data.model as any).parent;
        parent = parent ? parent : cc.Canvas.instance.node;

        if (!node) {
            if (data.poolSize > 0 && data.allNodes.length >= data.poolSize) {
                node = data.allNodes[0];
                node.parent = parent;
                node.stopAllActions();
                cc.Tween.stopAllByTarget(node);
            }
            else {
                node = this.instantiate(data.model, parent);
                this.pool[name].push(node);
                if (data.poolSize > 0) data.allNodes.push(node);
            }
        }

        //把推出池的节点往后挪
        let index = data.allNodes.indexOf(node);
        if (index >= 0 && index != data.allNodes.length - 1) {
            data.allNodes.splice(index, 1);
            data.allNodes.push(node);
        }
        // cc.log(name, data.allNodes.length);
        node.active = true;

        if (data.allNodes.length != data.poolSize) {
            this.clearPool(name);
        }

        return node;
    }

    public getFirst(parent?: cc.Node): cc.Node {
        if (this.prefabs.length == 0) return;
        let name = this.prefabs[0].node?.name || this.prefabs[0].prefab.name;
        return this.get(name, parent);
    }

    public back(node: cc.Node) {
        if (this.pool[node.name]) {
            node.stopAllActions();
            node.active = false;
            // this.pool[node.name].push(node);
        }
    }

    public recycle(node: cc.Node) {
        if (node && node.isValid && this.pool[node.name]) {
            this.pool[node.name].splice(this.pool[node.name].indexOf(node), 1);
            node.destroy();
        }
    }

    public clear(node: cc.Node) {
        if (node && node.isValid && this.pool[node.name]) {
            this.pool[node.name].forEach((t) => {
                t.destroy();
            });
            delete this.pool[node.name];
        }
    }

    public clearAll() {
        for (let k in this.pool) {
            for (let t of this.pool[k]) {
                if (t.isValid) t.destroy();
            }
            delete this.pool[k];
        }
    }

    public clearPool(name: string) {
        if (this.pool[name]) {
            let data = this.getPrefabData(name);
            for (let i = this.pool[name].length - 1; i >= 0; i--) {
                let node = this.pool[name][i];
                if (!node.active) {
                    let index = data.allNodes.indexOf(node);
                    if (index >= 0)
                        data.allNodes.splice(index, 1);
                    node.removeFromParent();
                    node.destroy();
                    this.pool[name].splice(i, 1);
                }
            }
            // cc.log("clear pool", name);
        }
    }

    public getPrefabData(name: string) {
        return this.prefabs.find((t) => { return t.model.name == name; });
    }

    public getAllActivedNode(key: string) {
        if (this.pool[key]) {
            let nodes: Array<cc.Node> = this.pool[key];
            return nodes.filter((t) => t.active);
        }
        return [];
    }

    private clearInvalidNode() {
        for (let k in this.pool) {
            for (let i = this.pool[k].length - 1; i >= 0; i--) {
                if (!this.pool[k][i].isValid) {
                    this.pool[k].splice(i, 1);
                }
            }
        }
    }
}
