

import GlobalEventMgr from '../../TRFrameWork/cocos-module/mgr/GlobalEventMgr';
import SoundMgr from '../../TRFrameWork/cocos-module/mgr/SoundMgr';
import { GlobalEventID } from '../../TRFrameWork/cocos-module/utils/GlobalEvent';
import { CommonUtils } from '../../TRFrameWork/Common/Utils/CommonUtils';
import { QTShape } from '../../TRFrameWork/QuadTree/quadtree/QTShape';
import { QTBox } from '../../TRFrameWork/QuadTree/TinyQuadtree';
import SceneMgr from '../../TRFrameWork/UIFrame/SceneMgr';
import ConfigMgr from '../config/ConfigMgr';
import { BuffData, BulletSkillData, KvData, ShootBagData } from '../config/DataDef';
import { BuffEffectInfo, MonsterInfo, shootBagParm } from '../config/DataInfo';
import {
    GameObjectType,
    MonsterActionStatue,
    MonsterAnimName,
    BtAckObjState,
    MonsterType,
    GameBundle,
    MonsterDeathType,
    ETurretDir,
    MonsterBrithType,
} from '../config/GameEnum';
import GameHelp from '../Mgr/GameHelp';
import BattleAckObject from './BattleAckObjet';
import { IPoolComponent } from './BattleBase';
import GameControl from './GameControl';
import MonsterHp from './MonsterHp';
import ShootBagUI from './ShootBagUI';
import BattleTripodUI from './BattleTripodUI';
import Utils from '../../TRFrameWork/cocos-module/utils/Utils';

const { ccclass, property } = cc._decorator;


@ccclass
export default class BattleMonsterUI extends BattleAckObject implements IPoolComponent {

    @property(MonsterHp)
    hp: MonsterHp = null; // 血条

    // protected _spine: sp.Skeleton = null; // spine动画

    protected get _monsterInfo(): MonsterInfo {
        return this._shootInfo as MonsterInfo;
    };  // 怪物信息

    // protected _mState: MonsterState = MonsterState.Init; // 怪物状态

    protected _orginScaleX: number = 1; // 初始缩放
    protected _hpOrginX: number = 0; // 血条x偏移

    // protected _battleScene: UISceneBattle = null; // 战斗场景

    protected _hasInit: boolean = false; // 是否初始化

    protected _shootNode: cc.Node = null; // 子弹发射节点

    protected _deathMaterial: cc.Material = null; // 死亡材质
    protected _normalMaterial: cc.Material = null; // 正常材质

    protected _assaultPos: cc.Vec2 = null; //
    protected _assaultDis: number = 88;

    protected _spineDir: number = 1; // spine方向
    // protected _mDir: ETurretDir = ETurretDir.UP;

    protected _currDistance: number = 0; // 当前距离

    protected _spineSpeedAuto: number = 100; // 默认spine匹配速度

    protected _isBeAttacked: boolean = false; // 是否被攻击

    public get areaDir(): ETurretDir {
        return this._monsterInfo.dir;
    }

    // 更换上下区域
    public changeAreaDir(): void {
        if (this.node.y > 0) {
            this._monsterInfo.dir = ETurretDir.UP;
        } else {
            this._monsterInfo.dir = ETurretDir.DOWN;
        }
    }

    // LIFE-CYCLE CALLBACKS:

    // 缓存组件引用
    protected _behitNode: cc.Node = null; // 受击节点
    protected _cachedTripodRadius: number = 0; // 缓存转盘半径
    protected _lastTarget: BattleAckObject = null; // 上一个目标
    protected _lastCurrDist: number = 0; // 缓存当前距离
    protected _lastUpdateFrame: number = -1; // 上一次更新距离的帧
    // 位置缓存
    protected _cachedWorldPos: cc.Vec3 = null; // 缓存的世界坐标
    protected _worldPosDirty: boolean = true; // 世界坐标是否需要更新
    // 组件缓存
    protected _cachedTripod: BattleTripodUI = null; // 缓存的转盘组件
    protected _cachedFireBox: cc.CircleCollider = null; // 缓存的火圈碰撞体

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

    public init(info: MonsterInfo): void {
        this.node.active = true;
        this.node.opacity = 0
        this._shootInfo = info;
        this.node.scale = info.getScale();
        this._isBeAttacked = false;
        this.showRange();
        //console.log('monster init', info.data);
        // this._fixScale = info.getScale();


        this.scheduleOnce(() => {
            this.doInit(info);
        })

        this.hp.node.active = false;

        // this.node['hpTxt'] && (this.node['hpTxt'].string = `${this._monsterInfo.curHp}`);
        // console.log('monster init', this._monsterInfo.getMaxHp(), this._monsterInfo.curHp);

        if (this._monsterInfo.endlessHp == 1) {
            GlobalEventMgr.getInstance().on(GlobalEventID.Post_Boss_Skill, this.onPostAckSkill, this);
        }

        // GlobalEventMgr.getInstance().on(GlobalEventID.Summon_Monster, this.addSummonMonster, this);
    }

    // ui 显示
    public showInUI(): void {
        this.node.opacity = 255;
        this.hp.node.active = false;
        this.getSpine();
        this._spine.setAnimation(0, MonsterAnimName.Idle, true);
        CommonUtils.hideBoneByName(this._spine, 'yingzi');

    }

    /**光环显示 */
    showRange() {
        let ring = this.node.getChildByName('ring');
        if (!(cc.isValid(ring) && ring.getComponent(cc.Animation))) {
            return;
        }
        ring.active = this._monsterInfo.data.haloScale == 1;
        //ring.scale =this._monsterInfo.data.haloScale;
        // ring.scale = ring.scale*this._monsterInfo.data.haloScale;
        let anims = ring.getComponent(cc.Animation);
        if (anims && anims.getClips().length > 0) {
            let clip = anims.getClips()[0];
            let name = clip.name;
            let rTime = Math.max(clip.duration);
            anims.play(name);
        }
    }

    protected doInit(info: MonsterInfo) {

        this.getSpine();
        // this._battleScene = SceneMgr.getCurrScene() as UISceneBattle;
        // this.addQTShape();
        // this.dirInit();
        this.stateChangeAnim(); // 初始化动画
        // this.hp.setHpProgress(); // 初始化血条
        this.hp.initBar(this._monsterInfo.getMaxHp(), GameControl.getInstance().getPassInfo().data.BOSS);

        if (this.node.x < 0) {
            this.changeObjDir(-1);
        } else {
            this.changeObjDir(1);
        }

        if (info.birthPos == MonsterBrithType.Loc0) {
            this._monsterInfo.dir = ETurretDir.UP;
        } else if (info.birthPos == MonsterBrithType.Loc3) {
            this._monsterInfo.dir = ETurretDir.DOWN;
        }
    }

    protected getSpine() {
        this._spineSpeedAuto = parseInt(ConfigMgr.getInstance().getById(41, KvData).val);
        if (this._spine) return this._spine;
        this._spine = this.node.getChildByName('spine').getComponent(sp.Skeleton);
        let sRoot: cc.Node = new cc.Node('sRoot');
        this.node.addChild(sRoot, -1);
        sRoot.setSiblingIndex(0);

        let ring = this.node.getChildByName('ring');
        ring && (ring.parent = sRoot)

        let iNode = this.node.getChildByName('img');
        iNode && (iNode.parent = sRoot)
        this._spine.node.parent = sRoot;

        // 优化Spine渲染设置
        this._spine.enableBatch = true; // 启用批量渲染
        this._spine.premultipliedAlpha = true; // 启用预乘alpha，提高渲染效率
        // this._spine.setBlendMode(sp.BlendMode.ALPHA_PREMULTIPLIED); // 设置混合模式
        this._spine.timeScale = 1; // 初始化时间缩放

        // 加载材质
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
            // 攻击结束，播放站立动画
            if (data.animation && data.animation.name.startsWith(MonsterAnimName.Attack) && this._monsterInfo.actionSt == MonsterActionStatue.Attack) {
                this.dirInit();
                this.changeActionState(MonsterActionStatue.Move);
            }
        });

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
    }

    // 重置攻击目标
    protected resetAckTarget(tag: BattleAckObject) {
        this._monsterInfo.lastActObj = tag;
        this._monsterInfo.toucheCart = false;
        this.dirInit(); // 初始化方向
        this.changeActionState(MonsterActionStatue.Move);

        // 重置缓存变量
        this._lastTarget = null;
        this._cachedTripodRadius = 0;
        this._cachedTripod = null;
        this._cachedFireBox = null;
        this._lastCurrDist = 0;
        this._lastUpdateFrame = -1;
        this._worldPosDirty = true;
    }

    // 目标距离
    public getDistanceWithTarget(): number {
        // 实时计算到目标的距离，而不是使用缓存
        if (!this._monsterInfo.lastActObj) {
            return Infinity;  // 无目标时返回无穷大
        }

        // 实时计算距离
        const target = this._monsterInfo.lastActObj;
        if (!target || !target.getAckwPos) {
            return Infinity;
        }

        const myPos = this.node.getPosition();
        const targetPos = target.getAckwPos();

        // 使用世界坐标计算距离
        return myPos.sub(cc.v2(targetPos.x, targetPos.y)).mag();
        // return this._currDistance;
    }


    /**
     * 重写getAckwPos方法，添加位置缓存机制
     */
    getAckwPos(): cc.Vec3 {
        // 如果位置脏标记为true或缓存未初始化，则更新缓存
        if (this._worldPosDirty || !this._cachedWorldPos) {
            // 缓存受击节点
            if (!this._behitNode) {
                this._behitNode = this._spine.node.getChildByName("behit");
            }

            // 根据是否有受击节点选择不同的位置计算方式
            if (this._behitNode) {
                this._cachedWorldPos = this._behitNode.convertToWorldSpaceAR(cc.v3());
            } else {
                // 使用spine节点作为基准位置
                this._cachedWorldPos = this._spine.node.parent.convertToWorldSpaceAR(
                    cc.v3(this._spine.node.x, this._spine.node.y + this._spine.node.height / 4)
                );
            }

            // 清除脏标记
            this._worldPosDirty = false;
        }

        return this._cachedWorldPos;
    }

    /**
     * 检查怪物是否在屏幕内，使用兼容Cocos Creator 2.4.1的简化视锥体剔除算法
     */
    protected isInScreen(safeBorderYInit: number = 0): boolean {
        // 获取缓存的世界坐标
        const worldPos = this.getAckwPos();
        let cameraComp: cc.Camera = null;
        const cameraNode = cc.find("Canvas/Camera");
        if (cameraNode) {
            cameraComp = cameraNode.getComponent(cc.Camera);
        }

        if (!cameraComp) {
            cameraComp = cc.Camera.main;
        }

        if (!cameraComp) {
            return true;
        }

        const screenPos = cameraComp.getWorldToScreenPoint(worldPos);
        const visibleSize = cc.view.getVisibleSize();
        const origin = cc.view.getVisibleOrigin();

        // 增加安全边界（屏幕外100像素内的怪物也视为在屏幕内）
        let safeBorderX = 100, safeBorderY = 100;
        if (safeBorderYInit) safeBorderY = safeBorderYInit;

        // 检查是否在可见区域内（包含安全边界）
        // getWorldToScreenPoint 返回 Vec3，我们只需要 x 和 y 坐标
        return !(screenPos.x < origin.x - safeBorderX ||
            screenPos.x > origin.x + visibleSize.width + safeBorderX ||
            screenPos.y < origin.y - safeBorderY ||
            screenPos.y > origin.y + visibleSize.height + safeBorderY);
    }

    public doUpdate(dt) {
        if (!this._hasInit) return; // 没有初始化
        if (this._spine && this._spine.timeScale === 0) {
            this.setSpeedTimeScale();
        }
        super.doUpdate(dt);
        let level = this._monsterInfo?.data.level || 0;
        this.node.zIndex = 2000 - this.node.position.y + level * 1000;
        if (this._monsterInfo.actionSt == MonsterActionStatue.Jump) {
            this.node.zIndex = 4000 + level * 1000;
        }
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
        this.adjustSpineQualityByDistance();
        let approxDistance = Math.abs(this.node.position.x) + Math.abs(this.node.position.y);
        if (Math.abs(approxDistance - this._lastDistanceToCamera) >= 200) {
            this._lastDistanceToCamera = approxDistance;
        }
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

        for (const element of this._qtShapes) {
            let cList = GameControl.getInstance().getQuadTree().collide(element, GameHelp.getInstance().getCollisionTag(GameObjectType.Monster));
            for (const element of cList) {
                this.currentFrameCollisions.add(element);
            }
        }

        // 碰撞开始：当前帧有，上一帧没有
        this.currentFrameCollisions.forEach(other => {
            if (!this.lastFrameCollisions.has(other)) {
                this.onCollisionEnterQT(other);
            }
        });


        // 碰撞结束：上一帧有，当前帧没有
        this.lastFrameCollisions.forEach(other => {
            if (!this.currentFrameCollisions.has(other)) {
                this.onCollisionExitQT(other);
            }
        });
    }

    onCollisionEnterQT(other: QTShape): void {
        if (other.get_mask() == GameObjectType.FireBox && other.node == this._monsterInfo.lastActObj.node) {
            if (!this._monsterInfo.toucheCart && other.node == this._monsterInfo.lastActObj.node) {
                console.log('碰到车了', this.node.uuid,);
                this._monsterInfo.toucheCart = true;
                // this._monsterInfo.touCheing = true;
            }
        }
    }

    onCollisionExitQT(other: QTShape): void {
        if (other.get_mask() == GameObjectType.FireBox && other.node == this._monsterInfo.lastActObj.node) {
            console.log('离开车了', this.node.uuid);
            this._monsterInfo.toucheCart = false;
            this.changeActionState(MonsterActionStatue.Move);
            this._assaultPos = null; // 离开车，重置攻击位置

        }
    }

    protected doRun(dt: number): void {
        if (this._monsterInfo.getCurHp() <= 0 && this._monsterInfo.endlessHp == 0) {
            if (this._invincible > 0) return;
            this.toDie();
            return;
        }

        if ((!cc.isValid(this._monsterInfo.lastActObj) || !cc.isValid(this._monsterInfo.lastActObj.node.parent)) && this._battleScene.getPassControl().getGameTripod().isLiving()) {
            this.resetAckTarget(this._battleScene.getPassControl().getGameTripod());
        }

        // this.checkActionType();
        this.setSpeedTimeScale();
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

        if (this._monsterInfo?.mPath) {
            this.doMovePath(dt);
            return;
        }

        if (!this.isInScreen()) {
            this.toDie();
            return;
        }

        if (this._monsterInfo.toucheCart) {

            if (this.checkAssault()) {
                return;
            }

            // 停在原地，直到敌人消灭或离开走位距离
            let strat = this._monsterInfo.data.strategy;
            if (strat == 0) {
                this.changeActionState(MonsterActionStatue.Stand);
                return;
            } else if (strat == 1) {
                //在走位距离范围内随机移动，直到敌人消灭或离开走位距离
                this.setRandomPos();
                this.changeActionState(MonsterActionStatue.RandomMove);
                return;
            } else {
                this.changeActionState(MonsterActionStatue.Stand);
            }
            return;
        }

        let currDist = this.getCurrDist();
        // // 上一帧的状态
        // let lastState = this.monsterInfo.isMove;

        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0 &&
            currDist <= this._monsterInfo.data.atkDist) {
            this.changeActionState(MonsterActionStatue.Attack);
        }

        // 小于走位距离
        if (currDist < this._monsterInfo.data.fristRang) {
            let strat = this._monsterInfo.data.strategy;
            // 直到敌人消灭或离开走位距离
            if (strat == 2) {
                this.changeActionState(MonsterActionStatue.Stand);
                return;
            }    // 停在原地，直到敌人消灭或离开走位距离
            if (strat == 0) {
                this.changeActionState(MonsterActionStatue.Stand);
                // this._monsterInfo.standed = true;
                return;
            }
            else if (strat == 1) {
                //在走位距离范围内随机移动，直到敌人消灭或离开走位距离
                this.setRandomPos();
                this.changeActionState(MonsterActionStatue.RandomMove);
                return;
            } else {
                this.changeActionState(MonsterActionStatue.Stand);
                return;
            }
        } else {
            this._monsterInfo.standed = false;
        }

        if (!this._monsterInfo.standed) {
            let dir = this._monsterInfo.moveDir;
            this.movePos(dt, dir);
            this._currDistance = currDist;
            this.dirInit();
        }
    }

    protected doMovePath(dt: number) {
        let currDist = this.getCurrDist();
        // // 上一帧的状态
        // let lastState = this.monsterInfo.isMove;

        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0 &&
            currDist <= this._monsterInfo.data.atkDist) {
            this.changeActionState(MonsterActionStatue.Attack);
        }

        let dir = this._monsterInfo.moveDir;
        this.movePos(dt, dir);
        this._currDistance = currDist;
        this.dirInit();
    }

    // 跳跃
    protected doJump(endPos: cc.Vec2, time: number) {
        this.delQTShape();
        if (endPos.x - this.node.x < 0) {
            this.changeObjDir(-1);
        } else {
            this.changeObjDir(1);
        }
        cc.tween(this.node).to(time, { position: cc.v3(endPos.x, endPos.y, 0) }).call(() => {
            this.addQTShape();
            this._monsterInfo?.mPath?.jumpEnd();
            this.changeAreaDir();
            this.changeActionState(MonsterActionStatue.Move);
        }).start();
    }

    addQTShape() {
        let ccs = this.node.getComponentsInChildren(cc.BoxCollider); // 获取所有碰撞体
        for (let i = 0; i < ccs.length; i++) {
            // cc.director.getCollisionManager()['removeCollider'](ccs[i]);
            // ccs[i].tag = GameObjectType.Monster;
            // cc.director.getCollisionManager()['addCollider'](ccs[i]);
            let box = ccs[i]
            let qtBox = new QTBox(box.offset.x - box.size.width / 2, box.offset.y - box.size.height / 2, box.size.width, box.size.height, GameObjectType.Monster);
            qtBox.node = this.node;
            qtBox.setScale(this.node.scale);
            this._qtShapes.push(qtBox);
            GameControl.getInstance().getQuadTree() && GameControl.getInstance().getQuadTree().insert(qtBox);
        }
        this.resetQTPos();
    }

    protected doAttack(dt: number) {
        // TODO move?
        if (this._monsterInfo.toucheCart) {
            // 停在原地，直到敌人消灭或离开走位距离
            let strat = this._monsterInfo.data.strategy;
            if (strat == 0) {
                return;
            }
        }
        if (!this._monsterInfo.standed) {
            let dir = this._monsterInfo.moveDir;
            this.movePos(dt, dir);
        }
    }

    protected doStand(dt: number) {
        let currDist = this.getCurrDist();
        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0 &&
            (currDist <= this._monsterInfo.data.atkDist || this._monsterInfo.toucheCart)
        ) {
            this.changeActionState(MonsterActionStatue.Attack);
        }
    }

    protected doRandomMove(dt: number) {
        // 进入攻击
        let currDist = this.getCurrDist();
        if (this._monsterInfo.isEnterAtkTime() &&
            this._monsterInfo.nextAtkTime <= 0 &&
            currDist <= this._monsterInfo.data.atkDist) {
            this.changeActionState(MonsterActionStatue.Attack);
            return;
        }
        let dir = this._monsterInfo.randomEndPos.sub(cc.v2(this.node.x, this.node.y)).normalize();
        this.movePos(dt, dir);
        if (cc.Vec2.distance(this._monsterInfo.randomEndPos, cc.v2(this.node.x, this.node.y)) <= 2) {
            // 游走完成
            this.dirInit();
            this.changeActionState(MonsterActionStatue.Move);
            return;
        }
    }

    //添加召唤兽
    public addSummonMonster(buffId?: number): void {
        let sData = ConfigMgr.getInstance().getById(buffId, BuffData);
        // 死亡召唤
        if (sData.deadSummon.length > 0) {
            // A1, B1, C1 | A2, B2, C2|...
            // A = 定位方式
            //  0 = 以自身为圆心
            //  1 = 以VIP为圆心
            // B = 属性继承本体数值
            //C = 召唤兽数量
            // D = 召唤兽ID

            let posType = sData.deadSummon[0];
            let over = sData.deadSummon[1];
            let mstCount = sData.deadSummon[2];
            let mstID = sData.deadSummon[3];

            this.doSummon(mstID, over);
        }
        // 碰撞召唤
        else if (sData.hitSummon.length > 0) {
            // A1, B1, C1 | A2, B2, C2|...
            // A = 定位方式
            //  0 = 以自身为圆心
            //  1 = 以VIP为圆心
            // B = 属性继承本体数值
            //C = 召唤兽数量
            // D = 召唤兽ID

            let posType = sData.hitSummon[0];
            let over = sData.hitSummon[1];
            let mstCount = sData.hitSummon[2];
            let mstID = sData.hitSummon[3];
            this.doSummon(mstID, over);
        }
    }

    /**
     * 
     * @param A 原点类型
     * @param B 召唤兽继承本体的数据 50=50%
     */
    public doSummon(mstID: number, over: number = 100): void {
        let basePos = cc.v3();
        // if (A == 0) {
        basePos = this.node.position;
        // } else if (A == 1) {
        //     let battle = GameControl.getInstance().sceneBattle;
        //     basePos = battle.getPassControl().getCartArmPos();
        // }
        let startAngle = 0;
        let endAngle = 90;
        let getPos = Utils.generateUniformPointInRing(20, 50, startAngle, endAngle);

        getPos.x *= Math.random() > 0.5 ? 1 : -1;
        getPos.y *= Math.random() > 0.5 ? 1 : -1;
        let wPos = basePos.add(cc.v3(getPos.x, getPos.y));
        const mstInfo = new MonsterInfo(mstID);
        const passInfo = GameControl.getInstance().getPassInfo();
        // const wInfo = passInfo.getCurWave()[passInfo.passWaveCount]; // 下一个波次
        const wInfo = GameControl.getInstance().sceneBattle.passControl.getCurWave();
        mstInfo.setAckMul(passInfo.data.atkMul);
        // 血量与移动倍数
        const db = wInfo.data.hp || 1;
        mstInfo.hp = mstInfo.data.hp * db * wInfo.passHp * wInfo.hpFix;
        mstInfo.resetCurHp(mstInfo.hp);
        mstInfo.passMoveMul = wInfo.passMoveMul;
        mstInfo.ackPower = mstInfo.data.atk * over / 100;
        // wInfo.mInfos.push(mstInfo);
        wInfo.curMonsterNum++;
        wInfo.livingMonsterNum++;
        wInfo.summonMonsterNum++;

        GameControl.getInstance().sceneBattle.getPassControl().addMonster(mstInfo, wPos);
    }


    // 设置游走位置
    protected setRandomPos() {
        this._monsterInfo.randomCenter = cc.v2(this.node.x, this.node.y);

        let tDir = CommonUtils.vectorToRadian(cc.v2(-this._monsterInfo.moveDir.x, -this._monsterInfo.moveDir.y));

        // console.log(`start = ${this._monsterInfo.moveDir.x},${this._monsterInfo.moveDir.y}|${tDir}`);
        let ranDir = tDir + (Math.PI / 6 * (Math.random() > 0.5 ? 1 : -1));
        this._monsterInfo.moveDir = CommonUtils.radianToVector(ranDir);
        // console.log(`randomDir = ${this._monsterInfo.moveDir.x},${this._monsterInfo.moveDir.y}, | ${ranDir}`);
        this._monsterInfo.randomEndPos = cc.v2(this.node.x, this.node.y).add(this._monsterInfo.moveDir.mul(this._monsterInfo.data.roamRang));
    }

    // 移动
    protected movePos(dt: number, dir: cc.Vec2) {
        if (this.isFreeze()) {
            dt = 0;
        }
        if (this._monsterInfo?.mPath) {
            let speed = this._monsterInfo.getFixSpeed(this.getBuffectMoveSpeed());
            this.setSpeedTimeScale(speed);
            let moveInfo = this._monsterInfo?.mPath.update(this.node, speed * dt);
            if (moveInfo.jump) {
                this.changeActionState(MonsterActionStatue.Jump);
                this.doJump(moveInfo.endPos, 0.5);
                return;
            } else {
                dir = moveInfo.dir;
            }
        }
        let speed = this._monsterInfo.getFixSpeed(this.getBuffectMoveSpeed());
        this.setSpeedTimeScale(speed);
        const delta = dir.mul(speed * dt);
        this.node.x += delta.x;
        this.node.y += delta.y;

        // //需要在移动出屏幕后更新位置
        // if (!this.isInScreen()) {
        //     this.changeState(BtAckObjState.End);
        //     return;
        // }

        // 标记世界坐标需要更新
        this._worldPosDirty = true;

        if (delta.x < 0) {
            this.changeObjDir(-1);
        } else if (delta.x > 0) {
            this.changeObjDir(1);
        }
    }

    setSpeedTimeScale(speed?: number) {
        return;
        if (!this._spine) { return; }
        if (!speed) {
            this._spine.timeScale = 1;
            return;
        }

        if (this._monsterInfo.actionSt == MonsterActionStatue.Move || this._monsterInfo.actionSt == MonsterActionStatue.RandomMove) {
            this._spine.timeScale = Math.max(speed / this._spineSpeedAuto, 0.05);
        } else {
            this._spine.timeScale = 1;
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
        if (this._monsterInfo.state == state) return;
        this._monsterInfo.state = state;

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
        if (state == MonsterActionStatue.Stand) {
            this._monsterInfo.standed = true;
        } else if (state == MonsterActionStatue.Move || state == MonsterActionStatue.RandomMove) {
            this._monsterInfo.standed = false;
        }
    }

    protected onPostAckSkill(data: any) {
        console.log(`onPostAckSkill = ${data}`, this.node.uuid);
        this._monsterInfo.actionSt = MonsterActionStatue.Attack;

        // play anim
        let anim = data.anim;
        let sid = data.sid;
        let endPos = null;
        let shootData = ConfigMgr.getInstance().getById(sid, ShootBagData);
        let ackTaget = null;
        if (shootData.enemySearch[0] == 4) {
            endPos = this.node.parent.convertToWorldSpaceAR(data.endPos)
        } else {
            ackTaget = this._monsterInfo.lastActObj; // this._battleScene.getPassControl().getGameTripod();  //MathUtils.randomArray(targets);// targets[0];
            // this._monsterInfo.lastActObj = ackTaget;
            endPos = ackTaget.getAckwPos();
        }

        let shootPos = this.getFireWPos(); // this._shootNode.parent.convertToWorldSpaceAR(this._shootNode.position);
        this.getShootBag({
            shootObj: this,
            shootWPos: shootPos,
            ackTaget: ackTaget,
            endPos: endPos,
            isAoe: false,
            eDir: this._monsterInfo.dir,
            ackPower: this._monsterInfo.ackPower,   // 攻击力
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

        }, sid);
        this._spine.setAnimation(0, anim, false);
    }

    // getNode(): cc.Node {
    //     return this.node;
    // }

    canAck(): boolean {
        if (!this._hasInit) {
            return false;
        }
        return this._monsterInfo.state == BtAckObjState.Run && this.isInScreen();
    }

    // 缓存屏幕边界值
    protected _cachedZoomRatio: number = 0;
    protected _cachedScreenWidth: number = 0;
    protected _cachedScreenHeight: number = 0;

    // 缓存变量
    protected _lastSpineQualityUpdate: number = -1; // 上一次更新Spine质量的帧
    protected _lastDistanceToCamera: number = 0; // 上一次距离相机的距离

    /**
     * 根据距离调整Spine动画质量
     */
    protected adjustSpineQualityByDistance(): void {
        if (!this._spine) return;

        // this._lastSpineQualityUpdate = this._updateFrameIndex;
        this._lastSpineQualityUpdate = 0;

        // 使用缓存的距离值，避免重复计算
        let distance = this._lastDistanceToCamera;
        if (distance <= 0) {
            // 如果缓存未初始化，计算一次
            let cameraPos = GameControl.getInstance().sceneBattle.getPassControl().getCartArmPos();
            let monsterPos = this.getAckwPos();
            distance = cc.Vec3.distance(cameraPos, monsterPos);
            this._lastDistanceToCamera = distance;
        }

        // 定义距离阈值和对应的质量设置
        const qualityLevels = [
            { maxDistance: 500, timeScale: 1, updateRate: 1, visible: true },
            { maxDistance: 1000, timeScale: 0.8, updateRate: 0.5, visible: true },
            { maxDistance: 2000, timeScale: 0.6, updateRate: 0.25, visible: true },
            { maxDistance: 3000, timeScale: 0.4, updateRate: 0.125, visible: true },
            { maxDistance: Infinity, timeScale: 0, updateRate: 0, visible: false }
        ];

        // 找到当前距离对应的质量设置
        for (const level of qualityLevels) {
            if (distance <= level.maxDistance) {
                // 只在质量设置变化时更新，避免频繁切换
                if (this._spine.timeScale !== level.timeScale) {
                    this._spine.timeScale = level.timeScale;
                }

                // 超远距离怪物隐藏Spine，减少渲染压力
                if (this._spine.node.active !== level.visible) {
                    this._spine.node.active = level.visible;
                }
                break;
            }
        }
    }

    getMonsterInfo(): MonsterInfo {
        return this._monsterInfo;
    }

    // 获取怪物类型
    getMonsterType(): MonsterType {
        return this._monsterInfo.getMonsterType();
    }

    // 对象类型
    getGameObjectType(): GameObjectType {
        return GameObjectType.Monster;
    }

    public doRidicule(obj: BattleAckObject): void {

        if (cc.isValid(obj.node) && cc.isValid(obj.node.parent)) {
            this.resetAckTarget(obj);

            console.log(`嘲讽 = ${this.node.uuid}`);
        }
    }

    //击退
    public doRepel(dir: cc.Vec2, distance: number): void {
        // console.log(`击退 doRepel = ${dir.x},${dir.y}`);
        if (this._monsterInfo.endlessHp == 1) {
            return; // 无限血
        }

        this.changeActionState(MonsterActionStatue.Repel);
        let endPos = cc.v2(this.node.x, this.node.y).add(dir.mul(distance));
        cc.Tween.stopAllByTarget(this.node);

        // 不超出屏幕
        if (endPos.x > cc.winSize.width / 2) {
            endPos.x = cc.winSize.width / 2;
        } else if (endPos.x < -cc.winSize.width / 2) {
            endPos.x = -cc.winSize.width / 2;
        }

        if (endPos.y + this.node.height / 2 > cc.winSize.height / 2) {
            endPos.y = cc.winSize.height / 2 - this.node.height / 2;
        } else if (endPos.y - this.node.height / 2 < -cc.winSize.height / 2) {
            endPos.y = -cc.winSize.height / 2 + this.node.height / 2;
        }

        cc.tween(this.node).to(0.3, { position: cc.v3(endPos.x, endPos.y) }, { easing: 'backOut' }).call(() => {
            this.dirInit();
            this.changeActionState(MonsterActionStatue.Move);
        }).start();
    }

    subHp(hurt: number, isCrit: boolean = false, realyHP: boolean = false): number {
        // if (this._invincible > 0) return 0;
        let iRet: number = 0;
        let retX: number = 1;
        if (this._monsterInfo.endlessHp == 1) {
            // 无限血
            GlobalEventMgr.getInstance().emit(GlobalEventID.WorldBoss_hurt, hurt); // 世界boss伤害
            retX = -1;
        } else {
            hurt = -hurt;
            if (!this.isLiving() || this._monsterInfo.getCurHp() <= 0) {
                return iRet;
            }
        }

        this.hp.node.active = true;
        let oldShow = Math.ceil(this._monsterInfo.getCurHp());
        // this._monsterInfo.changeHp(hurt, false); // -= hurt;
        this.changeHpMonster(hurt, realyHP);
        let newShow = Math.ceil(this._monsterInfo.getCurHp());
        iRet = oldShow - newShow;
        if (newShow <= 0) {
            iRet = Math.ceil(-hurt);
        }

        // console.log('monster subhp', this._monsterInfo.getMaxHp(), this._monsterInfo.curHp);
        if (this._monsterInfo.getCurHp() <= 0) {
            this.hp.node.active = false; // 隐藏血条
            let skID = this._monsterInfo.hasDeathType(MonsterDeathType.HpSkill);
            ///
            let dEvent = this._monsterInfo.HpDeathEvent(); // 死亡事件
            for (const element of dEvent) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.func_event, { id: element, wPos: this.getAckwPos() });
            }

            if (skID > 0) {
                this.addBulletSKill(ConfigMgr.getInstance().getById(skID, BulletSkillData))
            }
            GlobalEventMgr.getInstance().emit(GlobalEventID.game_mp_monDeath, this.getAckwPos());
        } else {
            this.hp.setHpProgress(this._monsterInfo.getCurHp()); // 初始化血条
        }
        return iRet * retX;
    }

    /**死亡之后触发技能*/
    public addDeathSkillBuff(): void {
        /// 死亡事件
        let deadBuff = this._monsterInfo.hasDeathType(MonsterDeathType.HpSkill); // 死亡事件
        let deadSkill = ConfigMgr.getInstance().getById(deadBuff, BulletSkillData)?.buffId || 0;
        if (deadSkill) {
            let buff = new BuffEffectInfo(deadSkill, null, cc.v2(0, 0), 0, null);
            this.addBuffect(buff);

            const buffData = ConfigMgr.getInstance().getById(deadSkill, BuffData);
            if (buffData && buffData.deadSummon.length > 0) {
                const num = buffData.deadSummon[2]; // 召唤数量
                setTimeout(() => {
                    for (let i = 0; i < num; i++) {
                        this.addSummonMonster(deadSkill);
                    }
                }, buffData.duration * 2 / 5);
            }
        }
    }

    changeHpMonster(value: number, realyHP: boolean): void {
        this._monsterInfo.changeHp(value, realyHP);
        if (this._isBeAttacked) return;

        //不在屏幕内不触发
        if (!this.isInScreen(-150)) return;

        //判定是否有击中之后触发得buff
        if (this._monsterInfo.data.attckedBuff.length > 0) {
            for (let i = 0; i < this._monsterInfo.data.attckedBuff.length; i++) {
                const buffId = this._monsterInfo.data.attckedBuff[i];
                const buffData = new BuffEffectInfo(buffId, 0, cc.v2(0, 0), 0, this);
                this.addBuffect(buffData);

                if (buffData && buffData.data.hitSummon.length > 0) {
                    const num = buffData.data.hitSummon[2]; // 召唤数量
                    setTimeout(() => {
                        for (let j = 0; j < num; j++) {
                            this.addSummonMonster(buffId);
                        }
                    }, buffData.data.duration * 2 / 5);
                }
            }
        }
        this._isBeAttacked = true;
    }

    public getShootBag(parm: shootBagParm, sId: number): ShootBagUI {
        let bagInfo = this._monsterInfo.getShootBagInfo(parm, sId);
        if (bagInfo) {
            let shootbag = new ShootBagUI(bagInfo);
            this._battleScene.addShootBag2Game(shootbag);
        }
        return null;
    }

    isliving(): boolean {
        return this._monsterInfo.isLiving();
    }

    // -----------end BattleAckObject
    protected showEnterAnim(animTime: number, cb: Function = null): void {
        if (this._monsterInfo.endlessHp == 1) {
            cc.tween(this.node).set({ scale: 0, opacity: 255 })
                .to(animTime, { scale: this._monsterInfo.getScale() })
                .call(() => {
                    cb && cb(); // 回调
                }).start();
        } else {
            cc.tween(this.node).
                to(animTime, { opacity: 255 })
                .call(() => {
                    cb && cb(); // 回调
                }).start();
        }
    }

    protected onAfterEnter(): void {
        this.addQTShape(); // 添加碰撞
        this.resetAckTarget(this._battleScene.getPassControl().getGameTripod());
        this.changeState(BtAckObjState.Run);
        this.addBrothBuff();
        this.addBrothShoot(); // 添加攻击
        this.dirInit();
        this.changeActionState(MonsterActionStatue.Move);
        this.normalColor();
        this._hasInit = true;
    }

    protected showDieAnim(animTime: number, cb: Function = null): void {
        if (this._monsterInfo.endlessHp == 1) {
            cc.tween(this.node)
                .to(0.1, { scale: 0 })
                .call(() => {
                    cb && cb(); // 回调
                }).start();
        } else {
            cc.tween(this.node)
                .to(animTime, { opacity: 0 })
                .call(() => {
                    cb && cb(); // 回调
                }).start();
        }
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
                let mName = MonsterAnimName.Enter;
                let anim = this._spine.findAnimation(mName);
                let animTime = 0.15;
                if (anim) {
                    this._spine.setAnimation(0, mName, false);
                    animTime = anim.duration;
                } else {
                    mName = MonsterAnimName.Idle;
                    this._spine.setAnimation(0, mName, true);
                }
                this.showEnterAnim(animTime, this.onAfterEnter.bind(this));
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
                    this._spine.setAnimation(0, MonsterAnimName.Die, false);
                    hideTime = dieAnim.duration;
                }
                this.showDieAnim(hideTime, this.onAfterDie.bind(this));
                if (this._monsterInfo.getDropItem().length > 0) {
                    // console.warn("怪物死亡 触发掉落事件")
                    GlobalEventMgr.getInstance().emit(GlobalEventID.game_addAward, this._monsterInfo.getDropItem(), this.getAckwPos());
                }
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
                this.addBulletSKill(ConfigMgr.getInstance().getById(skID, BulletSkillData))
            }
        }
    }

    protected checkRunAnim(): void {
        switch (this._monsterInfo.actionSt) {
            case MonsterActionStatue.Move:
                this._spine.setAnimation(0, MonsterAnimName.Run, true);
                break;
            case MonsterActionStatue.Attack:
                let ackTaget = this._monsterInfo.lastActObj; // this._battleScene.getPassControl().getGameTripod();  //MathUtils.randomArray(targets);// targets[0];
                // this._monsterInfo.lastActObj = ackTaget;

                let shootPos = this.getFireWPos(); // this._shootNode.parent.convertToWorldSpaceAR(this._shootNode.position);

                this.getShootBag({
                    shootObj: this,
                    shootWPos: shootPos,
                    ackTaget: ackTaget,
                    endPos: ackTaget.getAckwPos(),
                    isAoe: false,
                    eDir: this._monsterInfo.dir,
                    ackPower: this._monsterInfo.ackPower,   // 攻击力
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

                this._spine.setAnimation(0, MonsterAnimName.Attack, false);
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
        // this.setMoveDir(this.findMoveTargetPos());
        this.dirInit();
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
        return false;
    }

    // 添加技能 
    protected addBulletSKill(bsk: BulletSkillData) {

        // 发射包
        if (bsk.shootBagId > 0) {
            let sId = bsk.shootBagId;
            let ackTaget = this._monsterInfo.lastActObj; // this._battleScene.getPassControl().getGameTripod();  //MathUtils.randomArray(targets);// targets[0];
            // this._monsterInfo.lastActObj = ackTaget;

            let shootPos = this.getFireWPos(); // this._shootNode.parent.convertToWorldSpaceAR(this._shootNode.position);

            if (sId > 0) {

                this.getShootBag({
                    shootObj: this,
                    shootWPos: shootPos,
                    ackTaget: ackTaget,
                    endPos: ackTaget.getAckwPos(),
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

        // 死亡添加得buff
        if (bsk.buffId > 0) {
            let buffData = ConfigMgr.getInstance().getById(bsk.buffId, BuffData);
            if (buffData) this.addDeathSkillBuff();
        }
    }



    /** 移动方向初始化 */
    private dirInit() {
        if (!this._battleScene || !this._battleScene.gRoot) { return; }
        this.setMoveDir(this.findMoveTargetPos());
    }


    /** 查找移动目标 */
    protected findMoveTargetPos(): cc.Vec3 {
        let twPos = this._monsterInfo.lastActObj.getAckwPos();
        return this.node.parent.convertToNodeSpaceAR(twPos);
    }

    // 设置移动方向
    protected setMoveDir(moveTargetPos: cc.Vec3) {
        this._monsterInfo.moveDir = cc.v2(moveTargetPos.x, moveTargetPos.y).sub(this.node.getPosition()).normalize();
    }

    /** 获取距离 */
    /**
     * 获取转盘的外圈半径
     */
    protected getTripodOuterRadius(): number {
        // 空检查：如果没有目标，直接返回0
        if (!this._monsterInfo.lastActObj) {
            return 0;
        }

        // 只有当目标改变时才重新计算
        if (this._monsterInfo.lastActObj !== this._lastTarget) {
            this._lastTarget = this._monsterInfo.lastActObj;
            this._cachedTripodRadius = 0;
            this._cachedTripod = null;
            this._cachedFireBox = null;

            // 如果目标是转盘(BattleTripodUI)
            this._cachedTripod = this._lastTarget.node.getComponent(BattleTripodUI);
            if (this._cachedTripod) {
                this._cachedFireBox = this._cachedTripod.getComponentInChildren(cc.CircleCollider);
                if (this._cachedFireBox) {
                    this._cachedTripodRadius = this._cachedFireBox.radius;
                }
            }
        }
        return this._cachedTripodRadius;
    }

    /**
     * 获取到转盘外圈的距离
     */
    protected getCurrDist(): number {
        if (!this._monsterInfo.lastActObj) {
            return 0;
        }

        // 优先使用本地坐标计算，避免世界坐标转换
        let currPos: cc.Vec3 = this.node.position;
        let targetPos = this._monsterInfo.lastActObj.node.position;

        // 计算到目标中心点的距离
        let centerDist = cc.Vec2.distance(currPos, cc.v3(targetPos.x, targetPos.y));

        // 如果目标是转盘，计算到外圈的距离
        if (this._cachedTripodRadius <= 0) {
            this._cachedTripodRadius = this.getTripodOuterRadius();
        }
        if (this._cachedTripodRadius > 0) {
            // 距离外圈的距离 = 到中心点距离 - 外圈半径
            this._lastCurrDist = Math.max(0, centerDist - this._cachedTripodRadius);
        } else {
            // 非转盘目标，使用原逻辑
            this._lastCurrDist = centerDist;
        }

        // this._lastUpdateFrame = this._updateFrameIndex;
        this._lastTarget = this._monsterInfo.lastActObj;
        return this._lastCurrDist;
    }


    protected onDestroy(): void {
        super.onDestroy();
    }

    reuse(): void {
        this.node.active = true; // 激活节点
        this.node.opacity = 255;
        this.hp.node.active = true;
        this.hp.reuse();
        // console.log('monster reuse', this.node.uuid)
    }


    //清除数据
    protected clean(): void {
        if (!cc.isValid(this) || !cc.isValid(this.node.parent)) return;
        super.clean();
        this._hasInit = false;
        // this._monsterInfo = null;
        this._spine.node.scaleX = this._orginScaleX;
        this._assaultPos = null;
        this.changeObjDir(1);
        this.delQTShape();

        // 清理所有buff及其特效视图
        if (this._shootInfo) {
            const buffs = this._shootInfo.getBuffEffect();
            for (const buff of buffs) {
                buff.removeAllEffectView();
            }
            // 清空buff数组
            while (buffs.length > 0) {
                buffs.pop();
            }
        }

        // 清理缓存变量
        this._lastDistanceToCamera = 0;
        this._lastSpineQualityUpdate = -1;
        // this._updateFrameIndex = 0;
        this._lastUpdateFrame = -1;
        this._lastCurrDist = 0;
        this._worldPosDirty = true;
        this._cachedWorldPos = null;

        // 清理碰撞缓存
        this.lastFrameCollisions.clear();
        this.currentFrameCollisions.clear();

        // 清理定时器
        this.unscheduleAllCallbacks();
    }

    // 对象池回收时调用
    public unuse(): void {
        this.clean()
        // 取消全局事件监听器订阅
        GlobalEventMgr.getInstance().off(GlobalEventID.Post_Boss_Skill, this.onPostAckSkill, this);

        // // 清理Spine资源
        // if (this._spine && cc.isValid(this._spine)) {
        //     // 停止所有动画
        //     this._spine.setToSetupPose();
        //     // 取消动画完成监听器
        //     this._spine.setCompleteListener(null);

        //     // 重置材质
        //     if (this._normalMaterial && cc.isValid(this._normalMaterial)) {
        //         this._spine.setMaterial(0, this._normalMaterial);
        //     }

        //     // 重置Spine状态
        //     this._spine.node.active = true;
        //     this._spine.node.color = cc.Color.WHITE;
        //     this._spine.timeScale = 1;
        // }

        // 确保节点隐藏，减少渲染压力
        this.node.active = false;
        this.hp.node.active = false;

        // 取消所有定时器和缓动
        this.unscheduleAllCallbacks();
        cc.Tween.stopAllByTarget(this.node);
        // cc.Tween.stopAllByTarget(this._spine?.node);
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

