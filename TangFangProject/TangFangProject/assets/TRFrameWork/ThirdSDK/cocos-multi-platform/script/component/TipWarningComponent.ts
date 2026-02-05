import PlatformMgr, { PlatformEvent } from "../../PlatformManager";
import FloatingTipComponent from "./FloatingTipComponent";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("UI/TipWarningComponent")
export default class TipWarningComponent extends cc.Component {

    public static instance: TipWarningComponent;

    @property(cc.Prefab)
    preFloatingTip: cc.Prefab = null;

    @property(cc.Prefab)
    preLoading: cc.Prefab = null;

    @property
    viewGroup: string = "default";

    @property
    viewZindex: number = 2;

    private floatingTip: FloatingTipComponent;
    private loadingView: cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        TipWarningComponent.instance = this;

        PlatformMgr.instance.on(PlatformEvent.ShareErr, this.onFloatingTip, this);
        PlatformMgr.instance.on(PlatformEvent.VideoErr, this.onFloatingTip, this);
        PlatformMgr.instance.on(PlatformEvent.VideoShowOver, this.onVideoOver, this);
        PlatformMgr.instance.on(PlatformEvent.VideoShowing, this.onVideoShowing, this);
    }

    start () {
        
    }

    onFloatingTip(tip: string)
    {
        this.showTip(tip);
    }

    onVideoShowing()
    {
        this.showLoading(true);
    }

    onVideoOver()
    {
        this.showLoading(false);
    }

    showTip(content: string)
    {
        if (!this.floatingTip || !this.floatingTip.isValid)
        {        
            let node = cc.instantiate(this.preFloatingTip);
            node.group = this.viewGroup;
            node.zIndex = this.viewZindex;
            node.parent = cc.director.getScene().getChildByName("Canvas");
            this.floatingTip = node.getComponent(FloatingTipComponent);
        }
        this.floatingTip.node.parent = cc.Canvas.instance.node.getChildByName("layer_Bottom").getChildByName("main");
        this.floatingTip.node.zIndex = cc.macro.MAX_ZINDEX;
        this.floatingTip.show(content);
    }

    showLoading(enable: boolean)
    {
        if (!this.loadingView || !this.loadingView.isValid)
        {
            this.loadingView = cc.instantiate(this.preLoading);
            this.loadingView.group = this.viewGroup;
            this.loadingView.zIndex = this.viewZindex;
            this.loadingView.parent = cc.director.getScene().getChildByName("Canvas");
        }
        else
            this.loadingView.active = enable;
    }

}
