

import { Bezier } from "../../TRFrameWork/cocos-module/Bezier/Tools/Bezier";
import { EaseType } from "../../TRFrameWork/cocos-module/Bezier/Tools/EaseType";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import { GameObjectType, HurtFontAnimType } from "../config/GameEnum";
import { IPoolComponent } from "./BattleBase";
import GameResLoad from "./GameResLoad";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HurtEffectUI extends cc.Component implements IPoolComponent {
    @property({ type: cc.Label, displayName: "伤害值" })
    hurtLab: cc.Label = null;

    @property(cc.Node)
    missNode: cc.Node = null;

    @property(cc.Node)
    criticalNode: cc.Node = null; // 暴击节点

    protected onLoad(): void {
    }

    async init(hurt: number, aType: HurtFontAnimType, isCritical: boolean, color: string, scale: number, miss: boolean) {

        // this.hurtLab.node.color = new cc.Color().fromHEX(color);
        // this.hurtLab.node.scale = scale;
        // this.hurtLab.string = hurt.toString();

        // switch (aType) {
        //     case HurtFontAnimType.Slowup:
        //         this.showSlowupAnim(isCritical, scale);
        //         break;
        //     case HurtFontAnimType.Default:
        //         this.showDefualAnim(isCritical, scale);
        //         break;
        // }

        this.criticalNode.active = false;
        this.missNode.active = false;
        this.hurtLab.node.active = false;
        this.hurtLab.node.color = new cc.Color().fromHEX(color);
        if (miss) {
            this.showMissAnim();
        } else if (isCritical) {
            this.showCriticalAnim(hurt);
        } else {
            this.showHurtAnim(hurt, aType, isCritical, scale);
        }
    }

    protected showMissAnim() {
        this.missNode.active = true;
        cc.tween(this.node)
            .set({ scale: 2.0, opacity: 0 })
            .to(0.2, { scale: 1.0, opacity: 255 })
            .delay(0.2)
            .to(0.8, { opacity: 56, position: cc.v3(this.node.x, this.node.y + 80) })
            .call(() => {
                GameResLoad.putNode(this.node);
            }).start();
    }

    protected showCriticalAnim(hurt: number) {
        this.criticalNode.active = true;
        this.hurtLab.node.active = true;
        // this.hurtLab.node.color = cc.Color.RED;
        this.hurtLab.string = hurt.toString();
        cc.tween(this.node)
            .set({ scale: 3.6, opacity: 0 })
            .to(0.2, { scale: 1.6, opacity: 255 })
            .delay(0.5)
            .to(0.8, { scale: 1.0, opacity: 56, position: cc.v3(this.node.x, this.node.y + 45) })
            .call(() => {
                GameResLoad.putNode(this.node);
            }).start();
    }

    protected showHurtAnim(hurt: number, aType: HurtFontAnimType, isCritical: boolean, scale: number) {
        this.hurtLab.node.active = true;
        // this.hurtLab.node.color = new cc.Color().fromHEX(color);
        // this.hurtLab.node.scale = scale;
        this.hurtLab.string = hurt.toString();
        cc.tween(this.node)
            .set({ scale: 0.3, opacity: 0 })
            .to(0.2, { scale: 1.0, opacity: 255 })
            .delay(0.2)
            .to(0.8, { scale: 0.6, opacity: 56, position: cc.v3(this.node.x, this.node.y + 80) })
            .call(() => {
                GameResLoad.putNode(this.node);
            }).start();
    }

    protected showDefualAnim(isCritical: boolean, scale: number) {
        let dir = Random.range(1, 2);
        let x = 0;
        dir == 1 ? x = Random.range(-60 * scale, -30 * scale) : x = Random.range(40 * scale, 60 * scale);
        let startPos = cc.v3(0, 0);
        let endPos = cc.v3(x, Random.range(30 * scale, 60 * scale));
        let zongjiandian = cc.v3((startPos.x + endPos.x) / 2, Random.range(75 * scale, 100 * scale));
        let posArr: cc.Vec3[] = [startPos, zongjiandian, endPos];
        let dist = Utils.vt2distance(startPos.x, startPos.y, endPos.x, endPos.y);
        let time = dist / 200;

        if (isCritical) {
            cc.tween(this.hurtLab.node).to(time, { scale: scale * 4.0 }).start();
            // this.hurtLab.node.color = cc.Color.BLUE;
            this.node.zIndex = 9999;
        }
        Bezier.Move(this.hurtLab.node, posArr, time, EaseType.OutBack, null, () => {
            let delay = 0.16;
            if (isCritical) {
                delay = 0.9;
            }
            cc.tween(this.node).delay(delay).call(() => {
                GameResLoad.putNode(this.node);
            }).start();
        });
    }


    showSlowupAnim(isCritical: boolean, scale: number) {
        // let dir = Random.range(1, 2);
        let x = 0;
        // dir == 1 ? x = Random.range(-60, -30) : x = Random.range(40, 60);
        let dist = 120;
        let time = dist / 200;
        let delay = 0.2;
        if (isCritical) {
            delay = 0.5;
        }

        if (isCritical) {
            cc.tween(this.hurtLab.node).to(time, { scale: scale * 2.0, position: cc.v3(x, dist) }).delay(delay).call(() => {
                GameResLoad.putNode(this.node);
            }).start();
            this.node.zIndex = 9999;
        } else {
            cc.tween(this.hurtLab.node).to(time, { position: cc.v3(x, dist) }).delay(delay).call(() => {
                GameResLoad.putNode(this.node);
            }).start();
        }
    }


    reuse(): void {
    }

    unuse(): void {
        this.hurtLab.node.color = cc.Color.WHITE;
        this.hurtLab.node.scale = 1;

        this.node.opacity = 255;
        this.node.scale = 1;

        this.criticalNode.active = false;
        this.criticalNode.y = 0;
        this.criticalNode.opacity = 255;
        this.criticalNode.scale = 1;

        this.hurtLab.node.active = false;
        this.hurtLab.node.y = 0;
        this.hurtLab.node.opacity = 255;
    }
}
