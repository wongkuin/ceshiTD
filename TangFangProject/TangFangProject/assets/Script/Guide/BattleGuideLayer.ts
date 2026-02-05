import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import GameControl from "../Battle/GameControl";
import TurretBaseUI from "../Battle/TurretBaseUI";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleGuideLayer extends cc.Component {

    @property({ type: cc.Node, tooltip: "遮罩" })
    stencil: cc.Node = null;

    @property({ type: cc.Node, tooltip: "手指" })
    fingerNode: cc.Node = null;

    @property({ type: cc.Layout, tooltip: "layout" })
    layout: cc.Layout = null;

    @property({ type: cc.RichText, tooltip: "文本" })
    tips: cc.RichText = null;

    @property({ type: cc.Node, tooltip: "背景" })
    bg: cc.Node = null;

    /**跟随节点 */
    followNode: cc.Node = null;
    /**结束节点 */
    endNode: cc.Node = null;

    guideIndex: number = -1;
    gameCamera: cc.Camera = null;

    extHight: number;
    bStop = false;

    followTwoCameras: boolean = false;
    endTowCameras: boolean = false;
    isMust: boolean = true;
    onLoad() {
        this.init();
    }

    setGameCamera(camera: cc.Camera) {
        this.gameCamera = camera;
    }

    getWposBetweenCameras(node: cc.Node) {
        let tWpos = CocosHelper.convertBetweenCameras(node, this.gameCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera),);
        return tWpos;
    }

    getWpos(node: cc.Node, twoCameras: boolean) {
        if (!cc.isValid(node) || !cc.isValid(node.parent)) {
            return cc.v3()
        }
        if (twoCameras) {
            return this.getWposBetweenCameras(node);
        } else {
            return node.parent.convertToWorldSpaceAR(node.position)
        }
    }

    init() {
        this.node.targetOff(this);
        this.node.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            this._onMaskTouchStart(event);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);


    }

    onTouchEnd(event: cc.Event.EventTouch) {
        //  debugger;
        console.log("this.bStop", this.bStop);
        let nd = this.node as any;
        if (this.bStop) {
            GlobalEventMgr.getInstance().emit(GlobalEventID.fightGuideFail);
            // nd._touchListener.setSwallowTouches(true);
        } else {
            this._onMaskTouchEnd(event);
            const gameMap = GameControl.getInstance().sceneBattle?.gameMap;
            const lastBlock = cc.isValid(this.endNode) ? gameMap?.getLastSelectBlock() : true;
            if (lastBlock || !this.isMust) {
                nd._touchListener.setSwallowTouches(false);
                this.Hide();
                GlobalEventMgr.getInstance().emit(GlobalEventID.fightGuideSuccess);

            } else {
                // nd._touchListener.setSwallowTouches(true);
                // event.stopPropagation();
                // this.followNode.getComponent(TurretBaseUI).moveBack();
                GlobalEventMgr.getInstance().emit(GlobalEventID.fightGuideFail);

            }

        }
    }


    _onMaskTouchStart(event: cc.Event.EventTouch) {
        let pt = this.stencil.convertToNodeSpaceAR(event.getLocation());


        let rect = cc.rect(-this.stencil.width * this.followNode.anchorX, -this.stencil.height * this.followNode.anchorY, this.stencil.width, this.stencil.height);

        let nd = this.node as any;
        // 点中空洞，返回false,触摸事件继续派发
        if (rect.contains(pt) || !this.isMust) {
            nd._touchListener.setSwallowTouches(false);
            this.bStop = false;
        }
        else {
            nd._touchListener.setSwallowTouches(true);
            event.stopPropagation();
            this.bStop = true;
        }
    }




    public checkMoveInBlock() {

        let result = false;
        if (cc.isValid(this.endNode)) {
            let lPos = this.getWpos(this.followNode, this.followTwoCameras);
            let rect = this.endNode.getBoundingBox();
            let wpos = this.getWpos(this.endNode, this.endTowCameras);
            rect.x = wpos.x - this.endNode.width / 2;
            rect.y = wpos.y - this.endNode.height / 2;
            if (rect.contains(cc.v2(lPos.x, lPos.y))) {
                result = true;
            }
            return result;
        } else {
            return true;
        }


    }


    /**
     * 
     * @param guideType 引导类型
     * @param guideIndex 引导id
     * @param followNode 引导节点
     * @param endNode  结束节点，点击类型不存在这个参数
     */
    startGuide(guideIndex: number, followNode: cc.Node, followTwoCameras: boolean, endNode?: cc.Node, endTwoCameras: boolean = false,
        tips?: string, tipsPos?: cc.Vec3, isMust?: boolean, realRichText?: number[]) {


        // console.error("pos:", followNode.x, followNode.y)
        this.followTwoCameras = followTwoCameras;

        this.endNode = endNode;
        this.endTowCameras = endTwoCameras;
        this.extHight = 0;
        this.followNode = followNode;
        this.guideIndex = guideIndex;
        this.layout.node.parent.active = tips ? true : false;
        this.isMust = isMust;
        // console.warn(tips)
        if (tips) {
            this.tips.string = tips;
            this.scheduleOnce(() => {
                this.layout.updateLayout();
            })
        }
        if (tips) this.typeText(tips, 0.15 * (tips?.length || 1), realRichText);

        if (!cc.isValid(this.endNode)) {
            this.bg.opacity = 155;
        } else {
            this.bg.opacity = 0;
        }

        if (!isMust) {
            this.bg.opacity = 0;
        }

        if (tipsPos) {
            this.tips.node.parent.setPosition(tipsPos);
        } else {
            this.tips.node.parent.setPosition(141, -114);
        }
        this.node.active = true;
        this.bStop = false;

        this.initStencil(followNode, 0)
        this.playFingerAni();

        this.scheduleOnce(() => {
            this.bStop = true;
        }, 0.5);
    }

    private _typingTween: any = null;

    // 使用 Tween 实现打字效果
    typeText(text: string, duration: number = 1, realRichText: number[] = []) {
        if (this._typingTween) {
            this._typingTween.stop();
        }

        this.tips.string = '';
        const chars = text.split('');
        const charCount = chars.length;
        const interval = duration / charCount;
        this.node.active = false;
        let tempString = '', count = -1;
        this._typingTween = cc.tween(this.tips.node)
            .call(() => {
                this.tips.string = '';
                tempString = '';
            })
            .repeat(charCount,
                cc.tween()
                    .delay(interval)
                    .call(() => {
                        if (++count < charCount) {
                            if (realRichText.indexOf(count) >= 0)
                                tempString += CommonUtils.addOutline(`<color=#2EFF00>${chars[count]}</color>`, 2, '#000000')
                            else
                                tempString += chars[count];

                            this.tips.string = tempString;
                        }
                    })
            )
            .call(() => {
                this.layout.updateLayout();
            })
            .start();
        this.node.active = true;
    }

    playFingerAni() {
        cc.Tween.stopAllByTarget(this.fingerNode);
        let startPos = this.fingerNode.parent.convertToNodeSpaceAR(this.getWpos(this.followNode, this.followTwoCameras));
        let endPos = cc.v3();
        if (cc.isValid(this.endNode)) {
            endPos = this.fingerNode.parent.convertToNodeSpaceAR(this.getWpos(this.endNode, this.endTowCameras));
        }

        this.fingerNode.angle = -45;
        this.fingerNode.setPosition(startPos)
        if (cc.isValid(this.endNode)) {
            let select = this.endNode.parent?.getChildByName("Select1") || this.endNode;
            if (cc.isValid(select)) {
                select.active = true;
                cc.tween(select).to(1, { scale: 1.25 }).to(1, { scale: 1 }).union().repeatForever().start();
            }
            cc.tween(this.fingerNode)
                .to(2, { position: endPos })
                .call(() => {
                    this.fingerNode.setPosition(startPos)
                }).union()
                .repeatForever()
                .start();
        } else {
            this.fingerNode.angle = 0;
            this.fingerNode.setPosition(startPos)
            cc.tween(this.fingerNode)
                .to(2, { y: startPos.y + 100 })
                .to(2, { y: startPos.y + 20 })
                .union()
                .repeatForever()
                .start();
        }

    }

    _onMaskTouchEnd(event: cc.Event.EventTouch) {
        // 点击中了空洞
        console.log('click sucess');
        // this.Hide();
    }

    Hide() {
        this.node.active = false;
        let select = this.endNode?.parent?.getChildByName("Select1") || this.endNode;
        if (cc.isValid(select)) {
            cc.Tween.stopAllByTarget(select)
            select.active = false;
        }
    }

    initStencil(node: cc.Node, extHight: number) {

        if (node == null) {
            this.followNode = null;
            this.stencil.width = 210;
            this.stencil.height = 210;
            this.stencil.setPosition(cc.v2(0, 300));
            this.stencil.active = true;

            this.init();
            return;
        }
        this.followNode = node;
        let contentSize = node.getContentSize();
        this.stencil.width = contentSize.width * node.scaleX + 20;
        this.stencil.height = contentSize.height * node.scaleX + 20 + extHight;
        this.stencil.setAnchorPoint(this.followNode.anchorX, this.followNode.anchorY);
        this.extHight = extHight;
        this.stencil.active = false;
        this.scheduleOnce(() => {
            this.stencil.active = true;
        })


        this.init();
    }

    update() {
        // 跟随目标已经消失 被销毁
        if (cc.isValid(this.followNode) === false || !cc.isValid(this.followNode.parent)) { return; }

        let node = this.followNode;
        let pos = node.parent.convertToWorldSpaceAR(node.position);
        let localpos = this.stencil.parent.convertToNodeSpaceAR(pos);
        this.stencil.setPosition(cc.v2(localpos.x, localpos.y + this.extHight / 2));

        this.followNode = node;
        this.stencil.active = true;
    }


}