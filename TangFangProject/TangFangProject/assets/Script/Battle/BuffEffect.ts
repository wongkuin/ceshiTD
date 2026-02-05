

import BulletEffect from "./BulletEffect";
import GameResLoad from "./GameResLoad";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BuffEffect extends BulletEffect {
    // buff 效果展示

    protected onLoad(): void {
        super.onLoad();
        // add test 
        //this.addTest();
    }

    protected addTest(): void {
        let nNode = new cc.Node();
        let sp = nNode.addComponent(cc.Label);
        sp.string = this.node.name;
        sp.fontSize = 20;
        nNode.color = cc.Color.RED;
        this.node.addChild(nNode);
    }

    reuse(): void {
        super.reuse();
    }

    unuse(): void {
        super.unuse();
        this.node.scale = 1;

    }
    // update (dt) {}


}
