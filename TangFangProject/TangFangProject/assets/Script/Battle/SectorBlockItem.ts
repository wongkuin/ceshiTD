
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import CharHeroInfo, { BuffEffectInfo, TurretInfo } from "../config/DataInfo";
import GameHelp from "../Mgr/GameHelp";
import BattleAckObject from "./BattleAckObjet";
import BattleCharUI from "./BattleCharUI";
import BuffEffect from "./BuffEffect";
import BulletEffect from "./BulletEffect";
import GameResLoad from "./GameResLoad";
import TurretBaseUI from "./TurretBaseUI";
import TurretMoveUI from "./TurretMoveUI";
import GameControl from './GameControl';
import ConfigMgr from "../config/ConfigMgr";
import { BuffData, EquipSkillData } from "../config/DataDef";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SectorBlockItem extends BattleAckObject {

    @property(cc.Node)
    turretRoot: cc.Node = null;

    @property(cc.Node)
    selectNode: cc.Node = null;
    @property(cc.Node)
    selectNode1: cc.Node = null;
    @property(cc.Node)
    selectNode2: cc.Node = null;
    @property(cc.Node)
    lightNode: cc.Node = null;
    @property(cc.Node)
    coillRect: cc.Node = null; // 碰撞检测节点

    @property(cc.Node)
    arwNode: cc.Node = null;

    @property(cc.Node)
    unlockMask: cc.Node = null;

    @property(cc.Node)
    buffRoot: cc.Node = null; // buff节点

    @property(cc.Node)
    buyChipsRoot: cc.Node = null;

    @property(cc.Node)
    notRotationRoot: cc.Node = null;

    @property(ButtonPlus)
    lockChip: ButtonPlus = null;

    @property(ButtonPlus)
    lockWave: ButtonPlus = null;

    @property(ButtonPlus)
    lockVideo: ButtonPlus = null;

    @property(cc.Label)
    addChangeLab: cc.Label = null;
    @property(cc.Node)
    teamMask: cc.Node = null;

    public idx = -1;
    public teamId = -1;
    protected curInMapLevel: number = 0;
    protected stepAngle: number = 0;

    protected _waveLock: number = 0;  // 波次锁
    protected _videoLock: boolean = false;  // 视频锁
    protected _buffLock: boolean = false;    // buff锁
    protected _chipLock: boolean = false;    // 筹码锁
    protected needChipVal: number = 0;    // 需要筹码数
    protected turretNode: cc.Node = null;
    protected _heroData: CharHeroInfo = null;
    protected buyChipsNode: cc.Node = null; // 购买筹码UI节点
    protected _buffect: BuffEffectInfo[] = []; // buff效果
    protected _curWave: number = 0;  // 当前波次
    protected _fighting: boolean = false;
    protected _isStick: boolean = false;
    protected _isDuan: boolean = false;//是否是短棍
    protected _isChang: boolean = false;//

    doInit(idx: number, videoLock: boolean, wave: number = 0, levelBlockCount) {
        GlobalEventMgr.getInstance().on(GlobalEventID.game_enter_newwave, this.onNewWave, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.GAME_COIN_CHANGE, this.updateLabs, this);

        this.idx = idx;
        this.node.name = "SectorBlockItem_" + idx;

        // let spArr = this.arwNode.getComponent(sp.Skeleton);
        // spArr && spArr.setCompleteListener(this.onSpineComplete.bind(this));

        this.lockWave && this.lockWave.addClick(this.onBtnClick, this);
        this.lockVideo && this.lockVideo.addClick(this.onBtnClick, this);
        this.lockChip && this.lockChip.addClick(this.onBtnClick, this);

        this._videoLock = videoLock;
        this._waveLock = wave;
        this._chipLock = this.needChipVal > 0;

        this.refrushBtn();
        let angle = 0, mapLv: number = Math.floor(this.idx / levelBlockCount) + 1;
        if (mapLv == 3) {
            this.stepAngle = 90;
            //第三层做为棍子的摆放节点 --- 只放四个
            const colIdx = idx % levelBlockCount;
            angle = colIdx * 90 % 360;
            this.node.angle = angle;
            this._isStick = true;
        } else {
            this.stepAngle = 360 / levelBlockCount;
            angle = idx * this.stepAngle % 360;
            this.node.angle = angle;
            this._isStick = false;
        }
        this.turretRoot.angle = 360 - angle;
        this.curInMapLevel = Math.floor(this.idx / levelBlockCount) + 1;
        this.hideSelectEffect();

        this.lockChip.node.angle = -angle;
        this.lockVideo.node.angle = -angle;
        this.lockWave.node.angle = -angle;

        const ctr = GameControl.getInstance();
        if (ctr.isTeamBaid() && this.teamMask) {
            //团队副本先隐藏半边的
            if (ctr.getIsTeamBlocks(this.idx)) {
                this.teamMask.active = true;
            }
        } else this.teamMask && (this.teamMask.active = false);
    }

    isMyBlockByTeam() {
        const ctr = GameControl.getInstance();
        if (ctr.getIsMyBlocks(this.idx)) return true;
        return false;
    }

    resetNewWave(levelBlockCount: number) {
        let angle = 0, mapLv: number = Math.floor(this.idx / levelBlockCount) + 1;
        if (mapLv == 3) {
            this.stepAngle = 90;
            //第三层做为棍子的摆放节点 --- 只放四个
            const colIdx = this.idx % levelBlockCount;
            angle = colIdx * 90 % 360;
            this.node.angle = angle;
            this._isStick = true;
        } else {
            this.stepAngle = 360 / levelBlockCount;
            angle = this.idx * this.stepAngle % 360;
            this.node.angle = angle;
            this._isStick = false;
        }
        this.turretRoot.angle = 360 - angle;

        this.lockChip.node.angle = -angle;
        this.lockVideo.node.angle = -angle;
        this.lockWave.node.angle = -angle;
    }

    // public resetLock(wave: number = 0, videoLock: boolean = false) {
    //     this._waveLock = wave;
    //     this._videoLock = videoLock;
    //     this.refrushBtn();
    // }

    protected onNewWave(wave: number) {
        this._curWave = wave;
        this.refrushBtn();
    }

    protected refrushBtn() {
        // this.lockVideo && (this.lockVideo.node.active = this._videoLock);
        this.lockVideo && (this.lockVideo.node.active = false);
        // this.lockWave && (this.lockWave.node.active = this._waveLock > this._curWave);
        this.lockWave && (this.lockWave.node.active = false);
        this.lockChip && (this.lockChip.node.active = this._chipLock);
        this.unlockMask && (this.unlockMask.active = this._chipLock);
        // this.lightNode && (this.lightNode.active = this.isLock());
        this.lightNode && (this.lightNode.active = false);
        // if (this.lockWave?.node?.active) {
        //     let fStr = `阶段${this._waveLock + 1}解锁`
        //     this.lockWave.node.getChildByName("txt_lock").getComponent(cc.Label).string = fStr;
        //     this.lockChip.node.active = false;
        // }
    }

    public onBtnClick(evt: cc.Event.EventTouch) {
        if (evt.target == this.lockWave.node) {
            this.onTapWaveLock();
        } else if (evt.target == this.lockVideo.node) {
            this.onTapVideoLock();
        } else if (evt.target == this.lockChip.node) {
            this.onTapChipLock();
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
        }, this, { scene: "battle_wb", key: "unlock_block" });

    }

    protected onTapChipLock() {
        if (!this._chipLock) {
            return;
        }
        /**战斗过程中不能解锁*/
        if (this._fighting) {
            // GameHelp.getInstance().showToast("战斗中无法解锁");
            return;
        }
        let coinVal = GameControl.getInstance().getPassInfo().gameCoin;
        if (coinVal < this.needChipVal) {
            GameHelp.getInstance().showToast("金币不足，无法解锁");
            return;
        }
        GlobalEventMgr.getInstance().emit(GlobalEventID.game_addMoney, -this.needChipVal);
        this._chipLock = false;
        this.cleanAndDelBuyChipsNode();
        this.refrushBtn();
    }

    // 设定长短棍
    public setStickIsDuan(isDuan: boolean = false) {
        this._isDuan = isDuan;
    }

    // 添加能量
    public addAmm(num: number, actMan: BattleCharUI) {
        if (!this.turretNode) {
            return;
        }
        const baseUI = this.turretNode.getComponent(TurretBaseUI);
        if (!baseUI) return;
        if (baseUI.addAmm(num, actMan)) {
            if (baseUI.turretInfo.data.id >= 1301 && baseUI.turretInfo.data.id <= 1304) {
                const buff = ConfigMgr.getInstance().getById(baseUI.turretInfo.data.id, BuffData);
                if (this.addChangeLab) {
                    this.addChangeLab.node.active = true;
                    this.addChangeLab.string = `+${(buff.hpRes[1] || 10)}`
                    this.addChangeLab.node.color = cc.Color.GREEN
                    this.addChangeLab.node.angle = -this.addChangeLab.node.parent.angle;
                    this.addChangeLab.node.scale = 1;
                    cc.tween(this.addChangeLab.node)
                        .delay(0.2)
                        // .to(1, { y: 100 })
                        .to(1, { scale: 0.5 })
                        .call(() => {
                            this.addChangeLab.node.active = false;
                        })
                        .start();
                }
            }
            if (baseUI.turretInfo.data.id >= 1501 && baseUI.turretInfo.data.id <= 1505) {
                const skillData = ConfigMgr.getInstance().getById(baseUI.turretInfo.data.id, EquipSkillData);
                if (this.addChangeLab) {
                    this.addChangeLab.node.active = true;
                    this.addChangeLab.string = `+${(skillData.money || 2)}`
                    this.addChangeLab.node.color = cc.Color.WHITE;
                    this.addChangeLab.node.angle = -this.addChangeLab.node.parent.angle;
                    this.addChangeLab.node.scale = 1;
                    cc.tween(this.addChangeLab.node)
                        .delay(0.2)
                        // .to(1, { y: 100 })
                        .to(1, { scale: 0.5 })
                        .call(() => {
                            this.addChangeLab.node.active = false;
                        })
                        .start();
                }
            }
        }

    }

    // 检查升级
    public checkLvup(turret: cc.Node, turretInfo?: TurretInfo): boolean {
        let ret: boolean = false;
        let otherInfo = turretInfo ? turretInfo : turret.getComponent(TurretBaseUI).turretInfo;
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

        if (turret) GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DEL, turret);
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP);
        GlobalEventMgr.getInstance().emit(GlobalEventID.composite_mapTurret, myTurret);
        // GameResLoad.putNode(turret);
    }

    public doHeroLvUp(newHeroID: number = 0) {
        const tempID = this._heroData.idx;
        let newCharInfo = new CharHeroInfo(newHeroID);
        //英雄升级需要重置英雄数据，然后长度边长就行
        this._heroData = newCharInfo;
        //合成特效
        GameResLoad.loadBulletEffect("UI_lvlup").then((node: cc.Node) => {
            if (!node) {
                console.warn(`UI_lvlup is null`)
                return;
            }

            let be = node.getComponent(BulletEffect);
            if (!be) {
                be = node.addComponent(BulletEffect);
            }
            this.node.parent.addChild(node);
            node.setPosition(0, 0)
            be.play(false);
            SoundMgr.getInstance().playSoundByID(25);
        })

        GlobalEventMgr.getInstance().emit(GlobalEventID.HERO_LEVEL_UP, tempID, this._heroData);
    }

    public checkSwape(turret: cc.Node): boolean {
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
        const otherBlockItem = otherRoot.parent.getComponent(SectorBlockItem);
        const thisBlockItem = thisRoot.parent.getComponent(SectorBlockItem);

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
        if (this.buyChipsNode) {
            this.buyChipsNode.active = true;
        }
        this._fighting = false;

        //团队副本好友位展示
        if (GameControl.getInstance().isTeamBaid()) {
            this.onlyTeamShow(true);
        }
        // this.arwNode.active = true;
        // this.arwNode.getChildByName('arrow').active = false;
    }

    public onlyTeamShow(ZhengBei: boolean = true) {
        const ctr = GameControl.getInstance();
        if (ctr.getIsTeamBlocks(this.idx)) {
            this.node.children.forEach(n => {
                if (n.name == "NotRotationRoot") {
                    n.active = !ZhengBei;
                } else if (n.name == "teamMask") {
                    n.active = ZhengBei;
                }
            })

            if (this.buyChipsNode) {
                this.buyChipsNode.active = false;
            }
        }
        if (this._heroData?.teamID && this._heroData.teamID > 0) {
            const charList = GameControl.getInstance().sceneBattle.charList;
            for (let i = 0; i < charList.length; i++) {
                let char = charList[i];
                if (char.charInfo.teamID == this._heroData.teamID) {
                    char.node.active = !ZhengBei;
                }
            }
        }
    }

    public onFightStart() {
        if (this.turretNode) {
            this.turretNode.getComponent(TurretMoveUI).enabled = false;
            this.turretNode.getComponent(TurretBaseUI).showUpIcon(false);
        }
        //this.arwNode.active = false;
        if (this.buyChipsNode) {
            this.buyChipsNode.active = false;
        }

        if (GameControl.getInstance().isTeamBaid()) {
            this.onlyTeamShow(false);
        }

        this._fighting = true;
    }

    showSelectEffect() {
        // this.bg.node.color = new cc.Color(255, 255, 0, 255);
        // this.node.scale = 1.2;
        const data = this.turretNode?.getComponent(TurretBaseUI)?.turretInfo?.data;
        this._isDuan = !this._heroData;
        this._isChang = !!this._heroData;
        this.selectNode.active = true;
        if (this.curInMapLevel == 3) {
            this.selectNode1.active = this._isDuan;
            this.selectNode2 && (this.selectNode2.active = this._isChang);
        } else {
            this.selectNode1.active = true;
        }
    }

    hideSelectEffect() {
        // this.bg.node.color = new cc.Color(255, 255, 255, 255);
        // this.node.scale = 1.0;
        this.selectNode.active = false;
        this.selectNode1.active = false;
        this.selectNode2 && (this.selectNode2.active = false);
    }

    public isHasTurret(): boolean {
        return this.turretNode != null;
    }

    public getTurret(): cc.Node {
        return this.turretNode;
    }

    public resetTurret(root: cc.Node = null) {
        if (!root) return;
        root.parent = this.turretNode;
        this.turretNode = null;
        this.hideSelectEffect();
    }

    public addHero(heroInfo: CharHeroInfo) {
        this._heroData = heroInfo;
    }

    public isHasHero() { return !!this._heroData; }

    public getHero() { return this._heroData; }

    public addTurret(turret: cc.Node) {
        this.turretNode = turret;
        this.turretNode.parent = this.turretRoot;
        this.turretNode.setPosition(0, 0);
        this.turretNode.scale = 0.85;
        const tempScle = this.turretNode.scale;
        cc.tween(this.turretNode)
            .to(0.2, { scale: 0.2 })
            .to(0.2, { scale: tempScle })
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

    public getBuyChipsNode(): cc.Node {
        return this.buyChipsNode;
    }

    updateLabs() {
        if (!this.buyChipsNode) return;
        const gameCoin = GameControl.getInstance().getPassInfo()?.gameCoin || 0;
        let lab = this.buyChipsNode?.getComponentInChildren(cc.Label)
        if (!lab) return;
        if (!Number(lab.string)) return;
        lab.node.color = Number(lab.string) > gameCoin ? cc.Color.RED : cc.Color.WHITE;
    }

    public addBuyChips(node: cc.Node, parentNode: cc.Node, needVal: number) {
        this.buyChipsNode = node;
        this.buyChipsNode.parent = parentNode;
        let worldPos = this.buyChipsRoot.convertToWorldSpaceAR(cc.v2(0, 0));

        let localPos = parentNode.convertToNodeSpaceAR(worldPos);
        this.buyChipsNode.setPosition(localPos);
        var lab = node.getComponentInChildren(cc.Label);
        lab.string = `${needVal}`;
        this.unlockMask.active = (needVal > 0);
        this.needChipVal = needVal;
        this._chipLock = needVal > 0;

        this.refrushBtn();
    }

    public cleanAndDelBuyChipsNode() {
        if (this.buyChipsNode) {
            GameResLoad.putNode(this.buyChipsNode);
            this.buyChipsNode.destroy();
            this.buyChipsNode = null;
        }
    }

    protected onSpineComplete(data: any) {
        if (data.animation && data.animation.name == "jt_2") {
            //this.arwNode.getChildByName('arrow').active = false;
        }
    }

    public showArrow2Next(dir: cc.Vec2) {
        // let arrow = this.arwNode.getChildByName('arrow')
        // arrow.active = true;
        // arrow.angle = Utils.vector2ToAngle(cc.v2(dir.x, dir.y));// CommonUtils.angel - Math.atan2(dir.y, dir.x) * 180 / Math.PI;
        // let aSp = arrow.getComponent(sp.Skeleton);
        // aSp.timeScale = 0.5;
        // aSp.setAnimation(0, "jt_1", false);
        // aSp.addAnimation(0, "jt_2", false);
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
        // return this._buffLock || this._waveLock > this._curWave || this._videoLock || this._chipLock;
        return this._buffLock || this._videoLock || this._chipLock;
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

    public getCurInMapLevel() {
        return this.curInMapLevel;
    }

    public getStartAngle(): number {
        let angle = this.getCurInMapLevel()
        return this.node.angle;
    }

    public getEndAngle(): number {
        return this.node.angle + this.stepAngle;
    }
}
