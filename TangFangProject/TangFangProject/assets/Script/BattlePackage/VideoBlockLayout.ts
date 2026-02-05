

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import GameControl from "../Battle/GameControl";
import GameResLoad from "../Battle/GameResLoad";
import TurretBaseUI from "../Battle/TurretBaseUI";
import { TurretInfo } from "../config/DataInfo";
import PackageLine from "./PackageLine";

const { ccclass, property } = cc._decorator;
interface IVLineConfig {
    targetList: TurretBaseUI[];     // map 节点（必须）
    dragNode: cc.Node;          // list 节点（必须）
    itemNode: cc.Node;          // list 节点（必须）
    lineConfig: Map<string, PackageLine>;
}

@ccclass
export default class VideoBlockLayout extends cc.Component {

    @property(cc.Node)
    spLineRoot: cc.Node = null; // 3级引导线跟节点

    @property(cc.Node)
    itemPrefab: cc.Node = null;

    protected _items: TurretBaseUI[] = [];

    private _item_root: cc.Node = null;

    protected _allTurret: TurretBaseUI[] = [];

    // private _lineConfig: Map<string, PackageLine> = new Map();

    protected _lineCfg: IVLineConfig[] = [];

    protected _maxCount: number = 0;
    private _curCount: number = 0;

    protected gCamera: cc.Camera = null;

    onLoad() {
        this._item_root = this.node;
        GlobalEventMgr.getInstance().on(GlobalEventID.add_mapTurret, this.onAddMapTurret, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DRAG_START, this.onDelMapTurret, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.composite_mapTurret, this.onCompositeMapTurret, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.turret_move_back, this.onTurretMoveBack, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DEL, this.onTurretDel, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.turret_swape, this.onTurretSwaped, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.GameUI_Hide, this.clean, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.GameUI_Show, this.onShowGameUI, this);

    }

    public setMaxCount(count: number = 3) {
        this._maxCount = count;
        // this._curCount = 0;
    }

    onShowGameUI(gameCamera: cc.Camera) {
        this.gCamera = gameCamera;
        this.setMaxCount();
    }

    public async addTurret2List(curInfo: TurretBaseUI) {
        // if (this._items.find((node) => {
        //     return node['tId'] == tid;
        // })) {
        //     return;
        // };



        // if (vage.data.level != 3) {
        //     return;
        // }

        let turrID = curInfo.turretInfo.getID();

        let haveNode = this._items.filter((node) => {
            return node.turretInfo.getID() == turrID;
        });
        if (haveNode.length > 0) {
            let newData = this._lineCfg.find((data) => {
                return data.itemNode['tId'] == turrID;
            })
            newData.targetList.push(curInfo)
            this.restLine(turrID, haveNode[0].node, haveNode[0].node['vItem']);
            return;
        }

        let vage = new TurretInfo(turrID);


        // this._curCount++;
        let item = cc.instantiate(this.itemPrefab);
        item.parent = this._item_root;
        item.active = true;

        let pInfo = vage;
        pInfo.needVideo = true;
        // let scene = SceneMgr.getCurrScene();
        let node = await GameResLoad.loadTurretPrefab(pInfo.getTurretPath());
        if (node) {
            let pn = node.getComponent(TurretBaseUI);
            pn.init(pInfo);

            node.parent = item.getChildByName('root');
            node.setPosition(0, 0);
            node.active = true;

            // pn.hideBgImg()
            // let bSize = pn.getRealSize();
            // let eScale = item.getChildByName('root').width / (bSize.width > bSize.height ? bSize.width : bSize.height);
            // node.scale = eScale;
            node['vItem'] = item;
            this._items.push(pn);
        }
        let tid = vage.getID();
        item['tId'] = tid;
        // let btn = item.getComponentInChildren(ButtonPlus);
        // btn.addClick(this.onItemClicked, this); // 添加点击事件

        let newData: IVLineConfig = {
            targetList: this._allTurret.filter((node) => {
                return node.turretInfo.getID() == tid;
            }),
            dragNode: node,
            itemNode: item,
            lineConfig: new Map()

        }
        this._lineCfg.push(newData);

        item.on(cc.Node.EventType.POSITION_CHANGED, this.onPositionChanged, this);
        cc.tween(item).to(0.3, { x: - item.width + 5 }).call(() => {
            this.restLine(tid, node, item);
        }).start();


        this._curCount = this._items.length;
        if (this._curCount > this._maxCount) {
            this.onDelMapTurret(this._items[0].node);
            // 超过上限
            this.onTurretDel(this._items[0].node);
        }
    }

    protected restLine(tid: number, node: cc.Node, item: cc.Node) {
        let newData = this._lineCfg.find((data) => {
            return data.itemNode == item;
        })
        for (const element of newData.targetList) {
            this.addLine(newData.dragNode.uuid + "_" + element.node.uuid, newData.dragNode, element.node, newData.lineConfig);
        }
    }

    onPositionChanged(dd: any) {
        // console.log("onPositionChanged", this._lineConfig.size, this._lineConfig.keys());
        for (const cfg of this._lineCfg) {
            cfg.lineConfig.forEach((line, key) => {
                let nodeA = line.NodeA
                let nodeB = line.NodeB
                // console.log("onPositionxxxxx ---", nodeA, nodeB);
                line.node.setPosition(this.spLineRoot.convertToNodeSpaceAR(nodeA.convertToWorldSpaceAR(cc.v2())));
                let spk = line.getComponentInChildren(sp.Skeleton);
                let ikbone = spk.findBone("IK");

                let wPos = CocosHelper.convertBetweenCameras(nodeB, this.gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
                let endPos = line.node.convertToNodeSpaceAR(wPos);
                // let endPos = value.node.convertToNodeSpaceAR(nodeB.parent.convertToWorldSpaceAR(nodeB.position));
                ikbone.x = endPos.x;
                ikbone.y = endPos.y;
            })
        }

    }



    protected onTurretSwaped(param: any) {

        let from = (param.from as cc.Node).getComponent(TurretBaseUI);
        let to = (param.to as cc.Node).getComponent(TurretBaseUI);
        // console.log("交换炮塔", from.node.uuid, to.node.uuid)
        if (this._allTurret.indexOf(from) >= 0) {
            this._allTurret.splice(this._allTurret.indexOf(from), 1);
        }

        if (this._allTurret.indexOf(to) >= 0) {
            this._allTurret.splice(this._allTurret.indexOf(to), 1);
        }
        // console.log("交换炮塔长度", this._allTurret.length);
        // 删除线
        let gData = this._lineCfg.filter((cfg) => {
            return cfg.targetList.indexOf(from) >= 0 || cfg.targetList.indexOf(to) >= 0;
        });
        for (const data of gData) {
            this.removeLine(data.dragNode.uuid + "_" + from.node.uuid, data.lineConfig);
            this.removeLine(data.dragNode.uuid + "_" + to.node.uuid, data.lineConfig);
        }

        this.scheduleOnce(() => {
            this.onAddMapTurret(from);
            this.onAddMapTurret(to);
        }, 0.1);
    }

    // 移动到块中
    protected onTurretDel(tNode: cc.Node) {
        // console.log("删除炮塔 并清理", tNode.uuid)
        if (!tNode) return; // 没有炮塔
        if (this.onTurretDelList(tNode)) {
            GameResLoad.putNode(tNode);
        }
    }

    protected onTurretDelList(tNode: cc.Node): boolean {

        // console.log("删除炮塔 引导列表中", tNode.uuid)

        let tb = tNode.getComponent(TurretBaseUI);
        let idx = this._items.indexOf(tb)
        if (idx >= 0) {
            this._items.splice(idx, 1);
            let item = tNode['vItem'] as cc.Node;
            item.removeFromParent();
            tNode['vItem'] = null;

            let gData = this._lineCfg.find((data) => {
                return tb.turretInfo.getID() == data.itemNode['tId'];
            });
            this._lineCfg.splice(this._lineCfg.indexOf(gData), 1);
            return true;

        }
        return false; // 没有炮塔
    }



    protected async delTurret(item: TurretBaseUI) {
        item.node.parent.parent.removeFromParent(false);
        GameResLoad.putNode(item.node);
        // item.destroy();
    }

    protected onCompositeMapTurret(pNode: TurretBaseUI) {
        // if (pNode.getPackegeItemType() != PackageItemType.Turret) {
        //     return;
        // }

        // old line
        let oldLine = this._lineCfg.find((data) => {
            return data.targetList.indexOf(pNode) != -1;
        })

        if (oldLine) {
            // del 
            this.removeLine(oldLine.dragNode.uuid + "_" + pNode.node.uuid, oldLine.lineConfig);
            oldLine.targetList.splice(oldLine.targetList.indexOf(pNode), 1);
        }

        if (!GameControl.getInstance().getPassInfo().canShowVideoWapen()) {
            return;
        }

        if (pNode.turretInfo.getFusionOutput() == 0 || !pNode.turretInfo.canVideoOutput()) {
            return;
        }

        // console.log("合成炮塔xxxxxxxxxxxxxxxx", pNode.node.uuid)
        this.addTurret2List(pNode);
    }

    protected onTurretMoveBack(pNode: TurretBaseUI) {

        // console.log("炮塔移动回原位置", pNode.node.uuid)
        // 列表中
        let idx = this._items.indexOf(pNode) //
        if (idx >= 0) {
            this.restLine(pNode.turretInfo.getID(), pNode.node, pNode.node['vItem']);
        } else {
            // 地图上的
            if (!pNode.turretInfo.locked) {
                this.onAddMapTurret(pNode);
            }
        }
    }

    protected onAddMapTurret(pNode: TurretBaseUI) {

        // console.log('添加炮塔 到地图+++++++++++', pNode.node.uuid)

        this._allTurret.push(pNode);

        // console.log("添加炮塔长度", this._allTurret.length);
        // 视频列表中
        if (this._items.indexOf(pNode) >= 0) {
            this.onTurretDelList(pNode.node);
            return;
        }

        let gData = this._lineCfg.find((data) => {
            return pNode.turretInfo.getID() == data.itemNode['tId'];
        });
        if (gData) {
            gData.targetList.push(pNode);
            this.addLine(gData.dragNode.uuid + "_" + pNode.node.uuid, gData.dragNode, pNode.node, gData.lineConfig);
        }


    }

    protected onDelMapTurret(tNode: cc.Node) {
        // if (pNode.getPackegeItemType() != PackageItemType.Turret) {
        //     return;
        // }
        // console.log('删除炮塔-----------', tNode.uuid);
        let pNode = tNode.getComponent(TurretBaseUI);
        let idx = this._allTurret.indexOf(pNode)
        if (idx >= 0) {
            let delNodes = this._allTurret.splice(idx, 1);
        }
        // console.log("onDelMapTurret", this._allTurret.length);

        let gData = this._lineCfg.find((data) => {
            return pNode.turretInfo.getID() == data.itemNode['tId']
        });

        if (gData) {
            let gIdx = gData.targetList.indexOf(pNode);
            if (gIdx >= 0) {
                gData.targetList.splice(gIdx, 1);
                this.removeLine(gData.dragNode.uuid + "_" + pNode.node.uuid, gData.lineConfig);
            }

            // 推荐列表中
            let iIdx = this._items.indexOf(pNode);
            if (iIdx >= 0) {
                // 先删除全部的连线
                for (const element of gData.targetList) {
                    this.removeLine(gData.dragNode.uuid + "_" + element.node.uuid, gData.lineConfig);
                }
                // this._lineCfg.splice(this._lineCfg.indexOf(gData), 1);
            }

        }
    }



    protected async addLine(key: string, nodeA: cc.Node, nodeB: cc.Node, lineConfig: Map<string, PackageLine>) {
        // console.log("addLine", key);

        if (lineConfig.has(key)) {
            return; // 已经存在连线
        }

        let lNode = await GameResLoad.loadPackageLine('lineSP');
        let pline = lNode.getComponent(PackageLine);
        pline.node.parent = this.spLineRoot;
        pline.node.setPosition(this.spLineRoot.convertToNodeSpaceAR(nodeA.parent.convertToWorldSpaceAR(nodeA.position)));

        let spk = lNode.getComponentInChildren(sp.Skeleton);
        let ikbone = spk.findBone("IK");
        pline.NodeA = nodeA;
        pline.NodeB = nodeB;


        let wPos = CocosHelper.convertBetweenCameras(nodeB, this.gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
        let endPos = pline.node.convertToNodeSpaceAR(wPos);
        ikbone.x = endPos.x;
        ikbone.y = endPos.y;
        lineConfig.set(key, pline);
    }

    // 移除指定key的连线
    protected removeLine(key: string, lineConfig: Map<string, PackageLine>) {
        // console.log("removeLine", key);
        let pline = lineConfig.get(key);
        if (pline) {
            pline.NodeA = null;
            pline.NodeB = null;
            GameResLoad.putNode(pline.node);
            lineConfig.delete(key);
        }
    }

    public clean() {
        this._items.forEach(item => {
            cc.tween(item.node.parent.parent).to(0.3, { x: 0 }).call(() => {
                this.delTurret(item);
            }).start();
        });

        for (const element of this._lineCfg) {
            element.lineConfig.forEach((value, key) => {
                this.removeLine(key, element.lineConfig);

            });

        }


        this._lineCfg = [];
        this._items = [];
    }


    // update (dt) {}
}
