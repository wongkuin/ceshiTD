

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { BuffEffectInfo } from "../config/DataInfo";
import GameHelp from "../Mgr/GameHelp";
import BattleAckObject from "./BattleAckObjet";
import BattleCharUI from "./BattleCharUI";
import BuffEffect from "./BuffEffect";
import GameResLoad from "./GameResLoad";
import TurretBaseUI from "./TurretBaseUI";
import TurretMoveUI from "./TurretMoveUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GridBlockItem extends BattleAckObject {

    @property(cc.Node)
    turretRoot: cc.Node = null;

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Node)
    arwNode: cc.Node = null;

    @property(cc.Node)
    buffRoot: cc.Node = null; // buff节点

    @property(ButtonPlus)
    lockWave: ButtonPlus = null;

    @property(ButtonPlus)
    lockVideo: ButtonPlus = null;

    @property(cc.Node)
    sblNode: cc.Node = null; // 石板路Node节点

    @property(cc.Prefab)
    qipaoTip: cc.Prefab = null;

    @property({ type: cc.Label, tooltip: "波次解锁" })
    protected guideWaveLockLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "波次解锁根节点" })
    protected guideWaveLockNode: cc.Node = null;

    public idx = -1;

    /**位置id，对应mapConfig的路径配置中的id */
    public posId = -1;

    protected _waveLock: number = 0;  // 波次锁
    protected _videoLock: boolean = false;  // 视频锁
    protected _buffLock: boolean = false;    // buff锁

    protected turretNode: cc.Node = null;

    protected _buffect: BuffEffectInfo[] = []; // buff效果

    protected _curWave: number = 0;  // 当前波次

    protected _fighting: boolean = false;
    //------------引导波次锁，新需求，第一关特例

    protected _guideWaveLock: number = 0;  // 引导波次锁


    qipaoTipNode: cc.Node
    doInit(idx: number, videoLock: boolean, wave: number = 0,) {

        GlobalEventMgr.getInstance().on(GlobalEventID.game_enter_newwave, this.onNewWave, this);
        // GlobalEventMgr.getInstance().on(GlobalEventID.Fight_start, this.onFightStart, this);
        //[19,17,15,16,18,20,19,22,24,25,23,21,19,17,15,0,1,2,3,4,5,6,14,13,12,4,3,2,9,10,11,4,5,6,7,8,24,22,19]
        this.idx = idx;
        this.posId = idx;


        this.node.name = "GridBlockItem_" + idx;

        let spArr = this.arwNode.getComponent(sp.Skeleton);
        spArr && spArr.setCompleteListener(this.onSpineComplete.bind(this));
        this.guideWaveLockNode.active = false;
        this.lockWave.addClick(this.onBtnClick, this);
        this.lockVideo.addClick(this.onBtnClick, this);

        this._videoLock = videoLock;
        this._waveLock = wave;

        this.refrushBtn();

    }

    setGuideWaveLock(guideWaveLock: number) {
        this._guideWaveLock = guideWaveLock;
        this.guideWaveLockNode.active = true;
        this.guideWaveLockLab.string = `第${this._guideWaveLock}波解锁`;
        this.qipaoTipNode = cc.instantiate(this.qipaoTip);
        this.qipaoTipNode.parent = this.node;
        this.qipaoTipNode.setPosition(64, 64);
        Utils.getWidget("tipsLab", this.qipaoTipNode).getComponent(cc.Label).string = `${5}波`;
    }

    refreshGuideWaveLock(wave: number) {
        console.warn("1111111111111111111:", wave);
        this.guideWaveLockNode.active = wave < this._guideWaveLock;
        if (wave >= this._guideWaveLock) {
            if (cc.isValid(this.qipaoTipNode)) {
                this.qipaoTipNode.destroy();
            }

        } else {
            if (cc.isValid(this.qipaoTipNode)) {
                Utils.getWidget("tipsLab", this.qipaoTipNode).getComponent(cc.Label).string = `${this._guideWaveLock - wave}波`;
            }
        }
    }

    // public resetLock(wave: number = 0, videoLock: boolean = false) {
    //     this._waveLock = wave;
    //     this._videoLock = videoLock;
    //     this.refrushBtn();
    // }

    protected onNewWave(wave: number) {
        this._curWave = wave;
        this.refreshGuideWaveLock(wave);
        this.refrushBtn();
    }

    protected refrushBtn() {
        this.lockVideo.node.active = this._videoLock;
        this.lockWave.node.active = this._waveLock > this._curWave;

        if (this.lockWave.node.active) {
            let fStr = `阶段${this._waveLock + 1}解锁`
            this.lockWave.node.getChildByName("txt_lock").getComponent(cc.Label).string = fStr;
        }
    }

    public onBtnClick(evt: cc.Event.EventTouch) {
        if (evt.target == this.lockWave.node) {
            this.onTapWaveLock();
        } else if (evt.target == this.lockVideo.node) {
            this.onTapVideoLock();
        }
    }

    protected onTapWaveLock() {
        let fStr = `阶段${this._waveLock + 1}解锁`
        GameHelp.getInstance().showToast(fStr);
    }

    protected onTapVideoLock() {
        console.log("onTapVideoLock");
        if (!this._videoLock) {
            return;
        }

        if (this._fighting) {
            GameHelp.getInstance().showToast("战斗中无法解锁");
            return;
        }

        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            // this.onSuccessFunc(b);
            this._videoLock = false;
            this.refrushBtn();
        }, this, { key: "battle_wb", scene: "unlock_block" });

    }

    // 添加能量
    public addAmm(num: number, actMan: BattleCharUI) {
        if (!this.turretNode) {
            return;
        }
        this.turretNode.getComponent(TurretBaseUI).addAmm(num, actMan);
    }

    // 检查升级
    public checkLvup(turret: cc.Node): boolean {
        let ret: boolean = false;
        let otherInfo = turret.getComponent(TurretBaseUI).turretInfo;
        let myTurret = this.turretNode.getComponent(TurretBaseUI);
        let thisInfo = myTurret.turretInfo;
        if (thisInfo.getFusionInput() == otherInfo.getID()) {
            ret = true;
        }
        return ret;
    }

    public doLvup(turret: cc.Node) {
        let myTurret = this.turretNode.getComponent(TurretBaseUI);
        let thisInfo = myTurret.turretInfo;
        myTurret.doLevelUp(thisInfo.getFusionOutput());

        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DEL, turret);
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP);
        GlobalEventMgr.getInstance().emit(GlobalEventID.composite_mapTurret, myTurret);
        // GameResLoad.putNode(turret);
    }

    public checkSwape(turret: cc.Node): boolean {
        console.log("checkSwape", turret.name, this.turretNode.name);
        if (turret.getComponent(TurretBaseUI).turretInfo.locked) {
            return false;
        }

        // let tempRoot = this.turretNode.parent;
        // turret.parent = tempRoot;

        let otherRoot: cc.Node = turret['rParent'];
        let thisRoot: cc.Node = this.turretRoot;

        const originalTurret = this.turretNode;
        const originalTurretRoot = this.turretRoot;

        // 更新当前节点的父节点和引用
        this.turretNode.parent = otherRoot;
        this.turretNode['rParent'] = otherRoot;

        // 更新目标节点的父节点和引用
        turret.parent = thisRoot;
        turret['rParent'] = thisRoot;


        // 4. 更新GridBlockItem组件引用
        const otherBlockItem = otherRoot.parent.getComponent(GridBlockItem);
        const thisBlockItem = thisRoot.parent.getComponent(GridBlockItem);

        if (otherBlockItem) {
            otherBlockItem.turretNode = originalTurret;
            console.log("otherBlockItem", otherBlockItem.uuid);
        }

        if (thisBlockItem) {
            thisBlockItem.turretNode = turret;
            console.log("thisBlockItem", thisBlockItem.uuid);
        }

        // 5. 计算新位置并执行动画
        const otherPos = otherRoot.convertToNodeSpaceAR(thisRoot.convertToWorldSpaceAR(cc.Vec3.ZERO));
        const thisPos = thisRoot.convertToNodeSpaceAR(otherRoot.convertToWorldSpaceAR(cc.Vec3.ZERO));

        const duration = 0.05


        // 执行动画
        cc.tween(turret)
            .set({ position: thisPos })
            .to(duration, { position: cc.Vec3.ZERO }, { easing: 'sineOut' })
            .start();

        cc.tween(originalTurret)
            .set({ position: otherPos })
            .to(duration, { position: cc.Vec3.ZERO }, { easing: 'sineOut' })
            .start();

        GlobalEventMgr.getInstance().emit(GlobalEventID.turret_swape, { from: originalTurret, to: turret });
        return true;
    }


    public showGameUI() {
        if (this.turretNode) {
            this.turretNode.getComponent(TurretMoveUI).enabled = true;
        }
        this.arwNode.active = true;
        this.arwNode.getChildByName('arrow').active = false;
    }

    public onFightStart() {
        if (this.turretNode) {
            this.turretNode.getComponent(TurretMoveUI).enabled = false;
            this.turretNode.getComponent(TurretBaseUI).showUpIcon(false);
        }
        this.arwNode.active = false;
    }

    showSelectEffect() {
        this.bg.node.color = new cc.Color(255, 255, 0, 255);
        this.node.scale = 1.2;
    }

    hideSelectEffect() {
        this.bg.node.color = new cc.Color(255, 255, 255, 255);
        this.node.scale = 1.0;
    }

    public isHasTurret(): boolean {
        return this.turretNode != null;
    }

    public getTurret(): cc.Node {
        return this.turretNode;
    }



    public addTurret(turret: cc.Node) {

        this.turretNode = turret;
        this.turretNode.parent = this.turretRoot;
        this.turretNode.setPosition(0, 0);

        if (this.node.y > 0) {
            this.turretNode.getComponent(TurretBaseUI)?.setTeamerTurret(true);//判断队友炮塔
        }

        cc.tween(this.turretNode)
            .to(0.1, { scale: 0.2 })
            .to(0.1, { scale: 1.0 })
            .start();
        this.hideSelectEffect();
    }

    public removeTurretNode() {
        if (this.turretNode) {
            this.turretNode = null;
        }
    }

    public cleanAndDelTurret() {
        if (this.turretNode != null) {
            GameResLoad.putNode(this.turretNode);
            this.turretNode = null;
        }
    }

    protected onSpineComplete(data: any) {
        if (data.animation && data.animation.name == "jt_2") {
            this.arwNode.getChildByName('arrow').active = false;
        }
    }

    public showArrow2Next(dir: cc.Vec2) {
        let arrow = this.arwNode.getChildByName('arrow')
        arrow.active = true;
        arrow.angle = Utils.vector2ToAngle(cc.v2(dir.x, dir.y));// CommonUtils.angel - Math.atan2(dir.y, dir.x) * 180 / Math.PI;
        let aSp = arrow.getComponent(sp.Skeleton);
        aSp.timeScale = 0.5;
        aSp.setAnimation(0, "jt_1", false);
        aSp.addAnimation(0, "jt_2", false);
    }


    public doUpdate(dt: number) {
        this.updateBuffect(dt);
    }

    // 添加一个buff
    public override addBuffect(buffect: BuffEffectInfo): void {
        console.log(`add Map Block buffect ${buffect.data.id}`);

        // super.addBuffect(buffect);
        // 添加buff效果
        this.showBuffEffect(buffect);
        this._buffect.push(buffect);
    }

    public override canAck(): boolean {

        return true;
    }

    // 显示buff效果
    protected showBuffEffect(buff: BuffEffectInfo): void {
        let res = buff.getBuffRes();
        if (res.length <= 1) {
            return;
        }
        let medium = buff.getBuffMedium();
        let fd = this._buffect.find(v => v.data.id == buff.data.id);
        let self = this;
        if (medium == 0 && !fd) {
            GameResLoad.loadBuffEffect(res).then((eNode) => {
                if (!eNode) {
                    console.warn(`buff effect ${res} is null`)
                    return;
                }

                if (!cc.isValid(self)) {
                    return;
                }
                let be = eNode.getComponent(BuffEffect);
                if (!be) {
                    be = eNode.addComponent(BuffEffect);
                }

                eNode.active = true;
                eNode.scale = 1.0;
                self.buffRoot.addChild(eNode);
                buff.addEffectView(be);
                be.play(true);
            })
        } else if (medium == 1) {
            GameResLoad.loadBuffEffect(res).then((eNode) => {
                if (!eNode) {
                    console.warn(`buff effect ${res} is null`)
                    return;
                }
                if (!cc.isValid(self)) {
                    return;
                }
                let be = eNode.getComponent(BuffEffect);
                if (!be) {
                    be = eNode.addComponent(BuffEffect);
                }
                self.buffRoot.addChild(eNode);
                eNode.active = true;
                eNode.scale = 1.0;
                be.play();
            })
        }
    }

    protected updateBuffect(dt: number): void {
        let buffLock = false;
        for (let i = this._buffect.length - 1; i >= 0; i--) {
            const buff = this._buffect[i];
            buff.doUpdate(dt);
            if (buff.isLockBlock()) {
                buffLock = true;
            }
        }
        this._buffLock = buffLock;
        this.updateBuffEffect(dt);
    }

    // 刷新buff
    public updateBuffEffect(dt: number): void {
        for (let i = this._buffect.length - 1; i >= 0; i--) {
            let effect = this._buffect[i];
            if (effect) {
                // effect.doUpdate(dt);
                if (effect.isEnd()) {
                    this._buffect.splice(i, 1);
                    // this.refrushPowUpEffect();
                }
            }
        }
    }

    public isLock(): boolean {
        return this._buffLock || this._waveLock > this._curWave || this._videoLock || this._guideWaveLock > this._curWave;
    }

    // 附加buff
    public getExtBuff(): number[] {
        let ret: number[] = [];
        for (const element of this._buffect) {
            ret = ret.concat(element.getBlockExtBuffs());
        }
        return ret;
    }

    //////////////
    public override subHp(v: number, isCritical?: boolean, realyHP?: boolean): number {
        console.log(`grid block sub hp ${v} ${isCritical} ${realyHP}`)
        return 0;
    }

    setSBLNodeState(state: boolean) {
        this.sblNode.active = state;
    }

}
