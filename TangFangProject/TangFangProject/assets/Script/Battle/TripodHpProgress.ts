
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import GameControl from "./GameControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TripodHpProgress extends cc.Component {

    @property(cc.Sprite)
    hp_img: cc.Sprite = null;

    // @property(cc.Sprite)
    // shield_img: cc.Sprite = null;

    @property(cc.Label)
    hp_add: cc.Label = null;

    @property(cc.Label)
    shield_add: cc.Label = null;

    @property(cc.Label)
    txt_hp: cc.Label = null;

    @property(cc.Label)
    txt_shield: cc.Label = null;

    @property(cc.Material)
    default_Material: cc.Material = null;


    @property(cc.Material)
    flashWhite_Material: cc.Material = null;

    userMat: cc.Material = null;

    // onLoad () {}
    start() {
        GlobalEventMgr.getInstance().on(GlobalEventID.show_change_hp, this.onCartChangeHp, this); // 车辆血量变化
        GlobalEventMgr.getInstance().on(GlobalEventID.show_change_shield, this.onCartChangeShield, this); // 车辆速度变化
        this.hp_add.node.active = false;
        this.shield_add.node.active = false;
    }

    protected onEnable(): void {
        this.onCartChangeHp(0);
        this.onCartChangeShield(0);
    }

    setFlashWhite() {
        if (!this.flashWhite_Material || !this.default_Material || this.userMat == this.flashWhite_Material) {
            return;
        }

        this.node.getComponentsInChildren(cc.Sprite).forEach((sp) => {
            let mat = sp.setMaterial(0, this.flashWhite_Material);
            this.userMat = this.flashWhite_Material;
            // mat.setProperty('flashIntensity', 1.0);
        });
        this.scheduleOnce(() => {
            this.node.getComponentsInChildren(cc.Sprite).forEach((sp) => {
                let mat = sp.setMaterial(0, this.default_Material);
                this.userMat = this.default_Material;
                // mat.setProperty('flashIntensity', 1.0);
            });
        }, 0.1);
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.05, { scale: 1.1 })
            .to(0.05, { scale: 1 })
            .start();
    }

    protected onCartChangeHp(val: number) {
        this.refrush();
        if (val > 0) {
            this.showAddHp(val);
        } else {
            if (val < 0) {
                this.setFlashWhite();
            }
        }
    }

    protected showAddHp(val: number) {
        this.hp_add.string = "+" + val;
        this.hp_add.node.y = 0;
        cc.Tween.stopAllByTarget(this.hp_add.node);
        this.hp_add.node.active = true;
        this.hp_add.node.scale = 2;
        cc.tween(this.hp_add.node)
            .delay(0.2)
            .to(0.6, { y: 48 })
            .to(1, { scale: 1 })
            .call(() => {
                this.hp_add.node.active = false;
            })
            .start();
    }


    protected refrush() {
        let scene = GameControl.getInstance().sceneBattle; //// SceneMgr.getCurrScene() as UISceneBattle;
        let cInfo = scene.getPassControl().getGameTripod().getShootInfo();
        this.setBloodProgress(Math.ceil(cInfo.getCurHp()) / Math.ceil(cInfo.getMaxHp()));

        this.txt_hp.string = Math.ceil(cInfo.getCurHp()).toString();
        let sStr = "";
        if (cInfo.getCurShield() >= 1) {
            sStr = Math.ceil(cInfo.getCurShield()).toString();
        }
        this.txt_shield.string = sStr;
    }

    protected onCartChangeShield(val: number) {
        this.refrush();
        if (val > 0) {
            this.showAddShield(val);
        }
    }

    protected showAddShield(val: number) {
        //TODO show change value
        this.shield_add.string = "+" + val;
        this.shield_add.node.y = 0;
        cc.Tween.stopAllByTarget(this.shield_add.node);
        this.shield_add.node.active = true;
        cc.tween(this.shield_add.node)
            .delay(0.2)
            .to(0.6, { y: 48 })
            .call(() => {
                this.shield_add.node.active = false;
            })
            .start();
    }

    public setBloodProgress(progress: number) {
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        this.hp_img.fillRange = progress;
    }

    // public setShieldProgress(progress: number) {
    //     if (progress < 0) progress = 0;
    //     if (progress > 1) progress = 1;
    //     this.shield_img.fillRange = progress;
    // }

    // update (dt) {}
}
