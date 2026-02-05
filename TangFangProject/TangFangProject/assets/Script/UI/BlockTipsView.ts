

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import GameHelp from "../Mgr/GameHelp";

// import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
// import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
// import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
// import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
// import { TurretInfo } from "../config/DataInfo";
// import GameHelp from "../Mgr/GameHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockTipsView extends cc.Component {

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property(cc.RichText)
    tipText: cc.RichText = null;

    @property(cc.Layout)
    layout: cc.Layout = null;

    @property(cc.Node)
    tipBG: cc.Node = null;




    //     protected _hasShowID: number[] = []; //已经显示过的ID

    //     protected onLoad(): void {
    //         AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node); //适配
    //     }

    protected start(): void {
        // this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node['_touchListener'].setSwallowTouches(false); //设置吞噬事件
        GlobalEventMgr.getInstance().on(GlobalEventID.show_block_tips, this.showBlockTips, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.hide_block_tips, this.hideTips, this);
        this.tipNode.active = false;
    }

    public showVagetTips(vData: string, wPos: cc.Vec3): void {
        // if (this._hasShowID.indexOf(vData.data.id) >= 0) return;
        // this._hasShowID.push(vData.data.id);

        // this.unschedule(this.hideTips);
        // let vInfo: TurretDataInfo = vData;
        // let nPos = this.node.convertToNodeSpaceAR(wPos);
        this.tipNode.active = true;
        // this.tipNode.setPosition(nPos);
        this.tipText.string = CommonUtils.addOutline(GameHelp.replaceColorStr(vData), 2, '#000000');
        this.layout.updateLayout();
        this.scheduleOnce(() => {
            this.tipBG.width = this.layout.node.width;
            this.tipBG.height = this.layout.node.height;
        })
        // this.tipBG.width = this.tipText.node.width + 40;

        // if (this.tipNode.x - this.tipBG.width / 2 < -this.node.width / 2) {
        //     this.tipBG.x = this.tipBG.width / 2 + 10 - this.node.width / 2 - this.tipNode.x;
        // } else if (this.tipNode.x + this.tipBG.width / 2 > this.node.width / 2) {
        //     this.tipBG.x = this.node.width / 2 - this.tipNode.x - this.tipBG.width / 2 - 10;
        // } else {
        //     this.tipBG.x = 0;
        // }

        // this.tipNode.runAction(cc.fadeIn(0.5));
        // this.scheduleOnce(this.hideTips, 5);
    }

    protected showBlockTips(data: any): void {
        // { data: this.getTurretNode().getShootInfo() as VegetableDataInfo, wPos: this.getTipWPos() }
        // console.log("showBlockTips", data);
        if (!data) return;
        if (!data.msg) return;
        this.showVagetTips(data.msg, data.wPos);
    }

    //     protected onTouchStart(event: cc.Event.EventTouch): void {
    //         this.hideTips();
    //     }

    protected hideTips(): void {
        // this.unschedule(this.hideTips);
        this.tipNode.active = false;
    }
    //     // update (dt) {}
}
