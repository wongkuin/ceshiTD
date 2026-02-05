import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import GameControl from "../Battle/GameControl";
import ConfigMgr from "../config/ConfigMgr";
import { KvData, PassiveSkillData, TeamCopyDailyData, TeamCopyKvData } from "../config/DataDef";
import UIConfig from "../config/UIConfig";
import GameBattleTeamUI from "./GameBattleTeamUI";
import BattleControl, { GamePassResult } from "./BattleControl";
import GameResLoad from "../Battle/GameResLoad";
import BattleTripodUI from "../Battle/BattleTripodUI";
import CharHeroInfo, { PassInfo, TripodInfo, TurretInfo } from "../config/DataInfo";
import GameHelp from "../Mgr/GameHelp";
import UISceneBattle_Auto from "../AutoScripts/UISceneBattle_Auto";
import GameDrawHelp from "../Data/GameDrawHelp";
import GameUserData from "../Data/GameUserData";
import BattleGuideLayer from "../Guide/BattleGuideLayer";
import WapenItemUI from "../Battle/WapenItemUI";
import UISceneBattleBase, { GamePassState } from "./UISceneBattleBase";
import GameBattleTeamUI_Auto from "../AutoScripts/GameBattleTeamUI_Auto";
import UISceneBattleTeam_Auto from "../AutoScripts/UISceneBattleTeam_Auto";
import BattleCharUI from "../Battle/BattleCharUI";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import { GameBundle } from "../config/GameEnum";
import TeamerAIMgr from "../Battle/TeamerAIMgr";
import TurretBaseUI from "../Battle/TurretBaseUI";
import TurretMoveUI from "../Battle/TurretMoveUI";
import GameMap from "../Battle/GameMap";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UISceneBattleTeam extends UISceneBattleBase {

    @property(UISceneBattleTeam_Auto)  //自动绑定
    auto: UISceneBattleTeam_Auto = null;

    screenName: string = "TeamBattle";

    _guideIndex = 1;//引导步骤

    protected _myTotalHurt: number = 0; // 自己总伤害
    protected _teamerTotalHurt: number = 0; // 队友总伤害

    protected _myReadyState: boolean = false; // 自己准备状态确定
    protected _teamerReadyState: boolean = false; // 队友准备状态

    _gameUI: GameBattleTeamUI = null;

    _dt: number = 0;
    _readyDjs: number = 30;
    start() {
        this.debugEvent(); // 调试事件
    }

    getMyTotalHurt() {
        return this._myTotalHurt;
    }

    public async load(params: any): Promise<string> {

        this._passControl = new BattleControl();
        let passInfo = new PassInfo(params.info.passId);
        passInfo.maxPassWave = params.info.maxPassWave;
        this._passControl.init(passInfo); // 初始化关卡信息

        await this.setBattleBg(); // 加载战斗背景

        GameControl.getInstance().sceneBattle = this; // 设置战斗场景
        GameControl.getInstance().resetGame(params); // 初始化游戏数据

        await this.addTripod();
        await this.addCartHpProgress();

        let cInfo = GameControl.getInstance().getCharInfo();
        // let charInfo = new CharHeroInfo(params.info.teamerId);
        //   charInfo.maxLiveTime = liveTime;
        // await this.addTeamCharHero(charInfo);

        await this.addCharHero(new CharHeroInfo(cInfo.getID()));
        await this.addCharHero(new CharHeroInfo(cInfo.getID()), 2, true);

        FormMgr.load(UIConfig.ui_game3in1);
        // FormMgr.load(UIConfig.ui_game2in2);

        this._gameUI = await FormMgr.open(UIConfig.ui_gameBattleTeam) as GameBattleTeamUI;

        // 修改游戏状态
        this.changeGameStatue(GamePassState.Init);
        this.setGameSpeed(GameControl.getInstance()._addSpeed);
        TeamerAIMgr.getInstance().initData();
        GameControl.getInstance().zoomScale = 0.85;
        // GameControl.getInstance().getCharHero().setGuangTy();
        return null;
    }

    // 设置战斗背景
    protected override async setBattleBg() {

        let path = `prefabs/${this._passControl.getPassInfo().getBattleMap()}`;// "prefabs/GMap"
        let map = await this.loadRes<cc.Prefab>(path, cc.Prefab, GameBundle.Bundle_GameMap);
        if (!map) {
            console.error("load map error", path);
            return;
        }
        let mapNode = cc.instantiate(map);
        this.bgRoot.addChild(mapNode);
        this._gameMap = mapNode.getComponent(GameMap);

        let day = new Date().getDate();
        let wavePath = ConfigMgr.getInstance().getById(day, TeamCopyDailyData).wavePath.split(",").map((item) => {
            return parseInt(item);
        });
        console.error("wavePath", wavePath);
        this._passControl.getPassInfo().mapConfig.resetMapInfo(wavePath[1]);
        this._gameMap.doInit(this._passControl.getPassInfo().mapConfig);
    }

    protected async addCartHpProgress() {
        let cp = 'CartHpProgress';
        let hp = await GameResLoad.LoadCartHpPrefab(cp);
        this._gameMap.turntableRoot.addChild(hp);
        hp.setPosition(10, -50);
        GameControl.getInstance().setBaseWpos(this._gameMap.turntableRoot.convertToWorldSpaceAR(cc.v3(0, 0)));
    }


    // 添加团队英雄
    protected async addTeamCharHero(cInfo: CharHeroInfo) {

        let cartPath = cInfo.getPrefabName();
        let res = await GameResLoad.LoadCharPrefab(cartPath);
        if (!res) {
            cc.error(`error load cart ${cartPath}`)
            return;
        }
        let cNode = res;
        let char = cNode.getComponent(BattleCharUI);

        let idx = 0;
        let reverse = true;

        if (cInfo.maxLiveTime > 0) {
            // 随机生成一个位置
            let realPath = this._passControl.getPassInfo().mapConfig.realPath;
            let maked: number[] = [];
            for (const element of this._charList) {
                maked.push(element.getCurPathIdx());
            }
            idx = Math.floor(Math.random() * realPath.length);
            while (maked.indexOf(idx) != -1) {
                idx = Math.floor(Math.random() * realPath.length);
            }
        }
        this.addChar2Map(char);
        await char.initChar(cInfo, idx, reverse);
        GameControl.getInstance().setCharHeroTeamer(char);
        // await this.initTurret();
        // GameResLoad.loadTurretPrefab()
    }

    // 初始化 
    public onInit(params: any): void {
        // console.log('init game', params)
        super.onInit(params);
    }

    protected regiesterEvent() {

        super.regiesterEvent();


        GlobalEventMgr.getInstance().on(GlobalEventID.next_wave_by_clear, this.onMonsterClear, this);

        // GlobalEventMgr.getInstance().on(GlobalEventID.Fight_start, this.onFightStart, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.fightGuideFail, this.onFightGuideFail, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.myself_hurt, this.onMyselfHurt, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.teamer_hurt, this.onTeamerHurt, this);
    }

    offRegiesterEvent() {
        super.offRegiesterEvent();
    }

    // 显示回调 
    public onShow(params: any): void {
        super.onShow(params);
    }

    public onAfterShow(params: any): void {
        // this._passControl.refreshWave(); // 下一个波次
        super.onAfterShow(params);
        this.changeGameStatue(GamePassState.Playing);
        this.showZhengBei(true, false);
    }

    update(dt) {
        super.update(dt);
        this._dt += dt;
        if (this._dt > 0.5) {
            this._dt = 0;
            this.refreshHurtUI();
        }
    }


    // 怪物清除
    onMonsterClear(data: any) {
        this.showZhengBei(false, false); // 整备界面
    }
    setTeamerReadyDJS() {
        this.unschedule(this.scheduleTeamerReady);
        let list = ConfigMgr.getInstance().getById(5, TeamCopyKvData).val.split(",").map((v) => {
            return parseInt(v);
        })
        let djs = Random.range(list[0], list[1]);
        this.scheduleOnce(this.scheduleTeamerReady, djs * this._passControl.getPassInfo().gameSpeed);
    }

    scheduleTeamerReady() {
        this._teamerReadyState = true;
        console.error("队友准备");
        this.setIsZhengbei();
        if (!this._isZhengbei) {
            this.onFightStart();
        }
    }
    setReadyDJS() {
        this._readyDjs = parseInt(ConfigMgr.getInstance().getById(3, TeamCopyKvData).val);
        this._gameUI.setReadyBtnState(this._myReadyState);
        this.unschedule(this.onShowReadyDJS)
        this.schedule(this.onShowReadyDJS, this._passControl.getPassInfo().gameSpeed);
        this.onShowReadyDJS();
    }
    onShowReadyDJS() {
        this._readyDjs--;

        this._gameUI.showReadyDJS(this._readyDjs);
        if (this._readyDjs <= 0) {
            this._myReadyState = true;
            this.setIsZhengbei();
            this.onFightStart();
            this.unschedule(this.onShowReadyDJS);

        }
    }



    async checkAddBlacks() {
        let day = new Date().getDate();
        let wavePath = ConfigMgr.getInstance().getById(day, TeamCopyDailyData).wavePath.split(",").map((item) => {
            return parseInt(item);
        });

        let wave = this.getWaveId();

        for (let i = 0; i < wavePath.length; i = i + 2) {
            if ((wavePath[i] - 1) == wave) {
                this._passControl.getPassInfo().mapConfig.resetMapInfo(wavePath[i + 1]);
                await this._gameMap.resetMap(this._passControl.getPassInfo().mapConfig);
            }
        }

    }

    // 整备界面
    public async showZhengBei(firist: boolean, relife: boolean) {
        console.log("拉近相机")
        // cc.game.setFrameRate(20)
        this._passControl.enter2Zhengbei();
        console.warn("显示商店")
        this.showGameUI(firist, relife);
        this.initReadyState();
        if (!firist) {
            await this.checkAddBlacks();
        }

        await TeamerAIMgr.getInstance().refreshTeamerBlack();
        // this.changeGameStatue(GamePassState.Zhengbei);
        this._isZhengbei = true;

        this.setTeamerReadyDJS();
        this.setReadyDJS();
        cc.Tween.stopAllByTarget(this.gameCamera.node);

        let zoom = 1; //  mapUIRoot.scale / this._passControl.getGameCart().root.scale;
        cc.tween(this.gameCamera.node)
            .delay(0.1)
            .to(0.2, { position: cc.v3(0, -430 / zoom, 0) }).start();


        const _this = this;
        cc.tween(this.gameCamera).delay(0.1).to(0.1, { zoomRatio: zoom }).call(() => {
            _this.charList.forEach(char => {
                if (char.charInfo.teamID > 0) {
                    char.node.active = !firist;
                }
            })
        }).start();
    }

    initReadyState() {
        this._myReadyState = false;
        this._teamerReadyState = false;
        this._gameUI.hideTeamerReady();
        this._gameUI.hideMyselfReady();
        this._gameUI.setShopMainMaskState(false)
    }

    checkReadyState() {
        return this._myReadyState && this._teamerReadyState;
    }

    setIsZhengbei() {
        this._isZhengbei = !this.checkReadyState();
        if (this._teamerReadyState) {
            this._gameUI.showTeamerReady();
        }
        if (this._myReadyState) {
            this._gameUI.showMyselfReady();
        }

    }


    onFightGuideFail() {
        this._gameMap.hideAllSelectEffect();
        // GlobalEventMgr.getInstance().emit(GlobalEventID.hide_block_tips);
        console.log("失败回调")
    }

    IsGuideIng(): boolean {
        let waveId = this._passControl.getPassInfo().getCurWave().length - 1;

        if (GameUserData.getInstance().checkNeedFightGuide1(waveId)) {
            return true;

        }
        if (GameUserData.getInstance().checkNeedFightGuide2(waveId)) {
            return true;
        }
        return false
    }

    getWaveId(): number {
        return this._passControl.getPassInfo().getCurWave().length - 1;
    }

    getGuideIndex() {
        return this._guideIndex;

    }


    //  startGuide(guideIndex: number, followNode: cc.Node, followTwoCameras: boolean, endNode?: cc.Node, endTwoCameras: boolean = false, 
    //tips?: string, tipsPos?: cc.Vec3,isMust?:boolean) {


    //波次结束添加金币
    // public addWaveEndSilver() {
    //     let varlue = ConfigMgr.getInstance().getById(2, KvData).val;
    //     //console.log("波次添加金币", varlue);
    //     //this.onAddSilver(parseInt(varlue), this.node.parent.convertToWorldSpaceAR(this.node.position)); // 添加金币
    // }

    moveingTurretMoveBack() {
        let node = GameControl.getInstance().moveingTurret;
        if (cc.isValid(node)) {
            node.getComponent(TurretBaseUI).moveBack();
            node.getComponent(TurretMoveUI).resetEvent();
            GameControl.getInstance().moveingTurret = null;

        }
        this.gameMap.hideAllSelectEffect();
        GlobalEventMgr.getInstance().emit(GlobalEventID.hide_block_tips);
        this._gameUI.delMoveTurret()
    }

    protected override onFightStart() {
        // if (this._gameMap.getAllTurretList().length == 0) {
        //     GameHelp.getInstance().showToast('场上没有任何装备');
        //     return;
        // }
        this._myReadyState = true;

        console.warn("战斗开始")
        this.setIsZhengbei();
        this._gameUI.setReadyBtnState(this._myReadyState);
        if (this._isZhengbei) {
            return;
        }

        //this._isZhengbei = false;

        this._gameUI.hideTeamerReady();
        this._gameUI.hideMyselfReady();
        this._gameUI.setShopMainMaskState(false);
        this.moveingTurretMoveBack();
        console.warn("隐藏商店")
        this.hideGameUI();
        this._gameMap.getTeamerBlocks().forEach((block) => {
            if (block && block.getTurret()) {
                block.getTurret().active = true;
            }
        });
        let zoomRatio = GameControl.getInstance().zoomScale;
        cc.tween(this.gameCamera.node).to(0.2, { position: cc.v3(0, 0, 0) }).start();
        cc.tween(this.gameCamera).to(0.2, { zoomRatio: zoomRatio }).call(() => {
            this.changeGameStatue(GamePassState.Playing);
            GlobalEventMgr.getInstance().emit(GlobalEventID.monster_begin); // 发送怪物开始事件
            this.checkShowWaveTips();
        }).start();

        this._gameMap.getTeamerBlocks().forEach((block) => {
            //    block.setSBLNodeState(false);
        });



        // this._gameMap.onFightStart();

        let wInfo = this._passControl.getPassInfo().getCurWave()[this._passControl.getPassInfo().getCurWave().length - 1]; // 下一个波次

        if (wInfo.weather1 == 2) {
            // this.showRain();
            GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_SHOW_RAIN, { zap: false, t: 10 });
        } else if (wInfo.weather1 == 3) {
            // this.showRain();
            // this.showzap();
            // this._needZap = true;
            GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_SHOW_RAIN, { zap: true, t: 10 });
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
        this._gameUI.autoView.playerRoot.opacity = 30;
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
        this._gameUI.autoView.playerRoot.opacity = 255;
        super.hideGameUI();
    }




    // public async addCopyChar(): Promise<BattleAckObject> {
    //     return null;
    // }




    // 添加鼎
    protected async addTripod() {
        let path = 'Tripod';
        let res = await GameResLoad.LoadTropidPrefab(path);
        if (!res) {
            cc.error(`error load cart ${path}`)
            return;
        }
        let node = res;
        let tripod = node.getComponent(BattleTripodUI);
        this._tripod = tripod;
        this._gameMap.addTripod(node);
        this._passControl.setTripod(tripod);
        let tInfo = new TripodInfo();
        await tripod.init(tInfo);

        GameControl.getInstance().setBaseWpos(this._tripod.node.convertToWorldSpaceAR(cc.v3(0, 0)));
    }
    protected onTurretCheckUp(): void {
        // list turret 
        // map turret 
        let layoutTurret = this._gameUI.getAllTurretList();
        console.log("layoutTurret", layoutTurret.length)

        let mapTurrets = this._gameMap.getMyAllTurretList();
        console.log("mapTurrets", mapTurrets.length)

        // 全部隐藏
        for (const element of layoutTurret) {
            element.showUpIcon(false);
        }
        // 
        for (const element of mapTurrets) {
            element.showUpIcon(false);
        }
        if (this._passControl.getPassInfo().data.id == 1 && this._gameMap.getAllTurretList().length < this._gameMap.getBlocksNum()) {
            return;
        }
        // 比对显示
        for (const element of layoutTurret) {
            for (const em of mapTurrets) {
                if (element.turretInfo.getID() == em.turretInfo.getFusionInput()) {
                    element.showUpIcon(true);
                    em.showUpIcon(true);
                }
            }
        }

        for (let i = 0; i < mapTurrets.length; i++) {
            for (let j = i + 1; j < mapTurrets.length; j++) {
                if (mapTurrets[i].turretInfo.getID() == mapTurrets[j].turretInfo.getFusionInput()) {
                    mapTurrets[i].showUpIcon(true);
                    mapTurrets[j].showUpIcon(true);
                }
            }
        }
    }


    // private activeTouchId: number = null
    // protected onBgTouchStart(e: cc.Event.EventTouch) {
    //     // console.log("onBgTouchStart", e.getLocation());
    //     const touchId = e.touch.getID();
    //     if (this.activeTouchId !== null) {
    //         e.stopPropagation(); // 阻止事件继续传播
    //         return;
    //     }
    //     this.activeTouchId = touchId;
    //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_bg_touch_start, e);
    // }
    // protected onBgTouchMove(e: cc.Event.EventTouch) {
    //     // console.log("onBgTouchMove", e.getLocation());
    //     if (e.touch.getID() === this.activeTouchId) {
    //         GlobalEventMgr.getInstance().emit(GlobalEventID.game_bg_touch_move, e);
    //     }
    // }

    // protected onBgTouchEnd(e: cc.Event.EventTouch) {
    //     // console.log("onBgTouchEnd", e.getLocation());
    //     if (e.touch.getID() === this.activeTouchId) {
    //         this.activeTouchId = null;
    //         GlobalEventMgr.getInstance().emit(GlobalEventID.game_bg_touch_end, e);
    //     }
    // }

    onMyselfHurt(hurt) {
        this._myTotalHurt += hurt;
    }

    onTeamerHurt(hurt) {
        this._teamerTotalHurt += hurt;
    }

    refreshHurtUI() {
        this._gameUI.refreshHurtUI(this._myTotalHurt, this._teamerTotalHurt);

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
                this._passControl.showResult(GamePassResult.Win);
            }
            if (event.keyCode == cc.macro.KEY.f8) {
                this._passControl.showResult(GamePassResult.Fail);
            }
            if (event.keyCode == cc.macro.KEY.f2) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.func_event, { id: 4 });
            }
            if (event.keyCode == cc.macro.KEY.f4) {
                this.showZhengBei(false, false);
            }
            if (event.keyCode == cc.macro.KEY.f5) {
                this._teamerReadyState = true;
                this.onFightStart();
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
