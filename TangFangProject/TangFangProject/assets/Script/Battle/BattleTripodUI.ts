

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { QTCircle, QTPolygon } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import { TripodInfo } from "../config/DataInfo";
import { BtAckObjState, GameObjectType, GamePowupEffect } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import GameControl from "./GameControl";
import PowUpEffectMgr from "./PowUpEffectMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleTripodUI extends BattleAckObject {


    public rootNode: cc.Node = null;

    // protected carrierBox: cc.Rect = null;  // 载具 左下  右上 坐标

    protected _hpRTime: number = 0; // 恢复时间

    protected _hpAddPer: number = 0; // 恢复值

    public get cartInfo(): TripodInfo {
        return this._shootInfo as TripodInfo;
    };


    start() {
        // GlobalEventMgr.getInstance().on(GlobalEventID.game_hp_addPre, this.onHpAddPre, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.game_hp_add, this.onSkillRecoverHpEvent, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.game_sp_add, this.onSkillRecoverSpEvent, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.up_powect, this.onUpPowupEffect, this);
    }

    public async init(info: TripodInfo) {
        // this._battleScene = SceneMgr.getCurrScene() as UISceneBattle;
        this._shootInfo = info;
        this.rootNode = this.node.getChildByName('root');
        this.loadData();
    }

    public loadData() {
        this._spine = this.node.getChildByName('spine').getComponent(sp.Skeleton);
        this._spine.setAnimation(0, "animation", true);
        this.setFightMsg();

    }

    public setFightMsg() {
        let gameQT = GameControl.getInstance().getQuadTree();
        this.getComponentsInChildren(cc.PolygonCollider).forEach((collider) => {
            if (collider.tag == 9999) {
                collider.tag = GameObjectType.Cart; // 设置碰撞体
                let shape = new QTPolygon(collider.points, GameObjectType.Cart);
                shape.node = this.node;
                gameQT && gameQT.insert(shape);
                this._qtShapes.push(shape);
            }
        });

        let fb = this.getComponentInChildren(cc.CircleCollider);
        if (fb) {
            fb.tag = GameObjectType.FireBox; // 设置碰撞体
            let shape = new QTCircle(fb.radius, GameObjectType.FireBox);
            shape.node = this.node;
            gameQT && gameQT.insert(shape);
            this._qtShapes.push(shape);
        }

        this.upShapesPos();
    }

    public upShapesPos() {
        for (const element of this._qtShapes) {
            let nPos = GameControl.getInstance().sceneBattle.gRoot.convertToNodeSpaceAR(this.getAckwPos());
            element.setPosition(nPos.x, nPos.y);
        }
    }


    public doUpdate(dt: number): void {
        // super.doUpdate(dt);
        this.updateBuffect(dt)
        this.node.zIndex = 2000 - this.node.position.y; // 调整z轴
        if (this.cartInfo.state == BtAckObjState.Run) {
            this.cartInfo.doUpdate(dt);
            this.upShapesPos();
        }

        if (this._hpAddPer > 0) {
            this._hpRTime += dt;
            if (this._hpRTime >= 10) {
                this.addHp(this._hpAddPer);
                //this.onAddHpPer(this._hpAddPer, this.cartInfo.getMaxHp());
                this._hpRTime = this._hpRTime - 10;
            }
        }
    }

    protected onUpPowupEffect() {
        let newValue = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_HpRegenPer);
        if (newValue > 0 && this._hpAddPer <= 0) {
            this._hpRTime = 10;
        }
        this._hpAddPer = newValue;

        let fixHpMax = PowUpEffectMgr.getInstance().getPowUpEffectByType(GamePowupEffect.player_HpMaxPer);
        if (fixHpMax > 0) {
            this.cartInfo.fixHpMax(fixHpMax);
        }
    }


    public getTripodInfo(): TripodInfo {
        return this.cartInfo;
    }

    protected onSkillRecoverSpEvent(type: number, val: number) {
        // type 0:固定值 1:百分比
        // let addSp = type == 0 ? val : this.cartInfo.getMaxSp() * (val / 100);
        // addSp = Math.floor(addSp);
        console.log(`addSp ${val}, ${type}`);
        if (type == 0) {
            this.addSp(val);
        } else if (type == 1) {
            let fix = val / 100 * this.cartInfo.getMaxSp();
            this.addSp(fix);
        }
    }

    protected addSp(value: number) {
        this.cartInfo.changeShield(value);
    }

    /** 技能恢复载具HP */
    protected onSkillRecoverHpEvent(type: number, val: number) {
        // type 0:固定值 1:百分比
        // let addHp = type == 0 ? val : this.cartInfo.getMaxHp() * (val / 100);
        // addHp = Math.floor(addHp);
        console.log(`addHp ${val}, ${type}`);
        if (type == 0) {
            this.addHp(val);
        } else if (type == 1) {
            this.onAddHpPer(val, this.cartInfo.getMaxHp());
        }
        // this.carrierInfo.state = MosterState.normal;
        // GlobalEventMgr.getInstance().emit(GlobalEvent.createAddHp, this.node.getPosition(), addHp, ObjType.carrier);
    }

    /** 加hp */
    public addHp(value: number) {
        this.cartInfo.changeHp(value);
        this.setAnimation();
    }

    /**百分百加血 */
    public onAddHpPer(attr: number, baseValue: number) {
        let fixHp = baseValue * (attr / 100);
        fixHp = this.cartInfo.changeHp(fixHp);
        this.setAnimation();
    }


    subHp(hurt: number, isCrit: boolean = false, realyHP: boolean = false): number {
        // console.log(`cart hurt ${hurt}`);
        // this.cartInfo.curHp -= hurt;
        let iRet = 0;
        let oldShow = Math.ceil(this.cartInfo.getCurHp());
        this.cartInfo.changeHp(-hurt, realyHP);
        if (this.cartInfo.getCurHp() <= 0) {
            iRet = Math.ceil(hurt);
        } //else {
        //  iRet = oldShow - Math.ceil(this.cartInfo.getCurHp());
        //}
        iRet = Math.ceil(hurt)

        this.setAnimation();
        // this.checkCreateFire();
        if (this.cartInfo.getCurHp() <= 0) {
            this.toDie();
        }
        return iRet;
        // let progress = this.cartInfo.getCurHp() / this.cartInfo.getMaxHp();
        // this._hpBar && this._hpBar.setBloodProgress(progress);
    }


    /** 设置动画 */
    public setAnimation(run: boolean = false) {
    }

    public canAck(): boolean {
        return this.cartInfo.state == BtAckObjState.Run;
    }

    // 对象类型
    getGameObjectType(): GameObjectType {
        return GameObjectType.Cart;
    }

    protected toDie() {
        this.changeState(BtAckObjState.Die);
        // 死亡动画
        let dieAnim = this._spine.findAnimation('die');
        let hideTime = 0.5; // 隐藏时间
        if (dieAnim) {
        }

        cc.Tween.stopAllByTarget(this.node); // 停止所有动画
        cc.tween(this.node).to(hideTime, { opacity: 0 }).call(() => {
            this.changeState(BtAckObjState.End);
        }).start();
    }



    // 修改状态
    protected changeState(state: BtAckObjState) {
        this.cartInfo.state = state;
    }


    public relife() {
        let hideTime = 0.5; // 隐藏时间
        cc.Tween.stopAllByTarget(this.node); // 停止所有动画
        cc.tween(this.node).to(hideTime, { opacity: 255 }).call(() => {
            this.changeState(BtAckObjState.Run);
            this.normalColor();
        }).start();
        this.cartInfo.relife();
        this.doReliveShoot();
    }

    protected clean(): void {
        super.clean();
    }




}


