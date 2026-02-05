import PlatformMgr from "../../PlatformManager";

const {ccclass, property, menu, requireComponent} = cc._decorator;

@ccclass
@requireComponent(cc.Button)
@menu("UI/ClickShareComponent")
export default class ClickShareComponent extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node.on("click", ()=>{
            PlatformMgr.instance.shareVideo();
        });
    }

    // update (dt) {}
}
