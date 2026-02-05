

import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import GameControl from "../Battle/GameControl";
import PowUpEffectMgr from "../Battle/PowUpEffectMgr";
import ConfigMgr from "../config/ConfigMgr";
import { DrawMainData, DrawSubData, ItemBaseData, KvData, PowUpData, TeamCopyKvData, WapenFusionData, WapenTableData } from "../config/DataDef";
import CharHeroInfo, { TurretInfo } from "../config/DataInfo";
import { GameItemType } from "../config/GameEnum";
import GamePowUpData from "./GamePowUpData";
import GameUserData from "./GameUserData";
import { WapenType } from "./GameWapenData";



export default class GameDrawHelp extends Singleton<GameDrawHelp> {
    protected _hpPer: number = 1;
    protected _foutTurrets: number[] = [];
    protected _foutHeros: CharHeroInfo[] = [];
    //补偿机制 --key-value  id-weight3
    protected _compenSations: Map<number, number> = new Map();
    protected _compenTimes: Map<number, number> = new Map()
    //补偿次数-每个补偿元素只能补偿n次
    protected _compenCanTimes: Map<number, number> = new Map();
    protected CAN_TIMES: number = 3;

    public init() {
        this.unRegiestEvent();
        this.regiestEvent(); // 注册事件
    }

    regiestEvent() {
        // GlobalEventMgr.getInstance().on(GlobalEventID.LOCK_BLOCK_NUMB, this.onLockBlockNum, this);
    }

    unRegiestEvent() {
        // GlobalEventMgr.getInstance().off(GlobalEventID.LOCK_BLOCK_NUMB, this.onLockBlockNum, this);
    }

    public resetHpPer(progress: number) {
        this._hpPer = progress;
    }
    public resetFoutTurrets(foutTurrets: number[]) {
        this._foutTurrets = foutTurrets;
    }
    public resetFoutHeros(foutHeros: CharHeroInfo[]) {
        this._foutHeros = foutHeros;
    }
    public resetCompenSations() {
        this._compenSations.clear();
        this._compenTimes.clear();
        this._compenCanTimes.clear();
        //含有补偿机制的所有元素
        let seedDatas = ConfigMgr.getInstance().filter(DrawSubData, (alue: DrawSubData, index: number, array: DrawSubData[]) => {
            return !!alue.weight3;
        })
        seedDatas.forEach(subData => {
            this._compenSations.set(subData.id, subData.weight3);
            this._compenCanTimes.set(subData.id, this.CAN_TIMES);
        })
    }

    // onLockBlockNum(lockNum: number) {
    //     console.log('锁的格子数', lockNum);
    //     this._lockBlockNum = lockNum;
    // }

    // 根据传入的常量 cId，绘制物品数据
    public drawItemData<T>(cId: number | string, isMain: boolean = false): { rData: T[]; videoList: boolean[]; } {

        // 存储物品的key
        let mkeyList = [];

        if (!isMain) {
            // 获取配置数据
            let vs = ConfigMgr.getInstance().getById(cId, KvData).val.split(',');
            return this.drawItemDataByList<T>(vs);
        }

        if (isMain) {
            mkeyList = [cId];
        }
        return this.drawByMainKeyList<T>(mkeyList);
    }


    public drawItemDataByList<T>(vs: number[] | string[]): { rData: T[]; videoList: boolean[]; } {
        let mkeyList = [];
        // 遍历配置数据
        for (let i = 0; i < vs.length;) {
            // 获取物品key
            let key = Number(vs[i]);
            let count = Number(vs[i + 1]);
            for (let j = 0; j < count; j++) {
                mkeyList.push(key);
            }
            i += 2;
        }
        return this.drawByMainKeyList<T>(mkeyList);
    }


    public drawByMainKeyList<T>(mkeyList: number[]): { rData: T[]; videoList: boolean[]; } {
        // 存储物品数据
        let rData: T[] = [];
        // 存储是否为视频
        let videoList: boolean[] = [];
        // console.log('抽奖主库id:', mkeyList);
        let countData: number[] = [];
        for (let i = 0; i < mkeyList.length; i++) {
            const mkey = mkeyList[i];
            let sData = GameDrawHelp.getInstance().drawMainData(mkey);
            if (!sData) { continue; }
            let ssData = GameDrawHelp.getInstance().drawRandomSubData<T>(sData, rData);
            let subData = ssData.data;
            let isVideo = ssData.isVideo;
            let iData = GameDrawHelp.getInstance().getItemBaseByID(subData.itemId);
            let vData = GameDrawHelp.getInstance().getRealItemData(iData) as T;
            if (vData) {
                if (!countData[iData.id]) countData[iData.id] = 1;
                else countData[iData.id] += 1;
                if (countData[iData.id] == mkeyList.length) {
                    --i;
                } else {
                    rData.push(vData);
                    videoList.push(isVideo);
                }
            } else {
                console.error('not data', subData.itemId);
            }
        }
        // @ts-ignore
        // let isHaveStick = (rData.filter((value) => { value?.data?.wapenType == WapenType.stick; }) || []).length > 0;
        // console.log("广告", videoList);
        return { rData, videoList };
    }

    // 抽奖主数据
    public drawMainData(key: number | string): DrawMainData {
        let allDatas = ConfigMgr.getInstance().getAll(DrawMainData).filter((alue: DrawMainData, index: number, array: DrawMainData[]) => {
            return alue.mainDrawID == key;
        });

        if (allDatas.length == 0) {
            console.error(`not find mainDrawID=${key}`);
            return null;
        }

        let allW = 0;
        let wList = []; // 记录权重
        for (const element of allDatas) {
            let realyW = element.weight;

            //  console.log('锁的格子数', this._lockBlockNum);
            // if (element.value == 1 && this._lockBlockNum <= 0) {
            //     realyW = 0;
            // }
            allW += realyW;
            wList.push(realyW);
        }
        let rand = Math.random() * allW;
        // console.log('主库抽奖', allDatas, rand, wList);
        for (let i = 0; i < wList.length; i++) {
            rand -= wList[i];
            if (rand <= 0) {
                return allDatas[i];
            }
        }
        // for (const element of wList) {
        //     rand -= element.weight;
        //     if (rand <= 0) {
        //         return element;
        //     }
        // }

        return allDatas[0];
    }

    // 获取抽奖子数据
    // 随机一个
    /**
     * 
     * @param mData 
     * @param rData  已经抽取过的数据 保证不重复抽取
     * @returns 
     */
    public drawRandomSubData<T>(mData: DrawMainData, rData: T[]): { 'data': DrawSubData, 'isVideo'?: boolean } {

        let subDatas = ConfigMgr.getInstance().filter(DrawSubData, (alue: DrawSubData, index: number, array: DrawSubData[]) => {
            return alue.subDrawID == mData.subDrawID;
        })

        let stopList = [];
        if (GameControl.getInstance().isTeamBaid()) {//团队副本抽取限制
            stopList = ConfigMgr.getInstance().getById(6, TeamCopyKvData).val.split(",").map(v => {
                return parseInt(v);
            });
            subDatas = subDatas.filter((value) => {
                let itemBase = this.getItemBaseByID(value.itemId);
                let pData = ConfigMgr.getInstance().getById(itemBase.typeArgs, WapenFusionData);
                return stopList.indexOf(pData.typeId) == -1;
            })
        }
        if (subDatas.length == 0) {
            console.error(`on find submain Data，subDrawID=${mData.subDrawID}`);
            return null;
        }

        // console.log('子库数据', mData.id, subDatas);
        console.log('子库数据', subDatas[0].type);

        if (subDatas[0].type == GameItemType.Stick) {
            let isVideo = false;
            let item = this.drawStickData(subDatas, rData);
            if (item.adv == 100) {
                isVideo = true;
            } else if (item.adv <= 0) {
                isVideo = false;
            } else if (Math.random() * 100 < item.adv) {
                isVideo = true;
            }
            console.log('抽取棍子数据', item, isVideo);
            return { 'data': item, 'isVideo': isVideo };
        }
        //强化效果
        else if (subDatas[0].type == GameItemType.Strengthen) {
            let isVideo = false;
            let item = this.drawPowUpData(subDatas, rData);
            if (item.adv == 100) {
                isVideo = true;
            } else if (item.adv <= 0) {
                isVideo = false;
            } else if (Math.random() * 100 < item.adv) {
                isVideo = true;
            }
            return { 'data': item, 'isVideo': isVideo };
        }
        else if (subDatas[0].type == GameItemType.Wapen) {
            return this.drawWapenData(subDatas, rData);
        }

        let allWeight = 0;
        for (const item of subDatas) {
            allWeight += item.weight;
        }

        let rand = Math.random() * allWeight;

        for (const item of subDatas) {
            rand -= item.weight;
            if (rand <= 0) {
                let isVideo = false;
                if (item.adv == 100) {
                    isVideo = true;
                } else if (item.adv <= 0) {
                    isVideo = false;
                } else if (Math.random() * 100 < item.adv) {
                    isVideo = true;
                }
                return { 'data': item, 'isVideo': isVideo };
            }
        }
    }

    // 抽取武器数据
    protected drawWapenData<T>(subData: DrawSubData[], rData: T[]): { 'data': DrawSubData, 'isVideo'?: boolean } {

        let allWeight: number[] = [];
        let wCount = 0;
        let stopList = ConfigMgr.getInstance().getById(6, TeamCopyKvData).val.split(",").map(v => {
            return parseInt(v);
        });

        subData = subData.filter((alue: DrawSubData) => {
            let itemBase = this.getItemBaseByID(alue.itemId);
            let pData = ConfigMgr.getInstance().getById(itemBase.typeArgs, WapenFusionData); //  GameTurretData.getInstance().getVageFasionDataById();
            //装备大类ID，判定是否解锁 -- 未解锁得装备不给抽取
            let wapenData = ConfigMgr.getInstance().getById(pData.typeId, WapenTableData); //  GameTurretData.getInstance().getVageFasionDataById();
            return alue.weight > 0 && (!wapenData?.stageUnlock || GameUserData.getInstance().lastPassLv > wapenData.stageUnlock);
        })

        let randomSort = function (array: DrawSubData[]): DrawSubData[] {
            for (let i = array.length - 1; i > 0; i--) {
                // 生成 [0, i] 之间的随机索引
                const j = Math.floor(Math.random() * (i + 1));
                // 交换元素
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        subData = randomSort(subData);

        for (let i = 0; i < subData.length; i++) {
            const element = subData[i];
            let itemBase = this.getItemBaseByID(element.itemId);
            let pData = ConfigMgr.getInstance().getById(itemBase.typeArgs, WapenFusionData); //  GameTurretData.getInstance().getVageFasionDataById();            
            let w = element.weight;
            // if (pData.attack == 1) {  //  刷新限制
            //GameTurretData.getInstance().getFightTurret(pData.require1)

            for (let ct of element.condition) {
                // 1 = 当HP≤70 %
                // 2=当场上有和所填道具ID对应相同的装备合成等级ID时

                if (ct == 1 && this._hpPer <= 0.7) {
                    w *= (element.weight2 || 1);
                    break;
                }

                if (ct == 2 && this._foutTurrets.indexOf(pData.fusionOutput) > 0) {
                    w *= (element.weight2 || 1);
                    break;
                }
            }
            //如果当前数据有补偿机制元素-添加补偿
            if (this._compenSations.get(element.id)) {
                let isCan = this._compenCanTimes.get(element.id) > 0;
                if (isCan) {
                    let sationWeight = 0;
                    if (GameControl.getInstance().isTeamBaid()) {
                        sationWeight = element.weight5;
                    } else if (GameControl.getInstance().isWorldBossBaid()) {
                        sationWeight = element.weight4;
                    } else {
                        sationWeight = element.weight3;
                    }
                    const nums = this._compenTimes.get(element.id) || 1;
                    w = w + (nums * sationWeight)
                }
                // console.error(`______________补偿机制ID:${element.id},总权重:${w}`);
            }
            // if (!GameControl.getInstance().isFightTurret(pData.typeId)) {
            //     w = 0;
            // }
            //团队副本抽取限制
            if (GameControl.getInstance().isTeamBaid() && stopList.indexOf(pData.typeId) >= 0) {
                w = 0;
            }

            allWeight.push(w);
            wCount += w;
        }


        let rand = Math.random() * wCount;
        // console.log('子库格子抽奖', subData, rand, allWeight);
        for (let i = 0; i < allWeight.length; i++) {
            let item = allWeight[i];
            rand -= item;
            ///测试------先改为type==8的时候
            if (rand <= 0) {
                // console.log(`抽到果蔬格子=${subData[i].itemId}`, i, allWeight);
                let rItem = subData[i];
                //补偿元素没抽到直接补偿次数
                if (!this._compenSations.get(rItem.id)) {
                    this._compenSations.forEach((value, key) => {
                        let times = this._compenTimes.get(key) || 0;
                        this._compenTimes.set(key, ++times);
                    })
                } else {
                    //补偿次数-1
                    let canTimes = this._compenCanTimes.get(rItem.id);
                    this._compenCanTimes.set(rItem.id, --canTimes);
                    //出了补偿元素重置
                    this._compenTimes.set(rItem.id, 0);
                }
                let isVideo = false;
                if (rItem.adv == 100) {
                    isVideo = true;
                } else if (rItem.adv <= 0) {
                    isVideo = false;
                } else if (Math.random() * 100 < rItem.adv) {
                    isVideo = true;
                }
                return { 'data': rItem, 'isVideo': isVideo };
            }
        }
        return null;
    }

    // 抽取强化 数据
    protected drawPowUpData<T>(subData: DrawSubData[], rData: T[]): DrawSubData {

        let allWeight: number[] = [];
        let wCount = 0;
        for (const element of subData) {
            let itemBase = this.getItemBaseByID(element.itemId);
            let pData: PowUpData = GamePowUpData.getInstance().getPowUpDataByID(itemBase.typeArgs);
            let w = element.weight;

            // if (pData.require1.length > 0) {  // 武器依赖
            //     let find = false;
            //     for (const element of pData.require1) {
            //         if (GameControl.getInstance().isFightTurret(element)) {
            //             find = true;
            //             break;
            //         }
            //     }
            //     if (!find) {
            //         w = 0;
            //     }
            // }

            // 果蔬升级依赖
            // if (pData.special > 0 && !GameControl.getInstance().isUseSpecialPowup(pData.id)) {
            //     w = 0;
            // }

            // 果蔬获取依赖
            // if (pData.lvUpWapeon.length > 0 && !GameControl.getInstance().hasFightTurretInList(pData.lvUpWapeon)) {
            //     w = 0;
            // }

            // if (pData.require2.length > 0 && w > 0) {  // 英雄依赖
            //     let find = false;
            //     // if (pData.require2[0] == -1 && GameControl.getInstance().getAllFightHero().length > 0) {
            //     //     find = true;
            //     // } else
            //     {
            //         // for (const element of pData.require2) {
            //         //     if (GameControl.getInstance().isFightHero(element)) {
            //         //         find = true;
            //         //         break;
            //         //     }
            //         // }
            //     }
            //     if (!find) {
            //         w = 0;
            //     }
            // }

            // if (pData.require3.length > 0 && w > 0) {  // 载具依赖
            //     // let find = false;
            //     // for (const element of pData.require3) {
            //     //     if (GameControl.getInstance().isFightHero(element)) {
            //     //         find = true;
            //     //         break;
            //     //     }
            //     // }
            //     // if (!find) {
            //     //     w = 0;    
            //     // }
            // }


            if (pData.require4.length > 0 && w > 0) {  // 强化依赖
                let find = false;
                for (const element of pData.require4) {
                    if (PowUpEffectMgr.getInstance().getDataById(element)) {
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    w = 0;
                }
            }

            //pData.only 
            // 0=无效
            // 1=此强化项同一时间最多出现1个。
            // 2=此强化项同一时间最多出现1个。若此强化项被选择过，之后就不会再出现。
            if (pData.only == 1 && w > 0) {
                for (const element of rData) {
                    let dd = element as PowUpData;
                    if (dd.id == pData.id) {
                        w = 0;
                        break;
                    }
                }
            } else if (pData.only == 2 && w > 0) {
                for (const element of rData) {
                    let dd = element as PowUpData;
                    if (dd.id == pData.id) {
                        w = 0;
                        break;
                    }
                }
                let pd = PowUpEffectMgr.getInstance().getDataById(pData.id);
                if (pd) {
                    w = 0;
                }
            }
            allWeight.push(w);
            wCount += w;
        }
        let rand = Math.random() * wCount;
        for (let i = 0; i < allWeight.length; i++) {
            let item = allWeight[i];
            rand -= item;
            if (rand <= 0) {
                // console.log(`抽到强化数据=${subData[i].itemId}`, i, allWeight);
                return subData[i];
            }
        }
        return null;
    }

    //抽取棍子数据
    protected drawStickData<T>(subData: DrawSubData[], rData: T[]): DrawSubData {
        let allWeight: number[] = [];
        let wCount = 0;

        for (const element of subData) {
            let w = element.weight;
            allWeight.push(w);
            wCount += w;
        }
        let rand = Math.random() * wCount;
        for (let i = 0; i < allWeight.length; i++) {
            let item = allWeight[i];
            rand -= item;
            if (rand <= 0) {
                console.log(`抽到强化数据=${subData[i].itemId}`, i, allWeight);
                return subData[i];
            }
        }
        return null;
    }

    // 获取道具信息
    public getItemBaseByID(itemID: number | string): ItemBaseData {
        return ConfigMgr.getInstance().getById(itemID, ItemBaseData);
    }


    // 获取道具真实数据
    public getRealItemData(itemBase: ItemBaseData): any {

        if (itemBase.type == GameItemType.GameRes) {
        }
        else if (itemBase.type == GameItemType.Wapen) {
            return new TurretInfo(itemBase.typeArgs);  //GameTurretData.getInstance().getVageFasionDataById(itemBase.value1);
        } else if (itemBase.type == GameItemType.Strengthen) {
            return GamePowUpData.getInstance().getPowUpDataByID(itemBase.typeArgs);
        } else if (itemBase.type == GameItemType.Box) {
            // return ConfigMgr.getInstance().getById(itemBase.typeArgs, BattleChestData);
        } else if (itemBase.type == GameItemType.Stick) {
            // return new CharHeroInfo(itemBase.typeArgs);
            //目前还是要添加一个武器，后去再考虑添加hero
            return new TurretInfo(itemBase.typeArgs);
        }
    }


}
