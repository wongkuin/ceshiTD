import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import ConfigMgr from "../config/ConfigMgr";
import { WapenTableData } from "../config/DataDef";
import GameControl from "./GameControl";
import TurretBaseUI from "./TurretBaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurretMoveUI extends cc.Component {

    protected dragThreshold: number = 1;

    /**
     * 触摸开始位置
     */
    protected touchStartPos: cc.Vec2 = null;

    /**
     * 拖拽位置偏移
     */
    protected dragOffset: cc.Vec2 = null;

    /**
     * 拖拽位置偏移
     */
    protected isDragging: boolean = false;
    public oldParent: cc.Node = null;

    /**棍子道具ID,为0就是非棍子道具*/
    private stickID: number = 0;
    private isW: boolean = false;
    private scaleY: number = 1;
    private scaleX: number = 1;

    protected start(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.scaleX = this.scaleX;
        this.node.scaleY = this.scaleY;
    }

    resetEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    setStickID(stickID: number = 0) {
        if (!stickID) return;
        let wapenTable = ConfigMgr.getInstance().getById(stickID, WapenTableData);
        if (!wapenTable) return;
        this.stickID = stickID;
    }

    getStickID() { return this.stickID; }

    /**是否棍子*/
    isStick() { return this.stickID > 0; }

    /**是否短棍子*/
    getIsShortStick() {
        if (!this.stickID) return false;
        return this.stickID == 30;
    }

    /**是否长棍子*/
    getIsLongStick() {
        if (!this.stickID) return false;
        return this.stickID == 31;
    }

    // onEnable() {
    //     //console.warn("onEnable");
    //     // this.oldParent = this.node.parent;
    //     this.node.getChildByName('bg').on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.node.getChildByName('bg').on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    //     this.node.getChildByName('bg').on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    //     this.node.getChildByName('bg').on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    // }


    // protected onDisable(): void {
    //     // console.warn("onDisable");
    //     this.node.getChildByName('bg').off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.node.getChildByName('bg').off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    //     this.node.getChildByName('bg').off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    //     this.node.getChildByName('bg').off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    // }

    public moveBack() {
        this.node.parent = this.oldParent;
        this.node.setPosition(cc.v2());
        this.node.setScale(1)
    }

    /**
     * 触摸开始回调
     * @param event 
     */
    protected onTouchStart(event: cc.Event.EventTouch) {
        console.log("onTouchStart");
        this.node.setScale(1);
        if (!this.enabled) {
            return;
        }
        GameControl.getInstance().moveingTurret = this.node;

        this.oldParent = this.node.parent;

        if (this.node.parent.name == 'weapon') {
            this.isW = true
        }

        this.touchStartPos = event.getLocation();
        this.dragOffset = this.node.convertToNodeSpaceAR(event.getLocation());

        let desc = this.node.getComponent(TurretBaseUI).turretInfo.getDesc();
        GlobalEventMgr.getInstance().emit(GlobalEventID.show_block_tips, { msg: desc })
    }

    /**
     * 触摸移动回调
     * @param event 
     */
    protected onTouchMove(event: cc.Event.EventTouch) {
        if (!this.enabled) {
            return;
        }
        if (!this.dragOffset) {
            return;
        }
        // 触摸位置
        let touchPosInWorld = event.getLocation();
        const touchPosInNode = this.node.getParent().convertToNodeSpaceAR(touchPosInWorld);

        // 触摸移动距离（判断是否触发拖拽）
        if (!this.isDragging && this.dragThreshold !== 0) {
            const distance = cc.Vec2.distance(this.touchStartPos, touchPosInWorld);
            if (distance < this.dragThreshold) {
                return;
            }
            // 重新计算中心偏移
            this.dragOffset = this.node.convertToNodeSpaceAR(event.getLocation());//touchPosInNode.sub(this.node.getPosition());
        }
        this.node.setPosition(touchPosInNode.sub(this.dragOffset));

        // 触发回调
        if (!this.isDragging) {
            this.isDragging = true;
            this.onDrgaStart();
            this.dragOffset = this.node.convertToNodeSpaceAR(event.getLocation());
        } else {
            this.onDragMove();
        }
    }

    /**
     * 触摸取消回调
     * @param event 
     */
    protected onTouchCancel(event: cc.Event.EventTouch) {
        this.onTouchEnd(event);
    }

    /**
     * 触摸结束回调
     * @param event 
     */
    protected onTouchEnd(event: cc.Event.EventTouch) {
        GameControl.getInstance().moveingTurret = null;
        GlobalEventMgr.getInstance().emit(GlobalEventID.hide_block_tips);
        if (!this.enabled) {
            return;
        }
        if (!this.dragOffset) {
            return;
        }
        // 重置标志
        this.touchStartPos = null;
        this.dragOffset = null;
        // 触发回调
        if (this.isDragging) {
            this.isDragging = false;
            this.onDragEnd();
        }
    }

    protected onDrgaStart() {
        this.node['rParent'] = this.node.parent;
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DRAG_START, this.node);
    }

    protected onDragEnd() {
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DRAG_END, this.node);
    }

    protected onDragMove() {
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DRAG_MOVE, this.node);
    }

    protected update(dt: number): void {
        if (this.node['_touchListener'] && !this.node['_touchListener']['_node']) {
            this.resetEvent();
        }
        if (this.node['_touchListener'] && !this.node['_touchListener']['_node']) {
            console.warn("!this.node['_touchListener']['_node']");
            debugger;
        }
    }
}
