

import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";

import AdapterMgr from "../../TRFrameWork/UIFrame/AdapterMgr";
import ToastMgr from "../../TRFrameWork/UIFrame/ToastMgr";
import { UIToast } from "../../TRFrameWork/UIFrame/UIForm";
import GameTutoialData, { TutoialEnum } from "../Data/GameTutoislData";

const { ccclass, property } = cc._decorator;


export enum eTutorialType {
    MoveTo = 1,
    Click = 2,
    Click_unFocus,
    FocusNode,
    FocusNode_unClick,
}

export type TutorialParams = {
    // endWPos: cc.Vec3,
    endTarget: cc.Node,
    target: cc.Node,   // 
    text?: string,
    extHight?: number,
    bgOpacity?: number,
    blockTime?: number,

    tType: eTutorialType,
    /**回调函数 */
    callFunc?: Function,
    /**回调函数this指向 */
    callFuncTarget?,
    /**主引导id */
    mainTutoialId?: TutoialEnum,
    /**子引导id */
    subTutoialId?: number,
    /**完成引导标志 */
    finishMainTutoial?: boolean,
    blockInput?: boolean, // 是否屏蔽输入
    /**是否聚焦 */
    isFocus?: boolean,
    addWidth?: number,
    addheight?: number

}

const tTagTween = 19999; // 动画tag

const HANG_MAX = 8;
@ccclass
export default class TutorialUI extends UIToast {
    @property(cc.Node)
    newParent: cc.Node = null;

    @property(cc.Node)
    fRoot: cc.Node = null;

    @property(cc.Node)
    fingerNode: cc.Node = null;

    @property(cc.Node)
    clickNode: cc.Node = null;

    // @property(cc.Node)
    // totalNode: cc.Node = null;

    @property(cc.Node)
    tipTextBack: cc.Node = null;

    @property(cc.Label)
    tipText: cc.Label = null;




    private _parm: TutorialParams = null;
    private oldParent: cc.Node = null;

    protected _runTime: number = 0;
    protected _showClick: boolean = false;

    public onInit(params: any): void {
        this.setBlockInput(true);
        super.onInit(params);
        this.fingerNode.active = false;
        this.clickNode.active = false;

        this.node.on("guideMaskLayerClick", this.onMaskClick, this);
    }



    public setBlockInput(block: boolean) {
        if (!this._blocker) {
            let node = new cc.Node('block_input_events');
            this._blocker = node.addComponent(cc.BlockInputEvents);
            this._blocker.node.setContentSize(AdapterMgr.getInstance().visibleSize);
            this.node.addChild(this._blocker.node, cc.macro.MIN_ZINDEX);
        }
        this._blocker.node.active = block;
    }

    public onShow(params: any): void {
        super.onShow(params);
        this.newParent.active = false;

        this.tipTextBack.y = 0;
        let fParams: TutorialParams = params as TutorialParams;
        this._parm = fParams;
        if (!fParams) {
            this.closeThisToast();
            return;
        }

        if (fParams.blockInput) {
            this.setBlockInput(true);
        } else {
            this.setBlockInput(false);
        }

        switch (fParams.tType) {
            case eTutorialType.MoveTo:
                this.showMoveTo();
                break;
            case eTutorialType.Click:
                if (fParams.isFocus) {
                    this.showFocusNode();
                }
                this.resetTargetParent();
                this.showClick();
                this._showClick = true;

                let sPos = this.tipTextBack.parent.convertToNodeSpaceAR(this._parm.target.parent.convertToWorldSpaceAR(this._parm.target.position));
                this.tipTextBack.y = sPos.y + 270;
                let x = (sPos.x < 0) ? sPos.x + 150 : sPos.x - 100;
                x = Math.max(-150, x);
                x = Math.min(150, x);
                this.tipTextBack.x = x;
                break;
            case eTutorialType.Click_unFocus:
                this.showClick();
                break;
            case eTutorialType.FocusNode:
                this.showFocusNode();
                this._showClick = true;
                break;
            case eTutorialType.FocusNode_unClick:
                this.showFocusNode();
                this._showClick = false;
                break;
            default:
                break;
        }
    }

    resetTargetParent() {
        this.oldParent = this._parm.target.parent;
        this.newParent.active = true;
        this.newParent.removeAllChildren();
        let newPos = this.newParent.convertToNodeSpaceAR(this._parm.target.parent.convertToWorldSpaceAR(this._parm.target.position));
        let node = cc.instantiate(this._parm.target);
        this.newParent.addChild(node);
        node.position = newPos;
        node.getComponent(ButtonPlus).addClick(this.onClick, this)
    }

    onClick() {
        if (this._parm?.callFunc) {
            this._parm.callFunc.bind(this._parm.callFuncTarget)();
        }

        if (this._parm?.finishMainTutoial) {
            GameTutoialData.getInstance().addFinishedTutoial(this._parm?.mainTutoialId)
        } else {
            if (this._parm?.mainTutoialId && this._parm?.subTutoialId >= 0) {
                GameTutoialData.getInstance().addSubTemporaryGuideId(this._parm?.mainTutoialId, this._parm?.subTutoialId);
            }
        }

        ToastMgr.close(this, null)
    }

    // 
    protected showMoveTo(): void {
        if (!cc.isValid(this._parm.target) || !cc.isValid(this._parm.target.parent)) {
            this.closeThisToast();
            return;
        }

        let sPos = this.fingerNode.parent.convertToNodeSpaceAR(this._parm.target.parent.convertToWorldSpaceAR(this._parm.target.position));
        let ePos = this.fingerNode.parent.convertToNodeSpaceAR(this._parm.endTarget.parent.convertToWorldSpaceAR(this._parm.endTarget.position));
        // this.fingerNode.active = true;
        // this.fingerNode.position = sPos;
        cc.Tween.stopAllByTarget(this.fingerNode);
        let mTime = Math.max(cc.Vec2.distance(sPos, ePos) / 500, 0.8);
        cc.tween(this.fingerNode)
            .set({ active: true, position: sPos })
            .to(mTime, { position: ePos }).call(() => {
                this.fingerNode.active = false
                this.scheduleOnce(this.showMoveTo, 1);
            }).tag(tTagTween)
            .start();
    }

    protected showClick() {
        this.clickNode.active = true;
        let sPos = this.clickNode.parent.convertToNodeSpaceAR(this._parm.target.parent.convertToWorldSpaceAR(this._parm.target.position));
        cc.Tween.stopAllByTarget(this.clickNode);
        cc.tween(this.clickNode)
            .sequence(
                cc.tween().set({ position: cc.v3(sPos.x, sPos.y + 20, 0), active: true }),
                cc.moveTo(0.5, cc.v2(sPos.x, sPos.y + 70)),
                cc.moveTo(0.5, cc.v2(sPos.x, sPos.y + 20)),
            )
            .repeatForever()
            .start();
    }

    protected showFocusNode() {
        let node = this._parm.target;
        let extHight = this._parm.extHight || 8;
        let text = this._parm.text || '';
        let bgOpacity = this._parm.bgOpacity || 120;

        //  this.maskLayer.initStencil(node, extHight, bgOpacity, this._parm?.addWidth, this._parm?.addheight);
        let hang = Math.ceil(text.length / HANG_MAX);
        let textCombine = '';
        let tmepText = text;
        this._runTime = 0;
        // this.cb = callbacks;
        // this.followNode = node;
        if (hang == 1) {
            textCombine = text;
            this.tipText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        }
        else {
            textCombine = text.slice(0, HANG_MAX) + '\n';
            tmepText = text.slice(HANG_MAX);
            this.tipText.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        }
        for (let i = 0; i < hang - 1; i++) {
            let end = (i + 1) * HANG_MAX;
            if (end > tmepText.length) { end = tmepText.length; }
            textCombine += tmepText.slice(i * HANG_MAX, end);
            if (i != hang - 2) { textCombine += '\n'; }
        }

        if (this._parm.target == null) {
            // this.totalNode.setPosition(cc.v2(0, 300));
            // this.totalNode.active = true;
            return;
        }

        this.tipTextBack.active = false;
        if (text && text.length > 0) {
            // this.tipTextBack.active = true;
            // this._showTxt = true;
            this.tipText.string = textCombine;
            if (hang == 1) {
                this.tipTextBack.width = (text.length + 2) * this.tipText.fontSize;
            }
            else {
                this.tipTextBack.width = (HANG_MAX + 2) * this.tipText.fontSize;
                this.tipTextBack.height = (hang + 2) * this.tipText.fontSize;
            }
        } else {
            // this.tipTextBack.active = false;
            // this._showTxt = false;
        }

        this.scheduleOnce(() => {
            this.tipTextBack.active = text && text.length > 0;
        }, 0.1);
        this.schedule(this.updateFocus);
        // this.showClick();
    }


    updateFocus(dt: number) {
        if (this._parm.target == null || !cc.isValid(this._parm.target) || !cc.isValid(this._parm.target.parent)) {
            return;
        }
        let node = this._parm.target;
        let pos = node.parent.convertToWorldSpaceAR(node.position);
        // let localpos = this.totalNode.parent.convertToNodeSpaceAR(pos);
        // this.totalNode.setPosition(localpos);
        // this.totalNode.active = true;

        if (this._parm.blockTime) {
            this._parm.blockTime -= dt;
        }

        let winsize = cc.winSize;
        let sPos = this.clickNode.parent.convertToNodeSpaceAR(this._parm.target.parent.convertToWorldSpaceAR(this._parm.target.position));
        if (sPos.y > winsize.height / 4) {
            this.clickNode.scaleY = -1;
            // this.tipText.node.scaleY = -1;
        }
        else {
            this.clickNode.scaleY = 1;
            // this.tipText.node.scaleY = 1;
        }

        this.clickNode.active = this._showClick;
        this._runTime += 4 * dt;

        this.clickNode.y = sPos.y + (50 + 50 * Math.sin(this._runTime)) * this.clickNode.scaleY;
        this.clickNode.x = sPos.x;
        if (this._parm.tType != eTutorialType.Click) {
            this.tipTextBack.x = 0;
        }
    }

    protected update(dt: number): void {
        if (this._parm.tType == eTutorialType.Click) {

            let node = this.newParent.children[0];
            if (cc.isValid(node) && cc.isValid(this._parm.target)) {
                let newPos = this.newParent.convertToNodeSpaceAR(this._parm.target.parent.convertToWorldSpaceAR(this._parm.target.position));

                node.position = newPos;
            }


        }
    }

    // 点击事件
    onMaskClick() {
        if (this._parm.blockTime && this._parm.blockTime > 0) {
            return;
        }
        if (this._parm.tType == eTutorialType.Click) {
            return;
        }

        if (this._parm?.callFunc) {
            this._parm.callFunc.bind(this._parm.callFuncTarget)();
            this.closeThisToast();
        }
    }

    protected closeThisToast() {
        ToastMgr.close(this, null);
    }

    public onAfterHide(params: any): void {
        cc.Tween.stopAllByTag(tTagTween);
        this.unscheduleAllCallbacks();
        super.onAfterHide(params);

        this.clickNode.active = false;
        // this.maskLayer.Hide();
    }
    // update (dt) {}
}

