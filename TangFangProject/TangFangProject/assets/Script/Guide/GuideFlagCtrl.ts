import GuideMaskLayer from "./GuideMaskLayer";

const { ccclass, property } = cc._decorator;

const HANG_MAX = 8;

@ccclass
export default class GuideFlagCtrl extends cc.Component {
    @property(cc.Node)
    totalNode: cc.Node = null;

    @property(cc.Node)
    tipTextBack: cc.Node = null;

    @property(cc.Label)
    tipText: cc.Label = null;

    @property(cc.Node)
    bgImg: cc.Node = null;

    protected fingerNode: cc.Node = null;


    // followNode: cc.Node = null;

    runTime: number = 0;

    private _txtPos: cc.Vec2 = cc.v2(0, 0);

    private _showTxt: boolean = false;



    protected onLoad(): void {
        this.fingerNode = this.node.getChildByName('finger')
        // this.totalNode.zIndex = 10;
    }


    /**
     * 
     * @param node 需要引导的节点
     * @param text  引导文本
     * @param extHight  扩展高度
     * @param callbacks 
     * @returns 
     */
    public ShowGuide(text: string, startPos: cc.Vec2, endPos: cc.Vec2, bgOpacity?: number, txtPos: cc.Vec2 = cc.v2(0, 0)) {

        this.runTime = 0;
        let hang = Math.ceil(text.length / HANG_MAX);
        let textCombine = '';
        let tmepText = text;
        this._txtPos = txtPos;

        // this.cb = callbacks;
        // this.followNode = node;
        if (hang == 1) {
            textCombine = text;
            this.tipText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        }
        else {
            textCombine = text.slice(0, HANG_MAX - 2) + '\n';
            tmepText = text.slice(HANG_MAX - 2);
            this.tipText.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        }
        for (let i = 0; i < hang - 1; i++) {
            let end = (i + 1) * HANG_MAX;
            if (end > tmepText.length) { end = tmepText.length; }
            textCombine += tmepText.slice(i * HANG_MAX, end);
            if (i != hang - 2) { textCombine += '\n'; }
        }

        this.bgImg.opacity = bgOpacity || 120;

        this.tipTextBack.active = false;
        if (text && text.length > 0) {
            // this.tipTextBack.active = true;
            this._showTxt = true;
            this.tipText.string = textCombine;
            if (hang == 1) {
                this.tipTextBack.width = (text.length + 2) * this.tipText.fontSize;
            }
            else {
                this.tipTextBack.width = (HANG_MAX + 2) * this.tipText.fontSize;
                this.tipTextBack.height = (hang + 2) * this.tipText.fontSize;
            }
        } else {
            this._showTxt = false;
        }

        this.fingerNode.active = false;
        this.scheduleOnce(() => {
            let sPos = this.fingerNode.parent.convertToNodeSpaceAR(startPos);
            let ePos = this.fingerNode.parent.convertToNodeSpaceAR(endPos);
            this.fingerNode.active = true;
            this.tipTextBack.active = this._showTxt;
            this.fingerNode.setPosition(sPos);


            let mt = cc.moveTo(1, cc.v2(ePos.x, ePos.y))
            let call = cc.callFunc(() => {
                this.fingerNode.setPosition(sPos);
            })
            cc.tween(this.fingerNode)
                .repeatForever(cc.sequence(mt, call)).start()
        }, 0.1
        )

    }


    update(dt: number) {
        // if (this.followNode == null) {
        //     return;
        // }
        // let node = this.followNode;
        // let pos = node.parent.convertToWorldSpaceAR(node.position);

        let localpos = this._txtPos;//cc.v2(0, 0) //this.totalNode.parent.convertToNodeSpaceAR(pos);
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

        this.runTime += 4 * dt;
        // this.fingerNode.y = 50 + 50 * Math.sin(this.runTime);

        if (localpos.x > (winsize.width / 2 - this.tipTextBack.width / 2)) {
            this.tipTextBack.x = winsize.width / 2 - this.tipTextBack.width / 2 - localpos.x;
        }
        else if (localpos.x < (-winsize.width / 2 + this.tipTextBack.width / 2)) {
            this.tipTextBack.x = -winsize.width / 2 + this.tipTextBack.width / 2 - localpos.x;
        }
        else {
            this.tipTextBack.x = 0;
        }


    }
}