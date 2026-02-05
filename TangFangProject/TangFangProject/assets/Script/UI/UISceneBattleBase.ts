import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import PlatformMgr, { PlatformEvent } from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import { UIScreen } from "../../TRFrameWork/UIFrame/UIForm";
import AOESustained from "../Battle/AOESustained";
import BattleAckObject from "../Battle/BattleAckObjet";
import BattleCharUI from "../Battle/BattleCharUI";
import BattleSummonTurretUI from "../Battle/BattleSummonTurretUI";
import BulletBase from "../Battle/BulletBase";
import GameControl from "../Battle/GameControl";
import GameMap from "../Battle/GameMap";
import GameResLoad from "../Battle/GameResLoad";
import PowUpEffectMgr from "../Battle/PowUpEffectMgr";
import ShootBagUI from "../Battle/ShootBagUI";
import TurretBaseUI from "../Battle/TurretBaseUI";
import TurretMoveUI from "../Battle/TurretMoveUI";
import ConfigMgr from "../config/ConfigMgr";
import { KvData } from "../config/DataDef";
import CharHeroInfo, { BuffEffectInfo, summonParm, SummonTurretInfo, TurretInfo } from "../config/DataInfo";
import { GameBulletType, GameBundle, GameObjectType } from "../config/GameEnum";
import GameDrawHelp from "../Data/GameDrawHelp";
import { WapenType } from "../Data/GameWapenData";
import BattleControl, { GamePassResult } from "./BattleControl";
import GameBattleBaseUI from "./GameBattleBaseUI";

const { ccclass, property } = cc._decorator;


// 游戏关卡状态
export enum GamePassState {
    Init,
    Ready,
    // Zhengbei,
    Playing,
    Relifing,
    Pause,
    End,
}


@ccclass
export default class UISceneBattleBase extends UIScreen {
    @property(cc.Camera)
    gameCamera: cc.Camera = null;  // 游戏摄像机

    @property(cc.Node)
    bgRoot: cc.Node = null;  // 背景节点

    screenName: string = "UISceneBattle";


    public get gRoot(): cc.Node {
        return this._gameMap.gRoot;
    }

    protected _gameUI: GameBattleBaseUI = null;

    protected _gameMap: GameMap = null; // 游戏地图

    get passControl(): BattleControl {
        return this._passControl;
    }

    get gameMap(): GameMap {
        return this._gameMap;
    }

    get charList(): BattleCharUI[] {
        return this._charList;
    }

    protected _charList: BattleCharUI[] = []; // 玩家角色
    protected _summonTurret: BattleAckObject[] = []; // 召唤塔


    protected _isZhengbei: boolean = false; // 是否

    protected _bulletList: Array<BulletBase> = []; // 子弹列表
    protected _AOEList: Array<AOESustained> = []; // 持续性aoe列表


    protected _passControl: BattleControl = null; // 游戏控制


    protected _tripod: BattleAckObject = null;

    // 游戏状态
    protected _state: GamePassState = GamePassState.Init;      // 当前状态

    protected _pauseCount = 0; // 暂停次数
    waitRelifing: number = 0;

    // 初始化 
    public onInit(params: any): void {
        super.onInit(params);
        // console.log('init game', params)
        this.regiesterEvent(); // 注册事件
        this.playBgMusic(); // 播放背景音乐
        // this.setGameSpeed(this._passControl.getPassInfo().gameSpeed);
        this.setGameSpeed(GameControl.getInstance()._defaultSpeed);
    }

    public onShow(params: any): void {
        super.onShow(params);
    }

    public onAfterShow(params: any): void {
        GlobalEventMgr.getInstance().emit(GlobalEventID.GameUI_Show, this.gameCamera); // 显示UI
        GlobalEventMgr.getInstance().emit(GlobalEventID.GameUI_Show, this.gameCamera); // 显示UI
    }

    playBgMusic() {
        // if (!cc.isValid(this)) { return; }
        // let sId = CommonUtils.randomIntClosedRange(4, 5); // bgList.length
        let self = this;
        let sList = ConfigMgr.getInstance().getById(10, KvData).val.split(',');
        let sName = Math.random() >= 0.5 ? sList[0] : sList[1];
        SoundMgr.getInstance().playMusic(sName, false, () => {
            cc.isValid(self) && self.scheduleOnce(self.playBgMusic, 0.5);
        });
    }


    public setGameSpeed(speed: number) {
        // if(speed==2){
        //     speed =1.5;
        // }
        this._passControl.getPassInfo().gameSpeed = speed;
        this.doGameSpeed(this._passControl.getPassInfo().gameSpeed);
    }

    // 设置游戏速度
    protected doGameSpeed(speed: number) {
        cc.director.getScheduler().setTimeScale(speed);
        sp['_timeScale'] = speed;
    }


    protected regiesterEvent() {
        // 注册事件

        GlobalEventMgr.getInstance().on(GlobalEventID.pauseGame, this.onGamePause, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.resumeGame, this.onGameResume, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DRAG_START, this.onTurretDragStart, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DRAG_END, this.onTurretDragEnd, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DRAG_MOVE, this.onTurretDragMove, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.CHAR_DRAG_START, this.onCharDragStart, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.CHAR_DRAG_END, this.onCharDragEnd, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.CHAR_DRAG_MOVE, this.onCharDragMove, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.Fight_start, this.onFightStart, this);


        GlobalEventMgr.getInstance().on(GlobalEventID.revice_block, this.onReviceBlock, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.game_createFakeHero, this.onCreateFakeHero, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_CHECK_UP, this.onTurretCheckUp, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.wave_summon, this.onWaveSummon, this);

        PlatformMgr.instance.on(PlatformEvent.VideoReward, this.onVideoShowing, this);
    }

    protected offRegiesterEvent() {
        // 移除GlobalEventMgr事件监听器
        GlobalEventMgr.getInstance().off(GlobalEventID.pauseGame, this.onGamePause, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.resumeGame, this.onGameResume, this);

        GlobalEventMgr.getInstance().off(GlobalEventID.TURRET_DRAG_START, this.onTurretDragStart, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.TURRET_DRAG_END, this.onTurretDragEnd, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.TURRET_DRAG_MOVE, this.onTurretDragMove, this);

        GlobalEventMgr.getInstance().off(GlobalEventID.CHAR_DRAG_START, this.onCharDragStart, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.CHAR_DRAG_END, this.onCharDragEnd, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.CHAR_DRAG_MOVE, this.onCharDragMove, this);

        GlobalEventMgr.getInstance().off(GlobalEventID.Fight_start, this.onFightStart, this);

        GlobalEventMgr.getInstance().off(GlobalEventID.revice_block, this.onReviceBlock, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.game_createFakeHero, this.onCreateFakeHero, this);
        GlobalEventMgr.getInstance().off(GlobalEventID.TURRET_CHECK_UP, this.onTurretCheckUp, this);

        GlobalEventMgr.getInstance().off(GlobalEventID.wave_summon, this.onWaveSummon, this);

        PlatformMgr.instance.off(PlatformEvent.VideoReward, this.onVideoShowing, this);
    }

    protected onVideoShowing() {
        this._passControl.addVideoShowTimes(); // 增加视频观看次数
    }

    // 获取关卡信息
    public getPassControl(): BattleControl {
        return this._passControl;
    }

    // 抵达方块
    onReviceBlock(data: any) {
        let idx = data.bid;
        let actMan: BattleCharUI = data.actMan;
        if (!(this._state == GamePassState.Playing)) {
            return;
        }

        let block = this._gameMap.getBlockByIndex(idx);
        if (!block.getTurret()) return;
        let extBuffs = block.getExtBuff();
        for (const element of extBuffs) {
            let tripod = GameControl.getInstance().sceneBattle.getTripod()
            tripod.addBuffect(new BuffEffectInfo(element, 0, cc.v2(), 0, block)); // 添加buff
        }
        if (block.isLock()) {
            return;
        }
        this._gameMap.reviceEffect(idx);
        if (!this._isZhengbei) {
            this.reviceBlockValid(idx, actMan);
        }
    }

    protected onFightStart() {
        GlobalEventMgr.getInstance().emit(GlobalEventID.Refresh_Physical_Energy);

    }

    protected reviceBlockValid(idx: number, actMan: BattleCharUI) {
        this._gameMap.reviceBlock(idx, actMan);
    }

    getTripod() {
        return this._tripod;
    }

    public getVaildBlocks() {
        return this._gameMap.getAllVaildBlocks(); // 获取所有可用的方块
    }

    public get getGameUI(): GameBattleBaseUI {
        return this._gameUI;
    }

    getTurretBasePower() {
        //         - 数值=A*B/100
        //   - A=当前上场的所有武器（装备大类类型为0的武器）的【原始单回合攻击】之和
        //   - B=【主动技能|actSkill】中的【att】
        let allTurret = this._gameMap.getAllTurretList()
        let A = 0;
        for (let i = 0; i < allTurret.length; i++) {
            let turretInfo: TurretInfo = allTurret[i].turretInfo;
            A += turretInfo.getTurretBasePower();
        }
        return A;
    }

    protected onTurretCheckUp(): void {
        // list turret 
        // map turret 
        let layoutTurret = this._gameUI.getAllTurretList();
        // console.log("layoutTurret", layoutTurret.length)

        let mapTurrets = this._gameMap.getAllTurretList();
        // console.log("mapTurrets", mapTurrets.length)

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
                if ([1, 2].indexOf(element.turretInfo.data.shootBagId[0]) < 0) {
                    if (element.turretInfo.getID() == em.turretInfo.getFusionInput()) {
                        element.showUpIcon(true);
                        em.showUpIcon(true);
                    }
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



    public onAfterHide(params: any): void {
        SoundMgr.getInstance().stopMusic();
        this.offRegiesterEvent();
    }



    public hideGameUI() {
        // this._gameUI.
        console.log("隐藏游戏UI")
        this._gameUI.hideBlockShop(); // 显示地图
        this._gameMap.hideGameUI();
        const control = GameControl.getInstance().sceneBattle.getPassControl();
        control.notMonFiveMinue = 0;
        control.notMonFiveMinuePassEnd = 0;
        control.getCurWave().cordCleanTime = 0;
        GlobalEventMgr.getInstance().emit(GlobalEventID.GameUI_Hide);
    }

    public showGameUI(first: boolean, relife: boolean) {

        console.log("显示游戏UI")
        // this._gameUI.node.active = true;
        GameDrawHelp.getInstance().resetHpPer(this._tripod.getShootInfo().hpProgress()); // 重置血条

        this.resetTurretOutDraw();
        let wInfo = this._passControl.getPassInfo().getCurWave()[this._passControl.getPassInfo().getCurWave().length - 1]; // 下一个波次

        this._gameUI.showBlockShop(first, wInfo, relife); // 显示地图
        const control = GameControl.getInstance().sceneBattle.getPassControl();
        if (control.getPassInfo().data.id <= 1) this._gameUI.updateArrowByMonster(1);
        else this._gameUI.updateArrowByMonster(0);

        this._gameMap.showGameUI();

        // 异步分批预加载怪物，避免主线程阻塞
        // this.preloadMonstersAsync(wInfo.mInfos);
        // this.scheduleOnce(this.checkAddSilverWithTurret, 0.5)
        // this.hideTianqi();
        GlobalEventMgr.getInstance().emit(GlobalEventID.TQ_HIDE_ALL);
        GlobalEventMgr.getInstance().emit(GlobalEventID.GameUI_Show, this.gameCamera);
    }


    protected async onCreateFakeHero(liveTime: number) {
        let charInfo = new CharHeroInfo(this._charList[0].charInfo.getID());
        charInfo.maxLiveTime = liveTime;
        this.addCharHero(charInfo);
    }

    // 添加英雄
    public async addCharHero(cInfo: CharHeroInfo, index: number = 0, team: boolean = false) {
        let cartPath = cInfo.getPrefabName();
        let res = await GameResLoad.LoadCharPrefab(cartPath);
        if (!res) {
            cc.error(`error load cart ${cartPath}`)
            return;
        }
        if (team) cInfo.teamID = index;
        else cInfo.teamID = -1;
        let cNode = res;
        let char = cNode.getComponent(BattleCharUI);
        let reverse = false;
        const isTeam = cInfo.teamID > 0;
        this.addChar2Map(char, isTeam);
        await char.initChar(cInfo, index, reverse);
        GameControl.getInstance().setCharHero(char);
        //补充团队角色
        if (team) GameControl.getInstance().setCharHeroTeamer(char);

        const blocks = this.gameMap.getAllBlocks();
        //最后四个点位是放置英雄-棍子的点位
        const blockIdx = blocks.length - 4 + index;
        let block = blockIdx >= blocks.length ? null : blocks[blockIdx];
        if (block) {
            block.addHero(cInfo);
            block.teamId = index ? index : 0;
        }
        // await this.initTurret();
        // GameResLoad.loadTurretPrefab()
    }


    // 添加角色到地图
    public addChar2Map(charNode: BattleCharUI, isTeam: boolean = false) {
        this._gameMap.turntableRoot.addChild(charNode.node);
        if (charNode?.stickNode_team) charNode.stickNode_team.active = isTeam;
        if (charNode?.stickNode) charNode.stickNode.active = !isTeam;
        charNode.node.setSiblingIndex(3);
        if (isTeam) charNode.node.active = false;
        this._charList.push(charNode);
    }

    public resetFoutHeros() {
        let toutChatList: CharHeroInfo[] = [];
        this._charList.forEach((char) => {
            toutChatList.push(char.charInfo);
        })
        GameDrawHelp.getInstance().resetFoutHeros(toutChatList); // 重置输出
    }

    onGamePause() {
        if (this._state == GamePassState.End) {
            return;
        }
        this._pauseCount += 1;
        console.log("暂停游戏", this._pauseCount)
        // if (this._pauseCount > 0) {
        //     this.changeGameStatue(GamePassState.Pause);
        // }
    }

    onGameResume() {
        this._pauseCount -= 1;
        console.log("恢复游戏", this._pauseCount)
        // if (this._pauseCount <= 0) {
        //     this.changeGameStatue(GamePassState.Playing);
        // }
    }

    async onCharDragStart(charNode: cc.Node) {
        let charInfo = charNode.getComponent(BattleCharUI).charInfo;
        await this._gameMap.showAddFakeChar(this._charList, charInfo)
        this._gameUI.addMoveChar(charNode, this.gameCamera, []);
    }

    onCharDragMove(charNode: cc.Node) {
        let tWpos = CocosHelper.convertBetweenCameras(charNode, cc.Canvas.instance.getComponentInChildren(cc.Camera), this.gameCamera);
        let index = this._gameMap.checkMoveInFakeStick(tWpos);
        if (index != null) {
            this._charList.forEach(element => {
                if (element.startIndex == index) {
                    //charNode.angle = element.node.angle;
                }
            });
        }
    }

    onCharDragEnd(charNode: cc.Node) {
        // 卖掉炮塔
        let tInfo = charNode.getComponent(BattleCharUI).charInfo;
        let tWpos = CocosHelper.convertBetweenCameras(charNode, cc.Canvas.instance.getComponentInChildren(cc.Camera), this.gameCamera);
        let index = this._gameMap.checkMoveInFakeStick(tWpos);
        if (index != null) {
            this.checkCharMove(index, charNode.getComponent(BattleCharUI))
        }
        else {
            charNode.getComponent(BattleCharUI).moveBack();
        }

        this._gameMap.removeAllFakeChar()
    }

    checkCharMove(index: number, selectChar: BattleCharUI) {
        let cInfo = selectChar.charInfo;
        if (cInfo.needVideo) {
            PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                if (!cc.isValid(this)) return;
                if (b) {
                    cInfo.needVideo = false; // 升级
                    this.addCharByMove(index, selectChar);
                } else {
                    selectChar.moveBack();
                }
            }, this, { scene: "battle", key: "unlock_char" });
            return;
        } else if (cInfo.locked && cInfo.getPrice() > GameControl.getInstance().getPassInfo().gameCoin) {
            selectChar.moveBack();

        } else {
            this.addCharByMove(index, selectChar);
            return
        }
    }

    async addCharByMove(index: number, selectChar: BattleCharUI) {
        let hasAdd = false
        this._charList.forEach(element => {
            if (element.startIndex == index) {
                element.upLevel();
                this.resetFoutHeros();
                hasAdd = true;
            }
        });
        if (!hasAdd) {
            await this.addCharHero(selectChar.charInfo, index);
        }
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DEL, selectChar.node);
    }

    // 拖拽开始
    onTurretDragStart(turretNode: cc.Node) {
        let cturret = this._gameMap.getAllTurretList();
        let compList: TurretBaseUI[] = [];

        for (let i = 0; i < cturret.length; i++) {
            let tt = cturret[i];
            if (tt.node != turretNode && tt.turretInfo.getFusionInput() == turretNode.getComponent(TurretBaseUI).turretInfo.getID()) {
                if (GameControl.getInstance().isTeamBaid()) {
                    if (this._gameMap.getAllTeamerTurretList().indexOf(tt) >= 0) {
                        continue;
                    }
                }
                compList.push(tt);
            }
        }
        if (this._passControl.getPassInfo().data.id == 1 && this._gameMap.getAllTurretList().length < this._gameMap.getBlocksNum()) {
            compList = [];
        }
        /// 转移到移动层
        this._gameUI.addMoveTurret(turretNode, this.gameCamera, compList);
    }


    // 拖拽移动
    onTurretDragMove(turretNode: cc.Node) {
        const turretBaseUI: TurretBaseUI = turretNode.getComponent(TurretBaseUI);
        const turretMoveUI: TurretMoveUI = turretNode.getComponent(TurretMoveUI);
        let tWpos = CocosHelper.convertBetweenCameras(turretNode, cc.Canvas.instance.getComponentInChildren(cc.Camera), this.gameCamera);
        let stickID = 0, wapenID = 0;
        if (turretBaseUI.turretInfo.data.wapenType == WapenType.stick) {
            stickID = turretMoveUI.getStickID()
            wapenID = turretBaseUI.turretInfo.data.id;
        }
        if (this._gameMap.checkMoveInBlock(tWpos, stickID, wapenID)) {
            if (turretBaseUI.turretInfo.data.wapenType == WapenType.stick) {
                turretNode.opacity = 20;
                turretNode.scale = 1.5;
            } else {
                turretNode.opacity = 255;
                turretNode.scale = 1;
            }
        } else {
            turretNode.opacity = 255;
            turretNode.scale = 1;
        }

        if (!turretBaseUI.turretInfo.locked) {
            this._gameUI.checkMoveInDel(turretNode);
        }

        turretBaseUI.onShowSingleIcon();
        turretNode.setScale(0.8);
    }

    // 拖拽结束
    onTurretDragEnd(turretNode: cc.Node) {
        this._gameUI.delMoveTurret(turretNode);
        let dropBlock = this._gameMap.getLastSelectBlock();
        const turretBase = turretNode.getComponent(TurretBaseUI);
        // 卖掉炮塔
        let tInfo = turretBase.turretInfo;
        /**塔单位上的才隐藏*/
        if (turretNode.parent.name == 'weapon') {
            turretBase.onShowSingleIcon();
        }
        turretNode.opacity = 255;
        turretNode.scale = 1;
        turretBase.onShowAllWapenUI();

        if ((!tInfo.locked || tInfo.buyed) && this._gameUI.checkMoveInDel(turretNode)) {
            this._gameUI.delTurret(turretNode);
            GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DEL, turretNode);
            SoundMgr.getInstance().playSoundByID(26);
            this.resetTurretOutDraw();
            return;
        }

        if (!dropBlock) {
            turretBase.moveBack();
            // GlobalEventMgr.getInstance().emit(GlobalEventID.turret_move_back, turretNode.getComponent(TurretBaseUI));
        } else {
            this._gameMap.checkTurretMove(dropBlock, turretNode)
        }
        /**塔单位上的才隐藏*/
        if (turretNode.parent?.name == 'weapon') {
            turretBase.onShowSingleIcon();
            turretNode.setScale(0.8);
        } else turretNode.setScale(1);
        this.resetTurretOutDraw();
    }

    protected resetTurretOutDraw() {
        let toutTS: number[] = [];
        this._gameMap.getAllTurretList().forEach((turret) => {
            turret.turretInfo.getFusionOutput() > 0 && toutTS.push(turret.turretInfo.getFusionOutput());
        })
        GameDrawHelp.getInstance().resetFoutTurrets(toutTS); // 重置输出
    }

    public changeGameStatue(statue: GamePassState) {
        // this._lastState = this._state;
        this._state = statue;
    }

    /**
     * 异步分批预加载怪物资源
     * @param monsterInfos 怪物信息列表
     */
    public async preloadMonstersAsync(monsterInfos: any[]) {
        if (!monsterInfos || monsterInfos.length === 0) {
            return;
        }

        const uniquePaths = new Set<string>();
        monsterInfos.forEach((mInfo) => {
            const path = mInfo.getImgPath();
            if (path) {
                uniquePaths.add(path);
            }
        });

        const paths = Array.from(uniquePaths);
        if (paths.length === 0) {
            return;
        }

        const batchSize = 10; // 每批加载的数量
        const delayMs = 50; // 批间延迟，避免主线程阻塞

        //分批异步加载
        for (let i = 0; i < paths.length; i += batchSize) {
            const batch = paths.slice(i, i + batchSize);

            const loadPromises = batch.map((path) => {
                return GameResLoad.loadMonsterPrefab(path).catch((error) => {
                    console.error(`Failed to preload monster: ${path}`, error);
                    return null;
                });
            });

            try {
                await Promise.all(loadPromises);
            } catch (error) {
                console.error('Monster preload error:', error);
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    update(dt) {
        this._passControl.doUpdate(dt);

        GameControl.getInstance().getQuadTree().update();
        dt = this._passControl.getPassInfo().gameSpeed * dt;

        if (this._pauseCount > 0) {
            return;
        }

        switch (this._state) {
            case GamePassState.Init:
                break;
            case GamePassState.Ready:
            // break;
            // case GamePassState.Zhengbei:
            //     this._gameUI.doUpdate(dt);
            //     this.updateChar(dt);
            //     this.checkBullet(dt);
            //     break;
            case GamePassState.Playing:

                this.checkAOE(dt);
                this.checkBullet(dt);
                // this._gameUI.doUpdate(dt);
                this.updateGameUI(dt);
                this._gameMap.doUpdate(dt);
                this.updateChar(dt, this._isZhengbei);
                this.updateSummonTurret(dt);
                // this.updateTianqi(dt);
                if (this.checkTripodRemove()) {
                    return;
                }

                if (!this._isZhengbei) {
                    // this._passControl.doPlaying(dt);
                    // this._passControl.checkTutoialHero(dt);
                    this.updateBattlePlaying(dt);
                }
                break;
            case GamePassState.Relifing:
                this.waitRelifing -= dt;
                if (this.waitRelifing <= 0) {
                    this.endRelife();
                }
                break;
            case GamePassState.Pause:
                break
            case GamePassState.End:
                break;
        }
    }

    getWaveId(): number {
        return 0;
    }

    public relife() {
        this.waitRelifing = 1.2;
        this._tripod.relife();
        this._gameMap.relife();
    }

    protected checkTripodRemove(): boolean {
        if (this._tripod.isWaitRemove()) {
            this._passControl.showResult(GamePassResult.Fail);
            return true;
        }
        return false
    }

    protected updateBattlePlaying(dt) {
        this._passControl.doPlaying(dt);
        this._tripod.doUpdate(dt); // 更新炮台
    }

    protected endRelife() {
        this.changeGameStatue(GamePassState.Playing);
    }

    protected updateGameUI(dt) {
        this._gameUI.doUpdate(dt);
    }

    protected updateChar(dt: number, zhengber: boolean): void {

        let waitDelList: BattleCharUI[] = [];
        // 更新角色
        for (const element of this._charList) {
            if (element.isWaitRemove() && element.charInfo.maxLiveTime > 0) {
                waitDelList.push(element);
            } else {
                if (!zhengber) {
                    element.doUpdate(dt);
                }
                if (zhengber && element.charInfo.clickNum > 0) {
                    // element.doZhengbeiUpdate(dt);
                    element.charInfo.clickNum = 0
                }
            }
        }

        for (const mst of waitDelList) {
            this._charList.splice(this._charList.indexOf(mst), 1);
            GameResLoad.putNode(mst.node);
        }
    }

    public updateSummonTurret(dt: number) {
        let waitDelList: BattleAckObject[] = [];
        // 更新角色
        for (const element of this._summonTurret) {
            if (element.isWaitRemove()) {
                waitDelList.push(element);
            } else {
                element.doUpdate(dt);
            }
        }

        for (const mst of waitDelList) {
            this._summonTurret.splice(this._summonTurret.indexOf(mst), 1);
            GameResLoad.putNode(mst.node);
        }
    }

    protected checkBullet(dt) {
        let removeBlt: BulletBase[] = [];
        for (const blt of this._bulletList) {
            if (blt.isWaitRemove()) {
                removeBlt.push(blt);
            } else {
                blt.doUpdate(dt);
            }
        }
        for (const blt of removeBlt) {
            GameResLoad.putNode(this._bulletList.splice(this._bulletList.indexOf(blt), 1)[0].node);
        }
    }

    protected checkAOE(dt) {
        let removeAOE: AOESustained[] = [];
        for (const blt of this._AOEList) {
            if (blt.isWaitRemove()) {
                removeAOE.push(blt);
            } else {
                blt.doUpdate(dt);
            }
        }
        for (const blt of removeAOE) {
            GameResLoad.putNode(this._AOEList.splice(this._AOEList.indexOf(blt), 1)[0].node);
        }
    }



    // 召唤波次
    /**
     * 处理波次召唤事件
     * @param data 包含波次信息的对象，包含波次ID、位置和来源标签
     */
    protected onWaveSummon(data: any) {
        // 以下是注释掉的测试数据示例，展示了data对象的结构
        //  let data = {
        //     waveId: bsk.waveId,
        //     pos: wPos,
        //     sourceTag: this._bulletInfo.sourceTag,
        // };
        // 判断召唤来源是否为怪物或怪物子弹
        if (data.sourceTag == GameObjectType.Monster || data.sourceTag == GameObjectType.Monster_Bullet) {
            // 如果是怪物或怪物子弹，将波次信息添加到通过控制中
            this._passControl.addSummonWave(data.waveId, data.pos);
        } else {
            // TODO: 处理其他来源的波次召唤逻辑
        }
    }

    public addSummonMonster(parm: summonParm) {

        switch (parm.sourceTag) {
            case GameObjectType.Monster:
            case GameObjectType.Monster_Bullet:
                // this._passControl.addSummonMonster(parm);
                //TODO
                break;
            case GameObjectType.Turret:
            case GameObjectType.Hero:
            case GameObjectType.Cart:
                //TODO
                this.addSummonTurret(parm);
                break;
            default:
                break;


        }

    }

    // 添加召唤炮台
    public async addSummonTurret(parm: summonParm) {

        let mInfo = new SummonTurretInfo(parm.monId, parm); // 生成召唤炮台信息
        let data = await GameResLoad.loadSummonTurretPrefab(mInfo.getImgPath()); //  loadMonsterPrefab 
        let ret: BattleSummonTurretUI = null;
        if (data) {
            let monster = data.getComponent(BattleSummonTurretUI);
            monster.node.parent = GameControl.getInstance().sceneBattle.gRoot;

            let setPos = GameControl.getInstance().sceneBattle.gRoot.convertToNodeSpaceAR(parm.wPos);
            monster.node.setPosition(setPos);
            monster.init(mInfo);
            ret = monster;
        }

        if (!ret) {
            console.error("error load summon  monster", mInfo.getImgPath());
        }

        let mst = ret;
        if (mst) {
            this._summonTurret.push(mst);
        }
        return Promise.resolve(ret);
    }

    // 添加子弹到场景中
    public async addBullet2Map(bullet: BulletBase, bType: GameBulletType) {
        if (!cc.isValid(bullet)) { return; }
        if (bType == GameBulletType.Laser) {
            this._gameMap.lasetRoot.addChild(bullet.node);
        } else {
            this._gameMap.bulletRoot.addChild(bullet.node);
        }
        // this._passControl.addBullet(bullet);


        // 添加子弹
        bullet.node.active = true;
        this._bulletList.push(bullet);
        if (this._bulletList.length > 200) {
            for (const element of this._bulletList) {
                element.dirtyCheckOutScene();
            }
        }
    }

    public drawDebugShootLine(bullet: BulletBase) {
        // draw line
        if (CC_DEBUG) {
            let grap = this._gameMap.bulletRoot.getComponent(cc.Graphics);
            if (!grap) {
                grap = this._gameMap.bulletRoot.addComponent(cc.Graphics);
            }
            grap.lineWidth = 5
            grap.strokeColor = cc.Color.RED;
            grap.clear();
            let sPos = this._gameMap.bulletRoot.convertToNodeSpaceAR(bullet.getStartWPos());
            let ePos = this._gameMap.bulletRoot.convertToNodeSpaceAR(bullet.getEndWPos());
            grap.moveTo(sPos.x, sPos.y);
            grap.lineTo(ePos.x, ePos.y);
            // console.log("draw line", sPos.x, sPos.y, ePos.x, ePos.y);
            grap.stroke();
        }
    }

    // 添加aoe到场景中
    public async addAOE2Map(aoe: AOESustained) {
        if (!cc.isValid(aoe)) { return; }

        this._gameMap.downEffect.addChild(aoe.node);
        // 添加aoe
        aoe.node.active = true;
        this._AOEList.push(aoe);

    }

    public addShootBag2Game(bag: ShootBagUI) {
        bag && this._passControl.addShootBag(bag)
    }

    protected onDestroy(): void {
        let collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = false;
        PowUpEffectMgr.getInstance().cleanData();
        GameControl.getInstance().clean(); // 清理数据
        this._passControl.clean()
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
        this._gameMap.doInit(this._passControl.getPassInfo().mapConfig);
    }


    // 判断节点是否在摄像机可视范围内
    isNodeVisibleInGameCamera(node: cc.Node): boolean {
        // 获取摄像机的节点
        let cameraNode = this.gameCamera.node;

        // 获取摄像机的 zoomRatio
        let zoomRatio = cameraNode.getComponent(cc.Camera).zoomRatio || 1;

        // 获取屏幕的视口大小
        let viewSize = cc.view.getVisibleSize();

        // 根据 zoomRatio 调整可见区域大小
        let visibleWidth = viewSize.width / zoomRatio;
        let visibleHeight = viewSize.height / zoomRatio;

        // 获取摄像机的位置
        let cameraPos = cameraNode.parent.convertToWorldSpaceAR(cameraNode.getPosition());

        // 计算摄像机的可见区域
        let visibleRect = new cc.Rect(
            cameraPos.x - visibleWidth / 2, // 左下角 x
            cameraPos.y - visibleHeight / 2, // 左下角 y
            visibleWidth, // 宽度
            visibleHeight // 高度
        );

        // 获取节点的世界坐标
        let nodeWorldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));

        // 判断节点是否在可见区域内
        return visibleRect.contains(nodeWorldPos);
    }

    public IsGuideIng(): boolean {
        return false;
    }

    public getGuideIndex(): number {
        return -1;
    }

}
