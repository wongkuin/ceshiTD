

import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { QTBox } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import { GameObjectType } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";
import BattleBase from "./BattleBase";
import GameControl from "./GameControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMapTree extends BattleBase {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    shakeIntensity: number = 5;

    shakeDuration: number = 0.8;

    rotationIntensity: number = 5;

    private originalPos: cc.Vec3 = cc.v3();
    private originalAngle: number = 0;

    start() {
        this.addQTShape();

        this.originalPos = this.node.position.clone();
        this.originalAngle = this.node.angle;
    }

    // update (dt) {}


    protected addQTShape(): void {
        let boxW = this.node.width;
        let boxH = this.node.height;
        let qtBox = new QTBox(-boxW / 2, 0, boxW, boxH, GameObjectType.Tree);
        qtBox.node = this.node;
        qtBox.setPosition(this.node.x, this.node.y);
        this._qtShapes.push(qtBox);
        GameControl.getInstance().getQuadTree().insert(qtBox);
    }

    public checkTree() {
        this.checkQTCollision();
    }

    lastFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 上一帧碰撞的对象
    currentFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 当前帧碰撞的对象

    protected checkQTCollision(): void {

        if (this.lastFrameCollisions.size != 0 || this.currentFrameCollisions.size != 0) {
            this.lastFrameCollisions = this.currentFrameCollisions;
            this.currentFrameCollisions = new Set<QTShape>();
        }

        for (const element of this._qtShapes) {
            let cList = GameControl.getInstance().getQuadTree().collide(element, GameHelp.getInstance().getCollisionTag(GameObjectType.Tree));
            for (const element of cList) {
                this.currentFrameCollisions.add(element);
            }
        }

        // 碰撞开始：当前帧有，上一帧没有
        this.currentFrameCollisions.forEach(other => {
            if (!this.lastFrameCollisions.has(other)) {
                this.onCollisionEnterQT(other);
            }
        });

        // 碰撞中：当前帧和上一帧均有
        // this.currentFrameCollisions.forEach(other => {
        //     if (this.lastFrameCollisions.has(other)) {
        //         // onCollisionStayQT(other);
        //     }
        // });

        // 碰撞结束：上一帧有，当前帧没有
        this.lastFrameCollisions.forEach(other => {
            if (!this.currentFrameCollisions.has(other)) {
                this.onCollisionExitQT(other);
            }
        });
    }


    // 检测碰撞
    protected onCollisionEnterQT(other: QTShape): void {
        // console.log("onCollisionEnterQT tree +++++++++++++++");
        this.shakeTree();
    }

    protected onCollisionExitQT(other: QTShape): void {
    }

    public shakeTree() {
        cc.Tween.stopAllByTarget(this.node);
        this.node.position = this.originalPos;
        this.node.angle = this.originalAngle;
        // 组合位置和旋转动画
        cc.tween(this.node)
            // 第一阶段：快速向右抖动
            .parallel(
                cc.tween().to(0.05, {
                    position: cc.v3(
                        this.originalPos.x + this.shakeIntensity,
                        this.originalPos.y,
                        0
                    )
                }),
                cc.tween().to(0.05, { angle: this.originalAngle + this.rotationIntensity })
            )
            // 第二阶段：快速向左抖动
            .parallel(
                cc.tween().to(0.05, {
                    position: cc.v3(
                        this.originalPos.x - this.shakeIntensity,
                        this.originalPos.y,
                        0
                    )
                }),
                cc.tween().to(0.05, { angle: this.originalAngle - this.rotationIntensity })
            )
            // 第三阶段：中等幅度回弹
            .parallel(
                cc.tween().to(0.08, {
                    position: cc.v3(
                        this.originalPos.x + this.shakeIntensity * 0.6,
                        this.originalPos.y,
                        0
                    )
                }),
                cc.tween().to(0.08, { angle: this.originalAngle + this.rotationIntensity * 0.6 })
            )
            // 第四阶段：小幅度回弹
            .parallel(
                cc.tween().to(0.1, {
                    position: cc.v3(
                        this.originalPos.x - this.shakeIntensity * 0.3,
                        this.originalPos.y,
                        0
                    )
                }),
                cc.tween().to(0.1, { angle: this.originalAngle - this.rotationIntensity * 0.3 })
            )
            // 最终回到原位
            .parallel(
                cc.tween().to(0.15, { position: this.originalPos }),
                cc.tween().to(0.15, { angle: this.originalAngle })
            )
            .start();
    }

}
