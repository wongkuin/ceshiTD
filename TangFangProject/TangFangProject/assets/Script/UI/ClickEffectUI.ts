

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import { UIFixed, UITips } from "../../TRFrameWork/UIFrame/UIForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClickEffectUI extends UITips {

    @property(cc.Prefab)
    cPrefab: cc.Prefab = null;

    private _touchStartPos: cc.Vec2 = null;

    private activeTouchId: number = null;

    private _clickSpace: number = 0.12;

    private _cdTime: number = 0;

    private _pool: cc.NodePool = new cc.NodePool();

    public onInit(params: any): void {
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node['_touchListener'].setSwallowTouches(false);
        this.unblockInputEvents();
        for (let i = 0; i < 5; i++) {
            let p = cc.instantiate(this.cPrefab)
            this._pool.put(p);
        }

        GlobalEventMgr.getInstance().on(GlobalEventID.block_InputEvents, this.blockInputEvents, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.unblock_InputEvents, this.unblockInputEvents, this);
    }

    public onShow(params: any): void {

    }

    public onTouchStart(event: cc.Event.EventTouch) {
        const touchId = event.touch.getID();
        if (this.activeTouchId !== null) {
            event.stopPropagation(); // 阻止事件继续传播
            return;
        }
        this._touchStartPos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.showClickEffect();
        this.activeTouchId = touchId;
        // console.log("onTouchStart", touchId);
    }

    public onTouchEnd(event: cc.Event.EventTouch) {
        if (event.touch.getID() === this.activeTouchId) {
            this.activeTouchId = null;
        }
    }

    public onTouchMove(event: cc.Event.EventTouch) {
        if (event.touch.getID() === this.activeTouchId) {
            this._touchStartPos = this.node.convertToNodeSpaceAR(event.getLocation());
        }
    }

    update(dt) {
        if (this.activeTouchId !== null) {
            this._cdTime += dt;
            if (this._cdTime >= this._clickSpace) {
                this.showClickEffect();
            }
        }
    }

    protected blockInputEvents() {
        this.node['_touchListener'].setSwallowTouches(true);
    }

    protected unblockInputEvents() {
        this.node['_touchListener'].setSwallowTouches(false);
    }


    showClickEffect() {
        let p = this._pool.get();
        if (!p) {
            p = cc.instantiate(this.cPrefab);
        }
        p.parent = this.node;
        p.setPosition(this._touchStartPos);
        for (const element of p.getComponentsInChildren(cc.ParticleSystem)) {
            element.resetSystem();
        };
        cc.tween(p).delay(0.5).call(() => {
            this._pool.put(p);
        }).start();
        this._cdTime = 0;
    }

}
