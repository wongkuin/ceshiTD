

import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameResLoad from "../Battle/GameResLoad";
import CharHeroInfo, { MonsterInfo, PassInfo, SummonWaveInfo, WaveInfo } from "../config/DataInfo";
import { ETurretDir, GameObjectType, GamePassType, MonsterBrithAlignment, MonsterBrithType, MonsterType } from "../config/GameEnum";

// import PackageNode from "../BattlePackage/PackageNode";
import BattleAckObject from "../Battle/BattleAckObjet";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import UIConfig from "../config/UIConfig";
// import { KvData, } from "../config/DataDef";
import ShootBagUI from "../Battle/ShootBagUI";
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import GameControl from "../Battle/GameControl";
// import { GameResultType } from "./PopGameResult";
import GameUserData from "../Data/GameUserData";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import ConfigMgr from "../config/ConfigMgr";
import PlatformMgr, { PlatformEvent } from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { GameResultType } from "./PopGameResult";
import { ItemVo } from "../Data/UserItemsData";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { KvData, MonsterData } from "../config/DataDef";
import { GamePassState } from "./UISceneBattleBase";
import ApiMgr from "../Mgr/ApiMgr";

const { ccclass, property } = cc._decorator;




export enum GamePassResult {
    None = 'none',
    Win = 'win',
    Fail = 'fail',
    TimeOut = 'timeout',
}


@ccclass
export default class BattleControl {

    protected _passInfo: PassInfo = null;

    protected _monsterList: Array<BattleMonsterUI> = []; // 怪物列表
    protected _endlessMonsters: Array<BattleMonsterUI> = []; // 无尽怪物
    protected _waitMonsterList: Array<MonsterInfo> = []; // 等待创建怪物列表
    protected _monsterToWave: Map<MonsterInfo, WaveInfo> = new Map(); // 注册映射，避免查找失败
    protected _waveSpawnedCounts: Map<number, number> = new Map(); // waveTimes -> spawned count

    protected _tripod: BattleAckObject; // 基座

    // protected _gameSpeed: Array<number> = []; // 游戏速度
    protected _pauseCount = 0; // 暂停次数

    protected _shootBag: ShootBagUI[] = []; // 发射包
    protected _curWave: WaveInfo = null; // 当前波数

    protected _tutoialHeroStep: number = 0;
    protected _tutoialWtime: number = 0;
    protected _waitResult: number = 0;
    // protected _waitRelifing: number = 2;
    protected _isWaitResult: boolean = false;
    protected _waitResultMaxTimer: number = 0; // 最长等待时间保护（毫秒）

    protected _isFight: boolean = true;

    protected timePhaseB2 = 0;
    protected timePhaseA2 = 0; //背包整备界面净耗时

    protected timePhaseB2_ad = 0;
    protected timePhaseA2_ad = 0;

    protected _videoShowTimes: number = 0;
    protected _videoWaveList: number[] = []; // 波次视频

    protected _summonWaves: SummonWaveInfo[] = []; //召唤波数
    protected startCharInfoList: CharHeroInfo[] = [];
    public notMonFiveMinue: number = 0;
    public notMonFiveMinuePassEnd: number = 0;
    public get monsterList() { return this._monsterList; }
    // update (dt) {}
    public init(info: PassInfo) {
        //SceneMgr.getCurrScene()
        this._passInfo = info;
        // this._sceneBattle = battleView;

        // this._runTime = 0;
        // this._runCurWaveTime = 0;

        // 设置游戏速度


        // this._gameSpeed.lastIndexOf
        this.regiestEvent();

    }

    public SetStartCharInfoList() {
        for (let i = 0; i < this._passInfo.stickList.length; i++) {
            if (this._passInfo.stickList[i][0] > 0) {
                let charInfo = new CharHeroInfo(this._passInfo.stickList[i][0], this._passInfo.stickList[i][1]);
                this.startCharInfoList[i] = charInfo;
            }
        }
    }

    protected regiestEvent() {
        PlatformMgr.instance.on(PlatformEvent.VideoShowing, this.onVideoShowing, this);
        PlatformMgr.instance.on(PlatformEvent.VideoShowOver, this.onVideoShowOver, this);
    }

    protected unRegiestEvent() {
        PlatformMgr.instance.off(PlatformEvent.VideoShowing, this.onVideoShowing, this);
        PlatformMgr.instance.off(PlatformEvent.VideoShowOver, this.onVideoShowOver, this);
    }

    public getPassInfo(): PassInfo {
        return this._passInfo;
    }

    public addVideoShowTimes() {
        this._videoShowTimes++;
    }

    public doUpdate(dt: number) {
        // nothing
    }

    public onFightStart(): void {
        if (this._passInfo.data.type == GamePassType.WorldBoss) {
            this.delEndlessMonster(); // 清空无尽怪
        }
        this.notMonFiveMinue = 0;
        this.notMonFiveMinuePassEnd = 0;
    }

    protected nextWave() {
        // this.changeGameStatue(GamePassState.Playing);,
        console.warn("nextWave");
        this._posMap.clear();
        this._fixBrithValue = [0, 0, 0, 0]; // 重置出生点
        for (let i = 0; i < 4; i++) {
            this._posMap.set(i, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }

        let waves = this._passInfo.go2NextWave();
        if (!waves) {
            return null;
        }

        this._curWave = waves[waves.length - 1];
        return this._curWave;
    }

    protected delEndlessMonster() {
        for (let i = this._endlessMonsters.length - 1; i >= 0; i--) {
            let mst = this._endlessMonsters[i];
            mst.delEndlessMonster();
        }
    }

    // 当前
    public getCurWave(): WaveInfo {
        return this._curWave;
    }


    // 车辆被瞄准坐标
    public getCartArmPos(): cc.Vec3 {
        return this._tripod.getAckwPos();
    }

    // public getCartPosY(): number {
    //     // return this._bCart.node.y;
    // }

    // 获取攻击目标
    public getGameTripod(): BattleAckObject {
        return this._tripod;
    }

    // 更新运行状态
    public doPlaying(dt: number) {

        this.updateShootBag(dt);

        let curMst = this._waitMonsterList.length + this._monsterList.length;
        this._passInfo.doUpdate(dt, curMst);
        // this._runCurWaveTime += dt * 1000;
        // this._bCart.doUpdate(dt);
        //this.endCheck(this._runTime);
        // this.waveRefreshCheck();
        // 支持多波次同时刷怪：遍历当前所有活跃波次，收集每个波次的待刷怪物
        const wInfos = this._passInfo.getCurWave() || [];
        for (const wInfoElem of wInfos) {
            const monsters = wInfoElem.needCreateMonster(dt, curMst);
            if (monsters.length > 0) this._waitMonsterList = this._waitMonsterList.concat(monsters);
        }

        for (const element of this._summonWaves) {
            let monsters = element.needCreateMonster(dt, curMst);
            if (monsters.length > 0) this._waitMonsterList = this._waitMonsterList.concat(monsters);
        }

        // 按波次允许情况从等待队列中按波次取怪生成，保证每个波次的生成限制遵守各自的 canAddMonster
        for (const wInfoElem of wInfos) {
            if (this._waitMonsterList.length === 0) break;
            if (!wInfoElem.canAddMonster) continue;
            // 优先选择与该波次匹配的怪物
            const idx = this._waitMonsterList.findIndex(m => m.waveNum == wInfoElem.waveTimes);
            if (idx >= 0) {
                const m = this._waitMonsterList.splice(idx, 1)[0];
                this.addMonster(m).then(() => { });
            } else {
                // 若没有匹配的，作为后备从队头取一个（保持原有行为）
                const m = this._waitMonsterList.shift();
                if (m) this.addMonster(m).then(() => { });
            }
        }

        // 强制刷新：如果场上没有怪物但等待队列还有未生成的怪物，尝试忽略 canAddMonster 限制把它们生成出来，
        // 以避免因 canAddMonster 状态阻塞导致最终生成数低于期望。
        if (this._monsterList.length === 0 && this._waitMonsterList.length > 0) {
            for (const wInfoElem of wInfos) {
                // 当该波次尚未生成完毕时，尽量从等待队列中取出属于该波次的怪物生成
                while (this._waitMonsterList.length > 0 && wInfoElem.curMonsterNum < wInfoElem.getAllMonsterNum()) {
                    const idx = this._waitMonsterList.findIndex(m => m.waveNum == wInfoElem.waveTimes);
                    if (idx < 0) break;
                    const m = this._waitMonsterList.splice(idx, 1)[0];
                    this.addMonster(m).then(() => { });
                }
            }
            // 若仍有等待但没有匹配的波次，作为后备全部生成（保持原有行为）
            while (this._waitMonsterList.length > 0) {
                const m = this._waitMonsterList.shift();
                if (!m) break;
                this.addMonster(m).then(() => { });
            }
        }

        // 更新每个波次的添加开关
        for (const wInfoElem of wInfos) {
            wInfoElem.checkCanAddMons();
        }
        this.checkMonster(dt);
        // console.log('monster', Date.now() - nT);
        this.checkEnd(dt);

        if (this._isFight) {
            this.timePhaseB2 += dt * 1000;
        } else {
            this.timePhaseA2 += dt * 1000;
        }

    }

    // 更新发射包
    protected updateShootBag(dt: number): void {
        let delBag: ShootBagUI[] = [];
        // 更新发射包
        for (const bag of this._shootBag) {
            bag.doUpdate(dt);
            if (bag.isWaitRemove()) {
                delBag.push(bag);
            }
        }
        for (const bag of delBag) {
            let delBag = this._shootBag.splice(this._shootBag.indexOf(bag), 1);
            // delete delBag[0];
        }
    }

    // 更新怪物 数据
    protected checkMonster(dt) {
        let removeMst: BattleMonsterUI[] = [];
        // let liveNum = 0;

        for (const mst of this._monsterList) {
            if (mst.isWaitRemove()) {
                removeMst.push(mst);
            } else {
                mst.doUpdate(dt);
                if (mst.isLiving()) {
                    // liveNum += 1;
                }
            }
        }

        for (const mst of removeMst) {
            const mInfo = mst.getMonsterInfo();
            if (mInfo.hp <= 0 && mInfo.endlessHp == 0) {
                this._passInfo.hpDeath += 1;
            }

            // 优先从映射表查找所属波次，回退到原有查找逻辑
            let wInfo = this._monsterToWave.get(mInfo) || this.getMonsterWave(mInfo);
            if (wInfo) {
                wInfo?.deadMonster();
            } else {
                console.error(`warn: can't find WaveInfo for dead monster waveNum=${mInfo.waveNum}, waveID=${mInfo.waveIDNum}, img=${mInfo.getImgPath()}`);
            }

            // 删除映射表条目
            if (this._monsterToWave.has(mInfo)) this._monsterToWave.delete(mInfo);
            // console.error(`info: removed monster (${mInfo.getImgPath()}) wave=${mInfo.waveNum} id=${mInfo.waveIDNum}`);
            GameResLoad.putNode(this._monsterList.splice(this._monsterList.indexOf(mst), 1)[0].node);
        }

        removeMst = [];

        if (this._passInfo.data.type == GamePassType.WorldBoss) {
            // 世界boss
            for (const mst of this._endlessMonsters) {
                mst.doUpdate(dt);

                if (mst.isWaitRemove()) {
                    removeMst.push(mst);
                }
            }

            for (const mst of removeMst) {
                GameResLoad.putNode(this._endlessMonsters.splice(this._endlessMonsters.indexOf(mst), 1)[0].node);
            }

        } else {
            let hasClean = false;
            // let curWave = this._passInfo.getCurWave();
            let wInfo = this._curWave;//  curWave[curWave.length - 1];

            // //怪物列表打空了就加个兼容
            // if (!hasClean && !this._monsterList.length) {
            //     const notMstTimes = (new Date()).getTime();
            //     if (!this.notMonFiveMinue) {
            //         this.notMonFiveMinue = notMstTimes;
            //     }
            //     else {
            //         if (notMstTimes - this.notMonFiveMinue > 5000) {
            //             this.notMonFiveMinue = 0;
            //             hasClean = true;
            //         }
            //     }
            // } else {
            //     this.notMonFiveMinue = 0;
            // }

            if (wInfo.hasClean() || hasClean) {
                hasClean = true;
                let clearWave = wInfo.waveTimes + 1;
                this._passInfo.setNewPassWave(clearWave);

                this._waveSpawnedCounts.delete(wInfo.waveTimes);
                // 更新当前波次引用为 PassInfo.curWave 的最后一项（不直接修改 PassInfo.curWaveInfos）
                try {
                    const cur = this._passInfo.getCurWave() || [];
                    this._curWave = cur.length > 0 ? cur[cur.length - 1] : null;
                } catch (e) { }
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_wave_parogress, clearWave, 0);
            }

            if (hasClean && this._passInfo.hasNextWave()) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.next_wave_by_clear);
                this._videoWaveList.push(this._videoShowTimes); // 记录下波数
            }
        }
    }



    // 检查游戏结束
    protected checkEnd(dt: number) {
        // if (this._bCart.isWaitRemove()) {
        //     this._sceneBattle.unschedule(this.showResult);
        //     this.showResult(GamePassResult.Fail);
        //     return;
        // }

        if (this._passInfo.data.type == GamePassType.WorldBoss) {
            return;
        }

        let hasClean = true;
        const curWaves = this._passInfo.getCurWave() || [];
        for (const wInfo of curWaves) {
            if (!wInfo.hasClean()) {
                hasClean = false;
                break;
            }
        }

        // //怪物列表打空了就加个兼容
        // if (!hasClean && !this._monsterList.length) {
        //     const notMstTimes = (new Date()).getTime();
        //     if (!this.notMonFiveMinuePassEnd) {
        //         this.notMonFiveMinuePassEnd = notMstTimes;
        //     }
        //     else {
        //         if (notMstTimes - this.notMonFiveMinuePassEnd > 5000) {
        //             this.notMonFiveMinuePassEnd = 0;
        //             hasClean = true;
        //         }
        //     }
        // } else {
        //     this.notMonFiveMinuePassEnd = 0;
        // }

        // 胜利判定：所有当前波次已清，并且没有下一波，且场上/等待队列中没有怪物
        const anyLiveMonsters = this._monsterList.length > 0 || this._endlessMonsters.length > 0;
        const anyWaiting = this._waitMonsterList.length > 0;

        if (!anyLiveMonsters && !anyWaiting && hasClean && !this._passInfo.hasNextWave()) {

            this.showResult(GamePassResult.Win);
            return;
            if (!anyLiveMonsters && !anyWaiting && this._waitResult <= 0) {
                // 进入等待结果状态，阻止输入
                this._waitResult = 0.1; // 减少等待时间到0.1秒
                this._isWaitResult = true;
                this._waitResultMaxTimer = 500; // 最长等待1秒
                GlobalEventMgr.getInstance().emit(GlobalEventID.block_InputEvents);
                // console.log(`info: all waves cleared, preparing to show WIN (wave=${this._passInfo.passWaveCount})`);
                return;
            } else {
                // 仍有残留怪物或等待队列，暂不判胜利
                // console.log(`info: clear pending, live=${this._monsterList.length}, endless=${this._endlessMonsters.length}, wait=${this._waitMonsterList.length}`);
            }
        }

        if (this._isWaitResult) {
            this._waitResult -= dt;
            if (this._waitResultMaxTimer > 0) this._waitResultMaxTimer -= dt * 1000;

            // 优化掉落物检查：即使还有掉落物，也在等待时间结束后显示结果
            // 掉落物可以在结果界面显示时继续处理
            const timeout = this._waitResultMaxTimer <= 0;

            if (this._waitResult <= 0 || timeout) {
                this._isWaitResult = false;
                this._waitResultMaxTimer = 0;
                this.showResult(GamePassResult.Win);
            }
            return;
        }

        //整备 
        if (hasClean && this._passInfo.isNextAreaWave()) {
            // this._enter2NextArea = 3; // 3秒后 下个区域
            // this._bCart.setAnimation(true);
            // GlobalEventMgr.getInstance().emit(GlobalEventID.GameMap_Move, true);
            // if (this._bulletList.length == 0 || this._enter2NextArea <= 0) {
            //     // this.enter2Zhengbei();
            // }
        }
    }


    // 设置鼎
    public setTripod(tripod: BattleAckObject) {
        this._tripod = tripod;
    }


    /// 获取怪物列表
    public getAllLiveMonster(shootObj: BattleAckObject = null): BattleMonsterUI[] {
        let list = [];
        list = this._monsterList.filter((mst) => { return mst.canAck() && mst != shootObj });
        list = list.concat(this._endlessMonsters);
        return list;
    }

    // public getAllLiveMonsterByDir(dir: ETurretDir): BattleMonsterUI[] {
    //     let list = [];

    //     if (dir == ETurretDir.None) {
    //         list = this.getAllLiveMonster().filter((mst) => { return mst.canAck() });
    //     } else {
    //         list = this.getAllLiveMonster().filter((mst) => { return mst.areaDir == dir });
    //     }
    //     return list;
    // }

    // 获取范围内的攻击对象
    public getTargetsInArea(cPos: cc.Vec2, sourceTag: GameObjectType, radius: number, areaDir: ETurretDir): BattleAckObject[] {

        // let ePos = GameControl.getInstance().sceneBattle.gRoot.convertToNodeSpaceAR(cc.v2(cPos.x, cPos.y));
        let list: BattleAckObject[] = [];
        if (sourceTag == GameObjectType.Turret || sourceTag == GameObjectType.Hero) {
            if (areaDir == ETurretDir.None) {
                list = this.getAllLiveMonster().filter((mst) => { return mst.getAckwPos().sub(cc.v3((cPos).x, (cPos).y, 0)).mag() <= radius });
            } else {
                list = this.getAllLiveMonster().filter((mst) => { return mst.areaDir == areaDir && mst.getAckwPos().sub(cc.v3((cPos).x, (cPos).y, 0)).mag() <= radius });
            }
            return list;
        } else if (sourceTag == GameObjectType.Monster_Bullet) {
            // return [this._bCart];
            return [];
        }
    }


    // 添加发射包
    public addShootBag(bag: ShootBagUI) {
        this._shootBag.push(bag);
    }

    // 添加召唤波次
    public addSummonWave(wId: number, wPos: cc.Vec3): void {
        let su = new SummonWaveInfo(wId, wPos);
        su.atkMul = this._curWave.atkMul;
        this._summonWaves.push(su);
    }

    public enter2Zhengbei(first: boolean = false, relife: boolean = false): WaveInfo {
        console.log("enter2Zhengbei")
        let wInfo: WaveInfo = null;
        if (relife) {
            wInfo = this._curWave; // 重新开始
        } else {
            wInfo = this.refreshWave(); // 下一个波次
        }

        // this._sceneBattle.showZhengBei(first, relife);
        // this._bCart.showHpBar(false);
        // if (wInfo && wInfo.haveBoss()) {
        //     this.showBossWillComing(); // 显示boss即将出现
        // }
        // this._gameUI.setWaveTxt(this._passControl.getPassInfo().curWaveInfos.waveTimes);
        this._isFight = false; // 战斗状态
        wInfo && GlobalEventMgr.getInstance().emit(GlobalEventID.game_enter_newwave, wInfo.waveTimes);
        return wInfo;
    }


    /** 刷新每波*/
    public refreshWave(waitTime: number = 0) {

        // 非游戏状态不刷新
        //GameHelp.getInstance().showToast("第" + (currWaveTiemes) + "波开始");
        let cw = this.nextWave();
        return cw;
    }


    /** 添加怪物 */
    public async addMonster(mInfo: MonsterInfo, initPos: cc.Vec3 = null): Promise<BattleMonsterUI> {
        // 尝试加载 prefab，多次重试以降低因 IO 导致的漏刷
        let data = null;
        const maxRetry = 2;
        for (let attempt = 0; attempt <= maxRetry; attempt++) {
            data = await GameResLoad.loadMonsterPrefab(mInfo.getImgPath());
            if (data) break;
            // 简短等待后重试
            await new Promise(resolve => setTimeout(resolve, 120));
        }
        let ret: BattleMonsterUI = null;
        if (data) {
            let monster: BattleMonsterUI = data.getComponent(BattleMonsterUI);
            monster.node.parent = GameControl.getInstance().sceneBattle.gRoot;
            if (!initPos) monster.node.setPosition(this.getMonsterInitPos(mInfo));
            else monster.node.setPosition(initPos);
            monster.init(mInfo);
            ret = monster;
        }

        if (!ret) {
            console.error("error load monster", mInfo.getImgPath(), `waveNum=${mInfo.waveNum}`, `waveID=${mInfo.waveIDNum}`);
            let wInfo = this.getMonsterWave(mInfo)
            if (wInfo) {
                // 若确实无法加载，仍然标记该怪物为已死亡以推进波次，但同时模拟其掉落（防止既计数又无掉落）
                wInfo.deadMonster();
                try {
                    // 模拟铜钱/掉落事件
                    const money = mInfo.getMoney && mInfo.getMoney() || 0;
                    if (money > 0) GlobalEventMgr.getInstance().emit(GlobalEventID.game_addMoney, money, this.getMonsterInitPos(mInfo));
                    const drops = mInfo.getDropItem && mInfo.getDropItem();
                    if (drops && drops.length > 0) GlobalEventMgr.getInstance().emit(GlobalEventID.game_addAward, drops, this.getMonsterInitPos(mInfo));
                } catch (e) { }
            } else {
                console.error(`error: failed to load monster and cannot find its WaveInfo (waveNum=${mInfo.waveNum})`);
            }
            return Promise.resolve(null);
        }

        if (mInfo.getMonsterType() == MonsterType.Boss && this._passInfo.data.type == GamePassType.Normal) {
            // console.error("boss coming");
            GlobalEventMgr.getInstance().emit(GlobalEventID.show_bossComing, true, mInfo);
        }

        let mst = ret;
        if (mst) {
            if (mst.getMonsterInfo().endlessHp == 1) {
                this._endlessMonsters.push(mst);
            } else {
                this._monsterList.push(mst);
            }

            // 注册 MonsterInfo -> WaveInfo 映射，并统计该波次生成数
            // 优先使用 MonsterInfo._originWave（由 WaveInfo.needCreateMonster 标记），以保证跨帧/波次切换后仍能正确归属
            const wInfo = (mInfo as any)._originWave || this.getMonsterWave(mInfo) || this._curWave;
            if (wInfo) {
                this._monsterToWave.set(mInfo, wInfo);
                const prev = this._waveSpawnedCounts.get(wInfo.waveTimes) || 0;
                this._waveSpawnedCounts.set(wInfo.waveTimes, prev + 1);
            } else {
                // console.warn(`warn: addMonster cannot determine wave for monster waveNum=${mInfo.waveNum}`);
            }

            // console.log(`info: spawned monster (${mInfo.getImgPath()}) wave=${mInfo.waveNum} id=${mInfo.waveIDNum}`);
        }
        return Promise.resolve(ret);
    }

    /**
     * 
     * @param mInfo 怪物信息
     */
    protected getMonsterWave(mInfo: MonsterInfo): WaveInfo {
        // 首先通过引用在每个 WaveInfo.mInfos 中查找（最可靠）
        for (const w of this._passInfo.curWaveInfos) {
            if (w.mInfos && w.mInfos.indexOf(mInfo) >= 0) return w;
        }

        // 兼容性回退：若引用匹配失败，再尝试按波次号匹配（历史原因，可能不总是可靠）
        for (const w of this._passInfo.curWaveInfos) {
            if (typeof mInfo.waveNum === 'number' && mInfo.waveNum === w.waveTimes) return w;
        }

        return null;
    }

    public getStartCharInfoList(): CharHeroInfo[] {
        return this.startCharInfoList;
    }

    /**
     * 显示游戏结算
     * @param endType 游戏结束类型
     */
    // 显示结果
    public showResult(endType: GamePassResult) {
        // 打印结果
        // console.log("show Result", endType);
        // 设置游戏状态为结束
        // this._state = GamePassState.End;
        GameControl.getInstance().sceneBattle.changeGameStatue(GamePassState.End)
        // 判断是否胜利
        let isWin = endType == GamePassResult.Win;
        let chestID = 0;
        /**是最新关卡 */

        // if (isWin) {
        //     let itemID = Utils.getDataList(this._passInfo.data.bouns1[0], this._passInfo.data.bouns1[1])[0].itemID;
        //     let iData = GameDrawHelp.getInstance().getItemBaseByID(itemID);
        //     let cData = GameDrawHelp.getInstance().getRealItemData(iData) as BattleChestData;
        //     chestID = cData.id;
        // }
        let bouns: Array<ItemVo> = [];

        let A = this._passInfo.data.item1;
        let B = this._passInfo.data.bouns1;
        let C = this._passInfo.passWaveCount; // 当前波数
        let D = this._passInfo.data.waves.length;

        let A1 = this._passInfo.data.item2;
        let B1 = this._passInfo.data.bouns2;
        let item1 = new ItemVo(1, A * B * C / D);
        let item2 = new ItemVo(2, A1 * B1 * C / D);


        // bouns.push(new ItemVo(1, A * B * C / D));
        // bouns.push(new ItemVo(2, A1 * B1 * C / D));
        GameControl.getInstance().getPassInfo().pushDropAwardList(item1);
        GameControl.getInstance().getPassInfo().pushDropAwardList(item2);
        let yuanbaoNum = GameControl.getInstance().getPassInfo().getYuanBaoDropNum()[0];
        GameControl.getInstance().getPassInfo().pushDropAwardList(new ItemVo(1, yuanbaoNum));
        bouns = GameControl.getInstance().getPassInfo().getDropAwardList();


        if (isWin) {
            // 下一关
            let st = (this._passInfo.data.id == GameUserData.getInstance().lastPassLv && GameUserData.getInstance().getPassAwardById(this._passInfo.data.id)?.boCi < this._passInfo.data.waves.length);
            let nextID = this._passInfo.data.id + 1; //this._passInfo.data.nextLv
            GameUserData.getInstance().setNewPass(nextID); // 新关卡
            if (st) {
                for (let i = 0; i < this._passInfo.data.fristBouns.length; i = i + 2) {
                    bouns.push(new ItemVo(this._passInfo.data.fristBouns[i], this._passInfo.data.fristBouns[i + 1], true));
                }
            }
        } else {
            this._videoWaveList.push(this._videoShowTimes);
        }
        console.log("bouns", bouns);

        GameUserData.getInstance().setPassAwardRecord(this._passInfo.data.id, this._passInfo.passWaveCount);
        let result: GameResultType = this.getResultParm(isWin, bouns, chestID);
        let speed = this.getPassInfo().gameSpeed;
        result.speed = speed || 1;
        GameControl.getInstance().sceneBattle.setGameSpeed(1);
        // 游戏结束
        FormMgr.open(UIConfig.ui_gameOver, result, { quick: true, onClose: this.onResultCallback.bind(this) }).then((form) => {
            GlobalEventMgr.getInstance().emit(GlobalEventID.unblock_InputEvents);
        });
        SoundMgr.getInstance().pauseMusic();
        if (isWin) {
            let win = ConfigMgr.getInstance().getById(12, KvData).val;
            SoundMgr.getInstance().playSound(win);
            // if (GameControl.getInstance().hasFinishTutorialHero()) {
            //     // GameTutoialData.getInstance().hasFightHero = true;
            // }
        } else {
            // SoundMgr.getInstance().playSoundByID(27);
        }
    }

    private onResultCallback(data: any) {
        // console.log("onResultCallback", this);// 关闭游戏
        if (data && data.r) {
            this.doRelife();
        }
    }

    public getResultParm(isWin: boolean = false, bouns: ItemVo[] = [], chestID: number = 0) {
        let isNewLevel = (this._passInfo.data.id == (GameUserData.getInstance().lastPassLv - 1)) ? true : false;
        let result: GameResultType = {
            isWin: isWin,   //是否胜利
            chestID: 0,  //宝箱ID
            relifeCount: this._passInfo.reliveCount, //复活次数
            relifeMaxCount: this._passInfo.maxReliveCount(), //最大复活次数
            bouns: bouns, //奖励  [id:count ...
            isNewLv: isNewLevel,//是否是最新关卡
            maxWave: this._passInfo.getCurWave()?.length || 0,
            passWave: this._passInfo.passWaveCount,
            passId: this._passInfo.data.id,
            videoWave: this._videoWaveList,
        }
        return result;
    }


    protected doRelife() {

        this._videoWaveList.pop();
        GameControl.getInstance().sceneBattle.setGameSpeed(this._passInfo.gameSpeed);
        GameControl.getInstance().sceneBattle.changeGameStatue(GamePassState.Relifing);

        GlobalEventMgr.getInstance().emit(GlobalEventID.game_relife)
        this._passInfo.relife();
        GameControl.getInstance().sceneBattle.relife()
        // this._bCart.relife();

    }


    public clean(): void {
        GameControl.getInstance().sceneBattle.setGameSpeed(1); // 清理数据
        this.unRegiestEvent();
    }

    videoStartTime: number = 0;
    protected onVideoShowing() {
        this.videoStartTime = Date.now();
    }

    protected onVideoShowOver() {
        let spTime = Date.now() - this.videoStartTime;
        if (this._isFight) {
            this.timePhaseB2_ad += spTime
        } else {
            this.timePhaseA2_ad += spTime;
        }
    }

    /**
     * 获取怪物出生位置
     * @param birthPos 出生位置 0=上 1=左 2=右 3=下
     * @param birthAlignment  出生对齐   // 0=靠近中间 1=靠近左侧（从车到线做垂直线，逆时针方向为左）2=靠近右侧
     * @returns 
     */
    protected getMonsterInitPos(mInfo: MonsterInfo): cc.Vec3 {

        let birthPos = mInfo.birthPos
        let birthAlignment = mInfo.birthAlignment
        // if (birthPos > 10000) {
        //     mInfo.setMovePath(birthPos);
        //     return mInfo.mPath.getBrithPos();
        // }
        let rPos = cc.v3(0, 0);
        let val = CommonUtils.randomIntClosedRange(mInfo.data.distanceM, mInfo.data.distanceH);
        switch (birthPos) {
            /**改成0-4 四个区间 */
            case MonsterBrithType.Loc0:
            case MonsterBrithType.Loc1:
            case MonsterBrithType.Loc2:
            case MonsterBrithType.Loc3:
                rPos = this.getMonsterBirthPos(birthPos, birthAlignment, cc.v3(0, val)); break;
            case MonsterBrithType.RealyPos:
                rPos = cc.v3(0, 0); break;
            case MonsterBrithType.CriticPos:
            case MonsterBrithType.CriticRound:
            case MonsterBrithType.Loc9:
                birthPos = MonsterBrithType.Loc0;
                const width = cc.winSize.width;
                const height = cc.winSize.height;
                rPos = cc.v3(-width / 2 + Math.random() * width, height / 2 + Math.random() * 70);
                break;
            default:
                break;
        }
        // switch (birthPos) {
        //     case MonsterBrithType.Top:
        //         rPos = this.getMonsterBirthPos(birthPos, birthAlignment, cc.v3(0, val));
        //         break;
        //     case MonsterBrithType.Left:
        //         rPos = this.getMonsterBirthPos(birthPos, birthAlignment, cc.v3(-val, 300));
        //         break;
        //     case MonsterBrithType.Right:
        //         rPos = this.getMonsterBirthPos(birthPos, birthAlignment, cc.v3(val, 300));
        //         break;
        //     case MonsterBrithType.Bottom:
        //         rPos = this.getMonsterBirthPos(birthPos, birthAlignment, cc.v3(0, -val));
        //         break;
        //     case MonsterBrithType.RealyPos:
        //         rPos = mInfo.getStartPos();
        //         break;
        //     case MonsterBrithType.CriticPos:
        //         let fx = mInfo.birthAlignment * Math.random() * 2 - 1;
        //         let fy = mInfo.birthAlignment * Math.random() * 2 - 1;
        //         let newPos = GameControl.getInstance().sceneBattle.gRoot.convertToNodeSpaceAR(mInfo.basePos)
        //         rPos = newPos.add(cc.v3(fx, fy));
        //         break;
        //     case MonsterBrithType.CriticRound:
        //         let startAngle = 0;
        //         let endAngle = 90;
        //         let getPos = Utils.generateUniformPointInRing(mInfo.data.distanceM, mInfo.data.distanceH, startAngle, endAngle);
        //         getPos.x *= Math.random() > 0.5 ? 1 : -1;
        //         getPos.y *= Math.random() > 0.5 ? 1 : -1;
        //         rPos = cc.v3(getPos.x, getPos.y);
        //         // console.log("召唤兽生成位置", getPos.x, getPos.y);
        //         break;
        //     default:
        //         break;
        // }
        return rPos;
        // let x = 0;
        // let y = 0;
        // // ---------
        // y = 560;
        // x = (Math.random() - 0.5) * 750;
        // console.log("getMonsterInitPos", x, y);
        // return cc.v3(x, y);
    }


    protected _posMap: Map<number, number[]> = new Map<number, number[]>();
    protected _fixBrithValue: number[] = [0, 0, 0, 0];
    protected getMonsterBirthPos(birthPos: MonsterBrithType, birthAlignment: MonsterBrithAlignment, CenterPos: cc.Vec3): cc.Vec3 {
        //80 , 9
        let curLine = this._posMap.get(birthPos);
        let cIdx = Math.floor(curLine.length / 2);

        let getIdx = -1;
        switch (birthAlignment) {
            case MonsterBrithAlignment.Left:
                for (let i = 0; i < curLine.length; i++) {
                    if (curLine[i] == 0) {
                        getIdx = i;
                        curLine[i] = 1;
                        break;
                    }
                }
                break;
            case MonsterBrithAlignment.Right:
                for (let i = curLine.length - 1; i >= 0; i--) {
                    if (curLine[i] == 0) {
                        getIdx = i;
                        curLine[i] = 1;
                        break;
                    }
                }
                break;
            case MonsterBrithAlignment.Random:
                getIdx = Math.floor(Math.random() * curLine.length);
                break;
            case MonsterBrithAlignment.Center:
                let max = Math.max(cIdx, curLine.length - cIdx); // 最大的距离
                for (let i = 0; i < max; i++) {
                    let idx = cIdx - i;
                    if (idx >= 0 && idx < curLine.length) {
                        if (curLine[idx] == 0) {
                            getIdx = idx;
                            curLine[idx] = 1;
                            break;
                        }
                    }
                    idx = cIdx + i;
                    if (idx >= 0 && idx < curLine.length) {
                        if (curLine[idx] == 0) {
                            getIdx = idx;
                            curLine[idx] = 1;
                            break;
                        }
                    }
                }
                break;
            case MonsterBrithAlignment.Loc9:
                return cc.v3(
                    (Math.random() - 0.5) * cc.winSize.width,
                    CenterPos.y + this._fixBrithValue[birthPos]
                );
        }

        // if (getIdx == -1) {
        //     // curLine = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        //     this._posMap.set(birthPos, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
        //     let spValue = 30;
        //     if (birthPos == MonsterBrithType.Loc3) {
        //         spValue = -30;
        //     } else if (birthPos == MonsterBrithType.Loc1) {
        //         spValue = -30;
        //     }
        //     spValue = 0;
        //     this._fixBrithValue[birthPos] += spValue;
        //     return this.getMonsterBirthPos(birthPos, birthAlignment, CenterPos);
        // }

        let offset = 0, singleWidth = cc.winSize.width / 4;
        switch (birthPos) {
            case MonsterBrithType.Loc0: offset = 0; break;
            case MonsterBrithType.Loc1: offset = 1; break;
            case MonsterBrithType.Loc2: offset = 2; break;
            case MonsterBrithType.Loc3: offset = 3; break;
        }
        const rangeWidth = singleWidth * offset + Math.random() * singleWidth;
        if (birthPos == MonsterBrithType.Loc3 || birthPos == MonsterBrithType.Loc0) {
            return cc.v3(rangeWidth, CenterPos.y + this._fixBrithValue[birthPos]);
        }
        else if (birthPos == MonsterBrithType.Loc1 || birthPos == MonsterBrithType.Loc2) {
            return cc.v3(rangeWidth, CenterPos.y + (getIdx - cIdx) * 80);
        }

    }
}