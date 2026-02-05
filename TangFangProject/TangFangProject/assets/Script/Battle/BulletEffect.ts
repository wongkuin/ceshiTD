

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import BattleAckObject from "./BattleAckObjet";
import { IPoolComponent } from "./BattleBase";
import GameResLoad from "./GameResLoad";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletEffect extends cc.Component implements IPoolComponent {
    // 子弹受击效果

    protected anims: cc.Animation = null;
    protected particles: cc.ParticleSystem[] = [];
    protected spAnim: sp.Skeleton = null;

    protected onLoad(): void {
        this.anims = this.node.getComponent(cc.Animation);
        this.particles = this.node.getComponentsInChildren(cc.ParticleSystem);
        this.spAnim = this.node.getComponentInChildren(sp.Skeleton);
    }

    public play(loop: boolean = false, liveTime: number = 0): void {
        this.node.active = true;
        let rTime = 0.5;
        if (this.anims && this.anims.getClips().length > 0) {
            let clip = this.anims.getClips()[0];
            let name = clip.name;
            rTime = Math.max(clip.duration);
            this.anims.play(name);
        }

        if (this.spAnim) {
            let mName = this.spAnim.animation;
            console.log("mName", mName, this.node.x, this.node.y);
            let anim = this.spAnim.findAnimation(mName);
            rTime = Math.max(anim.duration, rTime);
            this.spAnim.setToSetupPose();
            this.spAnim.setAnimation(0, this.spAnim.animation, loop);
        }

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].resetSystem();
            rTime = Math.max(this.particles[i].duration + 0.1, rTime);
        }

        if (!loop) {
            this.scheduleOnce(() => {
                this.stop();
            }, rTime);
        } else if (liveTime > 0) {
            //如果是循环动画-设置结束时间
            this.scheduleOnce(() => {
                this.stop();
            }, liveTime);
        }
    }

    public stop(): void {
        this.anims && this.anims.stop();
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].stopSystem();
        }
        GameResLoad.putNode(this.node);
    }

    public stopLoop(): void {
        // this.anims && this.anims.stop();
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].stopSystem();
        }
        this.scheduleOnce(() => {
            this.stop();
        }, 0.15)
    }

    reuse(): void {
    }

    unuse(): void {
        this.node.active = false;
        this.spAnim && this.spAnim.setToSetupPose();
    }

    // update (dt) {}
}
