import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import ConfigMgr from "../config/ConfigMgr";
import { MapConfigData, RefreshCostData, TeamCopyKvData, WapenFusionData } from "../config/DataDef";
import { TurretInfo } from "../config/DataInfo";
import GameDrawHelp from "../Data/GameDrawHelp";
import GameControl from "./GameControl";
import GameMap from "./GameMap";
import GameResLoad from "./GameResLoad";
import SectorBlockItem from "./SectorBlockItem";
import TurretBaseUI from "./TurretBaseUI";
import TurretMoveUI from "./TurretMoveUI";



export default class TeamerAIMgr extends Singleton<TeamerAIMgr> {

    /**游戏铜钱变化 */
    _gameCoin = 0;
    /**广告券 */
    _ticketAD = 0;
    /**全都要的次数 */
    videoAllWapen = 0;

    /**本轮已使用全都要，不在看广告和铜钱消耗 */
    curVideoAll = false;
    /**本轮武器添加的数量 */
    curAddWapenNum = 0;

    /**刷新次数 */
    refreshTimes = 1;

    initData() {
        this._gameCoin = GameControl.getInstance().getPassInfo().gameCoin;
        let cfg = ConfigMgr.getInstance().getById(7, TeamCopyKvData).val.split(",").map((v) => {
            return parseInt(v);
        })
        this._ticketAD = Random.range(cfg[0], cfg[1]);
        this.videoAllWapen = 0;
        this.curVideoAll = false;
    }
    /**尝试使用全都要 */
    useVideoAll() {
        if (this._ticketAD > 0 && this.videoAllWapen < GameControl.getInstance().getPassInfo().videoAllWapenMax) {
            this.videoAllWapen++;
            this.curVideoAll = true;
            this._ticketAD--;
        }
    }


    addGameCoin(coin: number) {
        this._gameCoin += coin;
        console.warn("队友铜钱变化", this._gameCoin, coin);
    }

    // 创建新炮塔列表
    public async refreshTeamerBlack(mKey?: number[]) {
        let defaultId = GameControl.getInstance().getPassInfo().data.shop1;
        if (!mKey) {
            this.curAddWapenNum = 0;
        }
        mKey = mKey || defaultId;
        this.curVideoAll = false;



        let getVage: TurretInfo[] = [];
        let videoList: boolean[] = [];

        let getData = GameDrawHelp.getInstance().drawItemDataByList<TurretInfo>(mKey) //GameDrawHelp.getInstance().drawItemData<TurretInfo>(mKey);
        getVage = getData.rData;
        videoList = getData.videoList;
        let valueInfoList = [];//得分列表
        let list = []
        for (let i = getVage.length - 1; i >= 0; i--) {//  - 先逐一判断3个商品装备的价值
            let valueInfo = this.checkWapenValue(getVage[i]);
            valueInfoList.push(valueInfo);
            list.push(getVage[i].data.id);
        }
        console.warn(list, "----------------------3商品装备的价值valueInfoList", JSON.stringify(valueInfoList))
        this.dealValueInfo(getVage, videoList, valueInfoList);
    }

    getMaxVauleIndex(list: { value: number, posId: number }[]) {
        let max = 0;
        let index = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].value > max) {
                max = list[i].value;
                index = i;
            }
        }
        return index;
    }


    //GameControl.getInstance().getPassInfo().videoAllWapenMax
    //处理炮台
    async dealValueInfo(getVage: TurretInfo[], videoList: boolean[], valueInfoList: { value: number, posId: number }[]) {
        let index = this.getMaxVauleIndex(valueInfoList);
        if (valueInfoList[index]?.value > 0) {
            if (videoList[index] && !this.curVideoAll) {//需要广告而且本轮不免费,尝试全都要
                this.useVideoAll();
            }
            await this.addWapen2Teamer(getVage[index], videoList[index], valueInfoList[index].posId);
            getVage.splice(index, 1);
            valueInfoList.splice(index, 1);
            videoList.splice(index, 1);
            let list = []
            if (getVage.length > 0) {
                let valueInfoListNew = [];//重新判断价值
                for (let i = getVage.length - 1; i >= 0; i--) {//  - 先逐一判断3个商品装备的价值
                    let valueInfo = this.checkWapenValue(getVage[i]);
                    valueInfoListNew.push(valueInfo);
                    list.push(getVage[i].data.id);
                }
                console.error("商品重新计算价值,", list, valueInfoListNew)
                this.dealValueInfo(getVage, videoList, valueInfoListNew);
                return

            } else {//炮台全部处理完，判断商店刷新逻辑
                this.checkStoreUpdate();
            }

        } else {//判断商店刷新逻辑
            this.checkStoreUpdate();
        }

    }
    //判断商店刷新逻辑
    checkStoreUpdate() {
        let id = Math.min(this.refreshTimes, ConfigMgr.getInstance().getAll(RefreshCostData).length - 1);
        let cost = ConfigMgr.getInstance().getById(id, RefreshCostData).num;
        if (this.curAddWapenNum > 0) {
            if (this._gameCoin - cost > 50) {
                this.refreshTimes++;
                this._gameCoin -= cost;
                console.warn("刷新商店了")
                this.refreshTeamerBlack(GameControl.getInstance().getPassInfo().data.shop2);
                return;
            }

        } else {
            if (this._gameCoin - cost > 20) {
                this.refreshTimes++;
                this._gameCoin -= cost;
                console.warn("刷新商店了")
                this.refreshTeamerBlack(GameControl.getInstance().getPassInfo().data.shop2);
                return;
            }
        }

        let curScene = GameControl.getInstance().sceneBattle;
        let gameMap: GameMap = curScene.gameMap;
        console.warn("队友剩余铜钱:" + this._gameCoin + "，剩余广告券：" + this._ticketAD);
        //退出后，重新组织炮台
        gameMap.organizeTeamerTurret();
    }


    /**尝试加炮台 */
    async addWapen2Teamer(turretInfo: TurretInfo, video: boolean, posId: number) {
        if (this.curVideoAll) {//本轮免费
            await this.wapen2List(turretInfo, posId);
        } else {
            if (video) {//需要看广告
                if (this._ticketAD > 0) {
                    this._ticketAD--
                    await this.wapen2List(turretInfo, posId);
                }
            } else {//不需要广告，要铜钱
                if (this._gameCoin >= turretInfo.getWapenPrice()) {
                    this._gameCoin -= turretInfo.getWapenPrice();
                    await this.wapen2List(turretInfo, posId);
                } else {//铜钱不足
                    this.useVideoAll();//尝试全都要
                    if (this.curVideoAll) {//本轮免费
                        await this.wapen2List(turretInfo, posId);
                    }
                }
            }
        }
    }

    // 加载炮塔资源 并添加到列表
    protected async wapen2List(pInfo: TurretInfo, posId: number) {
        let curScene = GameControl.getInstance().sceneBattle;
        let gameMap: GameMap = curScene.gameMap;
        let block = gameMap.getAllBlocks()[posId];
        //console.error("加载炮塔资源,到底加载了个啥啊:",wapen.data.id,wapen.data.name);
        // await gameMap.wapen2List(wapen, posId);
        let node = await GameResLoad.loadTurretPrefab(pInfo.getTurretPath());
        if (node) {
            let pn = node.getComponent(TurretBaseUI);
            // pInfo.needVideo = videoList[i];
            pn.init(pInfo);
            //棍子信息
            let tm = node.getComponent(TurretMoveUI);
            if (pInfo.data.wapenType == 4)
                tm && (tm.setStickID(pInfo.data.typeId));
            else
                tm && (tm.setStickID(0));

            node.getComponent(TurretBaseUI).onShowSingleIcon();
        }
        else {
            console.log('load turret res failed :', pInfo.getTurretPath());
        }
        // console.error(`_____index:${posId}_______尝试添加队友武器:${pInfo.data.id}`);
        gameMap.checkTurretMoveTeamerAI(block, node);
        return;
    }


    /**计算武器的得分价值
     * value:武器价值得分
     * posId:武器的位置
     */
    checkWapenValue(turretInfo: TurretInfo): { value: number, posId: number } {
        const control = GameControl.getInstance();
        let emptyValue = 0;//空格子价值
        let emptyPosId = -1;//空格子位置

        let conflateValue = 0;//合成价值
        let conflatePosId = -1;//合成位置

        let teamerBlockIdList = control.teamBlocks;//队友格子id列表
        let teamerEmptyBlockIdList = [];//队友的空格子id列表
        let curScene = control.sceneBattle;
        let gameMap: GameMap = curScene.gameMap;
        let id = control.getPassInfo().mapConfig.data.id;
        let mapConfig: MapConfigData = ConfigMgr.getInstance().getById(id, MapConfigData);

        let allBlocks = gameMap.getAllBlocks();
        for (let i = 0; i < mapConfig.block.length; i++) {
            let isOpenTeamBlock = control.teamBlocks.indexOf(i) >= 0;
            if (isOpenTeamBlock && mapConfig.block[i] == 0 && !allBlocks[i].getTurret()) {
                teamerEmptyBlockIdList.push(i);
            }
            // console.log("posId",path[i],"   y:",mapConfig.block[2 * path[i] + 1]);
        }
        let wapenFusion = ConfigMgr.getInstance().getById(turretInfo.data.id, WapenFusionData)
        if (teamerEmptyBlockIdList.length > 0) {//有空格子
            let posList = this.getMostFrequentWithObject(teamerEmptyBlockIdList);
            if (posList.length == 1) {
                emptyPosId = posList[0]
            } else {
                emptyPosId = posList[Random.range(0, posList.length - 1)]
            }
            let X = wapenFusion.aiP3;
            if (teamerBlockIdList.length == teamerEmptyBlockIdList.length) {//全部格子为空，价值计算方式不同
                let C = wapenFusion.aiP4;
                let B = this.getValueCishuByList(emptyPosId, teamerEmptyBlockIdList);
                emptyValue = X * C * B;
            } else {//有炮塔上阵
                let C = wapenFusion.aiP2;
                let list = gameMap.getAllTeamerTurretList();
                let typeId = turretInfo.data.typeId;
                let D = this.getSameWapenTypeBlockNum(typeId, list);

                let E = Math.min(D * C, 1);
                emptyValue = X * (1 - E);
            }

        }

        //计算合成价值
        //升级需要的id
        let needId = turretInfo.getFusionInput();
        //- 当前装备可否继续合成
        if (needId == 0) {//不可以继续合成
        } else {
            let list = gameMap.getTeamerBlocks();
            //需要这个炮台来升级的格子列表
            let needBlockList: SectorBlockItem[] = this.getSameWapenIdList(needId, list);

            if (needBlockList.length > 0) {//-棋盘中至少有1个和当前装备的【装备合成等级ID】相同的装备
                let needPosList = [];//需要的格子位置列表
                needBlockList.forEach((v) => {
                    // needPosList.push(v.posId);
                })
                // let path1 = [];//当前需要这个格子的路径配置
                // for (let i = 0; i < path.length; i++) {
                //     if (needPosList.indexOf(path[i]) != -1) {
                //         path1.push(path[i]);
                //     }
                // }
                // //【path】中出现次数最多的值，若有多个结果，随机取1个
                // let posList1 = this.getMostFrequentWithObject(path1);
                // if (posList1.length == 1) {
                //     conflatePosId = posList1[0];
                // } else {
                conflatePosId = teamerEmptyBlockIdList[Random.range(0, teamerEmptyBlockIdList.length - 1)];
                // }

                let B = this.getValueCishuByList(conflatePosId, teamerBlockIdList);
                let X = wapenFusion.aiP3;
                let C = wapenFusion.aiP1;
                let D = wapenFusion.aiP2;
                // E=棋盘中和当前装备的大类ID相同的装备个数
                let typeId = turretInfo.data.typeId;
                let list = gameMap.getAllTeamerTurretList();
                let E = this.getSameWapenTypeBlockNum(typeId, list);
                // F=D*E。F最大值=1
                let F = Math.min(D * E, 1);
                conflateValue = X * B * C * (1 - F);

            }
        }

        let value = 0;
        let posId = -1;
        if (emptyValue > conflateValue) {
            value = emptyValue;
            posId = emptyPosId;
        } else if (emptyValue < conflateValue) {
            value = conflateValue;
            posId = conflatePosId;
        } else if (emptyValue == conflateValue) {
            if (Math.random() > 0.5) {
                value = emptyValue;
                posId = emptyPosId;
            } else {
                value = conflateValue;
                posId = conflatePosId;
            }


        }
        if (turretInfo.data.typeId == 11) {//定身咒

        }
        // console.warn("合成价值", value, posId);
        return { value: value, posId: posId };

    }
    /**得到棋盘中和当前装备的大类ID相同的装备个数 */
    getSameWapenTypeBlockNum(typeId: number, turretlist: TurretBaseUI[]): number {
        let num = 0;
        turretlist.forEach((turret) => {
            if (turret.turretInfo.data.typeId == typeId) {
                num++;
            }
        })
        return num;
    }
    /**得到某一个相同炮台id的炮台列表 */
    getSameWapenIdList(wapenId: number, blocklist: SectorBlockItem[]): SectorBlockItem[] {
        let list = [];
        blocklist.forEach((turret) => {
            if (turret.getTurret() && turret.getTurret().getComponent(TurretBaseUI).turretInfo.data.id == wapenId) {
                list.push(turret);
            }
        })
        return list;
    }


    /**获取出现频率最高的值 */
    getMostFrequentWithObject(numbers: number[]): number[] {
        if (numbers.length === 0) return [];

        const frequencyObj: { [key: number]: number } = {};

        // 统计频率
        numbers.forEach(num => {
            frequencyObj[num] = (frequencyObj[num] || 0) + 1;
        });

        let maxCount = 0;
        const result: number[] = [];

        // 遍历对象属性
        for (const numStr in frequencyObj) {
            const num = parseInt(numStr);
            const count = frequencyObj[num];

            if (count > maxCount) {
                maxCount = count;
                result.length = 0;
                result.push(num);
            } else if (count === maxCount) {
                result.push(num);
            }
        }

        return result;
    };

    getValueCishuByList(value: number, list: number[]): number {
        let cishu = 0;
        list.forEach((v) => {
            if (v == value) {
                cishu++;
            }
        })
        return cishu;
    }

    // update (dt) {}
}
