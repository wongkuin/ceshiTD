
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import MotionTrail from "../../TRFrameWork/Common/Components/MotionTrail";
import CharHeroInfo, { BuffEffectInfo, MapConfigInfo, mapIndex, ShootBagInfo, shootBagParm } from "../config/DataInfo";
import { BtAckObjState, eCharState, ETurretDir, GameObjectType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import { IPoolComponent } from "./BattleBase";
import CharMoveUI from "./CharMoveUI";
import GameControl from "./GameControl";
import ShootBagUI from "./ShootBagUI";
import StickColliderListener from "./StickColliderListener";

const { ccclass, property } = cc._decorator;

// enum eCharState {
//     Idle = 0,
//     
//     Attack = 2,
//     Die = 3,
// }


@ccclass
export default class BattleCharUI extends BattleAckObject implements IPoolComponent {

    @property(cc.Node)
    hitPos: cc.Node = null;

    @property(cc.Node)
    hpRoot: cc.Node = null;

    @property(cc.Node)
    stickNode: cc.Node = null;
    @property(cc.Node)
    stickNode_team: cc.Node = null;

    _moveUI: CharMoveUI = null;

    protected _orginScaleX: number = 1; // 初始缩放

    protected _hasInit: boolean = false; // 是否初始化

    protected _mapConfig: MapConfigInfo = null; // 地图配置

    // protected _curPathIndex: number = 0; // 当前路径索引

    protected _reverse: boolean = false; // 是否反向

    protected _mapIdx: mapIndex = null; // 当前地图索引

    protected _motionTrail: MotionTrail = null; // 运动轨迹
    protected _maxLevel: number = 1; // 最大等级
    protected _curLevel: number = 1; // 当前等级
    protected _addAmmPoint: number = 0; // 每次增加能量点数

    public startIndex: number = 0; // 起始路径索引

    public get charInfo(): CharHeroInfo {
        return this._shootInfo as CharHeroInfo;
    }

    public get moveUI(): CharMoveUI {
        if (this._moveUI) {
            return this._moveUI;
        }
        else {
            this._moveUI = this.node.getComponent(CharMoveUI);
            return this._moveUI;
        }
    }

    onLoad(): void {
        super.onLoad();
        this._buffRoot = this.hitPos;
        this._stunRoot = this.hpRoot;
        try {
            const cm = cc.director.getCollisionManager();
            if (cm && !cm.enabled) cm.enabled = true;
        } catch (e) { }
        // 给 stickNode 添加监听组件（若需要）
        if (this.stickNode) {
            let lst = this.stickNode.getComponent(StickColliderListener) as any;
            if (!lst) {
                try {
                    lst = this.stickNode.addComponent(StickColliderListener);
                } catch (e) { lst = null; }
            }
            if (lst) lst.owner = this;

            // 确保 stickNode 有 BoxCollider
            try {
                let bc = this.stickNode.getComponent(cc.BoxCollider) as cc.BoxCollider;
                if (!bc) {
                    bc = this.stickNode.addComponent(cc.BoxCollider);
                    const size = this.stickNode.getContentSize();
                    bc.size.width = size.width || 100;
                    bc.size.height = size.height || 100;
                }
            } catch (e) { }
        }
    }


    regiesterEvent(): void {
        GlobalEventMgr.getInstance().on(GlobalEventID.hero_use_skill, this.onHeroUseSkill, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.HERO_LEVEL_UP, this.onHeroLevelUp, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.CHAR_RESET, this.resetAngle, this);
    }

    unRegiesterEvent(): void {
        GlobalEventMgr.getInstance().off(GlobalEventID.hero_use_skill, this.onHeroUseSkill, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.HERO_LEVEL_UP, this.onHeroLevelUp, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.CHAR_RESET, this.resetAngle, this);

    }

    onHeroUseSkill() {
        this.doShoot();
    }

    onHeroLevelUp(blockIdx: number = 0, newCharInfo: CharHeroInfo = null) {
        if (blockIdx != this.startIndex) return;
        this._shootInfo = newCharInfo;
        this._curLevel = newCharInfo.data.maxLevel
        this._maxLevel = newCharInfo.data.maxLevel;
        this._addAmmPoint = newCharInfo.data.addAmm;
        this.onLevelChange();
        this.charInfo.changeCharState(eCharState.move);
    }

    public initChar(cInfo: CharHeroInfo, curPathIndex: number = 0, reverse: boolean = false): void {
        this.regiesterEvent();
        // this._battleScene = GameControl.getInstance().sceneBattle;
        if (this.moveUI) this.moveUI.enabled = false;
        this._shootInfo = cInfo;
        this.charInfo.idx = curPathIndex;
        this.node.opacity = 255;
        this.node.setPosition(cc.v2(0, 0));
        // this._mapIdx = {
        //     index: curPathIndex,
        //     reverse: reverse
        // }
        this._curLevel = cInfo.data.maxLevel;
        this._mapConfig = GameControl.getInstance().getPassInfo().mapConfig;
        // let pos = this._mapConfig.getIndexPos(this._mapIdx.index)
        // this.node.setPosition(pos);
        this.startIndex = curPathIndex;
        this._reverse = reverse;
        this.resetAngle();
        this.charInfo.changeCharState(eCharState.move);
        this._hasInit = true;
        // this.getSpine();
        this._maxLevel = cInfo.data.maxLevel;
        this._addAmmPoint = cInfo.data.addAmm;
        // this._orginScaleX = this._spine.node.scaleX;
        this.onLevelChange();
        this.scheduleOnce(() => {
            this.updateAnimByState(eCharState.move);
        })
    }

    setGuangTy() {
        let ty = Utils.getWidget("touying", this.node);
        if (ty)
            ty.active = false;

        let guangTY = Utils.getWidget("guangTY", this.node);
        if (guangTY)
            guangTY.active = true;
    }

    protected getSpine(): void {
        if (!this._spine) {
            this._spine = this.node.getChildByName('spine').getComponent(sp.Skeleton);
            this._spine.setCompleteListener(this.onSpineComplete.bind(this));
            this._motionTrail = this.node.getComponentInChildren(MotionTrail);
            this._spine.setEventListener(this.onSpineEvent.bind(this));

        }
    }

    protected onSpineEvent(track: any, event: any) {
        // console.log('onSpineEvent', event.data.name);
        if (event.data.name == 'step') { // 脚下声音
            let ss = this.charInfo.data.foot;//ConfigMgr.getInstance().getById(17, KvData).val.split(',');
            let sname = ss[Math.floor(Math.random() * ss.length)];
            SoundMgr.getInstance().playSound(sname);
            // console.log('播放脚步音效', sname);
        }
    }



    public levelChange(newLevel: number) {
        this._curLevel = newLevel;
    }

    protected onLevelChange() {
        this.stickNode.width = (this._curLevel - 1) * 100 + 140;
    }

    public doReverse() {
        console.log('反转');
        this._reverse = !this._reverse;
        this._mapIdx.reverse = this._reverse;
    }

    public doubleClick() {
        console.log('双击');
        this.charInfo.clickNum++;
    }

    addAmmFrom(num: number): void {
        if (this.charInfo.curState == eCharState.jumpEnd) {
            this.charInfo.changeCharState(eCharState.move);
        } else {
            if (this.charInfo.clickNum > 0) {
                this.charInfo.clickNum--;
                this.doJump();
            }
        }
    }

    public getCurPathIdx(): number {
        return this._mapIdx.index;
    }

    protected doJump(): void {
        this.charInfo.changeCharState(eCharState.jump); // 跳跃
        this.updateAnimByState(eCharState.jump);
    }

    protected onEndJump() {
        this.charInfo.changeCharState(eCharState.jumpEnd); // 跳跃
        this.updateAnimByState(eCharState.move);
        let bIdx = this._mapConfig.getBlockIndex(this._mapIdx.index);
        this.postReceiveEvent(bIdx);
    }

    protected onSpineComplete(data: any) {
        if (data.animation && data.animation.name == "jump") {
            this.onEndJump();
        }
    }

    public doUpdate(dt: number): void {
        if (!this._hasInit) {
            return;
        }

        switch (this.charInfo.curState) {
            case eCharState.idle:
                break;
            case eCharState.move:
            case eCharState.jumpEnd:
            case eCharState.jump:
                this.updateMove(dt);
                break;
            default:
                break;
        }
        super.doUpdate(dt);
        // this.updateShoot(dt);
    }


    protected updateAnimByState(st: eCharState): void {
        if (!this._spine) return;
        switch (st) {
            case eCharState.idle:
                this._spine.setAnimation(0, 'idle', true);
                break;
            case eCharState.move:
                this._spine.setAnimation(0, 'walk', true);
                break;
            case eCharState.jump:
                this._spine.setAnimation(0, 'jump', false);
                break;
            default:
                break;
        }
    }

    public getAckwPos(): cc.Vec3 {
        return this.hitPos.convertToWorldSpaceAR(cc.v3());
    }

    protected doShoot() {
        console.error("主动技能触发", this.charInfo.getSKillData().shoot);
        let sid = this.charInfo.getSKillData().shoot;
        if (!(sid > 0)) {
            return;
        }
        let actTarget = null;
        let pos = cc.v3();
        // A+100）*B/100
        let A = this._battleScene.getTurretBasePower();
        let B = this.charInfo.getSKillData().att;
        let power = Math.floor((A + 100) * B / 100);
        console.log("主动技能伤害:", 'A', A, 'B', B, 'power', power);
        let shootPos = this.getFireWPos();
        let param: shootBagParm = {
            shootObj: this,
            shootWPos: shootPos,
            ackTaget: actTarget,
            endPos: pos,
            isAoe: false,
            eDir: ETurretDir.None,
            ackPower: power,   // 攻击力
            damAppend: this.charInfo.getDamAppend(), // 伤害追加
            shootTurretId: this.charInfo.data.id, // 发射者i
            shootRadius: 0, // 发射半径
            tHitCriticalAdd: this.charInfo.fixHitCriticalAdd, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: this.charInfo.fixHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
            tAoeCriticalAdd: this.charInfo.fixAoeCriticalAdd, // 调整后 提高aoe暴击概率
            tAoeCriticalHurtAdd: this.charInfo.fixAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
            shootInfo: this.charInfo,
            reviveAttack: 0,
            extAckObj: [],
            damLv: this.charInfo.getDamLv(),
            damMul: this.charInfo.getDamMul(), // 百分比修改伤害
            attackMul: this.charInfo.getAttackMul(), // 百分比修改攻击
            damAdd: this.charInfo.getDamAdd(), // 强化 伤害
            actMan: null,

        };
        let bagInfo = this.charInfo.getShootBagInfo(param, sid)
        let shootbag = new ShootBagUI(bagInfo);
        let scene = this._battleScene;
        scene.addShootBag2Game(shootbag);
    }

    public override  addBuffect(buffect: BuffEffectInfo): void {
        super.addBuffect(buffect);
        console.log('添加 hero buff');
    }

    protected updateMove(dt: number): void {
        let tempIdx = { index: this._mapIdx.index, reverse: true };
        let newIdx = this._mapConfig.getNextAngleIndex(tempIdx);
        let nextAngle = this._mapConfig.getAngleByIndex(newIdx.index);
        let diff = Math.abs(nextAngle - this.node.angle);
        diff = Math.min(diff, 360 - diff);
        let mDis = dt * this.charInfo.moveBase * this.charInfo.moveMul;
        if (this._spine) {
            this._spine.timeScale = this.charInfo.moveMul;
        }

        if (this._motionTrail && !this._motionTrail.active && this.charInfo.moveMul > 1.2) {
            this._motionTrail.active = true;
        } else if (this._motionTrail && this._motionTrail.active && this.charInfo.moveMul < 1.2) {
            this._motionTrail.active = false;
        }

        if (diff < mDis) {
            this._mapIdx = newIdx;

            if (this._mapIdx.index < 0) {
                console.error('map end position');
            }

            //已经发射得格子
            let isShootedBlock: Set<number> = new Set();
            let testLv = this.stickNode.getContentSize().width < 150 ? 1 : 2;
            // 回退兼容：若顶端未命中，则按每个等级的块触发（旧逻辑）
            for (let lv = 1; lv <= testLv; lv++) {
                let list = this._mapConfig.getBlockIDListByIndex(newIdx.index, lv);
                for (let shootID = 0; shootID < list.length; shootID++) {
                    let ele = list[shootID];
                    if (isShootedBlock.has(ele)) continue;
                    this.postReceiveEvent(ele);
                    isShootedBlock.add(ele);
                }
            }

            // 抵达新块
            this.upDateBuffectByBlock();

        }
        this.node.angle = (this.node.angle - mDis + 360) % 360;

        if (this.charInfo.maxLiveTime > 0) {
            this.charInfo.liveTime += dt * 1000;
            if (this.charInfo.liveTime > this.charInfo.maxLiveTime) {
                this.charInfo.state = BtAckObjState.End
            }
        }
    }

    /**
     * 处理接收新块事件
     * @param bid 块ID
     */
    protected postReceiveEvent(bid: number): void {
        // console.log('抵达新块', this._mapIdx.index, bid); // 输出当前地图索引和新块ID
        GlobalEventMgr.getInstance().emit(GlobalEventID.revice_block, { bid: bid, actMan: this }) // 发送全局事件，通知新块到达
    }

    // Called by StickColliderListener when stick collides with a SectorBlockItem
    public onStickCollisionEnter(block: any, other: cc.Collider, self: cc.Collider) {
        try {
            (block as any)._collidingByStick = true;
            // 可视化提示（仅作调试），若格子有选中节点则显示
            if (block.selectNode) block.selectNode.active = true;
            // this._lastCollidingBlock = block;
            // 简要日志
            // console.log('stick collision enter', block.idx);
        } catch (e) { }
    }

    public onStickCollisionExit(block: any, other: cc.Collider, self: cc.Collider) {
        try {
            (block as any)._collidingByStick = false;
            if (block.selectNode) block.selectNode.active = false;
            // if (this._lastCollidingBlock === block) this._lastCollidingBlock = null;
            // console.log('stick collision exit', block.idx);
        } catch (e) { }
    }

    protected changeObjDir(dx, deep): void {

        if (dx > 0.01) {
            this._spine.node.scaleX = this._orginScaleX;
        } else if (dx < -0.01) {
            this._spine.node.scaleX = -this._orginScaleX;
        } else {
            let newIdx = this._mapConfig.getNextIndex({ index: this._mapIdx.index + deep, reverse: this._mapIdx.reverse });
            let nextPos = this._mapConfig.getIndexPos(newIdx.index);
            let fix = (this._mapIdx.reverse ? -1 : 1);
            this.changeObjDir(nextPos.x - this.node.x, deep + fix);
        }
    }

    canAck(): boolean {
        return this.charInfo.state == BtAckObjState.Run;
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

    public isWaitRemove(): boolean {
        let end = this._shootInfo && this._shootInfo.state == BtAckObjState.End;
        return end;
    }


    // 修改状态
    protected changeState(state: BtAckObjState) {
        this._shootInfo.state = state;
    }

    // 对象类型
    getGameObjectType(): GameObjectType {
        return GameObjectType.Hero;
    }

    reuse(): void {
    }

    unuse(): void {
        this.unRegiesterEvent();
        this._shootInfo = null;
        this._spine.node.scaleX = this._orginScaleX;
        this._hasInit = false; // 是否初始化
    }

    // update (dt) {}


    resetAngle() {
        let angle = this._mapConfig.getStickStartAngleByIndex(this.startIndex);
        let curIndex = this._mapConfig.getCurIndexByAngle(angle);
        this._mapIdx = {
            index: curIndex,
            reverse: this._reverse
        }
        this.node.angle = angle;
    }

    getAddAmmPoint(): number {
        return this._addAmmPoint;
    }

    public moveBack() {
        this.node.getComponent(CharMoveUI).moveBack();
    }

    public isMaxLevel() {
        return this._curLevel >= this._maxLevel;
    }
    public getCurLevel() {
        return this._curLevel;
    }

    public upLevel() {
        this._curLevel += 1;
        this.charInfo.curLevel = this._curLevel;
        this.onLevelChange();
    }
}
