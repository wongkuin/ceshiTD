

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimEndExt extends cc.Component {


    // update (dt) {}

    endAnim() {
        this.node.dispatchEvent(new cc.Event.EventCustom('animEnd', true));
    }
}
