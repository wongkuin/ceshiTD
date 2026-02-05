import { nameof } from "../../TRFrameWork/cocos-module/component/Watch";
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import UIManager from "../../TRFrameWork/UIFrame/UIManager";
import Main_PagePass_Auto from "../AutoScripts/Main_PagePass_Auto";
import GameControl from "../Battle/GameControl";
import GameResLoad from "../Battle/GameResLoad";
import ConfigMgr from "../config/ConfigMgr";
import { HeroData, KvData, MonsterData, OnlineBounsData, PassData, WaveTimesData, } from "../config/DataDef";
import { PassInfo } from "../config/DataInfo";
import { GameBundle, MonsterType } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameActivityData from "../Data/GameActivityData";
import GameGlobalData from "../Data/GameGlobalData";
import GameSignData from "../Data/GameSignData";
import GameUserData from "../Data/GameUserData";
import GameWapenData from "../Data/GameWapenData";
import { ItemVo } from "../Data/UserItemsData";
import BattleGuideLayer from "../Guide/BattleGuideLayer";
import GuideMgr from "../Guide/GuideMgr";
import LanguageMgr from "../lang/LanguageMgr";
import ApiMgr from "../Mgr/ApiMgr";
import GameHelp from "../Mgr/GameHelp";
import { TweenManager } from "../Mgr/TweenMgr";
import { AlertData } from "../module/common/PopAlert";
import MainPageBase from "./MainPageBase";
import UISceneMain from "./UISceneMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPagePass extends MainPageBase {

    @property(Main_PagePass_Auto)
    auto: Main_PagePass_Auto = null;

    @property(ButtonPlus)
    btnRank: ButtonPlus = null;

    @property(cc.Node)
    charNode: cc.Node = null;
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(ButtonPlus)
    btn_start: ButtonPlus = null;

    @property(ButtonPlus)
    btn_setting: ButtonPlus = null;

    @property(ButtonPlus)
    btn_sign: ButtonPlus = null;

    @property(ButtonPlus)
    btn_next: ButtonPlus = null;  // 下一关

    @property(ButtonPlus)
    btn_previous: ButtonPlus = null; // 上一关

    @property(ButtonPlus)
    btn_bili: ButtonPlus = null; // bili按钮


    @property(ButtonPlus)
    btn_buji: ButtonPlus = null; // 补给

    @property(ButtonPlus)
    btn_event: ButtonPlus = null; // 事件

    @property(ButtonPlus)
    btn_x3: ButtonPlus = null; // 挂机


    @property(ButtonPlus)
    btn_store: ButtonPlus = null; // 

    @property(ButtonPlus)
    btn_sevenDay: ButtonPlus = null; // 七日
    @property(ButtonPlus)
    btn_levelInfo: ButtonPlus = null;


    @property(cc.Label) // Lv txt
    txt_lv: cc.Label = null;

    @property(cc.Label)
    txt_monster: cc.Label = null;

    @property(cc.Node)
    monsterRoot: cc.Node = null;

    @property(cc.Node)
    guankaditu: cc.Node = null;

    @property(ButtonPlus)
    btn_GM: ButtonPlus = null; // 补给

    @property(ButtonPlus)
    btnOnline: ButtonPlus = null;

    @property(ButtonPlus)
    btnTimeGift: ButtonPlus = null;

    @property(ButtonPlus)
    btnDailyGift: ButtonPlus = null;

    @property(cc.Node)
    weatherRoot: cc.Node = null;

    @property(cc.Node)//雷
    zapNode: cc.Node = null;

    @property(cc.Node)//雨
    rainNode: cc.Node = null;

    @property(cc.Node)//雾
    smokeNode: cc.Node = null;


    @property(cc.Label)//护盾
    fyLab: cc.Label = null;

    @property(cc.Label)//血量
    hpLab: cc.Label = null;

    @property(cc.Label)//血量
    passTipsLab: cc.Label = null;

    @property([cc.Sprite])//树
    treeList: cc.Sprite[] = [];
    @property(cc.Label)
    tiliLab: cc.Label = null;
    @property(cc.Node)
    spineNode: cc.Node = null;
    @property(cc.Node)
    shader0: cc.Node = null;
    @property(cc.Node)
    shader1: cc.Node = null;


    @property({ type: ButtonPlus, tooltip: "在线礼包" })
    protected loginGiftBtn: ButtonPlus = null;



    // @property(cc.Sprite)
    // sp_bg: cc.Sprite = null;


    protected _curPass: number = 1;

    protected _curPassInfo: PassInfo = null; // 当前关卡信息
    protected _needEnergy: number = 5; // 当前关卡需要能量
    protected sdTotalNum: number = 3; // 每天每关扫荡次数
    protected _flyEndPos: cc.Vec3 = null; // 飞行动态结束位置

    // protected txt_energy: cc.Label = null;
    protected txt_cdEnergy: cc.Label = null; //体力cd时间
    private _tempTreePos: cc.Vec3[] = [];


    public onInit(params: any): void {

        if (CC_DEBUG) {
            this.btn_GM.node.active = true;
            this.auto.btn_Boss.node.active = true;
            this.auto.btn_WorldBoss.node.active = true;
            this.auto.btn_TeamBoss.node.active = true;
        } else {
            this.btn_GM.node.active = false;
            this.auto.btn_Boss.node.active = false;
            this.auto.btn_WorldBoss.node.active = false;
            this.auto.btn_TeamBoss.node.active = false;
            // this.btnRank.node.active = false;
        }

        UIManager.getInstance().closeForm(UIConfig.scene_login);
        this.btn_x3.node.active = false; // 暂时屏蔽
        this.regeisterEvent();
        // GameGlobalData.getInstance().openGuaJi = GameUserData.getInstance().lastPassLv > parseInt(ConfigMgr.getInstance().getById(40, KvData).val);
        this._curPass = GameUserData.getInstance().lastPassLv;

        GameUserData.getInstance().on(this.refrushEnergy, this, nameof<GameUserData>().energy);
        this.refreshYuAndHp();
        // GameAfkEventData.getInstance().on(this.refreshBujiBtn, this);
        GameSignData.getInstance().on(this.refreshSignRedDot, this);
        GameUserData.getInstance().on(this.refreshYuAndHp, this, nameof<GameUserData>().talentHpLv);
        GameUserData.getInstance().on(this.refreshYuAndHp, this, nameof<GameUserData>().talentSpLv);
        GameActivityData.getInstance().on(this.refreshLuckDrawRedDot, this, nameof<GameActivityData>().drawNum);
        GameActivityData.getInstance().on(this.refreshLuckDrawRedDot, this, nameof<GameActivityData>().drawRewardNum);
        GameActivityData.getInstance().on(this.refreshOnlineBounsRedDot, this, nameof<GameActivityData>().onlineTime);
        GameActivityData.getInstance().on(this.refreshDailyGiftRedDot, this, nameof<GameActivityData>().dailyGiftIndex);
        GameActivityData.getInstance().on(this.refreshDivineWeapon, this, nameof<GameActivityData>().divineWeaponGiftGetNum);
        GameActivityData.getInstance().on(this.refreshPassAwardRodDot, this, nameof<GameActivityData>().passRewardGetList);
        GlobalEventMgr.getInstance().on(GlobalEventID.Refresh_LevelInfo, this.updateLevelInfo, this);
        // GameSupplyData.getInstance().on(this.refreshBujiRedDot, this);
        this.playScaleAction(this.btn_start.node);
        this.playGuangAni(this.btnDailyGift.node.getChildByName("guang"));
        // GameSevenTaskData.getInstance().on(this.refreshSevenRedDot, this);

        // GameLoginTimeGiftData.getInstance().on(this.refreshOnlineRedDot, this, nameof<GameLoginTimeGiftData>().hasGetAward);

        this.treeList.forEach((tree, index) => {
            this._tempTreePos[index] = tree.node.position;
        })

        this.refreshAllRedDot();
        this.refreshJianTouRedDot();
        this.refreshBujiBtn();
        // this.refreshYugaoBtn();
        this.refrushPassInfo();

        this.schedule(this.refreshTimeGift, 1);
        this.checkSaoDang();
        this.schedule(this.checkSaoDang, 5)
        this.refreshWeatherState();
        this.chargeBg();
        // this.playCharAni(this.charNode);

        this.preloadAllRes();
        // 体力倒计时
        // this.refrushCDEnergy();
        this._needEnergy = parseInt(ConfigMgr.getInstance().getById(73, KvData).val); // 当前关卡需要能量
        // this.sdTotalNum = parseInt(ConfigMgr.getInstance().getById(76, KvData)?.val) || 3; // 每天每关扫荡次数
    }

    preloadAllRes() {
        // 预加载技能资源

        //预加载怪物资源
        const passInfo = ConfigMgr.getInstance().getById(this._curPass, PassData);
        if (passInfo) {
            const uniqueIds = new Set<number>();
            let allMonster: MonsterData[] = [];
            for (let i = 0; i < passInfo.waves.length; i++) {
                const waveInfo = ConfigMgr.getInstance().getById(passInfo.waves[i], WaveTimesData);
                for (let j = 0; j < waveInfo.monsterID.length; j++) {
                    uniqueIds.add(waveInfo.monsterID[j]);
                }
            }
            uniqueIds.forEach(id => {
                let mstData = ConfigMgr.getInstance().getById(id, MonsterData);
                allMonster.push(mstData);
            })

            this.preloadMonstersAsync(allMonster);
        }
    }

    /**
       * 异步分批预加载怪物资源
       * @param monsterInfos 怪物信息列表
       */
    public async preloadMonstersAsync(monsterInfos: MonsterData[]) {
        if (!monsterInfos || monsterInfos.length === 0) {
            return;
        }

        const uniquePaths = new Set<string>();
        monsterInfos.forEach((mInfo) => {
            const path = mInfo.img;
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
        let isBoss = false
        //分批异步加载
        for (let i = 0; i < paths.length; i += batchSize) {
            const batch = paths.slice(i, i + batchSize);
            isBoss = paths[i].indexOf('boss') >= 0;
            let initCount = isBoss ? 1 : 50;
            const loadPromises = batch.map((path) => {
                return GameResLoad.preloadMonsterPrefab(path, initCount).catch((error) => {
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

    updateLevelInfo() {
        this._curPass = GameUserData.getInstance().lastPassLv;
        this.refreshAllRedDot();
        this.refrushPassInfo();
    }

    refreshCharSp() {
        return;
    }

    refreshYuAndHp() {
        let attrList = GameUserData.getInstance().getUserTalentAttrList();
        this.fyLab.node.parent.active = Math.floor(attrList[2]) > 0;


        this.fyLab.string = Math.floor(attrList[2]) + "";
        this.hpLab.node.x = (Math.floor(attrList[2]) > 0) ? 7 : 0;
        this.hpLab.string = "" + Math.floor(ConfigMgr.getInstance().getById(1, HeroData).maxHP + attrList[0]);
    }
    /**检查扫荡 */
    checkSaoDang() {
        GameGlobalData.getInstance().checkSaodang();
        GameActivityData.getInstance().resetLuckDrewData();
    }

    protected refrushEnergy() {
    }

    onRefreshYugao() {
        console.log("111:onRefreshYugao");
        this.refreshYugaoBtn();
    }

    regeisterEvent() {
        this.btn_start.node.on('click', this.onBtnClicked, this);
        this.btn_setting.node.on('click', this.onBtnClicked, this);
        this.btn_sign.node.on('click', this.onBtnClicked, this);

        this.btn_next.node.on('click', this.onBtnClicked, this);
        this.btn_previous.node.on('click', this.onBtnClicked, this);
        this.btn_bili.node.on('click', this.onBtnClicked, this);
        this.btn_buji.node.on("click", this.onBtnClicked, this)
        this.btn_event.node.on("click", this.onBtnClicked, this)
        this.btn_sevenDay.node.on("click", this.onBtnClicked, this)
        this.btn_store.node.on("click", this.onBtnClicked, this)
        this.loginGiftBtn.node.on("click", this.onBtnClicked, this)
        this.btn_GM.node.on("click", this.onBtnClicked, this)
        this.btnOnline.node.on("click", this.onBtnClicked, this)
        this.btnTimeGift.node.on("click", this.onTimeGift, this)
        this.btnDailyGift.node.on("click", this.onBtnClicked, this)
        this.btnRank.node.on("click", this.onBtnClicked, this)
        this.btn_levelInfo.node.on("click", this.onBtnClicked, this)

        this.auto.btn_Boss.addClick(this.onBtnClicked, this);
        this.auto.btn_WorldBoss.addClick(this.onBtnClicked, this);
        this.auto.btn_TeamBoss.addClick(this.onBtnClicked, this);
        this.auto.btn_luckDraw.addClick(this.onBtnClicked, this);
        this.auto.btn_DivineWeapon.addClick(this.onBtnClicked, this);
        this.auto.btn_passAward.addClick(this.onBtnClicked, this);
    }


    refreshJianTouRedDot() {
    }


    unregeisterEvent() {
        this.btn_start.node.off('click', this.onBtnClicked, this);
        this.btn_setting.node.off('click', this.onBtnClicked, this);
        this.btn_sign.node.off('click', this.onBtnClicked, this);

        this.btn_next.node.off('click', this.onBtnClicked, this);
        this.btn_previous.node.off('click', this.onBtnClicked, this);
        this.btn_bili.node.off('click', this.onBtnClicked, this);
        this.btn_buji.node.off('click', this.onBtnClicked, this);
        this.btn_event.node.off('click', this.onBtnClicked, this);

        //this.btn_jinhua.node.off('click', this.onBtnClicked, this);
    }

    playScaleAction(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(1, { scale: 1.1 })
            .to(1, { scale: 1 })
            .union()
            .repeatForever()
            .start();
    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(8, { angle: 360 })
            .repeatForever()
            .start()
    }


    playCharAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(1.5, { y: 188 })
            .to(1.4, { y: 175 })
            .union()
            .repeatForever()
            .start()
    }

    onTimeGift() {
        FormMgr.open(UIConfig.ui_PopGameTimeGift);
    }

    onDailyGift() {
        console.error("open daily gift")
        FormMgr.open(UIConfig.ui_PopDailyGiftPack);
    }

    onOpenRank() {
        // if (typeof wx != undefined) {
        //     wx.postMessage({
        //         event: 'setScore',
        //         score: 502
        //     });
        // }
        if (window["wx"] && cc.sys.platform == cc.sys.WECHAT_GAME) {
            // new Promise(resolve => {
            //     window["wx"].getFriendCloudStorage({
            //         keyList: ['score'],
            //         success: (res: any) => {
            //             console.log('[getRank]', 'success', res);
            FormMgr.open(UIConfig.ui_PopRank)
            //             resolve(true);
            //         },
            //         fail: (res: any) => {
            //             console.log('[getRank]', 'fail');
            //             resolve(false);
            //         }
            //     });
            // });
        }
        // ApiMgr.getInstance().getPassRankInfo((data) => {
        //     FormMgr.open(UIConfig.ui_PopRank, { rankData: data })
        // });
        //PlatformMgr.instance.getUserInfo(null)
    }

    onBtnLuckDrew() {
        FormMgr.open(UIConfig.ui_PopLuckDraw, null, { quick: true });
    }

    onBtnLevelInfo() {
        FormMgr.open(UIConfig.ui_PopLevelInfo, { passId: this._curPass, quick: true });
    }

    onBtnDivineWeapon() {
        // FormMgr.open(UIConfig.ui_PopDivineWeaponGift);
    }

    onGetPassReward() {
        FormMgr.open(UIConfig.ui_PopPassAward);
    }

    onBtnClicked(evt: cc.Event.EventTouch) {
        console.log("onBtnClicked", evt.target.name);
        if (evt.target == this.btn_start.node) {
            // this.onBtnStart();
            this.onBtnLevelInfo();
        } else if (evt.target == this.auto.btn_luckDraw.node) {
            this.onBtnLuckDrew();
        } else if (evt.target == this.auto.btn_passAward.node) {
            this.onGetPassReward();
        } else if (evt.target == this.auto.btn_DivineWeapon.node) {
            this.onBtnDivineWeapon();
        } else if (evt.target == this.btnRank.node) {
            this.onOpenRank();
        } else if (evt.target == this.btnDailyGift.node) {
            this.onDailyGift();
        } else if (evt.target == this.btnTimeGift.node) {
            this.onTimeGift();
        } else if (evt.target == this.btn_setting.node) {
            this.onBtnSetting();
        } else if (evt.target == this.btnOnline.node) {
            this.onBtnOnline();
        } else if (evt.target == this.btn_GM.node) {
            this.onOpenGM();
        } else if (evt.target == this.btn_next.node) {
            this.onBtnNext();
        } else if (evt.target == this.btn_previous.node) {
            this.onBtnPrevious();
        } else if (evt.target == this.btn_bili.node) {
            this.onBtnBili();
        } else if (evt.target == this.btn_sign.node) {
            this.onBtnSign();
        } else if (evt.target == this.btn_buji.node) {
            this.onBtnBuji();
        } else if (evt.target == this.btn_event.node) {
            this.onBtnEvent();
        } else if (evt.target == this.btn_sevenDay.node) {
            this.clickBtnSevenDay();
        } else if (evt.target == this.btn_store.node) {
            this.clickBtnStore();
        } else if (evt.target == this.loginGiftBtn.node) {
            this.clickBtnOnlineGift();
        } else if (evt.target == this.btn_levelInfo.node) {

        } else if (evt.target == this.auto.btn_Boss.node) {
            // Boss 挑战入口 — 先检查体力
            if (GameUserData.getInstance().tryConsumeEnergy(this._needEnergy)) {
                GameHelp.getInstance().goToBattle(9999); //this.onBtnBoss();
            } else {
                let gStr = LanguageMgr.getInstance().getLang("energy_notEnough");
                GameHelp.getInstance().showToast(gStr);
                FormMgr.open(UIConfig.ui_popBuyEnergy);
            }
        } else if (evt.target == this.auto.btn_WorldBoss.node) {
            GameHelp.getInstance().goToBattleWordBoss(1001); //this.onBtnBoss();
        } else if (evt.target == this.auto.btn_TeamBoss.node) {
            GameHelp.getInstance().goToBattleTeam(1002, 1);
        }

    }

    onBtnOnline() {
        FormMgr.open(UIConfig.ui_PopOnlineBouns);
    }

    onOpenGM() {
        FormMgr.open(UIConfig.ui_popGM);
    }

    refreshLoginTime() {
    }

    refreshTimeGift() {
        GameActivityData.getInstance().checkDailyGiftRefresh();
        let timeCha = (new Date().getTime() - GameActivityData.getInstance().gameGiftGetTime) / 1000 / 3600;//小时
        let maxTime = parseInt(ConfigMgr.getInstance().getById(4, KvData).val);
        let redDot = this.btnTimeGift.node.getChildByName("redDot");
        redDot.active = timeCha >= maxTime;
    }

    clickBtnOnlineGift() {
        FormMgr.open(UIConfig.ui_PopOnlineGift);
    }

    clickBtnStore() {
        FormMgr.open(UIConfig.ui_PopStore);
    }

    clickBtnSevenDay() {
        FormMgr.open(UIConfig.ui_PopSevenTask);
    }



    clickBtnFeedback() {
        // FormMgr.open(UIConfig.ui_PopFeedBack);
    }


    getAwardBySaoDang() {
    }


    protected onBtnStart() {

        // let eIcon = this.btn_start.node.getChildByName("img").getChildByName('icon');
        // this._flyEndPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);

        if (GameUserData.getInstance().energy >= this._needEnergy) {
            // this.flyIcon();
            // 减体力
            GameUserData.getInstance().changeEnergy(-this._needEnergy);
        } else {
            let gStr = LanguageMgr.getInstance().getLang("energy_notEnough");
            GameHelp.getInstance().showToast(gStr);
            FormMgr.open(UIConfig.ui_popBuyEnergy);
            //  GameTrackHelp.getInstance().track_trigger_physical();
        }
        // this.flyIcon();
        if (GameWapenData.getInstance().fightList.length < GameUserData.getInstance().curSlotNum) {
            GameHelp.getInstance().showToast("上阵武器数量不足");
            return
        }

        this.startGame();
    }

    protected flyExpAni() {

    }

    finishFlyExpAni() {

    }

    protected startGame() {
        GameHelp.getInstance().goToBattle(this._curPass);
    }

    protected onBtnSetting() {
        FormMgr.open(UIConfig.ui_gamePause, { target: "hall" });
    }

    onBtnSign() {
        console.log("签到");
        FormMgr.open(UIConfig.ui_PopSign);
    }

    onBtnBuji() {
        FormMgr.open(UIConfig.ui_PopSupply);
    }

    onBtnEvent() {
    }

    chargeBg() {
        let passVo = ConfigMgr.getInstance().getById(this._curPass, PassData);
        this.loadSpirteFrame(`texture/main/bg/${passVo.menu}`, this.bg, GameBundle.Bundle_commonRes)
        let treeScale = [0.45, -0.5, -0.8, 1];
        this.treeList.forEach((tree, index) => {
            if (passVo.id % 10 == 8) {
                let x = 0, y = 0;
                switch (index) {
                    case 0: x = -180, y = 300; break;
                    case 1: x = 190, y = 250; break;
                    case 2: x = -350, y = 60; break;
                    case 3: x = 310, y = 60; break;
                }
                tree.node.setPosition(cc.v2(x, y));
            }
            else if (passVo.id % 10 == 9) {
                let x = 0, y = 0;
                switch (index) {
                    case 0: x = -150, y = 250; break;
                    case 1: x = 190, y = 250; break;
                    case 2: x = -270, y = 20; break;
                    case 3: x = 310, y = 20; break;
                }
                tree.node.setPosition(cc.v2(x, y));
            } else {
                tree.node.setPosition(this._tempTreePos[index]);
            }
            this.loadSpirteFrame(`texture/main/bg/tree${passVo.menu}`, tree, GameBundle.Bundle_commonRes)
            tree.node.scale = treeScale[index];
            this.playTreeAni(tree.node, treeScale[index])
        })

        //写死背景关卡展示--shader1显示月亮
        let showShader1 = [2, 3, 4, 5];
        let isShowMoon = false;
        showShader1.forEach(id => {
            if (this._curPass % 10 == id) isShowMoon = true;
        })
        if (passVo.weather5 && passVo.weather5 == 2) {
            this.shader0.active = !isShowMoon;
            this.shader1.active = isShowMoon;
        } else this.shader0.active = this.shader1.active = false;
    }
    playTreeAni(treeNode: cc.Node, treeScale: number) {
        cc.Tween.stopAllByTarget(treeNode);
        treeNode.scaleX = treeScale * 0.3;
        treeNode.scaleY = Math.abs(treeScale) * 0.3;
        cc.tween(treeNode)
            .to(0.15, { scaleX: treeScale, scaleY: Math.abs(treeScale) })
            .to(0.04, { angle: -3 })
            .to(0.06, { angle: 2 })
            .to(0.05, { angle: -2 })
            .to(0.03, { angle: 1 })
            .to(0.02, { angle: 0 })
            .start()

    }

    protected onBtnNext() {

        if (this._curPass >= GameUserData.getInstance().lastPassLv) {
            // let str = LanguageMgr.getInstance().getLang("txt_lastLv")
            let str = "先通关当前关卡解锁"
            GameHelp.getInstance().showToast(str);
            return;
        }
        this._curPass++;
        this.refrushPassInfo();
        this.refreshWeatherState();
        this.chargeBg();
    }

    protected onBtnPrevious() {
        // console.log("上一关")
        if (this._curPass <= 1) {
            let str = LanguageMgr.getInstance().getLang("txt_firstLv")
            GameHelp.getInstance().showToast(str);
            return;
        }
        this._curPass--;
        // this.newPassInfo();
        this.refrushPassInfo();
        this.refreshWeatherState();
        this.chargeBg();
    }

    protected onBtnBili() {
        FormMgr.open(UIConfig.ui_popBiliExt, { reward: false });
    }

    onShow() {
        this.refrushEnergy();
        GameUserData.getInstance().checkHasAddSlotNum();
        // Utils.getWidget("tiliCost", this.btn_start.node).getComponent(cc.Label).string = "x" + this._needEnergy;
        this.unschedule(this.onCdCheck);
        this.schedule(this.onCdCheck, 1);
        this.refreshCharSp();
    }

    protected onCdCheck() {
        // this.refrushCDEnergy();
    }

    public onAfterShow(params: any): void {

        super.onAfterShow(params);
        GameWapenData.getInstance().checkNewWapenUnlockByPassLv();
        this.scheduleOnce(() => {
            this.onCheckAllGuide();
        }, 1000);

        if (GameUserData.getInstance().showUnlockProgressAni) {
            this.scheduleOnce(() => {
                this.flyExpAni();
            })

        }

        // if (GameUserData.getInstance().lastPassLv >= 3 && !GameActivityData.getInstance().firstOpenDivineWeaponGift && GameActivityData.getInstance().divineWeaponGiftGetNum < 3) {
        //     FormMgr.open(UIConfig.ui_PopDivineWeaponGift);
        //     GameActivityData.getInstance().firstOpenDivineWeaponGift = true;
        // }
    }

    onCheckAllGuide() {
        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.curPage) {
            return;
        }

        //引导1 
        if (GameWapenData.getInstance().checkRedDotByWapenId(1) && GuideMgr.getInstance().CheckShowGuid(1, this.node, main.btn_equip.node)) {
            return;
        }
        //引导8
        if (GameUserData.getInstance().talentAtkLv == 1 && GuideMgr.getInstance().CheckShowGuid(8, this.node, this.btn_start.node)) {
            return;
        }
    }

    refreshBujiBtn() {
    }


    refreshYugaoBtn(isPlayAni = false) {

    }

    protected refrushPassInfo() {
        let cfg = ConfigMgr.getInstance().getById(this._curPass, PassData);
        this.txt_lv.string = cfg.name;
        // 获取当前关卡的奖励数据
        let passAwardVo = GameUserData.getInstance().getPassAwardById(this._curPass);
        // 获取当前打卡次数，如果不存在则默认为0
        let boci = passAwardVo?.boCi || 0;
        if (boci >= cfg.waves.length) {
            this.txt_monster.string = `已通关`;
        } else {
            this.txt_monster.string = `最高记录:第${boci}波`;
        }

        const curEnergy = GameUserData.getInstance().energy;
        this.tiliLab.node.color = curEnergy >= cfg.physicCost ? cc.Color.WHITE : cc.Color.RED;
        this.tiliLab.string = `-${this._needEnergy}`;

        let passNextVo = ConfigMgr.getInstance().getById(this._curPass + 1, PassData);
        if (this._curPass == 1) {
            this.btn_previous.node.active = false;
        } else {
            this.btn_previous.node.active = true;
        }

        if (passNextVo) {
            this.btn_next.node.active = true;
        } else {
            this.btn_next.node.active = false;

        }

        if (this._curPass > 1) {
            const monsterData = ConfigMgr.getInstance().getById(this._curPass, PassData);
            const endWaveID = monsterData.waves[monsterData.waves.length - 1];
            let mstIds = ConfigMgr.getInstance().getById(endWaveID, WaveTimesData).monsterID || [];
            let img = "", mstScale = 1;
            for (let i = mstIds.length - 1; i >= 0; i--) {
                const mstCfg = ConfigMgr.getInstance().getById(mstIds[i], MonsterData);
                if (mstCfg.type == MonsterType.Boss) {
                    img = mstCfg.img;
                    mstScale = mstCfg.scale;
                    break;
                }
            }
            SceneMgr.getCurrScene().loadRes(`spine/${img}`, sp.SkeletonData, GameBundle.Bundle_monster).then((res: sp.SkeletonData) => {
                if (cc.isValid(this.spineNode) && res) {
                    this.spineNode.getComponent(sp.Skeleton).skeletonData = res;
                    this.spineNode.scale = mstScale * 1.2;
                    this.spineNode.getComponent(sp.Skeleton).setAnimation(0, "idle", true);
                }
            });
        }


        this.passTipsLab.string = cfg.noteTitle || "";

        this.refreshJianTouRedDot();
    }

    /**挂机状态 */
    refreshBtnGuaJiState() {
    }


    clickBtnGuaJi() {
    }

    clickBtnJinhua() {

    }

    mergDuplicateRewards(data: ItemVo[]): ItemVo[] {
        let list: ItemVo[] = [];

        function getListIndexBy(id) {
            let index = -1;
            for (let i = 0; i < list.length; i++) {
                if (list[i].itemID == id) {
                    return i;
                }
            }
            return index;
        }
        data.forEach((item: ItemVo) => {
            let index = getListIndexBy(item.itemID);
            if (index >= 0) {
                list[index].num += item.num;
            } else {
                list.push({ itemID: item.itemID, num: item.num });
            }
        })
        return list;
    }


    refreshAllRedDot() {
        this.refreshEventRedDot();
        this.refreshSignRedDot();
        this.refreshBujiRedDot();
        this.refreshOnlineRedDot();
        this.refreshSevenRedDot();
        this.refreshOnlineBounsRedDot();
        this.refreshDailyGiftRedDot();
        this.refreshLuckDrawRedDot();
        this.refreshDivineWeapon();
        this.refreshPassAwardRodDot();
    }

    refreshOnlineBounsRedDot() {
        let allData = ConfigMgr.getInstance().getAll(OnlineBounsData);
        if (GameActivityData.getInstance().onlineBounsGetIdList.length >= allData.length) {
            this.btnOnline.node.active = false;
            return;
        } else {
            this.btnOnline.node.active = true;
            let redDot = this.btnOnline.node.getChildByName("redDot");
            redDot.active = GameActivityData.getInstance().OnlineBounsRedDot();
        }

    }

    refreshDailyGiftRedDot() {

        let redDot = this.btnDailyGift.node.getChildByName("redDot");
        redDot.active = GameActivityData.getInstance().checkDailyGiftRedDot();


    }

    refreshDivineWeapon() {
        // this.auto.btn_DivineWeapon.node.active = GameActivityData.getInstance().divineWeaponGiftGetNum < 3;
    }

    refreshPassAwardRodDot() {
        let redDot = this.auto.btn_passAward.node.getChildByName("redDot");
        redDot.active = GameActivityData.getInstance().getPassRewardRedDot();
    }


    refreshSevenRedDot() {
    }

    refreshLuckDrawRedDot() {
        let redDot = this.auto.btn_luckDraw.node.getChildByName("redDot");
        redDot.active = GameActivityData.getInstance().checkLuckDrawRedDot();

    }
    refreshOnlineRedDot() {

    }
    /**事件红点 */
    refreshEventRedDot() {
        console.warn("refreshEventRedDot1");
    }

    /**签到红点 */
    refreshSignRedDot() {
        this.btn_sign.node.active = GameSignData.getInstance().checkActive();
        let redDot = this.btn_sign.node.getChildByName("redDot");
        redDot.active = GameSignData.getInstance().checkAllRedDot();

    }
    /**补给红点 */
    refreshBujiRedDot() {
    }

    setRedDotAction(node: cc.Node) {
        if (TweenManager.getInstance().hasActiveTween(node)) {
            console.log("该节点有正在运行的 Tween", node.name);
            return;
            //     console.log("该节点有正在运行的 Tween");
        } else {
            this.removeRedDotAction(node);
            TweenManager.getInstance().create(node)
                .delay(1)
                .to(0.2, { angle: 25 }, { easing: 'sineOut' })
                .to(0.2, { angle: -25 }, { easing: 'sineOut' })
                .to(0.15, { angle: 15 }, { easing: 'sineOut' })
                .to(0.15, { angle: -15 }, { easing: 'sineOut' })
                .to(0.1, { angle: 10 }, { easing: 'sineOut' })
                .to(0.05, { angle: 0 }, { easing: 'sineIn' })
                .union()
                .repeatForever()
                .start();
        }
    }

    removeRedDotAction(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        node.angle = 0;
        if (TweenManager.getInstance().hasActiveTween(node)) {
            TweenManager.getInstance().stopAllTween(node);
            node.angle = 0;
            //     console.log("该节点有正在运行的 Tween");
        }

    }

    public onHide(params: any): void {

        TweenManager.getInstance().cleanAll();
    }

    // smokeNode: cc.Node = null;
    refreshWeatherState() {
        let passVo = ConfigMgr.getInstance().getById(this._curPass, PassData);
        this.smokeNode.active = passVo.weather4 == 1;
        this.zapNode.active = false;
        this.rainNode.active = false;
        if (passVo.weather3 == 2) {//雨
            this.rainNode.active = true;

            this.unschedule(this.scheduleZap);
        } else if (passVo.weather3 == 3) {//雷
            this.rainNode.active = true;
            this.unschedule(this.scheduleZap);
            this.scheduleZap();
            this.schedule(this.scheduleZap, 15);
        }

    }

    scheduleZap() {

        let index = Random.range(1, 2);
        let spineIndex = Random.range(1, 3);
        this.zapNode.active = true;
        let spine = this.zapNode.getChildByName("zap").getComponent(sp.Skeleton);

        spine.setAnimation(0, "zap_" + spineIndex, false);
        spine.setCompleteListener(() => {
            this.zapNode.active = false;
            spine.setCompleteListener(null);
        })
        SoundMgr.getInstance().playSound("falsh" + (index))



    }
}
