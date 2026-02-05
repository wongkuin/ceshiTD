

import GlobalEventMgr from "../../cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../cocos-module/utils/GlobalEvent";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Camera)
export default class CameraHelper extends cc.Component {

    // @property(cc.Camera)
    camera: cc.Camera = null;
    orignY: number;
    orignX: number;
    orignZ: number;
    zoomScale: number = 1.2;

    private shakeAnim = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.camera = this.node.getComponent(cc.Camera);
        this.orignX = this.node.x;
        this.orignY = this.node.y;
        this.orignZ = this.camera.zoomRatio
    }

    start() {
        this.addInputEvent();
        GlobalEventMgr.getInstance().on(GlobalEventID.shakeCamera, this.shakeCamera, this);
    }


    /**
     * 聚焦坐标
     * @param pos 
     * @param dtime 
     * @param focusIng 
     * @param focusEnd 
     */
    focusPos(pos: cc.Vec2, dtime: number = 0.5, inSide: boolean = true, focusIng: Function = null, focusEnd: Function = null) {
        // this.camera.node.setPosition(pos.x, pos.y, this.camera.node.position.z);
        // console.log('moveToPos', pos.x, pos.y);
        // this.camera.zoomRatio = 1;

        let newScale = this.camera.zoomRatio * this.zoomScale;
        //
        let newPosition = new cc.Vec3();
        newPosition.x = pos.x //- (pos.x - this.orignY) * this.zoomScale;
        newPosition.y = pos.y //- (pos.y - this.orignY) * this.zoomScale;

        if (inSide) {
            let halfX = cc.winSize.width * (this.zoomScale - 1) / 2;
            let halfY = cc.winSize.height * (this.zoomScale - 1) / 2;
            newPosition.x = Math.min(Math.abs(newPosition.x), halfX) * (newPosition.x < 0 ? -1 : 1);
            newPosition.y = Math.min(Math.abs(newPosition.y), halfY) * (newPosition.y < 0 ? -1 : 1);
        }

        cc.Tween.stopAllByTarget(this.camera.node);
        let moveTo = cc.tween().to(dtime, { position: cc.v3(newPosition.x, newPosition.y, this.camera.node.position.z) });
        let moveBack = cc.tween().to(dtime, { position: cc.v3(this.orignX, this.orignY, this.camera.node.position.z) });

        let delay = cc.tween().delay(1);
        let mCall = cc.tween().call(() => {
            focusIng && focusIng();
        })
        let eCall = cc.tween().call(() => {
            focusEnd && focusEnd();
        })

        let zoomTo = cc.tween().to(0.5, { zoomRatio: newScale });
        let zoomBack = cc.tween().to(0.5, { zoomRatio: this.orignZ });

        cc.tween(this.camera.node).sequence(moveTo, mCall, delay, moveBack, eCall).start();
        cc.tween(this.camera).sequence(zoomTo, delay, zoomBack).start();
    }

    /**
     * 抖动相机
     * @param duration 
     * @param magnitude 
     */
    // 摇晃相机
    shakeCamera(duration = 0.5, magnitude = 5) {
        // 停止所有目标为 this.camera.node 的缓动动画
        // cc.Tween.stopAllByTarget(this.camera.node);
        // 将节点位置重置为原始位置
        // this.node.setPosition(this.orignX, this.orignY);
        // 如果 shakeAnim 存在，则直接返回
        if (this.shakeAnim) {
            return;
        }

        // 创建一个缓动动画，将节点位置在 duration 时间内进行抖动
        this.shakeAnim = cc.tween(this.node)
            .by(duration / 2, { position: cc.v3(magnitude, 0, 0) }) // 向右抖动
            .by(duration / 2, { position: cc.v3(-magnitude, 0, 0) }) // 向左抖动
            .by(duration / 2, { position: cc.v3(0, magnitude, 0) }) // 向上抖动
            .by(duration / 2, { position: cc.v3(0, -magnitude, 0) }) // 向下抖动
            .call(() => {
                // 抖动动画结束后，将相机位置重置为原始位置
                this.node.setPosition(this.orignX, this.orignY);
                delete this.shakeAnim; // 删除 shakeAnim 属性
            })
            .start();
    }


    // 添加键盘按下事件
    private addInputEvent() {
        // 监听键盘按下事件
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        // if (event.keyCode == cc.macro.KEY.f6) {
        //     let rX = Math.random() * 750 - 375;
        //     let rY = Math.random() * 1280 - 640;
        //     this.focusPos(cc.v2(375, 640), 0.5, false);
        //     // this.shakeCamera(0.2, 18);
        // }
    }
    // update (dt) {}
}
