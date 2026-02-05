

import { IPoolComponent } from "../Battle/BattleBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PackageLine extends cc.Component implements IPoolComponent {

    // @property(cc.Node)
    // img : cc.Node = null;

    public NodeA: cc.Node = null;
    public NodeB: cc.Node = null;

    reuse(): void {
    }
    unuse(): void {
    }
}
