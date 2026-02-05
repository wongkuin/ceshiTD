import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import GameControl from "../Battle/GameControl";
import ConfigMgr from "../config/ConfigMgr";
import { ItemBaseData, KvData } from "../config/DataDef";
import UIConfig from "../config/UIConfig";
import GameBattleUI from "./GameBattleUI";
import BattleControl, { GamePassResult } from "./BattleControl";
import GameResLoad from "../Battle/GameResLoad";
import BattleTripodUI from "../Battle/BattleTripodUI";
import { PassInfo, TripodInfo } from "../config/DataInfo";
import GameHelp from "../Mgr/GameHelp";
import UISceneBattle_Auto from "../AutoScripts/UISceneBattle_Auto";
import GameUserData from "../Data/GameUserData";
import BattleGuideLayer from "../Guide/BattleGuideLayer";
import WapenItemUI from "../Battle/WapenItemUI";
import UISceneBattleBase, { GamePassState } from "./UISceneBattleBase";
import SectorBlockItem from "../Battle/SectorBlockItem";
import TurretBaseUI from "../Battle/TurretBaseUI";
import FromResMgr from "../../TRFrameWork/UIFrame/FromResMgr";
import { GameBundle } from "../config/GameEnum";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UISceneBattle extends UISceneBattleBase {

    @property(UISceneBattle_Auto)  //自动绑定
    auto: UISceneBattle_Auto = null;

    _guideIndex = 1;//引导步骤

    start() {
        this.debugEvent(); // 调试事件
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

        this._passControl.SetStartCharInfoList();
        let charList = this._passControl.getStartCharInfoList();
        for (let i = 0; i < charList.length; i++) {
            if (charList[i]) { // 检查元素是否存在
                await this.addCharHero(charList[i], i);
            }
        }
        // let cInfo = GameControl.getInstance().getCharInfo();
        // await this.addCharHero(cInfo);

        FormMgr.load(UIConfig.ui_game3in1);
        // FormMgr.load(UIConfig.ui_game2in2);

        this._gameUI = await FormMgr.open(UIConfig.ui_gameBattle) as GameBattleUI;
        if (GameControl.getInstance().getPassId() == 1) {
            await this._gameMap.addGuideWaveLock()
        }

        // 修改游戏状态
        this.changeGameStatue(GamePassState.Init);
        return null;
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
        GlobalEventMgr.getInstance().on(GlobalEventID.checkBattleGuide, this.checkGuide, this)
        GlobalEventMgr.getInstance().on(GlobalEventID.fightGuideFail, this.onFightGuideFail, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.fightGuideSuccess, this.onFightGuideSuccess, this);
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
    }


    // 怪物清除
    onMonsterClear(data: any) {
        this.showZhengBei(false, false); // 整备界面
    }


    // 整备界面
    public showZhengBei(firist: boolean, relife: boolean) {

        console.log("拉近相机")


        // cc.game.setFrameRate(20)
        this._passControl.enter2Zhengbei();
        this.showGameUI(firist, relife);
        // this.changeGameStatue(GamePassState.Zhengbei);
        this._isZhengbei = true;
        cc.Tween.stopAllByTarget(this.gameCamera.node);

        let zoom = 1.2; //  mapUIRoot.scale / this._passControl.getGameCart().root.scale;
        cc.tween(this.gameCamera.node)
            .delay(0.1)
            .to(0.2, { position: cc.v3(0, -220 / zoom, 0) }).start();


        cc.tween(this.gameCamera).delay(0.1).to(0.2, { zoomRatio: zoom }).call(() => {
            // this.showGameUI(firist, relife);

            // if (GameControl.getInstance().getPassId() == 1 && this.getWaveId() == 5) {
            //     FormMgr.open(UIConfig.ui_PopGetArtifact, { wapenId: 105, showTips: true });
            // }
            this._gameUI.autoView.guideLayer.getComponent(BattleGuideLayer).setGameCamera(this.gameCamera);
            this.checkGuide();

        }).start();
    }
    /**必须加载完炮台才可以 */
    checkGuide() {
        let waveId = this._passControl.getPassInfo().getCurWave().length - 1;
        if (this.gameCamera.zoomRatio == 1.2 && this._gameUI.finishLoadWapen && GameUserData.getInstance().checkNeedFightGuide1(waveId)) {

            this.pipeiGuide();
        }
        if (GameUserData.getInstance().checkNeedFightGuide2(waveId)) {

            this.pipeiGuide();
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

    onFightGuideSuccess() {
        console.log("成功回调")
        this._gameUI.delMoveTurret();
        if (this._guideIndex == 3) {//4轮空
            GameUserData.getInstance().setFightGuide1();
            this._guideIndex += 1;
            // this.scheduleOnce(() => {
            //     this.pipeiGuide();
            // }, 0.5);
            return;
            //  this.guideIng = false;
        } else if (this._guideIndex == 8) {
            GameUserData.getInstance().setFightGuide2();
            this._guideIndex++;
            this.scheduleOnce(() => {
                this.pipeiGuide();
            }, 0.5);
            //  this.guideIng = false;
            return;
        } else if (this._guideIndex == 9) {
            GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame);
        }
        this._guideIndex += 1;

        this.scheduleOnce(() => {
            this.pipeiGuide();
        }, 0.05)

    }

    //  startGuide(guideIndex: number, followNode: cc.Node, followTwoCameras: boolean, endNode?: cc.Node, endTwoCameras: boolean = false, 
    //tips?: string, tipsPos?: cc.Vec3,isMust?:boolean) {

    pipeiGuide() {
        console.log("引导匹配", this._guideIndex);
        let needDaley = false;
        if (this._guideIndex == 1 || this._guideIndex == 4 || this._guideIndex == 7) {// 1,4,7步骤需要等待武器0加载完成
            if (!cc.isValid(this._gameUI.autoView.wapen_list.children[0]?.getComponent(WapenItemUI)?.getTurretNode())) {
                needDaley = true;
            }
        }

        if (this._guideIndex == 2) {//2步骤需要等待武器1加载完成
            if (!cc.isValid(this._gameUI.autoView.wapen_list.children[1]?.getComponent(WapenItemUI)?.getTurretNode())) {
                needDaley = true;
            }
        }

        if (needDaley) {//如果需要等待就继续等，直到加载完成
            this.scheduleOnce(() => {
                this.pipeiGuide();
            }, 0.05)
            return;
        }
        //获得格子武器
        const getWapenByIdx = (sameID: number = 0) => {
            const allBlocks = this._gameMap.getAllBlocks();
            let block: SectorBlockItem = null, wapen = null;
            for (let i = 0; i < allBlocks.length; i++) {
                block = allBlocks[i];
                if (!block) continue;
                //找相同的节点
                if (sameID > 0 && i == sameID) {
                    wapen = block.node.getChildByName("weapon") || block.node;
                    break;
                }
                //没有锁的情况下 不存在节点
                if (!sameID && block.lockVideo && !block.lockVideo.node.active &&
                    block.turretRoot.childrenCount <= 0
                ) {
                    wapen = block.node.getChildByName("weapon") || block.node;
                    break;
                }
            }

            return wapen;
        }
        //找鬼剑术节点
        const getSwordWapen = () => {
            const allBlocks = this._gameMap.getAllBlocks();
            let block: SectorBlockItem = null, wapen = null;
            for (let i = 0; i < allBlocks.length; i++) {
                block = allBlocks[i];
                if (!block) continue;
                if (block.turretRoot.childrenCount > 0) {
                    //有武器
                    const wapenNode = block.turretRoot.children[0];
                    const wapenBaseUI = wapenNode.getComponent(TurretBaseUI);
                    const wapenData = wapenBaseUI?.turretInfo?.data;
                    //固定放置鬼剑术
                    if (wapenData && wapenData.id == 201) {
                        wapen = block.node.getChildByName("weapon") || block.node;
                        break;
                    }
                }
            }
            return wapen || allBlocks[1].node;
        }
        //获得塔
        const getTurretByIdx = (idx: number = 0) => {
            const wapenItem: WapenItemUI = this._gameUI.autoView.wapen_list.children[idx].getComponent(WapenItemUI);
            let wapenNode = wapenItem.getTurretNode();
            return wapenNode;
        }

        const battleGuideLayer: BattleGuideLayer = this._gameUI.autoView.guideLayer.getComponent(BattleGuideLayer);
        switch (this._guideIndex) {
            case 1:
                battleGuideLayer.startGuide(this._guideIndex,
                    getTurretByIdx(0), false, getWapenByIdx(),
                    true, "拖动武器到罗盘上已激活空余的格子", null, true, [2, 3]
                );
                break;
            case 2:
                battleGuideLayer.startGuide(this._guideIndex,
                    getTurretByIdx(1), false, getWapenByIdx(),
                    true, "再次拖动武器到罗盘上已激活空余的格子", null, true, [4, 5]
                );
                break;
            case 3:
                battleGuideLayer.startGuide(this._guideIndex,
                    this._gameUI.autoView.btn_fight.node, false, null,
                    null, null, null, true);
                // let itemArr = ConfigMgr.getInstance().getAll(ItemBaseData);
                // itemArr = itemArr.filter(item => {
                //     return !!item?.img;
                // })

                // for (let i = 0; i < itemArr.length; i++) {
                //     FromResMgr.getInstance().loadDynamicRes(`ItemIcon/${itemArr[i].img}`, null, GameBundle.Bundle_commonRes, 'prefabs/SceneBattle');
                // }
                break;
            case 4:
                battleGuideLayer.startGuide(this._guideIndex,
                    getTurretByIdx(0), false, getWapenByIdx(),
                    true, "上阵武器铜钱，可以帮助你获得额外的经济以购买其他武器", null, true, [4, 5]
                );
                break;
            case 5:
                battleGuideLayer.startGuide(this._guideIndex,
                    getTurretByIdx(1), false, getSwordWapen(),
                    true, "拖动武器到相同武器上，可以合成武器", null, true, [5, 6, 7, 8, 13, 14]
                );
                break;
            case 6:
                battleGuideLayer.startGuide(this._guideIndex,
                    this._gameUI.autoView.btn_draw.node, false, null,
                    null, null, null, true);
                break;

            case 7:
                let wapenNode = getSwordWapen();
                if (!wapenNode) {
                    this._guideIndex++;
                    battleGuideLayer.startGuide(this._guideIndex,
                        this._gameUI.autoView.btn_fight.node, false, null,
                        null, null, null, true);
                    return;
                }
                wapenNode = getWapenByIdx(18);
                battleGuideLayer.startGuide(this._guideIndex,
                    getTurretByIdx(0), false, wapenNode,
                    true, "拖动棍子上阵，棍子能提高罗盘上技能触发的频率，长棍子还可以触发罗盘外围的格子里的武器", null, true, [2, 3]
                );

                break;
            case 8:
                // FormMgr.load(UIConfig.ui_PopWapenInfo);
                battleGuideLayer.startGuide(this._guideIndex,
                    this._gameUI.autoView.btn_fight.node, false, null,
                    null, null, null, true);
                break;

            case 9:
                if (GameControl.getInstance().getPassInfo().gameSpeed == 2) {
                    this._guideIndex++;
                    return;
                }
                GlobalEventMgr.getInstance().emit(GlobalEventID.pauseGame);
                battleGuideLayer.startGuide(this._guideIndex,
                    this._gameUI.autoView.btn_speedx2.node, false, null,
                    null, null, null, true);
                break;
        }
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
        // if (GameControl.getInstance().getPassId() == 1 && this.getWaveId() == 0) {
        //     FormMgr.open(UIConfig.ui_PopGuideLv5, null, { quick: true });
        // }

        console.log("战斗开始")
        this._isZhengbei = false;
        this.hideGameUI();
        cc.tween(this.gameCamera.node).to(0.2, { position: cc.v3(0, 0, 0) }).start();
        cc.tween(this.gameCamera).to(0.2, { zoomRatio: 1 }).call(() => {
            this.changeGameStatue(GamePassState.Playing);
            // GlobalEventMgr.getInstance().emit(GlobalEventID.monster_begin); // 发送怪物开始事件
            this.checkShowWaveTips();
        }).start();

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

    protected async addCartHpProgress() {
        let cp = 'CartHpProgress';
        let hp = await GameResLoad.LoadCartHpPrefab(cp);
        this._gameMap.turntableRoot.addChild(hp);
        hp.setPosition(10, -50);
        GameControl.getInstance().setBaseWpos(this._gameMap.turntableRoot.convertToWorldSpaceAR(cc.v3(0, 0)));
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
