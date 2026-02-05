
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import GuideMaskLayer from "./GuideMaskLayer";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GuideCompRepreat extends cc.Component {


    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onTouchEnd(event: cc.Event.EventTouch): void {
        GlobalEventMgr.getInstance().emit(GlobalEventID.GuideEnd, this.node);
    }
}