import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import GameControl from "../Battle/GameControl";
import ConfigMgr from "../config/ConfigMgr";
import { ActSkillData, HeroData, KvData, PassiveSkillData, SnowBossData } from "../config/DataDef";
import UIConfig from "../config/UIConfig";
import BattleControl, { GamePassResult } from "./BattleControl";
import GameResLoad from "../Battle/GameResLoad";
import BattleTripodUI from "../Battle/BattleTripodUI";
import { PassInfo, TripodInfo, WaveInfo } from "../config/DataInfo";
import GameHelp from "../Mgr/GameHelp";
import UISceneBattleBase, { GamePassState } from "./UISceneBattleBase";
import SceneBattleWorldBoss_Auto from "../AutoScripts/SceneBattleWorldBoss_Auto";
import GameBattleWBUI from "./GameBattleWBUI";
import BattleCharUI from "../Battle/BattleCharUI";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import { GameBundle } from "../config/GameEnum";
import TurretBaseUI from "../Battle/TurretBaseUI";
import { ItemVo } from "../Data/UserItemsData";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GameResultType } from "./PopGameResult";
import GameMap, { BlockWaveLockInfo, MapExtInfo } from "../Battle/GameMap";

const { ccclass, property } = cc._decorator;


type BSkillData = {
    tm: number,
    skillId: number
}


@ccclass
export default class UISceneBattleWB extends UISceneBattleBase {

    @property(SceneBattleWorldBoss_Auto)  //自动绑定
    auto: SceneBattleWorldBoss_Auto = null;

    protected _gameUI: GameBattleWBUI = null; // 游戏UI

    protected _totalGameTime: number = 360;  // 总时间
    protected _waveTimeList: number[] = []; // 波次时间列表
    protected _totalHurt: number = 0; // 总伤害
    protected _curRevice: number = 0; // 当前抵达数
    protected _curReviceMax: number = 100; // 当前抵达最大数
    protected _curRSIndex: number = 0; // 当前波次索引
    protected _rStepList: number[] = []; // 每波次抵达步数

    protected _bossSillsList: BSkillData[] = []; // 怪物技能列表
    protected _curSkillIndex: number = 0; // 当前技能索引

    protected _summonPosList: cc.Vec3[] = []; // 召唤位置列表


    start() {
        this.debugEvent(); // 调试事件
    }

    public async load(params: any): Promise<string> {

        // GameControl.getInstance().sceneBattle = this; // 设置战斗场景
        // GameControl.getInstance().resetGame(params); // 初始化游戏数据
        // this._passControl = new BattleControl();

        // // let passInfo = new PassInfo(1);
        // this._passControl.init(GameControl.getInstance().getPassInfo()); // 初始化关卡信息


        this._passControl = new BattleControl();
        let passInfo = new PassInfo(params.info.passId);
        // passInfo.maxPassWave = params.info.maxPassWave;

        this._passControl.init(passInfo); // 初始化关卡信息

        await this.setBattleBg(); // 加载战斗背景

        GameControl.getInstance().sceneBattle = this; // 设置战斗场景
        GameControl.getInstance().resetGame(params); // 初始化游戏数据

        // await this.setBattleBg(); // 加载战斗背景

        let cInfo = GameControl.getInstance().getCharInfo();

        await this.addCharHero(cInfo);

        await this.addTripod();
        await this.addCartHpProgress();

        FormMgr.load(UIConfig.ui_game3in1);
        // FormMgr.load(UIConfig.ui_game2in2);


        this._totalGameTime = parseInt(ConfigMgr.getInstance().getById(4, SnowBossData).val); // 总时间
        ConfigMgr.getInstance().getById(5, SnowBossData).val.split(',').forEach((val: string) => {
            this._waveTimeList.push(parseInt(val) * 1000);
        });

        this._summonPosList = [];

        let pvs = ConfigMgr.getInstance().getById(52, SnowBossData).val.split(',');
        for (let i = 0; i < pvs.length;) {
            i += 2;
            if (i >= pvs.length) {
                break;
            }
            this._summonPosList.push(cc.v3(parseInt(pvs[i - 2]), parseInt(pvs[i - 1])));
        }
        CommonUtils.shuffleArr(this._summonPosList);

        this._rStepList = [];
        let rss = ConfigMgr.getInstance().getById(41, SnowBossData).val.split(',');
        for (let i = 0; i < rss.length; i++) {
            this._rStepList.push(parseInt(rss[i]));
        }
        this._curRSIndex = 0;

        let parms: any = {

        };

        this._gameUI = await FormMgr.open(UIConfig.ui_gameBattleWB, parms) as GameBattleWBUI;

        // 修改游戏状态
        this.changeGameStatue(GamePassState.Init);
        return null;
    }

    // 初始化 
    public onInit(params: any): void {
        // console.log('init game', params)
        super.onInit(params);
        this.resetChestStep();

    }

    protected regiesterEvent() {

        super.regiesterEvent();
        // GlobalEventMgr.getInstance().on(GlobalEventID.next_wave_by_clear, this.onMonsterClear, this);
        // GlobalEventMgr.getInstance().on(GlobalEventID.Fight_start, this.onFightStart, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.WorldBoss_hurt, this.refrushBossHurt, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.Post_Slot_Result, this.onSlotResult, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.exit_by_failed, this.onExitFailed, this)

    }

    offRegiesterEvent() {
        super.offRegiesterEvent();
    }

    // 显示回调 
    public onShow(params: any): void {
        super.onShow(params);
        this.schedule(this.checkGameTime, 1);
        this.checkGameTime();

        this.refrushChestView();
    }

    protected checkGameTime() {
        if (this._gameUI) {
            this._gameUI.refrushCDTime(this._totalGameTime, this._passControl.getPassInfo().runTime / 1000);
        }
    }

    // 更新总伤害
    protected refrushBossHurt(hurt: number) {
        this._totalHurt += hurt;
        if (this._gameUI) {
            this._gameUI.refrushBossHurt(Math.floor(this._totalHurt));
        }
    }

    protected override reviceBlockValid(idx: number, actMan: BattleCharUI) {
        super.reviceBlockValid(idx, actMan);
        this._curRevice++;

        if (this._curRevice >= this._curReviceMax) {
            this._curRevice = 0;
            // set new max TODO
            // this._curReviceMax = 100;
            // show chest
            this.resetChestStep();
            this.showWBChest();
        }
        this.refrushChestView();
    }

    protected resetChestStep() {
        if (this._rStepList.length > this._curRSIndex) {
            this._curReviceMax = this._rStepList[this._curRSIndex];
        }
        this._curRSIndex++;
    }

    protected refrushChestView() {
        if (this._gameUI) {
            this._gameUI.refrushChestView(this._curRevice, this._curReviceMax);
        }
    }

    protected showWBChest() {
        return;
        // console.log("show 抽奖");
        let data = this.getWapenList();
        if (data.wapenList.length <= 0) {
            console.log("没有可抽武器");
            return;
        }
        FormMgr.open(UIConfig.ui_PopSlot, data);
    }

    protected getWapenList(): any {
        let wList: number[] = [];
        for (const element of this._gameMap.getAllTurretList()) {
            let tid = element.turretInfo.data.typeId;
            (element.turretInfo.getFusionOutput() > 0) && wList.indexOf(tid) < 0 && wList.push(tid)
        }
        let data = {
            wapenList: wList,
        }
        GlobalEventMgr.getInstance().emit(GlobalEventID.Up_Slot_Wapen, data);
        return data;
    }

    protected onSlotResult(data: any) {
        console.log("抽奖结果", data);
        // let data = { wapenId: slotData.wapenId, luckNum: slotData.luckValue || 1 };
        //this._gameMap.addTurret(data.tid, data.pos);
        // this.refrushChestView();
        let wapenType = data.wapenId;
        let luckNum = data.luckNum;

        let vWapen: TurretBaseUI[] = [];
        for (const element of this._gameMap.getAllTurretList()) {
            if (wapenType == element.turretInfo.data.typeId && element.turretInfo.getFusionOutput() > 0) {
                vWapen.push(element);
            }
        }
        CommonUtils.shuffle(vWapen);
        for (let i = 0; i < luckNum; i++) {
            if (vWapen.length > i) {
                let wapen = vWapen[i];
                wapen.doLevelUp(wapen.turretInfo.getFusionOutput());
            }
        }

        this.scheduleOnce(() => {
            this.getWapenList();
        }, 0.5);
    }



    public onAfterShow(params: any): void {
        // this._passControl.refreshWave(); // 下一个波次
        super.onAfterShow(params);
        this.changeGameStatue(GamePassState.Playing);
        this.showZhengBei(true, false);
    }

    update(dt) {
        super.update(dt);
    }

    protected updateBattlePlaying(dt) {
        super.updateBattlePlaying(dt);
        // this._passControl.doPlaying(dt);
        let wt = this._passControl.getCurWave().waveTimes
        if (this._passControl.getPassInfo().runTime >= this._waveTimeList[wt]) {
            // this._passControl.refreshWave(); // 下一个波次
            this.onMonsterClear(null);
        }
        this.checkBossSkill();
    }


    protected checkBossSkill() {
        if (this._bossSillsList.length <= this._curSkillIndex) {
            return;
        }
        let skill = this._bossSillsList[this._curSkillIndex];
        if (skill.tm <= this._passControl.getCurWave().waveRunTime) {
            this.postBossSkill(skill.skillId);
            this._curSkillIndex++;
        }
    }

    protected postBossSkill(id: number) {
        // let sid = data.sid;
        let ackData = ConfigMgr.getInstance().getById(id, ActSkillData);
        let sid = ackData.shoot;
        let anim = ackData.act;
        let endPos = Utils.getRandomObjOfArray(this._summonPosList)[0];
        let data = {
            anim: anim,
            sid: sid,
            endPos: endPos,
        }
        GlobalEventMgr.getInstance().emit(GlobalEventID.Post_Boss_Skill, data);
    }

    // 怪物清除
    onMonsterClear(data: any) {
        this.showZhengBei(false, false); // 整备界面
    }

    // 整备界面
    public showZhengBei(firist: boolean, relife: boolean) {
        console.log("拉近相机")
        let nextWInfo = this._passControl.enter2Zhengbei();
        if (!nextWInfo) {
            //debugger
            this.showResult(GamePassResult.Win); // 胜利
            return;
        }
        this.resetBossInfo(nextWInfo);
        this.showGameUI(firist, relife);
        // this.changeGameStatue(GamePassState.Zhengbei);
        this._isZhengbei = true;


        // cc.Tween.stopAllByTarget(this.gameCamera.node);

        // let zoom = 1.0; //  mapUIRoot.scale / this._passControl.getGameCart().root.scale;
        // cc.tween(this.gameCamera.node)
        //     .delay(0.1)
        //     .to(0.1, { position: cc.v3(0, -220 / zoom, 0) }).start();
        // cc.tween(this.gameCamera).delay(0.1).to(0.2, { zoomRatio: zoom }).call(() => {
        // }).start();
    }

    protected resetBossInfo(wInfo: WaveInfo) {
        let wid = wInfo.waveTimes + 61;
        this._bossSillsList = [];
        this._curSkillIndex = 0;
        let bskills = ConfigMgr.getInstance().getById(wid, SnowBossData).val.split(',');
        for (let i = 0; i < bskills.length;) {
            let sd: BSkillData = {
                tm: parseInt(bskills[i]) * 1000,
                skillId: parseInt(bskills[i + 1]),
            }
            this._bossSillsList.push(sd);
            i += 2;
        }
    }



    protected checkTripodRemove(): boolean {
        if (this._tripod.isWaitRemove()) {
            this.showResult(GamePassResult.Fail);
            return true;
        }
        return false
    }

    protected onExitFailed() {
        this._passControl.getPassInfo().reliveCount = this._passControl.getPassInfo().maxReliveCount();
        this.showResult(GamePassResult.Fail);
    }

    protected showResult(endType: GamePassResult) {
        // 打印结果
        // console.log("show Result", endType);
        this.changeGameStatue(GamePassState.End)
        // 判断是否胜利
        let isWin = endType == GamePassResult.Win;
        let chestID = 0;
        /**是最新关卡 */

        let bouns: Array<ItemVo> = [];

        let ff = ConfigMgr.getInstance().getById(11, SnowBossData).val.split(',');
        if (isWin) {
            ff.concat(ConfigMgr.getInstance().getById(12, SnowBossData).val.split(','))
            ff.concat(ConfigMgr.getInstance().getById(13, SnowBossData).val.split(','))
            ff.concat(ConfigMgr.getInstance().getById(14, SnowBossData).val.split(','))
            ff.concat(ConfigMgr.getInstance().getById(15, SnowBossData).val.split(','))
            // 下一关
        } else {
            // this._videoWaveList.push(this._videoShowTimes);

            this._passControl.getCurWave().waveTimes >= 1 && ff.concat(ConfigMgr.getInstance().getById(12, SnowBossData).val.split(','))
            this._passControl.getCurWave().waveTimes >= 2 && ff.concat(ConfigMgr.getInstance().getById(13, SnowBossData).val.split(','))
            this._passControl.getCurWave().waveTimes >= 3 && ff.concat(ConfigMgr.getInstance().getById(14, SnowBossData).val.split(','))
        }
        console.log("bouns", bouns);

        for (let i = 0; i < ff.length;) {
            bouns.push(new ItemVo(parseInt(ff[i]), parseInt(ff[i + 1])));
            i += 2;
        }

        // GameUserData.getInstance().setPassAwardRecord(this._passInfo.data.id, this._passInfo.passWaveCount);
        let result: GameResultType = this._passControl.getResultParm(isWin, bouns, chestID);
        result.totalHurt = Math.floor(this._totalHurt);

        let speed = this._passControl.getPassInfo().gameSpeed;
        result.speed = speed || 1;
        GameControl.getInstance().sceneBattle.setGameSpeed(1);
        // 游戏结束
        FormMgr.open(UIConfig.ui_PopGameWBResult, result, { onClose: this.onResultCallback.bind(this) }).then((form) => {
            GlobalEventMgr.getInstance().emit(GlobalEventID.unblock_InputEvents);
        });

        SoundMgr.getInstance().pauseMusic();
        if (isWin) {
            let win = ConfigMgr.getInstance().getById(12, KvData).val;
            SoundMgr.getInstance().playSound(win);
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


    protected doRelife() {
        // this._videoWaveList.pop();
        this.setGameSpeed(GameControl.getInstance().getPassInfo().gameSpeed);
        this.changeGameStatue(GamePassState.Relifing);

        GlobalEventMgr.getInstance().emit(GlobalEventID.game_relife)
        this._passControl.getPassInfo().relife();
        this.relife()
        // this._bCart.relife();

    }

    // onFightGuideFail() {
    //     this._gameMap.hideAllSelectEffect();
    //     // GlobalEventMgr.getInstance().emit(GlobalEventID.hide_block_tips);
    //     console.log("失败回调")
    // }

    // IsGuideIng(): boolean {
    //     let waveId = this._passControl.getPassInfo().getCurWave().length - 1;

    //     if (GameUserData.getInstance().checkNeedFightGuide1(waveId)) {
    //         return true;

    //     }
    //     if (GameUserData.getInstance().checkNeedFightGuide2(waveId)) {
    //         return true;
    //     }
    //     return false
    // }

    getWaveId(): number {
        return this._passControl.getPassInfo().getCurWave().length - 1;
    }

    //波次结束添加铜钱
    // public addWaveEndSilver() {
    //     let varlue = ConfigMgr.getInstance().getById(2, KvData).val;
    //     //console.log("波次添加铜钱", varlue);
    //     //this.onAddSilver(parseInt(varlue), this.node.parent.convertToWorldSpaceAR(this.node.position)); // 添加铜钱
    // }

    protected override onFightStart() {
        if (this._gameMap.getAllTurretList().length == 0) {
            GameHelp.getInstance().showToast('场上没有任何装备');
            return;
        }

        console.log("战斗开始")
        this._isZhengbei = false;
        this.hideGameUI();
        // cc.tween(this.gameCamera.node).to(0.2, { position: cc.v3(0, 0, 0) }).start();
        // cc.tween(this.gameCamera).to(0.2, { zoomRatio: 1 }).call(() => {
        this._passControl.onFightStart();
        cc.tween(this.gameCamera).delay(0.2).call(() => {
            this.changeGameStatue(GamePassState.Playing);
            GlobalEventMgr.getInstance().emit(GlobalEventID.monster_begin); // 发送怪物开始事件
            this.checkShowWaveTips();

        }).start();

        // this._gameMap.onFightStart();

        let wInfo = this._passControl.getCurWave(); //  getPassInfo().getCurWave()[this._passControl.getPassInfo().getCurWave().length - 1]; // 下一个波次
        if (wInfo.weather1 == 2) {
            // this.showRain();
            GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_SHOW_RAIN, { zap: false, t: 10 });
        } else if (wInfo.weather1 == 3) {
            // this.showRain();
            // this.showzap();
            // this._needZap = true;
            GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_SHOW_RAIN, { zap: true, t: 10 });
        } else if (wInfo.weather1 == 4) {
            // this.showSnow();
            GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_SHOW_SNOW)
        }

        if (wInfo.weather1 == 1) {
            // this.showSmoke();
            GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_SHOW_SMOKE, { t: 10 });
        }
    }


    // 波次开始 
    public setTurretEffectAtWave() {

    }

    protected checkShowWaveTips() {

    }

    // 显示游戏UI
    showGameUI(first: boolean, relife: boolean) {

        super.showGameUI(first, relife);
        // console.log("显示游戏UI")
        // // this._gameUI.node.active = true;
        // GameDrawHelp.getInstance().resetHpPer(this._tripod.getShootInfo().hpProgress()); // 重置血条
        // this.resetTurretOutDraw();
        // let wInfo = this._passControl.getPassInfo().getCurWave()[this._passControl.getPassInfo().getCurWave().length - 1]; // 下一个波次
        // this._gameUI.showBlockShop(first, wInfo, relife); // 显示地图

        // // this._gameUI.setWaveTxt(wInfo.waveTimes);

        // this._gameMap.showGameUI();

        // wInfo.mInfos.forEach((mInfo) => {
        //     GameResLoad.loadMonsterPrefab(mInfo.getImgPath());
        // }); // 预加载怪物
        // // this.scheduleOnce(this.checkAddSilverWithTurret, 0.5)
        // // this.hideTianqi();
        // GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_HIDE_ALL);
    }


    // 隐藏游戏UI
    hideGameUI() {
        // this._gameUI.
        // console.log("隐藏游戏UI")
        // this._gameUI.hideBlockShop(); // 显示地图
        // this._gameMap.hideGameUI();
        super.hideGameUI();

        if (this._passControl.getCurWave().waveTimes == 3) {
            this._gameMap.switchMap(); // 切换地图
        }
    }


    // 设置战斗背景
    protected async setBattleBg() {

        let path = `prefabs/${this._passControl.getPassInfo().getBattleMap()}`;// "prefabs/GMap"
        let map = await this.loadRes<cc.Prefab>(path, cc.Prefab, GameBundle.Bundle_GameMap);
        if (!map) {
            console.error("load map error", path);
            return;
        }
        let mapNode = cc.instantiate(map);
        this.bgRoot.addChild(mapNode);
        this._gameMap = mapNode.getComponent(GameMap);

        let vds = ConfigMgr.getInstance().getById(22, SnowBossData).val.split(",");
        const intArray = vds.map(item => parseInt(item));             // 转换为整数


        let waveLock = ConfigMgr.getInstance().getById(21, SnowBossData).val.split(",");
        const intWaveLock = waveLock.map(item => parseInt(item));             // 转换为整数
        let bwlInfos: BlockWaveLockInfo[] = [];
        for (let i = 0; i < intWaveLock.length;) {
            bwlInfos.push({
                wave: intWaveLock[i],
                blockId: intWaveLock[i + 1]
            });
            i += 2;
        }

        let extInfo: MapExtInfo = {
            videoBlocks: intArray,
            waveLocks: bwlInfos
        }
        this._gameMap.doInit(this._passControl.getPassInfo().mapConfig, extInfo);
    }

    // 添加鼎
    protected async addTripod() {
        let path = 'Tripod_WB';
        let res = await GameResLoad.LoadTropidPrefab(path);
        if (!res) {
            cc.error(`error load cart ${path}`)
            return;
        }
        let node = res;
        let tripod = node.getComponent(BattleTripodUI);
        let hero = GameControl.getInstance().getCharHero();
        this._tripod = tripod;
        this._tripod.node.active = true;
        this._tripod.node.opacity = 1;
        // this._gameMap.addTripod(node);
        hero.hitPos.addChild(tripod.node);

        this._passControl.setTripod(tripod);
        let tInfo = new TripodInfo();
        await tripod.init(tInfo);

        // hero.setFightMsg(); // 设置英雄战斗信息
        // this._tripod = hero;
        // this._passControl.setTripod(this._tripod);
    }

    protected async addCartHpProgress() {
        let cp = 'CartHpProgress';
        let hp = await GameResLoad.LoadCartHpPrefab(cp);
        this._gameMap.turntableRoot.addChild(hp);
        hp.setPosition(10, -50);
        GameControl.getInstance().setBaseWpos(this._gameMap.turntableRoot.convertToWorldSpaceAR(cc.v3(0, 0)));
    }

    public onAfterHide(params: any): void {
        super.onAfterHide(params);
    }

    protected onDestroy(): void {
        // console.log("UISceneBattle onDestroy")
        this._gameUI.closeSelf();
        super.onDestroy();
    }

    protected debugEvent() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode == cc.macro.KEY.f7) {
                this.showResult(GamePassResult.Win);
            }
            if (event.keyCode == cc.macro.KEY.f2) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.func_event, { id: 4 });
            }
            if (event.keyCode == cc.macro.KEY.f3) {
                // this._gameUI.lvUPTurret(); // 升级炮台
                // this._passControl.setGameSpeed(2);
                let v4 = ConfigMgr.getInstance().getById(1, KvData).val.split(",");
                let v5 = ConfigMgr.getInstance().getById(2, KvData).val.split(",");
                GameHelp.getInstance().showPop3in1OnebyOne(v4, v5);
            }
        }, this);
    }
}
