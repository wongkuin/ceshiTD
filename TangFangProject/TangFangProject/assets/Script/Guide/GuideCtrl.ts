import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import { UITips } from "../../TRFrameWork/UIFrame/UIForm";
import GuideMaskLayer from "./GuideMaskLayer";

const { ccclass, property } = cc._decorator;

const HANG_MAX = 8;

@ccclass
export default class GuideCtrl extends UITips {
    @property(cc.Node)
    totalNode: cc.Node = null;

    @property(cc.Node)
    tipTextBack: cc.Node = null;

    @property(cc.Label)
    tipText: cc.Label = null;

    @property(GuideMaskLayer)
    maskLayer: GuideMaskLayer = null;

    @property(cc.Node)
    bgImg: cc.Node = null;

    protected fingerNode: cc.Node = null;

    followNode: cc.Node = null;

    runTime: number = 0;

    isRepeat: boolean = false;

    private _showTxt = false;


    public onInit(params: any): void {
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        this.fingerNode = this.totalNode.getChildByName('finger')
        this.totalNode.zIndex = 10;
    }

    /**
     * 
     * @param node 需要引导的节点
     * @param text  引导文本
     * @param extHight  扩展高度
     * @param callbacks 
     * @returns 
     */
    public ShowGuide(node: cc.Node, text: string, txtPos?: cc.Vec2, extHight: number = 0, bgOpacity?: number) {
        this.runTime = 0;
        this.maskLayer.initStencil(node, extHight);
        let hang = Math.ceil(text.length / HANG_MAX);
        let textCombine = '';
        let tmepText = text;
        this.tipTextBack.active = !!text?.length;
        // this.cb = callbacks;
        this.followNode = node;
        if (hang == 1) {
            textCombine = text;
            this.tipText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        }
        else {
            textCombine = text.slice(0, HANG_MAX) + '\n';
            tmepText = text.slice(HANG_MAX);
            this.tipText.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        }
        if (text)
            for (let i = 0; i < hang - 1; i++) {
                let end = (i + 1) * HANG_MAX;
                if (end > tmepText.length) { end = tmepText.length; }
                textCombine += tmepText.slice(i * HANG_MAX, end);
                if (i != hang - 2) { textCombine += '\n'; }
            }

        this.bgImg.opacity = bgOpacity || 120;

        if (this.followNode == null) {
            // this.totalNode.setPosition(cc.v2(0, 300));
            // this.totalNode.active = true;
            return;
        }

        this.tipTextBack.active = false;
        if (text && text.length > 0) {
            // this.tipTextBack.active = true;
            this._showTxt = true;
            this.tipText.string = textCombine;
            // if (hang == 1) {
            //     this.tipTextBack.width = (text.length + 2) * this.tipText.fontSize;
            // }
            // else {
            //     this.tipTextBack.width = (HANG_MAX + 2) * this.tipText.fontSize;
            //     this.tipTextBack.height = (hang + 2) * this.tipText.fontSize;
            // }
        } else {
            // this.tipTextBack.active = false;
            this._showTxt = false;
        }

        this.scheduleOnce(() => {
            this.tipTextBack.active = this._showTxt;
        }, 0.1);
    }


    update(dt: number) {
        if (this.followNode == null || !cc.isValid(this.followNode) || !cc.isValid(this.followNode.parent)) {
            return;
        }
        let node = this.followNode;
        let pos = node.parent.convertToWorldSpaceAR(node.position);
        let localpos = this.totalNode.parent.convertToNodeSpaceAR(pos);
        this.totalNode.setPosition(localpos);
        this.totalNode.active = true;

        let winsize = cc.winSize;
        if (localpos.y > winsize.height / 4) {
            this.totalNode.scaleY = -1;
            this.tipText.node.scaleY = -1;
        }
        else {
            this.totalNode.scaleY = 1;
            this.tipText.node.scaleY = 1;
        }

        this.fingerNode.active = true;
        this.runTime += 4 * dt;
        this.fingerNode.y = 50 + 50 * Math.sin(this.runTime);

        // if (localpos.x > (winsize.width / 2 - this.tipTextBack.width / 2)) {
        //     this.tipTextBack.x = winsize.width / 2 - this.tipTextBack.width / 2 - localpos.x;
        // }
        // else if (localpos.x < (-winsize.width / 2 + this.tipTextBack.width / 2)) {
        //     this.tipTextBack.x = -winsize.width / 2 + this.tipTextBack.width / 2 - localpos.x;
        // }
        // else {
        //     this.tipTextBack.x = 0;
        // }

        // if (localpos.y > (winsize.height / 2 - this.tipTextBack.height / 2)) {
        //     this.tipTextBack.y = winsize.height / 2 - this.tipTextBack.height / 2 - localpos.y;
        // }
        // else if (localpos.y < (-winsize.height / 2 + this.tipTextBack.height / 2)) {
        //     this.tipTextBack.y = -winsize.height / 2 + this.tipTextBack.height / 2 - localpos.y;

        // } else {
        //     this.tipTextBack.y = 0;
        // }

    }
}