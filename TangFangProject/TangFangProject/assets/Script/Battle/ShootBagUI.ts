

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../config/ConfigMgr";
import { EquipSkillData, KvData } from "../config/DataDef";
import { BuffEffectInfo, BulletInfo, ShootBagInfo, summonParm } from "../config/DataInfo";
import { ETurretDir, GameBulletType, GameObjectType } from "../config/GameEnum";
import GameHelp from "../Mgr/GameHelp";
// import UISceneBattle from "../UI/UISceneBattle";
import BattleAckObject from "./BattleAckObjet";
import BulleCurveUI from "./BulleCurveUI";
import BulletLaser from "./BulleLaserUI";
import BulleLinetUI from "./BulleLinetUI";
import BulletBase from "./BulletBase";
import BulletBombUI from "./BulletBombUI";
import BulletCurveLineUI from "./BulletCurveLineUI";
import BulletFollowUI from "./BulletFollowUI";
import BulletOrbitingdUI from "./BulletOrbitingdUI";
import BulletFollowLoopUI from "./BulletFollowLoopUI";
import BulletThrowUI from "./BulletThrowUI";
import BulletWhirlUI from "./BulletWhirlUI";
import GameControl from "./GameControl";
import GameResLoad from "./GameResLoad";
import BulletCurveBlockUI from "./BulletCurveBlockUI";
import BulletLandmineUI from "./BulleLandmineUI";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";

const { ccclass, property } = cc._decorator;
var shootID: number = 0;
type ExtAckParm = {
    ackTarget: BattleAckObject,
    endwPos: cc.Vec3,
}

export default class ShootBagUI {
    protected _shootBagInfo: ShootBagInfo = null;

    protected _curWaweIdx: number = 0; // 当前波次
    protected _waitTime: number = 0;
    protected _isEnd: boolean = false;
    protected _totalShoots: number = 0; // 已发射次数计数

    public onLaserShoot: Function = null;

    public onLookatWpos: Function = null;

    protected sID: number = 0;

    protected _shooted: BattleAckObject[] = []; // 已经发射过的怪
    protected _lastShoot: BattleAckObject = null; // 最后一个发射的怪

    constructor(bagInfo: ShootBagInfo) {
        this._shootBagInfo = bagInfo;
        this.reset(bagInfo);
        this.sID = shootID++;
        // console.warn("创建 子弹", this.sID, bagInfo.data.id);
    }

    reset(bagInfo: ShootBagInfo) {
        this._curWaweIdx = 0;
        this._totalShoots = 0;
        this._shootBagInfo = bagInfo;
        this._waitTime = 0;
        this._isEnd = false;

        if (this._shootBagInfo.getShootInterval().length > 0) {
            this._waitTime = this._shootBagInfo.getShootInterval()[this._curWaweIdx];
        }

        if (this._shootBagInfo.parm.extAckObj.length > 0) {
            this._shooted = [].concat(this._shootBagInfo.parm.extAckObj);
        }
    }

    /** 创建指定数量的角度数组*/
    protected createAngleArrByNum(num: number, angle: number): Array<number> {
        if (num < 1) {
            return [0];
        }
        let arr = [];
        let min = (1 - num) / 2 * angle;
        for (let i = 0; i < num; i++) {
            let lastAngle: number = min + i * angle;
            arr.push(lastAngle);
        }
        return arr;
    }


    public doUpdate(dt: number) {
        if (this._shootBagInfo.shootIndex > 0) {
            this._shootBagInfo.shootIndex -= 1;
            return;
        }
        // this._shootBagInfo.data.interval[this._curWaweIdx]
        this._waitTime -= dt * 1000;
        if (this._waitTime <= 0 && !this._isEnd) {
            this.shootBag(this._curWaweIdx);
        }
    }


    /** 发射包 */
    protected shootBag(index: number): void {
        let bulletIds: number[] = this._shootBagInfo.getBulletIds();
        // 优化子弹ID获取：当索引超出范围时，使用最后一个有效ID或默认ID
        let bulletId: number;
        if (index < bulletIds.length && bulletIds[index] > 0) {
            bulletId = bulletIds[index];
        } else if (bulletIds.length > 0) {
            // 如果索引超出范围，使用最后一个有效ID
            bulletId = bulletIds[bulletIds.length - 1];
        } else bulletId = 0;

        // 执行发射
        this.waveShoot(index, bulletId);
        console.log("ShootBagUI shootBag idx", this.sID, index, bulletId, this._curWaweIdx, this._shootBagInfo.getShootInterval().length);

        if (this._curWaweIdx == 0) {
            this.checkSkillShoot(this._shootBagInfo.getSkills());
        }

        // 增加波次索引
        this._curWaweIdx += 1;

        // 检查是否已经发射了所有次数
        // interval.length 代表的是间隔数量，发射次数 = interval.length
        if (this._curWaweIdx >= this._shootBagInfo.getShootInterval().length) {
            this._isEnd = true;
            return;
        }

        // 设置下一次发射的间隔时间
        this._waitTime = this._shootBagInfo.getShootInterval()[this._curWaweIdx];
    }


    /** 检查技能发射 */
    protected async checkSkillShoot(skill: number[]) {
        if (!skill || skill.length <= 0) {
            return;
        }
        for (const skillId of skill) {
            let sData = ConfigMgr.getInstance().getById(skillId, EquipSkillData);
            if (!sData) {
                // console.error("equip skill data is null", skillId);
                continue;
            }

            // 触发3选1技能
            if (sData.powUp.length > 0) {
                let v4 = ConfigMgr.getInstance().getById(sData.powUp[0], KvData).val.split(",");
                let v5 = ConfigMgr.getInstance().getById(sData.powUp[1], KvData).val.split(",");
                GameHelp.getInstance().showPop3in1OnebyOne(v4, v5);
            }

            let target: BattleAckObject = null; // 
            if (sData.buffId > 0) {

                // 触发buff
                if (this._shootBagInfo.parm.shootInfo.getObjType() == GameObjectType.Turret ||
                    this._shootBagInfo.parm.shootInfo.getObjType() == GameObjectType.Hero ||
                    this._shootBagInfo.parm.shootInfo.getObjType() == GameObjectType.Cart) {
                    // sData.tgt  // buff 目标
                    // 1 = 对所有敌人生效
                    // 2 = 特殊目标 - 假人
                    // 3 = VIP
                    // 4 = 技能触发者

                    if (sData.tgt == 1) {
                        // 所有敌人
                        let battle = GameControl.getInstance().sceneBattle; //SceneMgr.getCurrScene() as UISceneBattle;
                        let enemies = battle.getPassControl().getAllLiveMonster();
                        for (const enemy of enemies) {
                            if (enemy.canAck()) {
                                let bWpos = battle.getTripod().getAckwPos(); // 获取基地位置
                                let dir = enemy.getAckwPos().sub(bWpos).normalize();
                                // let dir = enemy.node.parent.convertToWorldSpaceAR(cc.v3(0, 0));

                                let buff = new BuffEffectInfo(sData.buffId, this._shootBagInfo.parm.shootTurretId, cc.v2(dir.x, dir.y), 0, this._shootBagInfo.parm.shootObj);
                                enemy.addBuffect(buff);
                            }
                        }

                    } else if (sData.tgt == 3) {
                        // VIP
                        let battle = GameControl.getInstance().sceneBattle;
                        let vip = battle.getTripod();
                        if (cc.isValid(vip) && vip.canAck()) {
                            let buff = new BuffEffectInfo(sData.buffId, this._shootBagInfo.parm.shootTurretId, cc.v2(), 0, this._shootBagInfo.parm.shootObj);
                            vip.addBuffect(buff);
                            target = vip;
                        }
                    } else if (sData.tgt == 4) {
                        // 技能触发者
                        let sObj = this._shootBagInfo.parm.actMan;
                        if (cc.isValid(sObj)) {
                            let buff = new BuffEffectInfo(sData.buffId, this._shootBagInfo.parm.shootTurretId, cc.v2(), 0, this._shootBagInfo.parm.shootObj);
                            sObj.addBuffect(buff);
                            target = sObj;
                        }
                    }

                } else if (this._shootBagInfo.parm.shootInfo.getObjType() == GameObjectType.Monster) {
                    // let actMan = this._shootBagInfo.parm.actMan;
                    // actMan && actMan.doReverse();
                }
            }

            if (sData.animation.length > 0) {
                // sData.animationStart
                // 0=VIP的位置
                // 1=技能触发的位置
                // 2=目标的位置

                let sPos = cc.v3();
                if (sData.animationStart == 0) {
                    // let battle = GameControl.getInstance().sceneBattle;//SceneMgr.getCurrScene() as UISceneBattle;
                    // sPos = battle.getPassControl().getCartArmPos()
                    const visibleSize = cc.director.getWinSize();
                    sPos = cc.v3(visibleSize.width / 2, visibleSize.height / 2);
                } else if (sData.animationStart == 1) {
                    sPos = this._shootBagInfo.parm.shootWPos;
                } else if (sData.animationStart == 2) {
                    if (target) {
                        sPos = target.getAckwPos();
                    } else {
                        debugger;
                    }
                }
                GlobalEventMgr.getInstance().emit(GlobalEventID.createCombatBomb, {
                    pos: sPos,
                    url: sData.animation,
                    scale: 1,
                });

            }

            if (sData.money > 0) {
                // 触发货币
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_addMoney, sData.money, this._shootBagInfo.parm.shootWPos)
            }

            // 反向
            if (sData.return == 1) {
                this._shootBagInfo.parm.actMan && this._shootBagInfo.parm.actMan.doReverse();
            }

            if (sData.click == 1) {
                this._shootBagInfo.parm.actMan && this._shootBagInfo.parm.actMan.doubleClick();
            }

            if (sData.fakeHero > 0) {
                // 假人
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_createFakeHero, sData.fakeHero);
            }

            // 召唤
            if (sData.summon.length > 0) {
                // A1, B1, C1, D1, E1 | A2, B2, C2, D2, E2 |...
                // A = 定位方式
                //  0 = 以自身为圆心
                //  1 = 以VIP为圆心
                // B = 召唤的最小半径
                // C = 召唤的最大半径。召唤兽一定只会在B和C之间的距离内出现
                // D = 召唤方位
                //  0 = 无特定方位，360°均可
                //  1 = 只能在画面的上半场或下半场内出现
                // E = 召唤兽表的配置ID
                for (let i = 0; i < sData.summon.length; i += 5) {
                    let A = sData.summon[i + 0];
                    let B = sData.summon[i + 1];
                    let C = sData.summon[i + 2];
                    let D = sData.summon[i + 3];
                    let E = sData.summon[i + 4];
                    this.doSummon(A, B, C, D, E);
                }
            }
        }
    }


    public doSummon(A: number, B: number, C: number, D: number, E: number): void {
        let basePos = cc.v3();
        if (A == 0) {
            basePos = this._shootBagInfo.parm.shootWPos;
        } else if (A == 1) {
            let battle = GameControl.getInstance().sceneBattle;
            basePos = battle.getPassControl().getCartArmPos();
        }
        let startAngle = 0;
        let endAngle = 90;
        if (D == 1) {
            startAngle = 45
        }
        let getPos = Utils.generateUniformPointInRing(B, C, startAngle, endAngle);

        getPos.x *= Math.random() > 0.5 ? 1 : -1;
        getPos.y *= Math.random() > 0.5 ? 1 : -1;
        // console.log("召唤兽生成位置", getPos.x, getPos.y);
        let param: summonParm = {
            wPos: basePos.add(cc.v3(getPos.x, getPos.y)),
            monId: E,
            sourceTag: this._shootBagInfo.sourceTag,
            shootAck: this._shootBagInfo.parm.ackPower,
        }
        // console.log("召唤兽创建位置", param.wPos.x, param.wPos.y);
        GameControl.getInstance().sceneBattle.addSummonMonster(param);
    }

    /**
     * 波次发射
     * @param index 子弹波次
     * @param targetNode 攻击对象
     * @param type 子弹类型
     */
    protected waveShoot(index: number, bulletId: number): void {
        if (bulletId <= 0) {
            return;
        }

        let num: number = this._shootBagInfo.getNum()[index];
        let angle: number = this._shootBagInfo.getAngle()[index] || 0;
        let arrAngle: Array<number> = this.createAngleArrByNum(num, angle);

        // console.warn("shootBagInfo", num, angle, arrAngle);

        let curParm: any = {};
        for (const angle of arrAngle) {
            let bulletInfo: BulletInfo = new BulletInfo(bulletId);
            let ss = this._shootBagInfo.getEnemySearch()[index]
            if (!curParm[ss]) {
                curParm[ss] = this.getExtAckParm(index)
            }
            let extParm = curParm[ss];
            if (ss != 4) {
                curParm[ss] = null;
            }

            if (this._shootBagInfo.data.enemySearchFail == 0 && extParm.ackTarget == null) {
                continue;
            }

            if (this._shootBagInfo.data.enemySearchFail == 1 && extParm.ackTarget == null) {
                let dx = Utils.generateUniformPointInRing(50, 420, 0, 360);
                extParm.endwPos = this._shootBagInfo.parm.shootWPos.add(cc.v3(dx.x, dx.y, 0));
            }

            bulletInfo.setShootInfo(this._shootBagInfo, extParm.ackTarget, extParm.endwPos);
            // console.log("shootBagInfo", bulletInfo.movDir.x, bulletInfo.movDir.y);
            this._lastShoot = extParm.ackTarget;
            switch (bulletInfo.getBulletType()) {
                case GameBulletType.Line:
                    this.createBulletLine(angle, bulletInfo);
                    break;
                case GameBulletType.Curve:
                    this.createBulletCurve(angle, bulletInfo);
                    break;
                case GameBulletType.Laser:
                    this.createBulletLaser(angle, bulletInfo);
                    break;
                case GameBulletType.Whirl:
                    this.createBulletWhirl(angle, bulletInfo);
                    break;
                case GameBulletType.Bomb:
                    this.createBulletBomb(angle, bulletInfo);
                    break;
                case GameBulletType.Follow:
                    this.createBulletFollow(angle, bulletInfo);
                    break;
                case GameBulletType.Curve_line:
                    this.createBulletCurveLine(angle, bulletInfo);
                    break;
                case GameBulletType.Throw:
                    this.createBulletThrow(angle, bulletInfo);
                    break;
                case GameBulletType.Orbiting:
                    this.createBulletOrbiting(angle, bulletInfo);
                    break;
                case GameBulletType.Follow_loop:
                    this.createBulletFollowLoop(angle, bulletInfo);
                    break;
                case GameBulletType.Curve_block:
                    this.createBulletCurveBlock(angle, bulletInfo);
                    break;
                case GameBulletType.Landmine:
                    this.createBulletLandmine(angle, bulletInfo);
                    break;
                default:
                    this.createBulletLine(angle, bulletInfo);
                    break;
            }

        }

        this.onLookatWpos && this.onLookatWpos(this._shootBagInfo.parm.endPos);
    }


    protected getExtAckParm(idx: number): ExtAckParm {
        let rRet: ExtAckParm = {
            ackTarget: null,//,
            endwPos: cc.v3(), //this._shootBagInfo.parm.endPos,
        }

        this._shootBagInfo.parm.ackTaget

        if (!this._shootBagInfo.getEnemySearch()[idx]) {
            console.error("enemySearch err, shootbag id=", this._shootBagInfo.data.id);
            return rRet;
        }

        // if (this._shootBagInfo.data.enemySearch[idx] == 102) {
        //     // if (this._shootedMons.length < 1) {
        //     //     this._shootedMons.push(this._shootBagInfo.parm.ackTaget);
        //     // } else
        //     {
        //         // 来源  
        //     }
        // }
        let enemySearch = this._shootBagInfo.getEnemySearch()[idx];

        if (this._shootBagInfo.sourceTag == GameObjectType.Turret || this._shootBagInfo.sourceTag == GameObjectType.Hero || this._shootBagInfo.sourceTag == GameObjectType.Cart) {
            let bScene = GameControl.getInstance().sceneBattle;// SceneMgr.getCurrScene() as UISceneBattle;
            if (bScene && bScene.gRoot) {
                let mons;
                let shootRang = 0;
                let shootObj = this._shootBagInfo.parm.shootObj;
                let ackwPos = cc.v3();
                if (cc.isValid(shootObj) && shootObj.isLiving()) {
                    shootRang = shootObj?.getShootInfo()?.getShootRang() || 0;
                }
                if (shootRang > 0) {
                    ackwPos = this._shootBagInfo.parm.shootObj.getAckwPos()
                    mons = bScene.getPassControl().getTargetsInArea(cc.v2(ackwPos.x, ackwPos.y), this._shootBagInfo.sourceTag, shootRang, ETurretDir.None);
                } else {
                    mons = bScene.getPassControl().getAllLiveMonster(this._shootBagInfo.parm.shootObj)
                }

                let newTarget = GameHelp.getInstance().getFinalyTarget(mons, enemySearch,
                    this._lastShoot, this._shooted, this._shootBagInfo);
                if (cc.isValid(newTarget) && newTarget.canAck()) {
                    rRet.ackTarget = newTarget;
                    rRet.endwPos = newTarget.getAckwPos();

                    if (enemySearch == 11) {
                        // console.warn(rRet.endwPos.y);
                        // if(rRet.endwPos.y>cc.winSize.height/2+200){
                        //     rRet.endwPos.y -=100;
                        // }else if(rRet.endwPos.y<cc.winSize.height/2-200){
                        //      rRet.endwPos.y +=100;
                        // }

                    }
                } else {
                    rRet.ackTarget = null;
                    let xSymbol = Math.random() > 0.5 ? 1 : -1;
                    let ySymbol = Math.random() > 0.5 ? 1 : -1;
                    let rX = Math.random() * 200 - 50;
                    let rY = Math.max(Math.random(), 0.5) * 200 - 50;
                    // console.log("rX=", rX, "rY=", rY, shootRang);
                    if (shootRang > 0) {
                        rX = (Math.random() * shootRang);
                        rY = Math.max(Math.random(), 0.3) * shootRang;
                    }
                    this._shootBagInfo.parm.endPos;

                    rRet.endwPos = ackwPos.add(cc.v3(rX * xSymbol, rY * ySymbol, 0));
                }
            }
        } else if (this._shootBagInfo.sourceTag == GameObjectType.Monster_Bullet) {
            let bScene = GameControl.getInstance().sceneBattle;// SceneMgr.getCurrScene() as UISceneBattle;
            // 坐标锁定
            if (enemySearch == 1002) {
                rRet.ackTarget = null;
                rRet.endwPos = this._shootBagInfo.parm.endPos;
            } else if (enemySearch == 1001) {
                // 格子目标
                let mons = bScene.getVaildBlocks();
                // console.log("mons 1001=", mons);
                let newTarget = GameHelp.getInstance().getFinalyTarget(mons, enemySearch, this._lastShoot, this._shooted);
                rRet.ackTarget = newTarget;
                rRet.endwPos = newTarget.getAckwPos();
            } else {
                rRet.ackTarget = this._shootBagInfo.parm.ackTaget || bScene.getPassControl().getGameTripod();
                rRet.endwPos = rRet.ackTarget.getAckwPos();
            }
            // rRet.ackTarget = this._shootBagInfo.parm.ackTaget;
            // rRet.endwPos = this._shootBagInfo.parm.ackTaget.getAckwPos();
        }
        rRet.ackTarget && this._shooted.push(rRet.ackTarget);
        return rRet;

    }

    public isWaitRemove(): boolean {
        return this._isEnd;
    }

    // 创建子弹线
    protected createBulletLine(angle: number, bulletInfo: BulletInfo) {
        this.loadBullet(angle, bulletInfo, BulleLinetUI);
    }

    // 创建子弹曲线
    protected createBulletCurve(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulleCurveUI);
    }

    protected createBulletCurveBlock(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletCurveBlockUI);
    }

    // 创建子弹激光
    protected createBulletLaser(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletLaser);
        this.onLaserShoot && this.onLaserShoot(bulletInfo.data.lifeTime);
        //  激光攻击间隔 
    }

    // 回旋弹
    protected createBulletWhirl(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletWhirlUI);
    }

    // 炸弹
    protected createBulletBomb(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletBombUI);
    }

    // 地雷炸弹
    protected createBulletLandmine(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletLandmineUI);
    }

    // 跟随
    protected createBulletFollow(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletFollowUI);
    }

    // 曲线+线
    protected createBulletCurveLine(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletCurveLineUI);
    }

    // 抛物线
    protected createBulletThrow(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletThrowUI);
    }

    // 围绕
    protected createBulletOrbiting(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletOrbitingdUI);
    }

    // 循环 围绕
    protected createBulletFollowLoop(arrAngle: number, bulletInfo: BulletInfo) {
        this.loadBullet(arrAngle, bulletInfo, BulletFollowLoopUI);
    }

    protected loadBullet<T extends BulletBase>(angle0: number, bulletInfo: BulletInfo, type: { new(): T }) {
        let scene = GameControl.getInstance().sceneBattle; // SceneMgr.getCurrScene() as UISceneBattle;
        let fPath = bulletInfo.bulletSP.spMain;

        // console.warn("添加子弹", bulletInfo.data.id);
        if (!fPath || fPath.length == 0) {
            console.error("create Bullet no spMain", bulletInfo.data.id, bulletInfo.bulletSP.id);
            return;
        }
        GameResLoad.loadBulletPrefab(fPath).then(async data => {
            if (!data) {
                console.error("createBulletLine err", fPath);
                return;
            }
            let bulletNode = data;
            let bullet = bulletNode.getComponent(type);
            if (!bullet) {
                bulletNode.removeComponent(BulletBase);
                bullet = bulletNode.addComponent(type);
            }
            bulletInfo.fixAngel = angle0;
            bulletNode.active = false;
            await scene.addBullet2Map(bullet, bulletInfo.getBulletType());
            bullet.init(bulletInfo);
            // scene.drawDebugShootLine(bullet);
            // console.log('shoot', bulletInfo.data.id, bulletInfo.fixAngel);
        })
    }
}

