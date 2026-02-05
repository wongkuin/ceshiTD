

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { RAD_TO_DEG } from "../AppDefual";
import BulletEffect from "../Battle/BulletEffect";
import GameResLoad from "../Battle/GameResLoad";
import HurtEffectUI from "../Battle/HurtEffectUI";
import { HurtFontAnimType } from "../config/GameEnum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BullectEffectUI extends cc.Component {

    @property
    isUp: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    loopEffect: Map<cc.Node, BulletEffect> = new Map<cc.Node, BulletEffect>();
    loadingEffect: string[] = [];

    protected hurtRoot: cc.Node = null;


    onLoad() {


        this.hurtRoot = new cc.Node('hurtRoot');
        this.node.addChild(this.hurtRoot);
        this.hurtRoot.zIndex = cc.macro.MAX_ZINDEX;
        GlobalEventMgr.getInstance().on(GlobalEventID.createCombatBomb, this.onEffectShow, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.createCombatBombLoop, this.onEffectShowLoop, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.endCombatBombLoop, this.onEffectEndLoop, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.create_hurt, this.onCreateHurt, this);
    }

    start() {

    }

    onEffectShow(data) {
        //{
        //     pos: this.node.getPosition(),
        //     url: this._bulletInfo.bulletSP.spHit,
        //     scale: this._bulletInfo.bulletSP.spHitVal,
        // }
        if (this.isUp) {
            if (data.url.length < 1) {
                // console.warn(`bullet effect ${data.url} is null`)
                return;
            }
            GameResLoad.loadBulletEffect(data.url).then((node: cc.Node) => {
                if (!node) {
                    console.warn(`bullet effect ${data.url} is null`)
                    return;
                }

                let be = node.getComponent(BulletEffect);
                if (!be) {
                    be = node.addComponent(BulletEffect);
                }
                let lPos = this.node.convertToNodeSpaceAR(data.pos);
                this.node.addChild(node);
                this.node.active = true;
                node.setPosition(lPos);
                node.scale = data.scale;
                let dir = data.dir;
                if (dir) {
                    node.angle = Math.atan2(dir.y, dir.x) * RAD_TO_DEG + 90 + Math.random() * 16 - 8;
                }

                be.play();
            });
        }
    }


    onEffectShowLoop(data) {
        // pos: this.node.getPosition().add(this.hitPos.getPosition()),
        // url: this._bulletInfo.bulletSP.spHit,
        // scale: this._bulletInfo.bulletSP.spHitVal,
        // uuid: this.node.uuid, // 唯一标识符

        let nPos = this.node.convertToNodeSpaceAR(data.pos);
        if (this.loopEffect.has(data.node)) {
            let be = this.loopEffect.get(data.node);
            be.node.setPosition(nPos); // 更新位置
            return;
        }
        if (this.loadingEffect.indexOf(data.node) != -1) {
            return;
        }

        // console.log(`onEffectShowLoop ${data.uuid}`, data.pos.x, data.pos.y);

        this.loadingEffect.push(data.node);
        if (this.isUp) {
            GameResLoad.loadBulletEffect(data.url).then((node: cc.Node) => {
                let lodIdx = this.loadingEffect.indexOf(data.node);
                if (lodIdx < 0) {
                    return;
                }
                this.loadingEffect.splice(lodIdx, 1);
                if (!node) {
                    console.warn(`bullet effect ${data.url} is null`)
                    return;
                }
                if (!cc.isValid(data.node)) {
                    return;
                }

                let be = node.getComponent(BulletEffect);
                if (!be) {
                    be = node.addComponent(BulletEffect);
                }
                this.loopEffect.set(data.node, be);
                this.node.addChild(node);
                node.setPosition(nPos);
                this.node.active = true;
                node.scale = data.scale;
                be.play(true);
            });
        }

    }


    onEffectEndLoop(data) {
        // console.log(`onEffectEndLoop ${data.uuid}`);
        // if (this.loopEffect.has(data.uuid)) {
        //     let be = this.loopEffect.get(data.uuid);
        //     this.loopEffect.delete(data.uuid);
        //     be.stopLoop(); // 停止循环播放
        // } else {
        //     let lodIdx = this.loadingEffect.indexOf(data.uuid);
        //     lodIdx >= 0 && this.loadingEffect.splice(lodIdx, 1);
        // }
    }

    update(dt) {
        this.loopEffect.forEach((v, k) => {
            if (!cc.isValid(k.parent)) {
                this.loopEffect.delete(k);
                v.stopLoop();
                return;
            }
        });

    }

    onCreateHurt(data) {
        //data= { c: this.getAckPos(), hurt: hurt, type: this.getGameObjectType() }
        if (!this.isUp) {
            return;
        }

        if (!data || !data.hurt || data.hurt == 0) return;
        let lPos = this.node.convertToNodeSpaceAR(data.pos);
        let self = this;
        // console.log('hurtUI', data.hurt);

        let type = data.type || HurtFontAnimType.Default;
        let color = data.color || "#FFFFFF"
        let isCritical = data.isCritical || false;
        let scale = data.scale || 1;
        let miss = data.block || false;

        miss && console.log("格挡触发", miss);

        GameResLoad.loadHurtEffect("hurtUI").then((hurtNode: cc.Node) => {
            self.hurtRoot.addChild(hurtNode);
            hurtNode.setPosition(lPos.x, lPos.y);
            hurtNode.getComponent(HurtEffectUI).init(data.hurt, type, isCritical, color, scale, miss);
        });

    }
}
