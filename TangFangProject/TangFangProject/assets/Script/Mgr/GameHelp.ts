

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import { MathUtils } from "../../TRFrameWork/Common/Utils/MatchUtils";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import BattleAckObject from "../Battle/BattleAckObjet";
import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameControl, { GameBattleInfo, passCharInfo, passTurretInfo, telentInfo } from "../Battle/GameControl";
import ShootBagUI from "../Battle/ShootBagUI";
import ConfigMgr from "../config/ConfigMgr";
import { DrawMainData, DrawSubData, HeroData, ItemBaseData, MonsterData, WapenFusionData, WapenTableData } from "../config/DataDef";
import { ShootBagInfo, shootBagParm } from "../config/DataInfo";
import { ETurretDir, GameObjectType, WidgetType } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameGlobalData from "../Data/GameGlobalData";
import GameRelicData from "../Data/GameRelicData";
import GameUserData from "../Data/GameUserData";
import GameWapenData from "../Data/GameWapenData";
import { ItemVo } from "../Data/UserItemsData";
import { MonsterManager } from "./MonsterManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameHelp extends Singleton<GameHelp> {

    static energy_max: number = 0; // 能量上限

    isValid: boolean = true;

    private _pop3in1Infos: any[] = [];
    private _showing3in1: boolean = false;

    constructor() {
        super();
        this.regiestEvent();
    }

    public Init() {
        console.log("GameHelp Init");
    }

    protected regiestEvent() {
        GlobalEventMgr.getInstance().on(GlobalEventID.func_event, this.onFuncEvent, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.vibrateShort, this.onVibrateShort, this);

    }


    public showToast(msg: string, duration: number = 2, widtType: WidgetType = WidgetType.Center) {
        FormMgr.open(UIConfig.toast_tip, { msg: msg, duration: duration, widget: widtType });
    }

    public static replaceColorStr(str: string): string {
        let rStr = str;

        rStr = rStr.replace(/\\n/g, '<br/>')

        rStr = rStr.replace(/<\/n>/g, '\n')

        rStr = rStr.replace(/<g>/g, "<color=#00ff2a>");
        rStr = rStr.replace(/<\/g>/g, "</color>");

        rStr = rStr.replace(/<r>/g, "<color=#ff3612>");
        rStr = rStr.replace(/<\/r>/g, "</color>");


        rStr = rStr.replace(/<color1>/g, "<color=#4CE64C>");

        rStr = rStr.replace(/<color2>/g, "<color=#006BFF>");

        rStr = rStr.replace(/<color3>/g, "<color=#BB14DC>");

        rStr = rStr.replace(/<color4>/g, "<color=#FFAB0B>");


        // console.log("replaceColorStr", rStr);
        return rStr;
    }

    public static isBlockParent(turret: cc.Node) {
        if (!turret || !turret['rParent']) { return false; }
        return turret['rParent'].name == 'weapon';
    }


    protected getBattleInfo(passId: number): GameBattleInfo {
        let heroList = []; // GameCrewData.getInstance().getFightCrewList(); // GameHeroData.getInstance().getFightHeroList();
        let list = [];

        heroList.forEach((hvo) => {
            let vo = { hid: hvo.id, level: hvo.level, skills: [] };
            list.push(vo);
        });

        let ftList: passTurretInfo[] = [];
        let wList = GameWapenData.getInstance().getAllOpenFight();//武器
        for (const element of wList) {
            let skills = GameWapenData.getInstance().getBuffListByWapenId(element.id);
            let atk = GameWapenData.getInstance().getWapenCurAtkById(element.id);

            console.log("getBattleTurretInfo", element.id, element.level, skills, atk);
            ftList.push({
                tid: element.id,
                level: element.level,
                skillExt: skills,
                atk: atk,
            });
        }

        let maxHp = ConfigMgr.getInstance().getById(1, HeroData).maxHP;
        let charInfo: passCharInfo = {
            ID: 1,
            maxHP: maxHp,
        }

        let tList = GameUserData.getInstance().getUserTalentAttrList();//天赋
        let telent: telentInfo = {
            atk: tList[1],
            atkNum: tList[3],
            hp: tList[0],
            def: tList[2],
        }

        let relicSkillList = GameRelicData.getInstance().getPassiveSkillIdList();
        let info: GameBattleInfo = {
            fid: `${passId}_${Date.now()}`,
            // hero: list,
            char: charInfo,
            turret: ftList,
            passId: passId,
            telent: telent,
            tutorial: (passId == 1 && GameUserData.getInstance().lastPassLv <= 1) ? true : false,
            lastPassLV: GameUserData.getInstance().lastPassLv,
            maxPassWave: GameUserData.getInstance().getPassAwardById(passId).boCi,
            relicSkillList: relicSkillList,
        }
        return info;
    }

    public goToBattle(passId: number) {
        console.log("goToBattle", passId);
        let info = this.getBattleInfo(passId);
        FormMgr.open(UIConfig.scene_battle, { info: info }, { loadingForm: UIConfig.ui_loading });
    }

    public goToBattleWordBoss(pid: number) {
        console.log("goToBattleWordBoss", pid);
        let info = this.getBattleInfo(pid);
        FormMgr.open(UIConfig.scene_battle_worldBoss, { info: info }, { loadingForm: UIConfig.ui_loading });
    }

    public goToBattleTeam(pid: number, teamerId: number) {
        console.log("goToBattleTeam", pid);
        let info = this.getBattleInfo(pid);
        info.teamerId = teamerId;
        FormMgr.open(UIConfig.scene_battle_Team, { info: info }, { loadingForm: UIConfig.ui_loading });
    }

    // 检查是否可以碰撞
    public checkCanCollision(sTag: GameObjectType, oTag: GameObjectType): boolean {
        let bRet: boolean = false;
        if (sTag == GameObjectType.Monster) {
            if (oTag == GameObjectType.FireBox) {
                bRet = true;
            }
        } else if (sTag == GameObjectType.Monster_Bullet) {
            if (oTag == GameObjectType.Cart || oTag == GameObjectType.Turret || oTag == GameObjectType.Hero) {
                bRet = true;
            }
        } else if (sTag == GameObjectType.Turret) {
            if (oTag == GameObjectType.Monster || oTag == GameObjectType.Monster_Bullet) {
                bRet = true;
            }
        } else if (sTag == GameObjectType.Hero) {
            if (oTag == GameObjectType.Monster || oTag == GameObjectType.Monster_Bullet) {
                bRet = true;
            }
        } else if (sTag == GameObjectType.Cart) {

        } else if (sTag == GameObjectType.FireBox) {
            if (oTag == GameObjectType.Monster) {
                bRet = true;
            }
        } else if (sTag == GameObjectType.Tree) {
            if (oTag == GameObjectType.Monster) {
                bRet = true;
            }
        }
        return bRet;
    }

    public getCollisionTag(sTag: GameObjectType): number {
        let nRet: number = 0;
        switch (sTag) {
            case GameObjectType.Monster:
                nRet = GameObjectType.FireBox;
                break;
            case GameObjectType.Monster_Bullet:
                nRet = GameObjectType.Cart | GameObjectType.Turret | GameObjectType.Hero;
                break;
            case GameObjectType.Turret:
                nRet = GameObjectType.Monster | GameObjectType.Monster_Bullet;
                break;
            case GameObjectType.Hero:
                nRet = GameObjectType.Monster | GameObjectType.Monster_Bullet;
                break;
            case GameObjectType.Cart:
                nRet = GameObjectType.Monster_Bullet;
                break;
            case GameObjectType.FireBox:
                nRet = GameObjectType.Monster;
                break;
            case GameObjectType.Tree:
                nRet = GameObjectType.Monster;
                break;
        }
        return nRet;
    }

    /**
     * 
     * @param targets 索敌列表
     * @param enemySearch 索敌方式
     * @param lastActObj 上一个攻击对象
     * @param search1Taget 第一个索敌对象
     * @returns 
     */
    public getFinalyTarget(targets: BattleAckObject[], enemySearch: number,
        lastActObj: BattleAckObject, search1Taget?: BattleAckObject[], shootBagInfo?: ShootBagInfo): BattleAckObject {
        // 若没有配置发射包，则此项无效
        // 0 = 打最近的，打死为止
        // 1 = 随机挑一个，打死为止
        // 2 = 优先打大怪，打死为止
        // 3 = 优先打小怪，打死为止
        // 4 = 打最近的，每一次发射都重新索敌
        // 5 = 随机打，每一次发射都重新索敌
        // 101 同前一个
        // 102 排除前面的
        if (targets.length < 1) {
            return null;
        }

        if (shootBagInfo) {
            //查找当前发射包是否是对地对空
            const wapenFusionData = ConfigMgr.getInstance().getById(shootBagInfo.data.id, WapenFusionData);
            if (wapenFusionData?.typeId) {
                const wapenData = ConfigMgr.getInstance().getById(wapenFusionData.typeId, WapenTableData);
                if (wapenData && (wapenData?.atType == 2 || wapenData?.atType == 3)) {
                    //2只对地,3只对空
                    targets = targets.filter((tar) => {
                        if (tar.node?.getComponent(BattleMonsterUI)) {
                            const mst = tar.node.getComponent(BattleMonsterUI);
                            const mData = ConfigMgr.getInstance().getById(mst.getMonsterInfo().data.id, MonsterData);
                            if (mData && (mData.moveType == wapenData.atType - 1)) {
                                return true;
                            }
                        } else return false;
                    })
                }
            }
        }

        let rTag = MathUtils.randomArray(targets);
        switch (enemySearch) {
            case -2:
                return null;
                break;
            case 0:
                if (lastActObj && lastActObj.canAck()) {
                    rTag = lastActObj;
                } else {
                    targets = targets.sort((a, b) => {
                        // return a.node.position.y - b.node.position.y;
                        return (a.getDistanceWithTarget() - b.getDistanceWithTarget());
                    });
                    rTag = targets[0];
                }
                break;
            case 1:
                if (lastActObj && lastActObj.canAck()) {
                    rTag = lastActObj;
                }
                break;
            case 2:
                targets = targets.sort((a, b) => {
                    return b.getMonsterType() - a.getMonsterType();
                });
                if (lastActObj && lastActObj.canAck() && lastActObj.getMonsterType() >= targets[0].getMonsterType()) {
                    rTag = lastActObj;
                } else {
                    targets = targets.sort((a, b) => {
                        return (a.getDistanceWithTarget() - b.getDistanceWithTarget());
                    });
                    rTag = targets[0];
                }
                break;
            case 3:
                targets = targets.sort((a, b) => {
                    return a.getMonsterType() - b.getMonsterType();
                });
                if (lastActObj && lastActObj.canAck() && lastActObj.getMonsterType() <= targets[0].getMonsterType()) {
                    rTag = lastActObj;
                } else {

                    targets = targets.sort((a, b) => {
                        return (a.getDistanceWithTarget() - b.getDistanceWithTarget());
                    })
                    rTag = targets[0];
                }
                break;
            case 4:
                targets = targets.sort((a, b) => {
                    return a.node.position.y - b.node.position.y;
                    // return (a.getDistanceWithTarget() - b.getDistanceWithTarget());
                });

                rTag = targets[0];
                break;

            case 5:
                rTag = MathUtils.randomArray(targets);
                // targets = targets.sort((a, b) => {
                //     return b.node.position.y - a.node.position.y;
                // });
                // rTag = targets[0];
                break;
            case 11:
                rTag = MonsterManager.findMostConcentratedGroup(targets);
                // targets = targets.sort((a, b) => {
                //     return b.node.position.y - a.node.position.y;
                // });
                // rTag = targets[0];
                break;
            case 101:
                rTag = search1Taget[0];
                break;
            case 1001:
            case 102:
                let news = targets.filter((a) => {
                    return search1Taget.indexOf(a) < 0; // a != search1Taget;
                });
                if (news.length > 0) {
                    rTag = MathUtils.randomArray(news);
                } else {
                    rTag = null;
                }
                break;
            default:
                break;
        }
        return rTag;
    }

    protected onFuncEvent(data: any) {

    }

    // 弹出3选一
    public showPop3in1OnebyOne(normal: string[], change: string[], firstCh?: string[]) {
        let normals: number[] = [];
        for (let i = 0; i < normal.length; i += 2) {
            let count = 0;
            while (count < parseInt(normal[i + 1])) {
                normals.push(parseInt(normal[i]));
                count++;
            }
        }
        let changes: number[] = [];
        for (let i = 0; i < change.length; i += 2) {
            let count = 0;
            while (count < parseInt(change[i + 1])) {
                changes.push(parseInt(change[i]));
                count++;
            }
        }

        let firstChange: number[] = [];
        if (firstCh) {
            for (let i = 0; i < firstCh.length; i += 2) {
                let count = 0;
                while (count < parseInt(firstCh[i + 1])) {
                    firstChange.push(parseInt(firstCh[i]));
                    count++;
                }
            }
        }
        let pData = {
            value1: normals,
            value2: changes,
            value3: firstChange,
        }

        this._pop3in1Infos.push(pData);
        this.checkShowPop3in1();
    }


    protected checkShowPop3in1() {
        if (this._pop3in1Infos.length > 0 && !this._showing3in1) {
            let pData = this._pop3in1Infos.shift();
            if (pData) {
                this._showing3in1 = true;
                FormMgr.open(UIConfig.ui_game3in1, { data: pData }, {
                    onClose: () => {
                        GameHelp.getInstance()._showing3in1 = false;
                        GameHelp.getInstance().checkShowPop3in1();
                    }
                });
            }
        }
    }


    public getShootParm(sId: number, shootObj: BattleAckObject, ackTaget: BattleAckObject, endPos: cc.Vec3, shootPos: cc.Vec3, power: number): shootBagParm {
        // let bParam: shootBagParm = this._bulletInfo.parm;
        // let shootPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        let param: shootBagParm = {
            shootObj: shootObj,
            shootWPos: shootPos,
            ackTaget: ackTaget,
            endPos: endPos,
            isAoe: false, // 是否aoe
            ackPower: power, // 攻击力
            eDir: ETurretDir.None,
            shootTurretId: 0, // 发射者id
            shootRadius: 0, // 射程
            tHitCriticalAdd: 0, // 调整后 提高命中暴击概率
            tHitCriticalHurtAdd: 0, // 调整后 提高命中暴击伤害
            tAoeCriticalAdd: 0, // 调整后 提高aoe暴击概率
            tAoeCriticalHurtAdd: 0, // 调整后 提高aoe暴击伤害
            reviveAttack: GameControl.getInstance().getReviveAttack(),
            shootInfo: shootObj?.getShootInfo(),
            extAckObj: [],
            damAppend: 0,
            damLv: 0,
            damMul: 0,
            attackMul: 0,
            damAdd: 0
        }
        return param;
    }

    // 手机震动
    protected onVibrateShort() {
        if (!GameGlobalData.getInstance().shockEnabled) {
            return;
        }
        PlatformMgr.instance.vibrateShort();
    }


    // 读表获取抽奖结果
    getDataList(type, num): { itemID: number, num: number }[] {
        let list: { itemID: number, num: number }[] = []
        for (let i = 0; i < num; i++) {
            let data = this.calcReward(type);
            if (data.itemId > 0) {
                list.push({ itemID: data.itemId, num: data.itemValue });
            }

        }
        // console.log("抽奖结果:", list.length, list)
        return list;
    }

    /**一份奖励 */
    calcReward(id, func?: Function): DrawSubData {
        let mainData = ConfigMgr.getInstance().getAll(DrawMainData).filter((data) => {
            return data.mainDrawID == id;
        })

        let weightList = this.getWeightList(mainData);
        let lotteryId = Utils.getRandDataOfWeightObjectList(weightList);
        let subDrawID = ConfigMgr.getInstance().getById(lotteryId.data.id, DrawMainData).subDrawID;
        //  let curChapterId = GameUserData.getInstance().curChapterId;
        let SubData = ConfigMgr.getInstance().getAll(DrawSubData).filter((data) => {
            let itemId = data.itemId;
            let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
            let isGet = true;
            //碎片必须先解锁才能抽到
            // console.log("itemId",itemId);

            if (itemData && itemData.type == 5 && (!GameWapenData.getInstance().getWapenById(itemData.typeArgs) || ConfigMgr.getInstance().getById(itemData.typeArgs, WapenTableData).open == 0)) {
                isGet = false;
            }
            // if (func) {
            // 	return func(data)&&isGet;
            // } else {
            //return (data.subDrawID == subDrawID);
            return (data.subDrawID == subDrawID) && isGet;
        })
        if (SubData.length == 0) {
            console.error("SubData.length==0,子库筛选错误，id：", id);
            return null;
        }
        // console.log("id",id,"SubData",SubData);
        let rewardId = Utils.getRandDataOfWeightObjectList(this.getWeightSubList(SubData)).data.id;
        let rewardData = ConfigMgr.getInstance().getById(rewardId, DrawSubData);
        return rewardData;

    }

    private getWeightList(list: DrawMainData[]): Array<{ id: number, weight: number }> {
        var arr = [];
        for (var i: number = 0; i < list.length; i++) {
            var obj = { id: list[i].id, weight: list[i].weight };
            arr.push(obj);
        }
        return arr;
    }


    private getWeightSubList(list: DrawSubData[]): Array<{ id: number, weight: number }> {
        var arr = [];
        for (var i: number = 0; i < list.length; i++) {
            var obj = { id: list[i].id, weight: list[i].weight };
            arr.push(obj);
        }
        return arr;
    }


    /**合并同类型奖励数据 */
    arrangeAwardList(olderList: ItemVo[]): ItemVo[] {
        let newList: ItemVo[] = [];
        for (let i = 0; i < olderList.length; i++) {
            let item = olderList[i];
            let added = false;
            for (let j = 0; j < newList.length; j++) {
                let nItem = newList[j];
                if (nItem.itemID == item.itemID) {
                    added = true;
                    nItem.num += item.num;
                    item = null;
                    break;
                }
            }
            if (!added) {
                newList.push(item);
            }
        }
        return newList;
    }

    /** 判断是否在扇形区域内 */
    isInSectorArea(
        pointX: number,
        pointY: number,
        centerX: number,
        centerY: number,
        radius: number,
        startAngleDegrees: number,
        endAngleDegrees: number
    ): boolean {
        const deltaX = pointX - centerX;
        const deltaY = pointY - centerY;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const radiusSquared = radius * radius;

        if (distanceSquared > radiusSquared) {
            return false;
        }

        const startAngleRad = startAngleDegrees * Math.PI / 180;
        const endAngleRad = endAngleDegrees * Math.PI / 180;

        let pointAngle = Math.atan2(deltaY, deltaX);

        if (pointAngle < 0) {
            pointAngle += 2 * Math.PI;
        }

        let normalizedStart = startAngleRad;
        let normalizedEnd = endAngleRad;

        if (normalizedEnd < normalizedStart) {
            normalizedEnd += 2 * Math.PI;
            if (pointAngle < normalizedStart) {
                pointAngle += 2 * Math.PI;
            }
        }
        return pointAngle >= normalizedStart && pointAngle <= normalizedEnd;
    }
}




