import UserVariable from "../../TRFrameWork/cocos-module/component/UserVariable";
import { TimerUtils } from "../../TRFrameWork/Common/Utils/TimeUtils";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import ConfigMgr from "../config/ConfigMgr";
import { EquipSkillExData, ItemBaseData, KvData, WapenCostData, WapenTableData, WapenUpData } from "../config/DataDef";
import UIConfig from "../config/UIConfig";
import GameHelp from "../Mgr/GameHelp";
import GameUserData from "./GameUserData";
import UserItemsData from "./UserItemsData";
import { UserKeyType } from "./UserKeyType";

export enum WapenType {
    wapen = 0,
    skil = 1,
    buff = 2,
    stick = 4,
}



export interface fightWapenVo {
    /**出战位置 */
    posIndex: number,
    /**武器id */
    id: number,
}

/**解锁/出战的装备数据 */
export default class GameWapenData extends UserVariable<GameWapenData> {


    constructor() {
        super(UserKeyType.GameWapenData, true);
    }

    /**出战列表,posIndex 从0 开始*/
    fightList: fightWapenVo[] = [];
    /**拥有的装备列表 */
    hasWapenList: WapenVo[] = [];
    lockList: WapenVo[] = [];


    /**首次初始化用 */
    protected init(first: boolean): void {

        this.initData();

        if (first) {
            TimerUtils.instance.once(() => {
                let autoCfg = ConfigMgr.getInstance().getById(38, KvData).val.split(",").map((v) => {
                    return parseInt(v);
                })

                for (let i = 0; i < autoCfg.length; i = i + 2) {
                    UserItemsData.getInstance().pushItem(autoCfg[i], autoCfg[i + 1]);
                }
            }, 0.5)

        }


    }

    getAllFightWapen(): WapenVo[] {
        let wapenList: WapenVo[] = [];
        for (let i = 0; i < this.fightList.length; i++) {
            let wapenVo = this.getWapenById(this.fightList[i].id);
            if (wapenVo) {
                wapenList.push(wapenVo);
            }
        }
        return wapenList;

    }

    getAllFightSkill(): WapenVo[] {
        let wapenList: WapenVo[] = [];
        for (let i = 0; i < this.hasWapenList.length; i++) {
            let vo = this.hasWapenList[i];
            let cfg = this.getWapenTableDataById(vo.id);

            if (cfg.wapenType == 1 && cfg.open == 1) {
                wapenList.push(vo);
            }
        }
        return wapenList;
    }

    getAllOpenFight(): WapenVo[] {
        let wapenList: WapenVo[] = [];
        for (let i = 0; i < this.hasWapenList.length; i++) {
            let vo = this.hasWapenList[i];
            let cfg = this.getWapenTableDataById(vo.id);

            if (cfg.open == 1) {
                wapenList.push(vo);
            }
        }
        return wapenList;
    }

    /**得到一个没有上阵的位置 */
    getFightWapenIdlePosIndex(): number {
        let posIndex = -1;
        if (GameUserData.getInstance().curSlotNum > this.fightList.length) {
            for (let i = 0; i <= GameUserData.getInstance().curSlotNum; i++) {
                if (!this.getFightVoByPosIndex(i)) {
                    posIndex = i;
                    return i;
                }
            }
        } else {
            return posIndex;
        }
    }

    /**增加或者替换一个位置的上阵武器 */
    addFightWapen(fruitId, posIndex) {
        if (!this.getWapenTableDataById(fruitId)) {
            console.error("不存在的武器id,无法上阵");
            return;
        }
        let fightVo = this.getFightVoByPosIndex(posIndex);
        if (fightVo) {
            fightVo.id = fruitId;
        } else {
            this.fightList.push({ id: fruitId, posIndex: posIndex })
        }
        // console.log("11111111111111::", this.fightList);
    }
    /**删除一个位置的出战武器通过id */
    deleteFightWapenByWapenId(fruitId) {
        let index = -1;
        for (let i = 0; i < this.fightList.length; i++) {
            if (this.fightList[i].id == fruitId) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            this.fightList.splice(index, 1);
        }

    }

    /**删除一个位置的出战武器通过位置 */
    deleteFightWapenByPosIndex(index) {
        let ind = -1;
        for (let i = 0; i < this.fightList.length; i++) {
            if (this.fightList[i].posIndex == index) {
                ind = i;
                break;
            }
        }
        if (ind >= 0) {
            this.fightList.splice(ind, 1);
        }

    }

    /**通过位置获取上阵武器信息 */
    getFightVoByPosIndex(index): fightWapenVo {
        for (let i = 0; i < this.fightList.length; i++) {
            if (this.fightList[i].posIndex == index) {
                return this.fightList[i];
            }
        }
        return null;
    }
    /**检查武器是否上阵 */
    checkWapenFightById(id): boolean {
        let result = false;
        for (let i = 0; i < this.fightList.length; i++) {
            if (this.fightList[i].id == id) {
                result = true;
                break;
            }
        }
        return result
    }

    /**获取已解锁的武器 */
    getHasWapenAndNoFight(): WapenVo[] {
        let list = [];
        this.hasWapenList.forEach((vo) => {
            let cfg = this.getWapenTableDataById(vo.id);
            if (!this.checkWapenFightById(vo.id) && cfg.wapenType == WapenType.wapen && cfg.open == 1) {
                list.push(vo);
            }
        })
        list.sort((a, b) => {
            // 武器
            // 列表排序调整：已上场的在最前面，已获取的在前面，等级=1的在后面，状态相同时ID小的在前面 
            let aId = a.id;
            let bId = b.id;
            const wapenA = this.getWapenTableDataById(aId);
            const wapenB = this.getWapenTableDataById(bId);
            let sortA = wapenA.sort, stageUnlockA = wapenA.stageUnlock || 0;
            let sortB = wapenB.sort, stageUnlockB = wapenB.stageUnlock || 0;
            if (sortA > sortB) {
                return 1
            } else if (sortA < sortB) {
                return -1
            } else if (sortA == sortB) {
                return stageUnlockA - stageUnlockB;
            }
        })
        return list;
    }



    /**新武器解锁，关卡解锁的 */
    checkNewWapenUnlockByPassLv() {
        let name = ""
        let wapenList: number[] = [];
        ConfigMgr.getInstance().getAll(WapenTableData).forEach((vo) => {
            if (vo.stageUnlock > 0 && vo.open == 1 && vo.stageUnlock < GameUserData.getInstance().lastPassLv && !this.getWapenById(vo.id)) {//默认解锁
                this.addWapenById(vo.id);
                name += vo.name + " ";
                wapenList.push(vo.id);
            }
        })
        if (GameUserData.getInstance().lastPassLv < 3 && name) {//引导会打断，继续飘字
            GameHelp.getInstance().showToast("新解锁装备： " + name);
        }

        if (GameUserData.getInstance().lastPassLv >= 3 && wapenList.length > 0) {
            FormMgr.open(UIConfig.ui_PopWapenLock, { wapenId: wapenList[0] });
        }

    }
    /**得到相应类型的武器数据 */
    getItmeListByType(type?: WapenType): number[] {
        let list = [];
        ConfigMgr.getInstance().getAll(WapenTableData).forEach((vo) => {
            if (vo.open == 1) {
                if (type >= 0) {
                    if (vo.wapenType == type) {
                        list.push(vo.id)
                    }
                } else {
                    list.push(vo.id);
                }

            }
        })

        list.sort((a, b) => {
            // 武器
            // 列表排序调整：已上场的在最前面，已获取的在前面，等级=1的在后面，状态相同时ID小的在前面 
            const wapenA = this.getWapenTableDataById(a);
            const wapenB = this.getWapenTableDataById(b);
            let sortA = wapenA.sort, stageUnlockA = wapenA.stageUnlock || 0;
            let sortB = wapenB.sort, stageUnlockB = wapenB.stageUnlock || 0;
            if (sortA > sortB) {
                return 1
            } else if (sortA < sortB) {
                return -1
            } else if (sortA == sortB) {
                return stageUnlockA - stageUnlockB;
            }
        })



        return list;

    }


    getNoHasWapenList(): number[] {
        let list = [];
        ConfigMgr.getInstance().getAll(WapenTableData).forEach((vo) => {
            if (vo.open == 1 && vo.wapenType == WapenType.wapen && !this.getWapenById(vo.id)) {
                list.push(vo.id)
            }
        })
        list.sort((a, b) => {
            const wapenA = this.getWapenTableDataById(a);
            const wapenB = this.getWapenTableDataById(b);
            let sortA = wapenA.sort, stageUnlockA = wapenA.stageUnlock || 0;
            let sortB = wapenB.sort, stageUnlockB = wapenB.stageUnlock || 0;
            if (sortA > sortB) {
                return 1
            } else if (sortA < sortB) {
                return -1
            } else if (sortA == sortB) {
                return stageUnlockA - stageUnlockB;
            }
        })
        return list;
    }




    /**增加一个拥有装备的等级 */
    addWapenLevelById(WapenId) {
        let WapenVo = this.getWapenById(WapenId);
        if (WapenVo) {
            WapenVo.level++;
        } else {
            console.error("未找到该装备数据")
        }
    }


    initData() {
        // this.addWapenById(301);
        // this.addWapenById(302);
        // this.addWapenById(303);
        ConfigMgr.getInstance().getAll(WapenTableData).forEach((vo) => {
            // if (vo.unlock.length == 0 && vo.open == 1 && vo.stageUnlock == 0 && !this.getWapenById(vo.id)) {//默认解锁
            this.addWapenById(vo.id, true);
            // }
        })


        this.hasWapenList.forEach((vo) => {
            let data = ConfigMgr.getInstance().getById(vo.id, WapenTableData)
            if (vo?.suipianNum > 0) {//新增碎片字段,处理兼容
                UserItemsData.getInstance().pushItem(data.item, vo.suipianNum);
                vo.suipianNum = 0;
            }
        })

        // this.hasWapenList.forEach((vo) => {
        //     if (!vo?.suipianNum) {//新增碎片字段,处理兼容
        //         vo.suipianNum = 0;
        //     }
        // })

        if (this.fightList.length == 0) {
            let cfg = ConfigMgr.getInstance().getById(35, KvData).val.split(",").map((item) => {
                return parseInt(item);
            })

            cfg.forEach((id, index) => {
                this.fightList.push({ posIndex: index, id: id })
            })
        }
        /**老数据兼容,格子数最多等于装备数，上阵格子下掉 */
        if (GameUserData.getInstance().curSlotNum > this.hasWapenList.length) {
            GameUserData.getInstance().curSlotNum = this.hasWapenList.length;
            for (let i = this.fightList.length - 1; i >= 0; i--) {
                if (this.fightList[i].posIndex >= GameUserData.getInstance().curSlotNum - 1) {
                    this.fightList.splice(i, 1);
                }
            }
        }
    }

    /**
    * 增加一名拥有的装备
    * @param id 
    */
    addWapenById(id, isAuto = false) {
        // console.log("增加装备", id)

        let data = this.getWapenTableDataById(id);
        if (!data) {
            return;
        }
        let Wapen = this.getWapenById(id);
        if (Wapen) {
            let isHave = this.fightList.filter(fight => { return fight.id == id }) || [];
            if (!isHave.length)
                this.fightList.push({ id: id, posIndex: 0 })
        } else {
            let Wapen = new WapenVo(id)
            Wapen.isNew = true;
            this.hasWapenList.push(Wapen);
            if (!isAuto && data.wapenType == 0) {//非默认解锁时解锁，自动解锁格子
                if (GameUserData.getInstance().curSlotNum < 8) {
                    GameUserData.getInstance().curSlotNum++;
                    this.addFightWapen(id, GameUserData.getInstance().curSlotNum - 1);
                }
            }
        }
        this.hasWapenList = this.hasWapenList.filter(wapenVo => {
            let dataWapen = ConfigMgr.getInstance().getById(wapenVo.id, WapenTableData);
            return !dataWapen?.stageUnlock || (GameUserData.getInstance().lastPassLv >= dataWapen.stageUnlock)
        })
        // console.log(`增加装备-战斗装备列表:${this.fightList},已经拥有的装备列表:${this.hasWapenList}`);
    }

    getSuiPianItemIdByWapenId(id) {
        let itemId = 0;
        let allCfg = ConfigMgr.getInstance().getAll(ItemBaseData);

        for (let vo of allCfg) {
            if (vo.type == 5 && vo.typeArgs == id) {
                itemId = vo.id;
                break;
            }
        }

        return itemId
    }

    /**
    * 装备数据
    * @param id 装备id
    * @returns 
    */
    getWapenById(id): WapenVo {
        for (let Wapen of this.hasWapenList) {
            if (Wapen.id == id) {
                return Wapen;
            }
        }
        return null;
    }

    addSuiPianById(id, num): void {
        let WapenVo = this.getWapenById(id);
        if (WapenVo) {
            WapenVo.suipianNum += num;
        } else {
            console.error("未找到该装备数据,碎片数量变更失败")
        }

    }

    getSuiPianNumById(id) {
        let num = 0;
        let WapenVo = this.getWapenById(id);
        if (WapenVo) {
            num = WapenVo.suipianNum;
        }
        return num;
    }


    getWapenPowerById(wapenId) {
        let power = 0;
        let WapenVo = this.getWapenById(wapenId);
        if (WapenVo) {
            let wapenTable = this.getWapenTableDataById(wapenId);
            let wapenUp = ConfigMgr.getInstance().getById(WapenVo.level, WapenUpData)
            power = wapenUp["atk" + wapenTable.wapenUp];
        }
        return power;
    }



    /**获取已解锁的装备buff列表 */
    getBuffListByWapenId(WapenId): number[] {
        let list: number[] = [];
        let WapenVo = this.getWapenById(WapenId);
        if (!WapenVo) {
            return list;
        }
        let configVo = this.getWapenTableDataById(WapenId);
        let upData = ConfigMgr.getInstance().getById(configVo.wapenUp, WapenUpData);
        if (!upData?.equipSkillEx) return list;
        upData.equipSkillEx.forEach((buffId) => {
            let exData = ConfigMgr.getInstance().getById(buffId, EquipSkillExData);
            if (WapenVo.level >= exData.lv) {
                list.push(buffId);
            }

        });
        // let unLock = configVo.unlock;
        // for (let i = 0; i < Math.floor(unLock.length / 2); i++) {
        //     let needLevel = unLock[2 * i];
        //     let buffId = unLock[2 * i + 1];
        //     if (WapenVo && WapenVo.level >= needLevel) {
        //         list.push(buffId);
        //     }
        // }
        return list;
    }


    getWapenCurAtkById(WapenId) {
        let power = 0;
        let WapenVo = this.getWapenById(WapenId);
        if (WapenVo) {
            let wapenTable = this.getWapenTableDataById(WapenId);
            let upData = ConfigMgr.getInstance().getById(wapenTable.wapenUp, WapenUpData);
            if (upData) power = (WapenVo.level - 1) * upData.growthAtk + upData.baseAtk;
        }
        return power;
    }

    /**
     * 
     * @param id 装备id
     * @returns 
     */
    public getWapenTableDataById(id: number): WapenTableData {
        return ConfigMgr.getInstance().getById(id, WapenTableData);
    }

    /**-----------------------检查一个装备能不能升级 */
    checkRedDotByWapenId(WapenId): boolean {
        let result = false;
        let vo = this.getWapenById(WapenId);
        let wapenTable = this.getWapenTableDataById(WapenId);
        if (!vo) {//解锁
            if (GameUserData.getInstance().lastPassLv - 1 < wapenTable.stageUnlock) {

                return false;
            }
            if (wapenTable.unlock.length > 0 && UserItemsData.getInstance().getItemNum(wapenTable.unlock[0]) >= wapenTable.unlock[1]) {
                result = true;
            }
        } else {//升级
            result = this.checkUpgradeByWapenId(WapenId);
        }



        return result;
    }

    checkUpgradeByWapenId(wapenId): boolean {
        let result = false;
        let vo = this.getWapenById(wapenId);
        let wapenTable = this.getWapenTableDataById(wapenId);
        if (vo) {
            if (wapenTable.id == 30 || wapenTable.id == 31) return false;
            if (vo.level >= wapenTable.maxLv) {
                return false;
            }
            let cost = this.getUpgredeCostById(wapenId);
            if (UserItemsData.getInstance().getItemNum(wapenTable.item) >= cost.suipianNum && UserItemsData.getInstance().getItemNum(1) >= cost.costNum) {
                result = true;
            }
        }
        return result;
    }

    /**
     * 
     * @param id 
     * @returns  碎片数量，元宝数量
     */
    getUpgredeCostById(id): { suipianNum: number, costNum: number } {
        let result = { suipianNum: 0, costNum: 0 };
        let itemVo = this.getWapenById(id);
        let wapenTable = this.getWapenTableDataById(id);
        if (!itemVo) {//解锁
            console.error("未找到该装备数据");
        } else {//升级
            let wapenUpId = wapenTable.wapenUp;
            let wapenUp = ConfigMgr.getInstance().getById(wapenUpId, WapenUpData);
            let nextLv = itemVo.level;
            let cfg = ConfigMgr.getInstance().getAll(WapenCostData).filter((vo) => {
                return vo.wapenCostId == id && vo.lv == nextLv;
            })

            result.suipianNum = Math.floor((cfg[0]?.cost1 || 0) * wapenUp.cost1);
            result.costNum = Math.floor((cfg[0]?.cost2 || 0) * wapenUp.cost2);
        }
        return result;

    }



    /**检查任意红点，最顶层 */
    checkAllRedDot(type?: WapenType): boolean {
        let result = false;
        let list = this.getItmeListByType(type);
        for (let i = 0; i < list.length; i++) {
            if (type && type != ConfigMgr.getInstance().getById(list[i], WapenTableData).wapenType) {
                continue;
            }
            result = this.checkRedDotByWapenId(list[i]);
            if (result) {
                break;
            }
        }
        return result;
    }

    checkNeedSuiPianById(id): boolean {
        let wapenVo = this.getWapenById(id);
        if (!wapenVo) {
            return false;
        }
        let level = wapenVo?.level || 0;
        let nextWapenUp = ConfigMgr.getInstance().getById(level + 1, WapenUpData);
        if (nextWapenUp) {
            return true;
        } else {
            return false;
        }
    }

}

/**装备数据 */
export class WapenVo {
    /**id */
    id: number = null;
    /**等级 */
    level: number = 1;
    /**是否是新获得 */
    isNew: boolean = false;

    /**碎片 */
    suipianNum: number = 0;

    constructor(Wapenid: number) {
        this.id = Wapenid;
        let data = ConfigMgr.getInstance().getById(Wapenid, WapenTableData);
        if (!data) {
            console.error('Wapenid error:', Wapenid);
            return;
        }
    }

}


