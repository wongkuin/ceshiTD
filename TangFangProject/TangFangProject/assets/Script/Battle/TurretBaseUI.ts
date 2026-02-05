

import GlobalEventMgr from '../../TRFrameWork/cocos-module/mgr/GlobalEventMgr';
import SoundMgr from '../../TRFrameWork/cocos-module/mgr/SoundMgr';
import { GlobalEventID } from '../../TRFrameWork/cocos-module/utils/GlobalEvent';
import ChestJump from '../../TRFrameWork/Common/Components/ChestJump';
import FormMgr from '../../TRFrameWork/UIFrame/FormMgr';
import SceneMgr from '../../TRFrameWork/UIFrame/SceneMgr';
import { BuffEffectInfo, shootBagParm, TurretInfo } from '../config/DataInfo';
import { GameBundle, GameObjectType } from '../config/GameEnum';
import UIConfig from '../config/UIConfig';
import { WapenType } from '../Data/GameWapenData';
import BattleAckObject from './BattleAckObjet';
import { IPoolComponent } from './BattleBase';
import BattleCharUI from './BattleCharUI';
import BulletEffect from './BulletEffect';
import GameControl from './GameControl';
import GameResLoad from './GameResLoad';
import ShootBagUI from './ShootBagUI';
import TurretMoveUI from './TurretMoveUI';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurretBaseUI extends BattleAckObject implements IPoolComponent {

    @property(cc.Sprite)
    wapenBG: cc.Sprite = null;
    @property(cc.Sprite)
    wapenGuang: cc.Sprite = null;

    @property(cc.Sprite)
    lvBG: cc.Sprite = null;

    @property(cc.ProgressBar)
    ammProgress: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    cdProgress: cc.ProgressBar = null;

    @property(cc.Node)
    upIcon: cc.Node = null; // 升级图标

    @property(cc.Label)
    tips: cc.Label = null;

    // protected _blockMapColor: cc.Color = cc.Color.WHITE.clone();
    protected _shootNode: cc.Node = null;


    public get turretInfo(): TurretInfo {
        return this._shootInfo as TurretInfo;
    }

    protected _hasInit: boolean = false;
    // protected _buffEffcts: TurretEffectInfo[] = []; // 果蔬效果

    onLoad(): void {
        super.onLoad();
    }

    protected setDragUI(): void {
        let dragUI = this.node.getComponent(TurretMoveUI);
        if (!dragUI) {
            this.node.addComponent(TurretMoveUI);
        }
    }

    start(): void {
        super.start();
        this.regiesterEvent();
        this.setDragUI();
        this.node.setScale(1);
    }

    regiesterEvent(): void {
        GlobalEventMgr.getInstance().on(GlobalEventID.monster_die, this.onMstDie, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.up_powect, this.onPowerEffect, this);
    }

    unregiesterEvent(): void {
        GlobalEventMgr.getInstance().off(GlobalEventID.monster_die, this.onMstDie, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.up_powect, this.onPowerEffect, this);
    }


    public async init(info: TurretInfo): Promise<void> {

        this._shootInfo = info;

        // this._battleScene = SceneMgr.getCurrScene() as UISceneBattle;
        this._hasInit = true;

        this.onShowAllWapenUI();
        this.addBorthBuff(); // 添加初始buff
        this.resetLvBg(); // 重置等级背景
        this.resetWapenIcon();
        this.resetWapenStickInfo();
        // this.pickTurretLaunchPos();
        this.updateAmmProgress();
        this.node.scale = 1;
    }
    /**设置是否队友炮塔 */
    setTeamerTurret(isTeamer: boolean): void {
        this.turretInfo.setTeamerTurret(isTeamer);
    }

    protected updateAmmProgress(): void {
        let cdNum = this.turretInfo.getCDTimeMax() <= 0 ? 0 : this.turretInfo.getCurCDTime() / this.turretInfo.getCDTimeMax();
        let ammNum = this.turretInfo.getAmm() / this.turretInfo.getAmmMax();
        cdNum = Math.min(1, cdNum);
        ammNum = Math.min(1, ammNum);
        this.cdProgress.node.active = cdNum > 0;
        this.ammProgress.node.active = ammNum > 0;
        /**cd需要一直展示*/
        this.cdProgress.progress = cdNum;
        /**攻击触发次数-单次触发*/
        this.ammProgress.progress = ammNum;
        if (ammNum) this.scheduleOnce(() => { if (cc.isValid(this.ammProgress)) this.ammProgress.node.active = false; }, 1);
    }

    public relife(): void {
        // this.skillAddAmmoEvent(1, 100)
    }

    // 添加能量
    public addAmm(num: number = 1, actMan: BattleCharUI): boolean {

        if (this.turretInfo.getCurCDTime() > 0) {
            return false;
        }

        // add amm by char
        actMan?.addAmmFrom(num);

        if (this.turretInfo.addAmm(num)) {
            return this.checkAck(0, actMan);
        }
        this.updateAmmProgress();
        return false;
    }

    protected updateCD(dt: number): void {
        if (this.turretInfo.getCurCDTime() > 0) {
            this.turretInfo.reSetCdTime(this.turretInfo.getCurCDTime() - dt * 1000);
            if (this.turretInfo.getCurCDTime() <= 0) {

            }
            this.updateAmmProgress();
        }
    }

    //添加出生buff
    protected addBorthBuff(): void {
        let buffs = GameControl.getInstance().getTurretStartBuff(this.turretInfo.data.typeId, this.turretInfo.data.level);
        for (let i = 0; i < buffs.length; i++) {
            this.turretInfo.addBuffEffect(new BuffEffectInfo(buffs[i], 0, cc.v2(), 0, this));
        }
    }

    public doLevelUp(nextId: number): boolean {
        // let newInfo = new VegetableDataInfo(nextId); // 升级后的数据
        // if (!newInfo || !newInfo.data) {
        //     console.log("turret lvup failed:", nextId);
        //     return false;
        // }

        // this._shootInfo = new VegetableDataInfo(nextId);
        let ret = this._shootInfo.doLevelUp(nextId);

        if (!ret) {
            console.log("turret lvup failed:", nextId);
            return false;
        }

        this.addBorthBuff();
        this.resetLvBg(); // 重置等级背景
        this.resetWapenIcon();

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
        this.checkUpgradeLv5();
        return true; // 返回是否升级成功
    }

    checkUpgradeLv5() {
        if (this.turretInfo?.data?.level >= 5) {
            FormMgr.open(UIConfig.ui_PopGetArtifact, { wapenId: this.turretInfo.data.id });
        }
    }


    // 移除炮塔效果 buff
    public cleanTurretEffect(): void {
        this.turretInfo.cleanBuffEffect();
    }

    public getShootBag(parm: shootBagParm, ext: boolean = false): ShootBagUI {
        let bagInfo = this.turretInfo.getShootBagInfo(parm, 0, ext);
        if (bagInfo) {
            let shootbag = new ShootBagUI(bagInfo);
            // shootbag.onLaserShoot = this.onLaserShoot.bind(this);
            return shootbag;
        }
        return null;
    }

    protected getShootBagParm(ackTaget?: BattleAckObject, ext: boolean = false, actMan: BattleAckObject = null): shootBagParm {
        let parm: shootBagParm = {
            shootObj: this,
            shootWPos: this.getFireWPos(),
            ackTaget: ackTaget,
            endPos: ackTaget?.getAckwPos() || cc.v3(),
            isAoe: false,
            eDir: this.turretInfo.dir,
            ackPower: this._shootInfo.getAttack(ext),
            damAppend: this._shootInfo.getDamAppend(), // 伤害追加
            shootTurretId: this.turretInfo.getID(), // 发射者i
            shootRadius: this.turretInfo.getShootRadius(),
            tHitCriticalAdd: this.turretInfo.fixHitCriticalAdd, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: this.turretInfo.fixHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
            tAoeCriticalAdd: this.turretInfo.fixAoeCriticalAdd, // 调整后 提高aoe暴击概率
            tAoeCriticalHurtAdd: this.turretInfo.fixAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
            reviveAttack: GameControl.getInstance().getReviveAttack(), // 复活攻击力
            shootInfo: this.turretInfo,
            extAckObj: [],
            extShoot: ext,
            damLv: this._shootInfo.getDamLv(),
            damMul: this._shootInfo.getDamMul(), // 百分比修改伤害
            attackMul: this._shootInfo.getAttackMul(), // 百分比修改攻击
            damAdd: this._shootInfo.getDamAdd(), // 强化 伤害
            actMan: actMan,
        }
        return parm;
    }


    // 对象类型
    getGameObjectType(): GameObjectType {
        // return GameObjectType.Turret;
        return this._shootInfo.getObjType();
    }
    ////---------BattleAckObject  end --------------------

    public doUpdate(dt: number): void {
        if (!this._hasInit) return;

        // if (this.turretInfo.getshootBagID() > 0) {
        //     // this.updateShootBag(dt);
        //     this.checkAck(dt); // 检测攻击
        // }
        // 更新炮塔效果
        // this.updateTurretEffect(dt);

        super.doUpdate(dt);
        // this.sendAddCapacityEvent();
        // if (this._infiniteAmm > 0) {
        //     this._infiniteAmm -= dt * 1000;
        //     if (this._infiniteAmm < 0) {
        //         // 停止无限弹药
        //         this.stopInfiniterAmm();
        //     }
        // }
        this.updateCD(dt);

    }


    /**0是数值，1百分比 */
    addHpByBuffkillResHp(type: 0 | 1, hp: number) {
        GlobalEventMgr.getInstance().emit(GlobalEventID.game_hp_add, type, hp);
    }


    // 检查攻击
    protected checkAck(dt: number, actMan: BattleCharUI): boolean {

        if (this.turretInfo.getshootBagID() > 0) {
            // 添加发射包1
            let parm1 = this.getShootBagParm(null, false, actMan);
            let shoot1 = this.getShootBag(parm1, false);
            this._battleScene.addShootBag2Game(shoot1);

            this.turretInfo.reSetCdTime(this.turretInfo.getCDTimeMax());

            // 添加发射包2
            let parm2 = this.getShootBagParm(null, true, actMan);
            let shoot2 = this.getShootBag(parm2, true);
            this._battleScene.addShootBag2Game(shoot2);
            return true;
        }
        return false;
    }

    // 发射位置
    public getFireWPos(): cc.Vec3 {
        return this._shootNode.parent.convertToWorldSpaceAR(this._shootNode.position);
    }


    // 怪物死亡
    onMstDie(monster: BattleAckObject): void {
        // if (this.turretInfo.lastActObj == monster) {
        //     this.turretInfo.lastActObj = null;
        // }
    }

    // 强化效果更新
    onPowerEffect(): void {
        this.turretInfo.refrushPowUpEffect();
    }

    // // 激光发射时间增加
    // protected onLaserShoot(time): void {
    //     this.turretInfo.nextAtkTime += time;
    // }

    public lookAtWPos(wPos: cc.Vec3): void {

        return;
        // console.log("lookAtWPos", this.turretInfo.data.name, this.turretInfo.data.turnType);
        // if (this.turretInfo.data.turnType == 0) {
        //     return;
        // }


        // let turnNode = this._shootNode.parent;

        // let moveDir = wPos.sub(this.node.parent.convertToWorldSpaceAR(this.node.position));
        // let angle = Utils.vector2ToAngle(cc.v2(moveDir.x, moveDir.y)) - 90;
        // if (this.turretInfo.dir == ETurretDir.DOWN) {
        //     angle -= -180;
        // }
        // turnNode.angle = (angle);
    }

    // 重置炮塔图标
    protected resetWapenIcon() {
        let info = this.turretInfo;
        let img = this.node.getChildByName("img")
        let path = `wapen/${info.getTurretAName()}`;
        SceneMgr.getCurrScene().loadSpirteFrame(path, img.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
        this._shootNode = img.getChildByName("firePos");
        this.showUpIcon(false);
    }

    protected resetWapenStickInfo() {
        let tm = this.node.getComponent(TurretMoveUI);
        let typeID = 0;
        //棍子信息
        if (this.turretInfo.data.wapenType == WapenType.stick) {
            typeID = this.turretInfo.data.typeId;
        }
        if (tm) tm.setStickID(typeID);
    }

    public showUpIcon(v: boolean): void {
        this.upIcon.active = v;
        if (v) {
            this.scheduleOnce(() => {
                cc.isValid(this.upIcon) && this.upIcon.getComponent(ChestJump).playJumpAnimation();
            })

        } else {
            this.upIcon.getComponent(ChestJump).stop();
        }
    }

    // 重置炮塔背景
    protected resetLvBg(): void {

        let cLv = this.turretInfo.getCompLevel();
        let ext = 'huang'
        switch (cLv) {
            case 1:
                ext = 'lv'
                break;
            case 2:
                ext = 'lan'
                break;
            case 3:
                ext = 'zi'
                break;
            case 4:
                ext = 'huang'
                break;
            case 5:
                ext = 'hong'
                break;
            case 99:
                ext = 'god'
                break;
        }
        let bgPath = "ui_bt/zy_k_" + ext
        SceneMgr.getCurrScene().loadSpirteFrame(bgPath, this.wapenBG, GameBundle.Bundle_commonRes);
        if (this.wapenGuang) {
            cc.Tween.stopAllByTarget(this.wapenGuang);
            this.wapenGuang.node.stopAllActions();
            this.wapenGuang.node.active = false;
            if (cLv >= 99) {
                this.wapenGuang.node.active = cLv == 99;
                SceneMgr.getCurrScene().loadSpirteFrame("ui_bt/zy_k_godBg", this.wapenGuang, GameBundle.Bundle_commonRes);
                cc.tween(this.wapenGuang.node).by(3, { angle: 360 }).repeatForever().start();
            }
        }
        if (cLv < 99) {
            if (this.turretInfo.needLvIcon()) {
                let lvbgPath = "ui_bt/zy_b_" + ext;
                SceneMgr.getCurrScene().loadSpirteFrame(lvbgPath, this.lvBG, GameBundle.Bundle_commonRes);
            } else {
                this.lvBG.node.active = false;
            }
        } else this.lvBG.node.active = false;
        
        this.tips.string = this.turretInfo.getWapenNote2();
    }

    public getLvBgShow() {
        let cLv = this.turretInfo.getCompLevel();
        if (cLv == 99) return false;
        return this.turretInfo.needLvIcon();
    }

    // 获取空闲动画名称
    protected getIdleAnimName(): string {
        // 返回空闲动画名称
        let rStr = 'idle';
        return rStr;
    }

    // 获取攻击动画名称
    protected getAckAnimName(): string {
        let rStr = 'firing';
        return rStr;
    }

    /**单个图标展示*/
    public onShowSingleIcon() {
        this.wapenBG.node.active = false;
        this.lvBG.node.active = false;
        // this.upIcon.active = false;
        this.tips.node.active = false;
    }

    public onShowAllWapenUI() {
        this.wapenBG.node.active = true;
        this.lvBG.node.active = this.getLvBgShow();
        this.tips.node.active = true;
    }

    public moveBack() {
        this.node.getComponent(TurretMoveUI).moveBack();
        this.node.setScale(1);
        GlobalEventMgr.getInstance().emit(GlobalEventID.turret_move_back, this);
    }

    reuse(): void {
        this.regiesterEvent();
    }

    unuse(): void {
        // this._shootBag = [];
        this.clean();
        this.node.scale = 1;
        this.node.getComponent(TurretMoveUI).enabled = true;
    }

    //清除数据
    protected clean(): void {
        super.clean();
        this.unregiesterEvent();
        this._hasInit = false;
    }

    protected onDestroy(): void {
        super.onDestroy();
    }

}
