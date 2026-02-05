
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { GameObjectType } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";
import UISceneBattleBase from "../UI/UISceneBattleBase";
import GameControl from "./GameControl";


const { ccclass, property } = cc._decorator;


// 对象池组件接口
export interface IPoolComponent {
    reuse(): void;
    unuse(): void;
}


@ccclass
export default class BattleBase extends cc.Component {

    protected get _battleScene(): UISceneBattleBase {
        return GameControl.getInstance().sceneBattle;
    }; // 战斗场景
    // protected _shootBag: ShootBagUI[] = []; // 发射包
    protected _qtShapes: QTShape[] = [];


    protected onLoad(): void {
    }

    protected start(): void {
    }

    public doUpdate(dt: number): void {
        this.resetQTPos();
    }

    protected delQTShape(): void {
        for (const element of this._qtShapes) {
            element.destroy();
        }
        this._qtShapes = [];
    }

    protected resetQTPos(): void {
        for (const element of this._qtShapes) {
            element.setPosition(this.node.position.x + this.getQTOffset().x, this.node.position.y + this.getQTOffset().y);
        }
    }

    protected getQTOffset(): cc.Vec2 {
        return cc.v2(0, 0);
    }

    // 检查是否可以碰撞
    public checkCanCollision(sTag: GameObjectType, oTag: GameObjectType): boolean {
        return GameHelp.getInstance().checkCanCollision(sTag, oTag);
    }


    protected onDestroy(): void {

    }

}
