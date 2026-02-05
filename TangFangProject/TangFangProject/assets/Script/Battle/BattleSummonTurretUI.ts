

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { QTBox, QTCircle } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../config/ConfigMgr";
import { BulletSkillData } from "../config/DataDef";
import { BuffEffectInfo, shootBagParm, SummonTurretInfo } from "../config/DataInfo";
import { BtAckObjState, GameBundle, GameObjectType, MonsterActionStatue, MonsterAnimName, MonsterDeathType } from "../config/GameEnum";
import BattleAckObject from "./BattleAckObjet";
import { IPoolComponent } from "./BattleBase";
import GameControl from "./GameControl";
import MonsterHp from "./MonsterHp";
import ShootBagUI from "./ShootBagUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleSummonTurretUI extends BattleAckObject implements IPoolComponent {

    @property(MonsterHp)
    hp: MonsterHp = null; // 血条

    // protected _spine: sp.Skeleton = null; // spine动画

    protected get _monsterInfo(): SummonTurretInfo {
        return this._shootInfo as SummonTurretInfo;
    };  // 信息


    protected _orginScaleX: number = 1; // 初始缩放
    protected _hpOrginX: number = 0; // 血条x偏移

    protected _hasInit: boolean = false; // 是否初始化

    protected _shootNode: cc.Node = null; // 子弹发射节点

    protected _deathMaterial: cc.Material = null; // 死亡材质
    protected _normalMaterial: cc.Material = null; // 正常材质

    protected _assaultPos: cc.Vec2 = null; //
    protected _assaultDis: number = 88;

    protected _spineDir: number = 1; // spine方向
    // protected _mDir: ETurretDir = ETurretDir.UP;

    protected _currDistance: number = 0; // 当前距离
    protected _qtOffset: cc.Vec2 = cc.v2(0, 0); // quadtree偏移


    onLoad() {
        super.onLoad();
        this._hpOrginX = this.hp.node.x; // 记录血条初始x偏移
    }

    start() {
        super.start();
        this._shootNode = this.node;
    }

    drawDebug() {
        let hpTxt = new cc.Node().addComponent(cc.Label);
        hpTxt.node.color = cc.Color.BLUE;
        hpTxt.fontSize = 26;
        this.node.addChild(hpTxt.node);
        this.node['hpTxt'] = hpTxt;
    }

    public init(info: SummonTurretInfo): void {
        this.node.active = true;
        this.node.opacity = 0
        this._shootInfo = info;
        this.node.scale = info.getScale();

        // this._fixScale = info.getScale();
        this.resetAckTarget(this._battleScene.getPassControl().getGameTripod());
        this.scheduleOnce(() => {
            this.doInit(info);
        })

        this.hp.node.active = false;
        // if (this._monsterInfo.endlessHp == 1) {
        //     GlobalEventMgr.getInstance().on(GlobalEventID.Post_Boss_Skill, this.onPostAckSkill, this);
        // }
    }


    protected doInit(info: SummonTurretInfo) {

        this.getSpine();
        // this._battleScene = SceneMgr.getCurrScene() as UISceneBattle;
        // this.addQTShape();

        this.dirInit();
        this.stateChangeAnim(); // 初始化动画
        // this.hp.setHpProgress(); // 初始化血条
        this.hp.initBar(this._monsterInfo.getMaxHp(), GameControl.getInstance().getPassInfo().data.BOSS);

        if (this.node.x < 0) {
            this.changeObjDir(-1);
        } else {
            this.changeObjDir(1);
        }

        // if (info.birthPos == MonsterBrithType.Top) {
        //     this._monsterInfo.dir = ETurretDir.UP;
        // } else if (info.birthPos == MonsterBrithType.Bottom) {
        //     this._monsterInfo.dir = ETurretDir.DOWN;
        // }
    }

    protected getSpine() {

        if (this._spine) return this._spine;
        this._spine = this.node.getChildByName('spine').getComponent(sp.Skeleton);
        let sRoot: cc.Node = new cc.Node('sRoot');
        this.node.addChild(sRoot, -1);
        sRoot.setSiblingIndex(0);

        let iNode = this.node.getChildByName('img');
        iNode && (iNode.parent = sRoot)
        this._spine.node.parent = sRoot;

        SceneMgr.getCurrScene().loadRes("effect/Flash", cc.Material, GameBundle.Bundle_commonRes).then((mat: cc.Material) => {
            if (!mat || !cc.isValid(this._spine)) return;
            this._spine.setMaterial(0, mat);
            this._normalMaterial = mat;
        });

        SceneMgr.getCurrScene().loadRes("effect/SpineDeath", cc.Material, GameBundle.Bundle_commonRes).then((mat: cc.Material) => {
            if (!mat || !cc.isValid(this._spine)) return;
            this._deathMaterial = mat;
        });

        this._spine.setCompleteListener((data) => {
            // this.stateChangeAnim(); //攻击结束，播放站立动画
            if (data.animation && data.animation.name.startsWith(MonsterAnimName.Attack) && this._monsterInfo.actionSt == MonsterActionStatue.Attack) {
                this.dirInit();
                this.changeActionState(MonsterActionStatue.Move);
            }
        });

        this._spine.setToSetupPose();
        this._spine.setBonesToSetupPose();
        this._spine.setSlotsToSetupPose();

        this._spine.enableBatch = true;
        this._orginScaleX = this._spine.node.scaleX;

        let sk: any = this._spine;
        let attachUtil = sk.attachUtil;
        //生成挂点
        attachUtil.generateAllAttachedNodes();
        //找到挂点
        let bNode = attachUtil.getAttachedNodes('buff');
        let sNode = attachUtil.getAttachedNodes('stun');

        bNode && bNode[0] && (this._buffRoot = bNode[0]);
        sNode && sNode[0] && (this._stunRoot = sNode[0]);
        // console.log('buffRoot', this._buffRoot.name, 'stunRoot', this._stunRoot.name);
    }

    // 重置攻击目标
    protected resetAckTarget(tag: BattleAckObject) {
        // this._monsterInfo.lastActObj = tag;
        // this._monsterInfo.toucheCart = false;
    }

    // 目标距离
    public getDistanceWithTarget(): number {
        return this._currDistance;
    }

    public doUpdate(dt) {
        if (!this._hasInit) return; // 没有初始化
        super.doUpdate(dt);

        this.node.zIndex = 2000 - this.node.position.y;
        // if (this._monsterInfo.actionSt == MonsterActionStatue.Jump) {
        //     this.node.zIndex = 4000;
        // }
        switch (this._monsterInfo.state) {
            case BtAckObjState.Init:
            case BtAckObjState.Die:
            case BtAckObjState.Start:
            case BtAckObjState.End:
                break;
            case BtAckObjState.Run:
                this.doRun(dt);
                break;
        }

        this.checkQTCollision();

    }

    lastFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 上一帧碰撞的对象
    currentFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 当前帧碰撞的对象

    protected checkQTCollision(): void {
        // console.log("checkCollision", this._bulletInfo.state);
        if (this._monsterInfo.state != BtAckObjState.Run) {
            return;
        }

        if (this.lastFrameCollisions.size != 0 || this.currentFrameCollisions.size != 0) {
            this.lastFrameCollisions = this.currentFrameCollisions;
            this.currentFrameCollisions = new Set<QTShape>();
        }
    }


    onCollisionEnterQT(other: QTShape): void {

    }

    onCollisionExitQT(other: QTShape): void {

    }


    protected doRun(dt: number): void {

        if (this._monsterInfo.getCurHp() <= 0 || this._monsterInfo.checkOutTime()) {
            this.toDie();
            return;
        }

        // this.checkActionType();

        switch (this._monsterInfo.actionSt) {
            case MonsterActionStatue.Move:
                this.doMove(dt);
                break;
            case MonsterActionStatue.Attack:
                this.doAttack(dt);
                break;
            case MonsterActionStatue.Stand:
                this.doStand(dt);
                break;
            case MonsterActionStatue.RandomMove:
                this.doRandomMove(dt);
                break;
            case MonsterActionStatue.Assault:
                this.doAssault(dt);
                break;
            case MonsterActionStatue.Repel:
                break;
            case MonsterActionStatue.Jump:

                break;
        }

        // this.updateShootBag(dt);
        this._monsterInfo.liveTime += dt * 1000;

        if (this._silent <= 0) {
            this._monsterInfo.nextAtkTime -= dt * 1000;
        }
    }

    protected doMove(dt: number) {
        let dir = this._monsterInfo.moveDir;
        this.movePos(dt, dir);
        let currDist = this.getCurrDist();
        this._currDistance = currDist;
        this.dirInit();

        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0
            // && currDist <= this._monsterInfo.sData.atkDist
        ) {
            this.changeActionState(MonsterActionStatue.Attack);
        }
    }

    addQTShape() {
        let ccs = this.node.getComponentsInChildren(cc.CircleCollider); // 获取所有碰撞体
        for (let i = 0; i < ccs.length; i++) {
            let box = ccs[i]
            if (box.tag == 9999) {
                let shape = new QTCircle(box.radius, this.getGameObjectType());
                shape.node = this.node;
                this._qtShapes.push(shape);
                shape.setScale(this.node.scale);
                GameControl.getInstance().getQuadTree() && GameControl.getInstance().getQuadTree().insert(shape);
            }
            else if (box.tag == 1000) {
                let shape = new QTCircle(box.radius, GameObjectType.FireBox);
                shape.node = this.node;
                shape.setScale(this.node.scale);
                this._qtShapes.push(shape);
                GameControl.getInstance().getQuadTree() && GameControl.getInstance().getQuadTree().insert(shape);
            }

            this._qtOffset.x = box.node.x;
            this._qtOffset.y = box.node.y;
        }
        this.resetQTPos();
    }

    protected override getQTOffset(): cc.Vec2 {
        return this._qtOffset.mul(this.node.scale);
    }

    protected doAttack(dt: number) {
        let dir = this._monsterInfo.moveDir;
        this.movePos(dt, dir);
    }

    protected doStand(dt: number) {
        let currDist = this.getCurrDist();
        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0
        ) {
            this.changeActionState(MonsterActionStatue.Attack);
        }
    }

    protected doRandomMove(dt: number) {
        // 进入攻击
        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0
        ) {
            this.changeActionState(MonsterActionStatue.Attack);
            return;
        }
        let dir = this._monsterInfo.moveDir;
        this.movePos(dt, dir);
    }

    // 移动
    protected movePos(dt: number, dir: cc.Vec2) {
        let speed = this._monsterInfo.getFixSpeed(this.getBuffectMoveSpeed());
        const delta = dir.mul(speed * dt);
        if (this.isFreeze()) {
            delta.x = 0;
            delta.y = 0;
        }
        this.node.x += delta.x;
        this.node.y += delta.y;

        if (delta.x < 0) {
            this.changeObjDir(-1);
        } else if (delta.x > 0) {
            this.changeObjDir(1);
        }

    }

    // 修改朝向
    protected changeObjDir(num: number) {
        if (!this._spine) { return; }
        // num = -num;
        this._spine.node.scaleX = this._orginScaleX * num;
        this.hp.node.x = this._hpOrginX * num;
        if (num == this._spineDir) {
            return;
        }
        this._spineDir = num;
        // console.log(`change spine dir = ${num}`);
        for (const element of this._qtShapes) {
            let qtbox = (element as QTBox)
            let newX = -(qtbox.x + qtbox.width);
            qtbox.resetPoints(newX, qtbox.y, qtbox.width, qtbox.height);
        }
    }

    // 等待移除
    public isWaitRemove(): boolean {
        return this._monsterInfo && this._monsterInfo.state == BtAckObjState.End;
    }

    // 是否存活
    public isLiving(): boolean {
        return this._monsterInfo && this._monsterInfo.isLiving();
    }

    // 设置状态
    protected changeState(state: BtAckObjState): void {
        if (!this._monsterInfo) {
            debugger;
            return;
        }

        // console.log(`changeState = ${state}`, this.node.uuid);
        if (this._monsterInfo.state == state) return;
        this._monsterInfo.state = state;
        //  回收
        // if (this._monsterInfo.state == BtAckObjState.End) {
        //     let skID = 0;
        //     if (this._monsterInfo.getCurHp() > 0) {
        //         skID = this._monsterInfo.hasDeathType(MonsterDeathType.ColliderSkill);
        //     }
        //     if (skID > 0) {
        //         this.addBulletSKill(ConfigMgr.getInstance().getById(skID, BulletSkillData))
        //     }
        // }

        if (state == BtAckObjState.End || state == BtAckObjState.Die) {
            this.delQTShape();
            GlobalEventMgr.getInstance().emit(GlobalEventID.monster_die, this);
        }
    }

    protected changeActionState(state: MonsterActionStatue): void {
        // if (this._monsterInfo.actionSt == state) return;
        this._monsterInfo.actionSt = state;
        this.stateChangeAnim();
        // console.log(`changeActionState = ${state}`, this.node.uuid);
    }

    ////---------BattleAckObject
    // 获取攻击位置
    getAckwPos(): cc.Vec3 {

        // this._spine.debugBones
        let behie = this._spine.node.getChildByName("behit")
        if (behie) {
            return behie.convertToWorldSpaceAR(cc.v3());
        }
        //return this.node.position;// return this.node.position;
        return this._spine.node.parent.convertToWorldSpaceAR(cc.v3(this._spine.node.x, this._spine.node.y + this._spine.node.height / 4));

    }

    // getNode(): cc.Node {
    //     return this.node;
    // }

    canAck(): boolean {
        if (!this._hasInit) {
            return false;
        }
        return this._monsterInfo.state == BtAckObjState.Run;
    }

    // // 获取炮塔信息
    // getAckInfo() {
    //     return this.getMonsterInfo();
    // }

    getMonsterInfo(): SummonTurretInfo {
        return this._monsterInfo;
    }

    // 获取怪物类型
    // getMonsterType(): MonsterType {
    //     return this._monsterInfo.getMonsterType();
    // }

    // 对象类型
    getGameObjectType(): GameObjectType {
        return this._monsterInfo.sourceTag;
    }

    subHp(hurt: number, isCrit: boolean = false, realyHP: boolean = false): number {
        let iRet: number = 0;
        let retX: number = 1;

        hurt = -hurt;
        if (!this.isLiving() || this._monsterInfo.getCurHp() <= 0) {
            return iRet;
        }

        // this.hp.node.active = true;
        let oldShow = Math.ceil(this._monsterInfo.getCurHp());
        this._monsterInfo.changeHp(hurt, false); // -= hurt;
        let newShow = Math.ceil(this._monsterInfo.getCurHp());
        iRet = oldShow - newShow;
        if (newShow <= 0) {
            iRet = Math.ceil(-hurt);
        }

        // console.log('monster subhp', this._monsterInfo.getMaxHp(), this._monsterInfo.curHp);
        if (this._monsterInfo.getCurHp() <= 0) {
            // this.toDie(); // 死亡
            this.hp.node.active = false; // 隐藏血条

            let dEvent = this._monsterInfo.HpDeathEvent(); // 死亡事件
            for (const element of dEvent) {
                // console.error('怪物死亡 触发事件', this.node.uuid);
                GlobalEventMgr.getInstance().emit(GlobalEventID.func_event, { id: element, wPos: this.getAckwPos() });
            }
            let skID = this._monsterInfo.hasDeathType(MonsterDeathType.HpSkill);
            if (skID > 0) {
                this.addBulletSKill(ConfigMgr.getInstance().getById(skID, BulletSkillData))
            }
            GlobalEventMgr.getInstance().emit(GlobalEventID.game_mp_monDeath, this.getAckwPos());
        } else {
            this.hp.setHpProgress(this._monsterInfo.getCurHp()); // 初始化血条
        }
        return iRet * retX;
        // console.log(`doHurt = ${this._monsterInfo.curHp}`);
        // this.node['hpTxt'] && (this.node['hpTxt'].string = `${this._monsterInfo.curHp}`);
    }

    public getShootBag(parm: shootBagParm, sId: number): ShootBagUI {
        let bagInfo = this._monsterInfo.getShootBagInfo(parm, sId);
        if (bagInfo) {
            let shootbag = new ShootBagUI(bagInfo);
            console.log("怪物攻击", this.node.uuid);
            this._battleScene.addShootBag2Game(shootbag);
        }
        return null;
    }

    isliving(): boolean {
        return this._monsterInfo.isLiving();
    }

    // -----------end BattleAckObject
    protected showEnterAnim(animTime: number, cb: Function = null): void {
        cc.tween(this.node).
            to(animTime, { opacity: 255 })
            .call(() => {
                cb && cb(); // 回调
            }).start();
    }

    protected onAfterEnter(): void {
        this.addQTShape(); // 添加碰撞
        this.changeState(BtAckObjState.Run);
        this.addBrothBuff();
        this.addBrothShoot(); // 添加攻击
        this.dirInit();
        this.changeActionState(MonsterActionStatue.Move);
        this.normalColor();
        this._hasInit = true;
    }

    protected showDieAnim(animTime: number, cb: Function = null): void {

        cc.tween(this.node)
            .to(animTime, { opacity: 0 })
            .call(() => {
                cb && cb(); // 回调
            }).start();
    }

    protected onAfterDie(): void {
        this.changeState(BtAckObjState.End); // 死亡
    }

    // 状态改变 修改动画
    protected stateChangeAnim(): void {
        // let oldAnima = this.spine.animation;
        // console.log(`monster state = ${this.monsterInfo.state}`)

        switch (this._monsterInfo.state) {
            case BtAckObjState.Init:
                let mName = "chusheng";//MonsterAnimName.Enter;
                let anim = this._spine.findAnimation(mName);
                let animTime = 0.15;
                if (anim) {
                    this._spine.setAnimation(0, mName, false);
                    animTime = anim.duration;
                    this.node.opacity = 255;
                } else {
                    mName = MonsterAnimName.Idle;
                    this._spine.setAnimation(0, mName, true);
                }
                this.showEnterAnim(animTime, this.onAfterEnter.bind(this));
                // cc.tween(this.node).
                //     to(animTime, { opacity: 255 })
                //     .call(() => {
                //         this.addQTShape(); // 添加碰撞
                //         this.changeState(BtAckObjState.Run);
                //         this.addBrothBuff();
                //         this.dirInit();
                //         this.changeActionState(MonsterActionStatue.Move);
                //         this.normalColor();
                //         this._hasInit = true;
                //     }).start();
                break;
            case BtAckObjState.Run:
                this.checkRunAnim();
                break;
            case BtAckObjState.Die:
                this._spine.setMaterial(0, this._deathMaterial);
                // 死亡动画
                let dieAnim = this._spine.findAnimation(MonsterAnimName.Die);
                let hideTime = 0.8; // 隐藏时间
                if (dieAnim) {
                    this._spine.clearTrack(1);
                    this._spine.setAnimation(0, MonsterAnimName.Die, false);
                    hideTime = dieAnim.duration;
                }

                this.showDieAnim(hideTime, this.onAfterDie.bind(this));

                // GlobalEventMgr.getInstance().emit(GlobalEventID.monster_die, this);
                // GlobalEventMgr.getInstance().emit(GlobalEventID.game_exp_add, this._monsterInfo.exp);

                // if (this._monsterInfo.getMoney() > 0) {
                //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_addMoney, this._monsterInfo.getMoney(), this.getAckwPos(), Math.min(2, this._monsterInfo.getMoney()));
                // }
                // if (this._monsterInfo.getDropItem().length > 0) {
                //     console.warn("怪物死亡 触发掉落事件")
                //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_addAward, this._monsterInfo.getDropItem(), this.getAckwPos());
                // }

                let yuanbao = GameControl.getInstance().getPassInfo().getYuanBaoDropNum();
                //   console.error('怪物死亡 触发掉落事件', yuanbao);
                if (yuanbao[0] < yuanbao[1]) {//触发掉落元宝事件
                    GlobalEventMgr.getInstance().emit(GlobalEventID.game_addYuanBao, this.getAckwPos());
                }

                // console.log('monster die', `exp = ${this._monsterInfo.exp}`);
                break;
        }
    }



    // 添加 出生buff
    protected addBrothBuff(): void {
        let bList = this._monsterInfo.getBrothBuffs();
        for (const buffId of bList) {
            let buff = new BuffEffectInfo(buffId, 0, cc.v2(0, 0), 0, this);
            this.addBuffect(buff);
        }
    }

    protected addBrothShoot(): void {

        let shoots = this._monsterInfo.hasBornShoot();
        for (const skID of shoots) {
            if (skID > 0) {
                let bData = ConfigMgr.getInstance().getById(skID, BulletSkillData);
                this.addBulletSKill(bData);
                if (!bData) {
                    console.error("子弹技能不存在 id = ", skID)
                }
            }
        }
    }


    getCurrentAnimationName(): string {
        if (!this._spine) return '';

        const trackEntry = this._spine.getCurrent(0); // 0 表示第一个轨道
        if (trackEntry) {
            return trackEntry.animation ? trackEntry.animation.name : '';
        }
        return '';
    }
    protected checkRunAnim(): void {
        switch (this._monsterInfo.actionSt) {
            case MonsterActionStatue.Move:
                if (this.getCurrentAnimationName() != MonsterAnimName.Run) {
                    this._spine.setAnimation(0, MonsterAnimName.Run, true);
                }
                break;
            case MonsterActionStatue.Attack:
                let ackTaget = this._monsterInfo.lastActObj; // this._battleScene.getPassControl().getGameTripod();  //MathUtils.randomArray(targets);// targets[0];
                // this._monsterInfo.lastActObj = ackTaget;

                let shootPos = this.getFireWPos(); // this._shootNode.parent.convertToWorldSpaceAR(this._shootNode.position);

                this.getShootBag({
                    shootObj: this,
                    shootWPos: shootPos,
                    ackTaget: ackTaget, // ackTaget,
                    endPos: ackTaget?.getAckwPos() || cc.v3(),//,
                    isAoe: false,
                    eDir: this._monsterInfo.dir,
                    ackPower: this._shootInfo.getAttack(false),   // 攻击力
                    damAppend: this._monsterInfo.getDamAppend(), // 伤害追加
                    shootTurretId: this._monsterInfo.data.id, // 发射者i
                    shootRadius: this._monsterInfo.data.atkDist, // 发射半径
                    tHitCriticalAdd: this._monsterInfo.fixHitCriticalAdd, // 调整后 提高命中暴击概率
                    tHitCriticalHurtAdd: this._monsterInfo.fixHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
                    tAoeCriticalAdd: this._monsterInfo.fixAoeCriticalAdd, // 调整后 提高aoe暴击概率
                    tAoeCriticalHurtAdd: this._monsterInfo.fixAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
                    shootInfo: this._monsterInfo,
                    reviveAttack: 0,
                    extAckObj: [],
                    damLv: this._monsterInfo.getDamLv(),
                    damMul: this._monsterInfo.getDamMul(), // 百分比修改伤害
                    attackMul: this._monsterInfo.getAttackMul(), // 百分比修改攻击
                    damAdd: this._monsterInfo.getDamAdd(), // 强化 伤害
                    actMan: null,

                }, this._monsterInfo.data.shootBagId);

                this._monsterInfo.nextAtkTime = this._monsterInfo.getFixFireInterval();

                // this._spine.setAnimation(0, MonsterAnimName.Attack, false);
                break;
            case MonsterActionStatue.Stand:
                this._spine.setAnimation(0, MonsterAnimName.Idle, true);
                break;
            case MonsterActionStatue.RandomMove:
                this._spine.setAnimation(0, MonsterAnimName.Idle, true);
                break;
            case MonsterActionStatue.Jump:
                this._spine.setAnimation(0, MonsterAnimName.Idle, true);
                break;

        }
    }

    protected doAssault(dt: number): void {
        this.setMoveDir(this.findMoveTargetPos());
        let dir = this._monsterInfo.moveDir;
        this.movePos(dt * 4, dir); // 移动速度加倍
        if (!this._assaultPos) {
            this.changeActionState(MonsterActionStatue.Move);
            return;
        }

        // if (!this._assaultPos) {
        //     console.warn('MonsterActionStatue.Assault3', this.node.uuid, this._monsterInfo.actionSt);
        // }
        if (this.node.getPosition().sub(this._assaultPos).mag() > this._assaultDis) {
            const delta = this._monsterInfo.moveDir.mul(this._assaultDis);
            this.node.x = delta.x + this._assaultPos.x;
            this.node.y = delta.y + this._assaultPos.y;
            this.changeState(BtAckObjState.End); // 攻击结束
        }
    }

    protected checkAssault(): boolean {
        // let sId = this._monsterInfo.hasDeathType(MonsterDeathType.ColliderSkill);
        // if (sId > 0) {
        //     this.changeActionState(MonsterActionStatue.Assault);
        //     // console.log('MonsterActionStatue.Assault', this.node.uuid, this._assaultPos);
        //     if (this._assaultPos) {
        //         return true;
        //     }
        //     this._assaultPos = this.node.getPosition(); // 记录攻击位置
        //     // console.log('MonsterActionStatue.Assault2', this.node.uuid, this._assaultPos);
        //     return true;
        // }
        return false;
    }

    // 添加技能 
    protected addBulletSKill(bsk: BulletSkillData) {

        if (!bsk) {
            console.error('summonTurret addBulletSKill', bsk);
            return;
        }
        // 发射包
        if (bsk.shootBagId > 0) {
            let sId = bsk.shootBagId;
            let ackTaget = this._monsterInfo.lastActObj; // this._battleScene.getPassControl().getGameTripod();  //MathUtils.randomArray(targets);// targets[0];
            // this._monsterInfo.lastActObj = ackTaget;

            let shootPos = this.getFireWPos(); // this._shootNode.parent.convertToWorldSpaceAR(this._shootNode.position);

            if (sId > 0) {
                // let param = this.getShootParm(sId, ackTaget, endPos, isAoe, target);
                // if (bsk.enemySearchFail != 0 || ackTaget != null) {
                //     bagInfo = new ShootBagInfo(sId, this._bulletInfo.sourceTag, param);
                // }
                this.getShootBag({
                    shootObj: this,
                    shootWPos: shootPos,
                    ackTaget: ackTaget,
                    endPos: ackTaget?.getAckwPos() || cc.v3(),//ackTaget.getAckwPos(),
                    isAoe: false,
                    eDir: this._monsterInfo.dir,
                    ackPower: this._shootInfo.getAttack(false),   // 攻击力
                    damAppend: this._monsterInfo.getDamAppend(), // 伤害追加
                    shootTurretId: this._monsterInfo.getID(), // 发射者i
                    shootRadius: this._monsterInfo.data.atkDist, // 发射半径
                    tHitCriticalAdd: this._monsterInfo.fixHitCriticalAdd, // 调整后 提高命中暴击概率
                    tHitCriticalHurtAdd: this._monsterInfo.fixHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
                    tAoeCriticalAdd: this._monsterInfo.fixAoeCriticalAdd, // 调整后 提高aoe暴击概率
                    tAoeCriticalHurtAdd: this._monsterInfo.fixAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
                    shootInfo: this._monsterInfo,
                    reviveAttack: 0,
                    extAckObj: [],
                    damLv: this._monsterInfo.getDamLv(),
                    damMul: this._monsterInfo.getDamMul(), // 百分比修改伤害
                    attackMul: this._monsterInfo.getAttackMul(), // 百分比修改攻击
                    damAdd: this._monsterInfo.getDamAdd(), // 强化 伤害

                }, sId);
                // this._battleScene.addShootBag2Game(shootbag);
            }
        }

    }



    /** 移动方向初始化 */
    private dirInit() {
        if (!this._battleScene || !this._battleScene.gRoot) { return; }
        this.setMoveDir(this.findMoveTargetPos());
    }


    /** 查找移动目标 */
    protected findMoveTargetPos(): cc.Vec3 {

        //TODO: 暂时使用
        return this.node.parent.convertToNodeSpaceAR(this._battleScene.getPassControl().getCartArmPos());
        // return this._battleScene.getPassControl().getCartArmPos();
    }

    // 设置移动方向
    protected setMoveDir(moveTargetPos: cc.Vec3) {
        // 将目标位置赋值给怪物信息中的移动目标位置
        // this._monsterInfo.moveTargetPos = moveTargetPos;
        // let moveDir = moveTargetPos.sub(this.node.getPosition()).normalize();
        this._monsterInfo.moveDir = cc.v2(moveTargetPos.x, moveTargetPos.y).sub(this.node.getPosition()).normalize();
    }

    /** 获取距离 */
    protected getCurrDist(): number {
        let currPos: cc.Vec3 = this.getAckwPos()
        let currDist: number = 0;
        let targetPos = this._battleScene.getPassControl().getCartArmPos();//this.findMoveTargetPos();
        // currDist = Utils.vt2distance(currPos.x, currPos.y, this._monsterInfo.moveTargetPos.x, this._monsterInfo.moveTargetPos.y) - this.atkTargetNode.height / 2;
        currDist = cc.Vec2.distance(currPos, cc.v3(targetPos.x, targetPos.y));
        return currDist;
    }


    protected onDestroy(): void {
        super.onDestroy();
    }

    unuse(): void {
        this.clean(); // 清理
        this._spine.setMaterial(0, this._normalMaterial);

    }

    reuse(): void {
        this.node.active = true; // 激活节点
        this.node.opacity = 255;
        // this.hp.node.active = true;
        this.hp.reuse();
        // console.log('monster reuse', this.node.uuid)
    }


    //清除数据
    protected clean(): void {
        super.clean();
        this._hasInit = false;
        // this._monsterInfo = null;
        this._spine.node.scaleX = this._orginScaleX;
        this._assaultPos = null;
        this.changeObjDir(1);
        this.delQTShape();
    }

    // 删除无尽怪
    public delEndlessMonster() {
        this.toDie(); // 死亡    
    }

    protected toDie() {

        cc.Tween.stopAllByTarget(this.node);
        this.changeState(BtAckObjState.Die); // 死亡
        this.stateChangeAnim();

        let skID = this._monsterInfo.hasDeathType(MonsterDeathType.Dead);
        if (skID > 0) {
            this.addBulletSKill(ConfigMgr.getInstance().getById(skID, BulletSkillData))
        }
        let sound = this._monsterInfo.deathSound();
        SoundMgr.getInstance().playSound(sound);
    }
}
