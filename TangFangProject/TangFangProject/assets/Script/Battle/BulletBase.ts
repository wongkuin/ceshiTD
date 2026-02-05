import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import MotionTrail from "../../TRFrameWork/Common/Components/MotionTrail";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { QTShape } from "../../TRFrameWork/QuadTree/quadtree/QTShape";
import { QTBox } from "../../TRFrameWork/QuadTree/TinyQuadtree";
import { AOESustainedInfo } from "../config/AOEInfo";
import ConfigMgr from "../config/ConfigMgr";
import { BulletSkillData } from "../config/DataDef";
import { BuffEffectInfo, BulletInfo, ShootBagInfo, shootBagParm } from "../config/DataInfo";
import { BulletAoeType, BulletVibrateType, ETurretDir, GameBulletState, GameObjectType } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";
import AOESustained from "./AOESustained";
import BattleAckObject from "./BattleAckObjet";
import BattleBase, { IPoolComponent } from "./BattleBase";
import GameControl from "./GameControl";
import GameResLoad from "./GameResLoad";
import ShootBagUI from "./ShootBagUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletBase extends BattleBase implements IPoolComponent {

    protected _bulletInfo: BulletInfo = null; // 子弹信息
    protected _checkSpace: number = 0.1; // 检测碰撞间隔

    protected _motion: MotionTrail = null; // 拖尾

    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}

    protected _imgNode: cc.Node = null;


    public init(bInfo: BulletInfo) {

        this._bulletInfo = bInfo;
        this.node.name = `Bullet_${bInfo.data.id}_${bInfo.sourceTag}_${bInfo.getOffset()}`
        // this._battleScene = SceneMgr.getCurrScene() as UISceneBattle;


        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(this.getStartWPos()));

        let collider = this.node.getComponentInChildren(cc.BoxCollider)
        // cc.director.getCollisionManager()['removeCollider'](collider);
        // collider.tag = bInfo.sourceTag;
        // cc.director.getCollisionManager()['addCollider'](collider);
        let box = collider
        let qtBox = new QTBox(box.offset.x - box.size.width / 2, box.offset.y - box.size.height / 2, box.size.width, box.size.height, this._bulletInfo.sourceTag);
        qtBox.node = this.node;
        this._qtShapes.push(qtBox);
        GameControl.getInstance().getQuadTree().insert(qtBox);
        this.resetQTPos();

        // console.log("addBullet2Map", this.getStartPos());

        // 拖尾
        // let mtRoot = this.node.getChildByName('montion');
        this._motion = this.node.getComponentInChildren(MotionTrail);
        if (this._motion) {
            // this._bulletInfo.hasTrajectory() && 
            this.scheduleOnce(() => {
                this._motion.active = true;
            })
        }
        //  else {
        //     if (mtRoot && this._bulletInfo.hasTrajectory()) {
        //         let self = this;
        //         GameResLoad.loadBulletMotion().then((node: cc.Node) => {
        //             if (cc.isValid(mtRoot)) {
        //                 mtRoot.addChild(node);
        //                 self._motion = node.getComponent(MotionTrail);
        //                 if (self._motion) {
        //                     self.scheduleOnce(() => {
        //                         self._motion.active = true;
        //                     })
        //                 }
        //             } else {
        //                 GameResLoad.putNode(node);
        //             }
        //         });
        //     }
        // }

        this._imgNode = this.node.getChildByName('img');
        if (this._imgNode) {
            this._imgNode.scale = this._bulletInfo.getBulletScale(); // 子弹缩放
            qtBox.setScale(this._imgNode.scale);

            let sps = this._imgNode.getComponent(sp.Skeleton);
            sps && sps.setAnimation(0, 'animation', true);
        }
        this.setMoveDir();
        SoundMgr.getInstance().playSound(this._bulletInfo.bulletSP.seLaunch); // 播放音效
    }

    //  
    public dirtyCheckOutScene(): void {
        this._checkSpace = 2;
    }


    // 检测碰撞
    protected onCollisionEnterQT(other: QTShape): void {
        let bullet: BulletBase = other.node.getComponent(BulletBase);
        if (bullet) {
            // 
            if (this.getBulletOffset() == 1 && bullet.getBulletOffset() != 2) {
                this.doOffset(); // 碰到子弹，子弹抵消
                // console.log("子弹碰子弹", this.node.name, bullet.node.name);
            }
        }
    }

    protected onCollisionExitQT(other: QTShape): void {
    }

    lastFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 上一帧碰撞的对象
    currentFrameCollisions: Set<QTShape> = new Set<QTShape>(); // 当前帧碰撞的对象

    protected checkQTCollision(): void {

        if (this.lastFrameCollisions.size != 0 || this.currentFrameCollisions.size != 0) {
            this.lastFrameCollisions = this.currentFrameCollisions;
            this.currentFrameCollisions = new Set<QTShape>();
        }

        for (const element of this._qtShapes) {
            let cList = GameControl.getInstance().getQuadTree().collide(element, GameHelp.getInstance().getCollisionTag(this._bulletInfo.sourceTag));
            let calced: cc.Node[] = [];
            for (const element of cList) {
                if (calced.indexOf(element.node) < 0) {
                    calced.push(element.node);
                    this.currentFrameCollisions.add(element);
                    // console.log("checkQTCollision", this.node.uuid, element.node.uuid, cList.length);
                }
            }
        }

        // 碰撞开始：当前帧有，上一帧没有
        this.currentFrameCollisions.forEach(other => {
            if (!this.lastFrameCollisions.has(other)) {
                this.onCollisionEnterQT(other);
            }
        });

        // 碰撞中：当前帧和上一帧均有
        // this.currentFrameCollisions.forEach(other => {
        //     if (this.lastFrameCollisions.has(other)) {
        //         // onCollisionStayQT(other);
        //     }
        // });

        // 碰撞结束：上一帧有，当前帧没有
        this.lastFrameCollisions.forEach(other => {
            if (!this.currentFrameCollisions.has(other)) {
                this.onCollisionExitQT(other);
            }
        });
    }

    // 获取子弹起始位置
    public getStartWPos(): cc.Vec3 {
        return this._bulletInfo.startWPos;
        // return this._bulletInfo.parm.shootObj.getFireWPos();
    }

    public getEndWPos(): cc.Vec3 {
        return this._bulletInfo.endPos;
    }


    // 可 抵消 子弹
    public getBulletOffset(): number {
        return this._bulletInfo?.getOffset() || 0;
    }

    protected setMoveDir() {
        // let tmpMoveDir = this._bulletInfo.movDir;
        // let changeAngle = this._bulletInfo.getRealAngel();
        // let moveDir = Utils.convertAngle(tmpMoveDir, changeAngle);
        // this._bulletInfo.fixMovDir = moveDir;

        this._bulletInfo.fixMovDirNow();
        let moveDir = this._bulletInfo.getRealMovDir();
        // let angle = Utils.vector2ToAngle(cc.v2(moveDir.x, moveDir.y)) - 90;
        // this.node.angle = (angle);
        this.resetRationt(moveDir);
        // this._bulletInfo.state = GameBulletState.Running;
        this.changeBulletState(GameBulletState.Running);

        this._qtShapes.forEach((element: QTShape) => {
            element.setRotation(this.node.angle);
        });
    }

    protected changeBulletState(state: GameBulletState) {
        if (!this._bulletInfo) {
            console.error("changeBulletState this._bulletInfo is null")
            return
        }
        this._bulletInfo.state = state;

        if (state == GameBulletState.Del || state == GameBulletState.End) {
            this.delQTShape();
            this._bulletInfo.vibrateCheck(BulletVibrateType.Vibrate_End);
        }
    }


    public doUpdate(dt: number): void {

        // this.node.getwo
        if (this.checkOutOfScreen()) {
            // console.log("超出屏幕");
            this.calcRebound(null, true)
        }

        this._checkSpace += dt;
        if (this._checkSpace >= 0.5) {
            this._checkSpace = 0;
            this.checkOutScreenDel() && this.changeBulletState(GameBulletState.Del);
        }

        if (this._bulletInfo.liveTime >= this._bulletInfo.getBulletLife() && this._bulletInfo.state == GameBulletState.Running) {
            if (this._bulletInfo.getBulletLife() <= 5) {
                this.doOffset();
            } else {
                this.change2End();
            }
        }
        this.setImgRadio();
        this.resetZIndex();
        // if (this._motion && this._motion.active) {
        //     this._motion.doUpdate();
        // }
        this.checkQTCollision(); // 检测碰撞

        super.doUpdate(dt);
        this._bulletInfo.liveTime += dt * 1000; // 子弹存活时间
    }


    protected resetZIndex() {
        this.node.zIndex = -this.node.y + 2000;
    }

    protected setImgRadio() {
        if (this._bulletInfo.getBulletDir() == 2) {
            // 1秒 360 度
            this._bulletInfo.imgRadio -= this._bulletInfo.getRadioSpeed(); // 6;
            this._bulletInfo.imgRadio = this._bulletInfo.imgRadio % 360;
            this._imgNode && (this._imgNode.angle = this._bulletInfo.imgRadio);


            for (const element of this._qtShapes) {
                element.setRotation(this._bulletInfo.imgRadio);
            }
        }
    }

    protected resetRationt(dir: cc.Vec2) {
        // 更新旋转（指向移动方向）
        const angle = cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
        this.node.angle = angle - 90;
    }


    protected change2End() {
        // console.log("BattleBulletUI toDel");
        if (this._bulletInfo.state != GameBulletState.Running) {
            return;
        }

        // this._bulletInfo.state = GameBulletState.End;
        this.changeBulletState(GameBulletState.End);
        // some del anim TODO
        this.calcAOE(BulletAoeType.End);
        this.scheduleOnce(() => {
            // this._bulletInfo.state = GameBulletState.Del;
            this.changeBulletState(GameBulletState.Del);
        });
    }


    // 子弹抵消
    protected doOffset() {
        this.showHitEffect(); // 击中效果
        this.change2End();
    }

    public isWaitRemove() {
        return this._bulletInfo.state == GameBulletState.Del;
    }


    async addAOEObject(fPath: string, aoeInfo) {
        let scene = GameControl.getInstance().sceneBattle;
        await GameResLoad.loadAOEPrefab(fPath).then(async (aoeNode) => {
            let aoe = aoeNode.getComponent(AOESustained);
            await scene.addAOE2Map(aoe);
            aoe.init(aoeInfo);

        });

    }

    getAOEInfo() {
        let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        this._bulletInfo.parm.isAoe = true;
        let fixHurt = this._bulletInfo.getFixHurt()
        return new AOESustainedInfo(wPos, this._bulletInfo.sourceTag, this._bulletInfo.parm,
            this._bulletInfo.data, fixHurt, this._bulletInfo.movDir);
    }

    // 子弹AOE效果
    protected calcAOE(type: BulletAoeType, ackObj: BattleAckObject = null) {
        if (this._bulletInfo.getBulletAoeType() == BulletAoeType.None) {
            return;
        }
        if (this._bulletInfo.getBulletAoeType() == type || this._bulletInfo.getBulletAoeType() == BulletAoeType.EndorHit) {
            // if()
            if (this._bulletInfo.bulletSP.spZone) {//持续性伤害
                this.addAOEObject(this._bulletInfo.bulletSP.spZone, this.getAOEInfo())
            } else {
                if (type == BulletAoeType.Hit) {
                    this.doAoeHurt(ackObj);
                } else if (type == BulletAoeType.End) {
                    this.doAoeHurt(null);
                }
            }

        }
    }

    // 触发aoe 伤害
    protected doAoeHurt(ackObj: BattleAckObject) {
        let cPos = this.node.getPosition();
        let scene = this._battleScene; // SceneMgr.getCurrScene() as UISceneBattle;
        if (!scene) return;

        this._bulletInfo.parm.isAoe = true;
        let targets: BattleAckObject[] = [];
        if (this._bulletInfo.sourceTag == GameObjectType.Turret || this._bulletInfo.sourceTag == GameObjectType.Hero) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            targets = scene.getPassControl().getTargetsInArea(cc.v2(wPos.x, wPos.y), this._bulletInfo.sourceTag, this._bulletInfo.getBulletAoeRadius(), ETurretDir.None);
        } else if (this._bulletInfo.sourceTag == GameObjectType.Monster_Bullet) {
            targets.push(scene.getPassControl().getGameTripod());
        }

        if (ackObj && targets.indexOf(ackObj) < 0) {
            targets.push(ackObj);
        }

        if (this._bulletInfo.tgt.length > 0) {
            targets = targets.filter((item) => {
                return this._bulletInfo.tgt.indexOf(item.getShootInfo().getID()) >= 0;
            });
        }
        let tlenght = targets.length;
        if (tlenght > 0) {

            if (tlenght > 20) {
                targets = CommonUtils.shuffleArray(targets);
                tlenght = 20;
            }
            for (let i = 0; i < tlenght; i++) {
                let target = targets[i];
                let hObj = target.doHurt(this._bulletInfo.getFixHurt());
                let hurt = hObj.hurt;
                this.checkAoeSkill(target, hurt, i); // 触发技能
                if (this._bulletInfo.sourceTag == GameObjectType.Monster_Bullet) {
                    GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: this.node.parent.convertToWorldSpaceAR(this.node.position), hurt: hurt, color: "#FF0000", isCritical: hObj.isCritical, block: hObj.block });
                } else {
                    GlobalEventMgr.getInstance().emit(GlobalEventID.create_hurt, { pos: target.getAckwPos(), hurt: hurt, isCritical: hObj.isCritical });
                }
            }
        }
    }

    // 触发技能
    protected checkAoeSkill(target: BattleAckObject, hurt: number, index: number = 0) {
        if (!target || !target.canAck()) return;
        if (this._bulletInfo.getBulletAoeSkill() > 0) {
            // console.log("BattleBulletUI checkAoeSkill");
            let skID = this._bulletInfo.getBulletAoeSkill();
            let bsk = ConfigMgr.getInstance().getById(skID, BulletSkillData);
            if (!bsk) {
                console.error('BulletSkillData aoe id = ' + skID + ' not found');
                return;
            }

            this.addBulletSKill(bsk, target, true, hurt, index);
        }
    }

    // 子弹击中 技能触发
    protected checkHitSkill(target: BattleAckObject, hurt: number, isCritical: boolean) {
        if (this._bulletInfo.getBulletHitSkill() > 0) {
            // console.log("BattleBulletUI checkHitSkill");
            let skID = this._bulletInfo.getBulletHitSkill();
            let bsk = ConfigMgr.getInstance().getById(skID, BulletSkillData);
            if (!bsk) {
                console.error('BulletSkillData hit id = ' + skID + ' not found');
                return;
            }
            this.addBulletSKill(bsk, target, false, hurt);
        }
    }

    // 添加子弹技能 和 buff
    protected addBulletSKill(bsk: BulletSkillData, target: BattleAckObject, isAoe: boolean, hurt: number, index: number = 0) {

        if (bsk.shootBagId > 0) {
            let sId = bsk.shootBagId;
            let bagInfo: ShootBagInfo = null;

            let targets: BattleAckObject[] = [];
            if (this._bulletInfo.sourceTag == GameObjectType.Turret || this._bulletInfo.sourceTag == GameObjectType.Hero) {
                let scene = this._battleScene;// SceneMgr.getCurrScene() as UISceneBattle;
                targets = scene.getPassControl().getAllLiveMonster().filter((m) => {
                    return m != target;
                });
            }

            let ackTaget = null; //target.getFinalyTarget(targets, bsk.enemySearch, null);
            let endPos = null;
            // if (ackTaget) {
            //     endPos = ackTaget.getAckwPos();
            // } else
            {
                endPos = this.node.parent.convertToWorldSpaceAR(this.node.position.add(cc.v3(this._bulletInfo.movDir.x * 200, this._bulletInfo.movDir.y * 200, 0)));
            }

            let startPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            if (isAoe) {
                startPos = target.getAckwPos();
            }
            // 缺少锁敌方式
            if (sId > 0) {
                // aoe 生成新发射 丢弃aoe
                let param = this.getShootParm(sId, ackTaget, startPos, endPos, false, target);
                // if (bsk.enemySearchFail != 0 || ackTaget != null) {
                bagInfo = new ShootBagInfo(sId, this._bulletInfo.sourceTag, param, index);
                // }
            }

            if (bagInfo) {
                let shootbag = new ShootBagUI(bagInfo);
                this._battleScene.addShootBag2Game(shootbag);
            }
        }


        if (bsk.buffId > 0 && !(target)) {
            console.error('addBulletSKill buffId = ' + bsk.buffId + ' target is null');
        }
        // 添加buff
        if (bsk.buffId > 0 && cc.isValid(target)) {

            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
            if (!isAoe) {
                let bWpos = GameControl.getInstance().getBaseWpos(); // 获取基地位置
                wPos = cc.v2(bWpos.x, bWpos.y);
            }

            let rDir = cc.v2(target.getAckwPos().x - wPos.x, target.getAckwPos().y - wPos.y).normalize();
            let buff = new BuffEffectInfo(bsk.buffId, this._bulletInfo.turretID, rDir, hurt, this._bulletInfo.parm.shootObj);
            target.canAck() && target.addBuffect(buff);
        }

        // 召唤波次
        if (bsk.waveId > 0) {
            let wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
            let data = {
                waveId: bsk.waveId,
                pos: wPos,
                sourceTag: this._bulletInfo.sourceTag,
            };
            GlobalEventMgr.getInstance().emit(GlobalEventID.wave_summon, data);
        }
    }

    protected getShootParm(sId: number, ackTaget: BattleAckObject, startPos: cc.Vec3, endPos: cc.Vec3, isAoe: boolean, target: BattleAckObject): shootBagParm {
        let bParam: shootBagParm = this._bulletInfo.parm;
        let shootPos = startPos;
        let param: shootBagParm = {
            shootObj: target,
            shootWPos: shootPos,
            ackTaget: ackTaget,// 缺少锁敌方式 TODO
            endPos: endPos,
            isAoe: isAoe,         // 是否aoe
            eDir: bParam.eDir,
            ackPower: bParam.ackPower, // 攻击力
            damAppend: bParam.damAppend, // 伤害追加
            shootTurretId: bParam.shootTurretId, // 发射者id
            shootRadius: bParam.shootRadius, // 发射半径
            tHitCriticalAdd: bParam.tHitCriticalAdd, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: bParam.tHitCriticalHurtAdd, // 调整后 提高命中暴击伤害
            tAoeCriticalAdd: bParam.tAoeCriticalAdd, // 调整后 提高aoe暴击概率
            tAoeCriticalHurtAdd: bParam.tAoeCriticalHurtAdd, // 调整后 提高aoe暴击伤害
            reviveAttack: bParam.reviveAttack,
            shootInfo: bParam.shootInfo,
            extAckObj: [target],
            damLv: bParam.damLv,
            damMul: bParam.damMul, // 百分比修改伤害
            attackMul: bParam.attackMul, // 百分比修改攻击
            damAdd: bParam.damAdd, // 强化 伤害
            actMan: bParam.actMan, //行动者

        }
        return param;
    }

    protected checkOutOfScreen(): boolean {
        // let bScene = SceneMgr.getCurrScene() as UISceneBattle;
        // return !bScene.isNodeVisibleInGameCamera(this.node);
        let zoomRatio = GameControl.getInstance().zoomScale;
        let width = cc.winSize.width / zoomRatio;
        let height = cc.winSize.height / zoomRatio;

        // X轴边界检查
        if (Math.abs(this.node.x) + this.node.width / 2 >= width / 2) {
            return true;
        }

        // Y轴边界检查
        if (Math.abs(this.node.y) + this.node.height / 2 > height / 2) {
            return true;
        }
        return false;
    }

    protected checkOutScreenDel(): boolean {
        let width = cc.winSize.width * 3;
        let height = cc.winSize.height * 2.4;
        let pos = this.node.position;
        if (pos.x < -width / 2 || pos.x > width / 2 || pos.y < -height / 2 || pos.y > height / 2) {
            return true;
        }
        return false;
    }



    /** 击中次数检查*/
    // 检查子弹命中次数
    public hitTimesCheck(ackObj: BattleAckObject, isCritical: boolean = false): void {
        this.calcAOE(BulletAoeType.Hit, ackObj);
        this.calcRebound(ackObj);
        // 无限
        if (this._bulletInfo.getBulletHitTimes() == -1) {
            return;
        }
        if (this._bulletInfo.currHitTimes >= this._bulletInfo.getBulletHitTimes()) {
            this.change2End();
        }
        SoundMgr.getInstance().playSound(this._bulletInfo.bulletSP.seHit); // 播放音效


        if (isCritical) {
            this._bulletInfo.vibrateCheck(BulletVibrateType.Vibrate_Hit);
        } else {
            this._bulletInfo.vibrateCheck(BulletVibrateType.Vibrate_HitAndCrit);
        }
    }

    /** 击中效果 */
    protected showHitEffect() {
        GlobalEventMgr.getInstance().emit(GlobalEventID.createCombatBomb, {
            pos: this.node.convertToWorldSpaceAR(cc.v2(0, 0)),
            url: this._bulletInfo.bulletSP.spHit,
            scale: this._bulletInfo.bulletSP.spHitVal,
            dir: this._bulletInfo.bulletSP.hitType == 1 ? this._bulletInfo.getRealMovDir() : null,
        });
    }

    // otherNormal = cc.v2();  //当前法向量
    /** 计算反弹*/
    public calcRebound(ackObj: BattleAckObject, out: boolean = false): boolean {

        let flag: boolean = false;
        // 反弹次数
        if (this._bulletInfo.currBouncesTime >= this._bulletInfo.getBulletBounceTimes() && this._bulletInfo.getBulletBounceTimes() != -1) {
            return false;
        }

        if (!out && (this._bulletInfo.getBulletBounceType() == 1 || this._bulletInfo.getBulletBounceType() == 3)) {

            this._bulletInfo.parm.extAckObj = [ackObj];
            let otherNormal = this.calcOtherNormalVec(ackObj);
            this.changeDir(otherNormal);
            this._bulletInfo.addBouncesTime();
            flag = true;

        }
        else if (out && (this._bulletInfo.getBulletBounceType() == 2 || this._bulletInfo.getBulletBounceType() == 3)) {
            // console.log("超出屏幕 反弹");
            this._bulletInfo.addBouncesTime();
            this.changeDir(this._bulletInfo.getRealMovDir(), out)
            flag = true;
        }

        return flag;
    }

    bounceFactor = 1;
    /** 反弹改变方向 */
    public changeDir(otherNormal: cc.Vec2, out: boolean = false) {
        // this.bulletInfo.moveDir = Utils.reflect_v2(this.bulletInfo.moveDir, otherNormal).normalize();
        // let angle = Utils.vectorsToDegress(cc.v2(this.bulletInfo.moveDir.x, this.bulletInfo.moveDir.y));
        // this.node.angle = -(angle);
        // this.bulletInfo.state = ObjState.move;
        // // this.node.emit(this.EventType.STATE_CHANGE, this.bulletInfo.moveDir);
        // this.stateChange(this.bulletInfo.moveDir);

        if (!out) {
            this._bulletInfo.fixAngel = this._bulletInfo.fixAngel + (Math.random() * 120 - 68);
            this.setMoveDir();
        } else {

            this._bulletInfo.fixAngel = 0;
            let zoomRatio = GameControl.getInstance().zoomScale;
            let width = cc.winSize.width / zoomRatio;
            let height = cc.winSize.height / zoomRatio;

            // X轴边界检查
            if (Math.abs(this.node.x) + this.node.width / 2 >= width / 2) {
                otherNormal.x *= -1 * this.bounceFactor; // 反转方向并应用反弹系数
                // 确保节点不会卡在边界外
                this.node.x = -otherNormal.x / Math.abs(otherNormal.x) * (width / 2 - this.node.width / 2) //* Math.sign(this._direction.x);
            }

            // Y轴边界检查
            if (Math.abs(this.node.y) + this.node.height / 2 > height / 2) {
                otherNormal.y *= -1 * this.bounceFactor; // 反转方向并应用反弹系数
                // 确保节点不会卡在边界外
                this.node.y = -otherNormal.y / Math.abs(otherNormal.y) * (height / 2 - this.node.height / 2) //* Math.sign(this._direction.y);
            }
            this._bulletInfo.movDir = otherNormal.normalize();
            this._bulletInfo.fixAngel = 0; // 重新设置角度
            this.setMoveDir();
        }

    }

    /** 计算被碰撞物法线*/
    public calcOtherNormalVec(ackObj: BattleAckObject): cc.Vec2 {
        let angle;

        let otherNode = ackObj.node;
        // let pos = this.node.getPosition();
        // if (!otherNode) {
        //     angle = 0;//上下
        //     if (pos.x <= this.bounds.xMin || pos.x >= this.bounds.xMax) {//左右
        //         angle = 90;
        //     }

        // } else {

        // }
        angle = otherNode.angle;
        let radius = Utils.getRadian(angle);
        let n = cc.v2(0, -1).rotate(radius) //this._bulletInfo.getRealMovDir().y > 0 ? cc.v2(0, -1).rotate(radius) : cc.v2(0, 1).rotate(radius);
        let otherNormal = cc.v2(n.x, n.y).normalize();
        return otherNormal;
    }

    /** 是否反弹 */
    // protected isRebound(): boolean {
    //     let flag: boolean = false;
    //     if (this._bulletInfo.getBulletBounceType() == 1) {
    //         // this._bulletInfo.currHitTimes >= this._bulletInfo.getBulletHitTimes() ? flag = false : flag = true;
    //         flag = true;
    //     }
    //     else if (this._bulletInfo.getBulletBounceType() == 2) {
    //         this._bulletInfo.currBouncesTime >= this.bulletInfo.bouncesTimes ? flag = false : flag = this.isOutBounds;
    //         this.isOutBounds = false;
    //     } else if (this._bulletInfo.getBulletBounceType() == 3) {
    //         if (this.isOutBounds) {
    //             this.bulletInfo.currBouncesTime >= this.bulletInfo.bouncesTimes ? flag = false : flag = this.isOutBounds;
    //             this.isOutBounds = false;
    //         }
    //         else {
    //             if (!otherNode) {
    //                 flag = false;
    //             }
    //             else {
    //                 if (this.bouncesType1(bulletNode, otherNode)) {
    //                     this.bulletInfo.currBouncesTime >= this.bulletInfo.bouncesTimes ? flag = false : flag = true;
    //                 }
    //             }
    //         }
    //     }
    //     return flag;
    // }

    // update (dt) {}
    reuse(): void {
        // console.log("BattleBulletUI reuse");
    }

    unuse(): void {
        // console.log("BattleBulletUI unuse");
        delete this._bulletInfo;
        this._bulletInfo = null;
        if (this._motion) {
            this._motion.active = false;
            // GameResLoad.putNode(this._motion.node);
            // this._motion = null;
        }

        this.lastFrameCollisions.clear();
        this.currentFrameCollisions.clear();
        this.delQTShape();
    }
}
