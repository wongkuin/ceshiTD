

import GameResLoad from "../Battle/GameResLoad";
import TurretBaseUI from "../Battle/TurretBaseUI";
import { WapenType } from "../Data/GameWapenData";

const { ccclass, property } = cc._decorator;

interface ILineConfig {
    targetWPosList: cc.Vec3[];     // 固定节点（必须）
    dragNode: cc.Node;      // 拖拽节点（必须）
    lineThickness?: number; // 线条粗细（可选，默认5）
    lineColor?: string;   // 线条颜色（可选，默认白色）
}

export class PackageLineDraw {
    private config: ILineConfig;
    private originalWidth: number = 0;
    private lineList: cc.Node[] = [];

    protected _lineRoot: cc.Node = null;

    constructor(root: cc.Node) {
        this._lineRoot = root;
    }

    // constructor(config: ILineConfig) {
    //     // this.validateConfig(config);
    //     // this.config = {
    //     //     lineThickness: 5,
    //     //     ...config
    //     // };

    //     // this.initializeNodes();
    //     // this.bindEvents();
    // }

    public resetConfig(config: ILineConfig): void {
        this.validateConfig(config);
        this.config = {
            lineThickness: 5,
            ...config
        };

        this.initializeNodes();
        this.bindEvents();
    }

    public async resetConfig2(config: ILineConfig) {
        this.validateConfig(config);
        this.config = {
            lineThickness: 5,
            ...config
        };

        await this.initializeNodes();
        this.bindEvents();
    }


    // 参数校验
    private validateConfig(config: ILineConfig): void {
        if (!config.targetWPosList || !config.dragNode) {
            throw new Error("[LineConnector] Missing required nodes in config");
        }
    }

    // 节点初始化
    private async initializeNodes() {
        for (const target of this.config.targetWPosList) {
            const lineNode = await this.createLineNode();
            lineNode.setAnchorPoint(0.5, 0.5);
            lineNode.active = false;
            let img = lineNode.getComponentInChildren(cc.Sprite);
            if (this.config.lineColor) {
                img.node.color = cc.color().fromHEX(this.config.lineColor);
            } else {
                img.node.color = cc.color().fromHEX("#ffffff");
            }
            this.lineList.push(lineNode);
        }
    }

    // 创建线条节点
    private async createLineNode(): Promise<cc.Node> {
        let node = await GameResLoad.loadPackageLine("line");
        if (!node) {
            cc.error("Failed to load line node");
            return;
        }
        node.parent = this._lineRoot;
        // node.zIndex = ZindexLayer.zindex_UI;
        return node;
    }

    // 生成纯色纹理
    private createSolidColorSpriteFrame(color: cc.Color): cc.SpriteFrame {
        const texture = new cc.Texture2D();
        texture.initWithData(new Uint8Array([color.getR(), color.getG(), color.getB(), 255]), 1, 1, 1);
        return new cc.SpriteFrame(texture);
    }

    // 事件绑定
    private bindEvents(): void {
        this.config.dragNode.on(cc.Node.EventType.TOUCH_MOVE, this.onDragMove, this);
        this.config.dragNode.on(cc.Node.EventType.TOUCH_END, this.onDragEnd, this);

        // for (const target of this.config.targetList) {
        //     target.on(cc.Node.EventType.POSITION_CHANGED, this.onDragMove, this);
        // }
    }

    // 拖拽移动
    private onDragMove(event: cc.Event.EventTouch): void {
        this.updateConnection();
    }

    // 拖拽结束
    private onDragEnd(): void {
        this.updateConnection(); // 确保最后一次位置更新
    }

    // 核心连线逻辑
    public updateConnection(): void {
        if (this.config?.dragNode) {
            const dragBase = this.config.dragNode.getComponent(TurretBaseUI);
            const wapenInfo = dragBase?.turretInfo?.data;
            if (wapenInfo && wapenInfo.wapenType == WapenType.stick) {
                return;
            }
        }
        const worldPos1 = this.config?.dragNode?.convertToWorldSpaceAR(cc.v2(0, 0));
        let nodepos1 = cc.Canvas.instance.node.convertToNodeSpaceAR(worldPos1);

        let targetPosList = [];
        for (const target of this.config.targetWPosList) {
            const worldPos2 = target; // target.convertToWorldSpaceAR(cc.v2(0, 0));
            let nodepos = cc.Canvas.instance.node.convertToNodeSpaceAR(worldPos2);
            targetPosList.push(nodepos);
        }

        if (!nodepos1 || targetPosList.length === 0) return

        // 
        if (this.lineList.length < targetPosList.length) {
            return;
        }

        targetPosList.forEach((targetPos, index) => {
            let line = this.lineList[index];
            this.updateLinePosition(nodepos1, targetPos, line);
            this.updateLineRotation(nodepos1, targetPos, line);
            this.updateLineScale(nodepos1, targetPos, line);
            line.active = true;

        })
    }

    // 更新连线位置（中点计算）
    private updateLinePosition(posA: cc.Vec2, posB: cc.Vec2, lineNode: cc.Node): void {
        if (!lineNode) return
        const centerX = (posA.x + posB.x) / 2;
        const centerY = (posA.y + posB.y) / 2;
        lineNode.setPosition(centerX, centerY);
    }

    // 更新连线角度
    private updateLineRotation(posA: cc.Vec2, posB: cc.Vec2, lineNode: cc.Node): void {
        if (!lineNode) return
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const angleRad = Math.atan2(dy, dx);
        lineNode.angle = angleRad * (180 / Math.PI);
    }

    // 更新连线缩放
    private updateLineScale(posA: cc.Vec2, posB: cc.Vec2, lineNode: cc.Node): void {
        if (!lineNode) return
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        lineNode.width = distance;
        lineNode.height = this.config.lineThickness;
    }

    // 销毁清理
    public destroy(): void {
        if (!this.config) {
            return;
        }

        // 销毁所有线条节点
        for (const element of this.lineList) {
            GameResLoad.putNode(element);
        }

        this.lineList = [];
        this.config.dragNode.off(cc.Node.EventType.TOUCH_MOVE, this.onDragMove, this);
        this.config.dragNode.off(cc.Node.EventType.TOUCH_END, this.onDragEnd, this);

        // for (const target of this.config.targetWPosList) {
        //     target.off(cc.Node.EventType.POSITION_CHANGED, this.onDragMove, this);
        // }
    }
}