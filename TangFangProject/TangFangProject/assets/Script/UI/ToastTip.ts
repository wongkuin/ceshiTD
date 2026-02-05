

import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { ECloseType } from "../../TRFrameWork/UIFrame/Struct";
import ToastMgr from "../../TRFrameWork/UIFrame/ToastMgr";
import { UIToast } from "../../TRFrameWork/UIFrame/UIForm";
import { WidgetType } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastTip extends UIToast {

    @property(cc.Label)
    msg: cc.Label = null;

    @property(cc.RichText)
    msgRichText: cc.RichText = null;

    @property(cc.Node)
    root: cc.Node = null;

    public onInit(params: any): void {
        super.onInit(params);
    }

    public onShow(params: any): void {
        super.onShow(params);
        this.node.position = cc.v3(0, 0, 0);
        // console.warn(params.msg);
        let string = CommonUtils.addOutline(GameHelp.replaceColorStr(params.msg), 3, '#000000');
        this.msgRichText.string = string;
        this.msg.node.active = false;
        this.doShow(params.duration, params?.widget);
    }

    public doShow(duration = 1, widgetType: WidgetType = WidgetType.Center): void {
        this.root.opacity = 0;
        let allChildren = []
        this.node.parent.children.forEach((node) => {
            if (node.active && node.name == "ToastTip" && node != this.node) {
                allChildren.push(node);
            }
        })
        let initY = 120;
        if (widgetType == WidgetType.Top) {
            initY = cc.view.getVisibleSize().height / 2 - 200;
        } else if (widgetType == WidgetType.Bottom) {
            initY = -cc.view.getVisibleSize().height / 2 + 100;
        }
        let lastY = allChildren.length > 0 ? allChildren[0].getChildByName("root").y : initY;
        allChildren.forEach((node) => {
            let y = node.getChildByName("root").y;
            if (lastY > y) {
                lastY = y;
            }
        })
        console.log("lastY", lastY);

        allChildren.forEach((node) => {
            cc.tween(node.getChildByName("root"))
                .by(0.5, { y: 100 })
                .start();

        })
        this.root.y = lastY - 60;

        this.scheduleOnce(() => {
            const labHeight = this.msg.node.height;
            const height = labHeight + 20;
            this.root.height = height;
            cc.Tween.stopAllByTarget(this.root);

            this.root.scale = 0.5;
            this.root.opacity = 0;
            cc.tween(this.root)
                .parallel(
                    cc.tween().by(0.5, { y: height }),
                    cc.tween().to(0.5, { scale: 1, opacity: 255 }, { easing: 'backOut' })
                )
                .delay(duration)
                .to(0.2, { opacity: 50 })
                .call(() => {
                    // this.closeSelf();
                    ToastMgr.close(this, null);
                })
                .start();
        });
    }

    public use() {

    }

    public free() {
        cc.Tween.stopAllByTarget(this.root);
        this.root.y = 0;
    }
}
