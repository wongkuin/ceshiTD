// // Learn TypeScript:
// //  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// // Learn Attribute:
// //  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// // Learn life-cycle callbacks:
// //  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import UserItemsData, { ItemVo } from "../Data/UserItemsData"

import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import PopGameResult_Auto from "../AutoScripts/PopGameResult_Auto";
import LanguageMgr from "../lang/LanguageMgr";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import UIConfig from "../config/UIConfig";
import AwardItemNew from "../module/activity/AwardItemNew";
import GameTrackHelp from "../Mgr/GameTrackHelp";
import ToastMgr from "../../TRFrameWork/UIFrame/ToastMgr";
import GameControl from "../Battle/GameControl";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import UISceneBattleTeam from "./UISceneBattleTeam";
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";

const { ccclass, property } = cc._decorator;

export type GameResultType = {
    isWin: boolean,   //是否胜利
    chestID: number,  //宝箱ID
    relifeCount: number, //复活次数
    relifeMaxCount: number, //最大复活次数
    bouns: Array<ItemVo> //奖励  [id:count ...]
    isNewLv?: boolean,//是否是最新关卡
    passWave: number,//通关波数
    maxWave: number,//最大波数
    passId?: number,//通关关卡
    videoWave: number[],//视频波数
    speed?: number,//速度
    totalHurt?: number,//总伤害
}


@ccclass
export default class PopGameResult extends UIWindow {

    @property(PopGameResult_Auto)
    auto: PopGameResult_Auto = null;

    get winNode(): cc.Node {
        return this.auto.win;
    }

    get failedNode(): cc.Node {
        return this.auto.failed;
    }

    @property(cc.Prefab)
    awardItemPrefab: cc.Prefab = null;

    modalType = new ModalType(ModalOpacity.OpacityHalf, false);
    closeType = ECloseType.CloseAndDestory;

    // isNewLv: boolean;
    gameResult: 0 | 1;

    rParams: GameResultType = null;
    relifed: boolean = false;
    protected _cdRelife: number = 0;


    protected rBonus: Array<ItemVo> = null;
    protected rMul: number = 1;

    protected _closePram: any = {};
    protected _resultData: GameResultType = null;





    public onInit(params: any): void {
        this.setBlockInput(true);
        // super.onInit(params);

        this._resultData = params as GameResultType;

        this.rParams = params as GameResultType;
        let result = this.rParams
        this.gameResult = (params.isWin) ? 1 : 0;

        // if (result.chestID > 0) {
        //     this.chestData = GameBattleChestData.getInstance().getNewBattleChest(result.chestID);
        // }

        this.regiestEvent();
        GlobalEventMgr.getInstance().emit(GlobalEventID.closeDropPop);
    }

    protected regiestEvent(): void {
        this.node.getComponent(ButtonPlus).addClick(this.onBtnClicked, this);

        this.auto.btn_giveup.addClick(this.onBtnClicked, this);
        this.auto.btn_relive.addClick(this.onBtnClicked, this);

        this.auto.btn_failClose.addClick(this.onBtnClicked, this);
        this.auto.btn_failClosex2.addClick(this.onBtnClicked, this);
    }

    public onShow(params: any): void {


        this.rBonus = [];
        this.rMul = 1;
        this.relifed = false;
        this._closePram = {};
        if (GameControl.getInstance().isTeamBaid()) {
            this.auto.txt_MyHurt.node.active = true;
            let scene = SceneMgr.getCurrScene() as UISceneBattleTeam;
            this.auto.txt_MyHurt.string = "我的伤害:" + scene.getMyTotalHurt() + "";
            this.auto.btn_failClosex2.node.active = false;
            this.auto.btn_failClose.node.getComponentInChildren(cc.Label).string = "领取奖励";
        }
        this.scheduleOnce(() => {
            this.setBlockInput(false);
        }, 0.5);
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.auto.btn_failClose.node) {
            this.closeSelf();
        } else if (evt.target == this.auto.btn_failClosex2.node) {
            this.openGetx2();
        } else if (evt.target == this.auto.btn_giveup.node) {
            this.hideRelife();
        } else if (evt.target == this.auto.btn_relive.node) {
            this.onRelifeClicked();
        }
    }

    public onAfterShow(params: any): void {
        super.onAfterShow(params);
        let data = this._resultData;

        if (data.isWin) {
            this.showWin(data);
        } else if (this.rParams.relifeCount < this.rParams.relifeMaxCount) {
            this.showRelife();
        } else {
            this.showFailed(data);
        }
    }

    /**
     * 显示失败
     */
    protected showFailed(data: GameResultType): void {

        this.auto.relive.active = false;
        this.auto.failed.active = true;
        this.auto.common.active = true;
        this.auto.win.active = false;

        // let anim = this.failedNode.getChildByName("UI_lose").getComponent(cc.Animation);
        // anim.play(anim.getClips()[0].name);
        // let canRelife = this.rParams.relifeCount < this.rParams.relifeMaxCount;
        // this.btn_relife.node.active = canRelife;
        // this.btn_close.node.active = canRelife;
        // this.txt_relifeTip.node.active = canRelife;

        let str = LanguageMgr.getInstance().getLang("txt_fail_tips");
        this.auto.txt_tips.string = CommonUtils.addOutline(str, 2, "#000000");
        this.showBouns(data.bouns);
    }

    protected showRelife(): void {
        this._cdRelife = 10;
        this.auto.relive.active = true;
        this.auto.common.active = false;
        this.auto.failed.active = false;
        this.auto.win.active = false;
        // this.schedule(this.cdRelife, 1, this._cdRelife, 0);
        // this.cdRelife();

        // let str = LanguageMgr.getInstance().getLang("txt_relifeTip");
        // this.auto.txt_reliveTips.string = CommonUtils.addOutline(GameHelp.replaceColorStr(str), 3, "#000000");
    }

    protected hideRelife(): void {
        this.showFailed(this._resultData);
        // this.unschedule(this.cdRelife);
    }

    // protected cdRelife(): void {
    //     this._cdRelife--;
    //     this.auto.txt_cdRelive.string = this._cdRelife.toString();
    //     this.auto.txt_cdRelive.getComponent(cc.Animation).play();
    //     if (this._cdRelife <= 0) {
    //         this.hideRelife();
    //     }
    // }

    /**
     * 显示胜利
     * @param data 
     */
    // 显示胜利界面
    protected showWin(data: GameResultType): void {

        this.auto.relive.active = false;
        this.auto.failed.active = false;
        this.auto.win.active = true;
        this.auto.common.active = true;

        // this.txt_fullChest.node.parent.active = false;
        // let anim = this.winNode.getChildByName("UI_win").getComponent(cc.Animation);
        // anim.play(anim.getClips()[0].name);
        // this.showBattleChest();
        this.showBouns(data.bouns);
        // let p = anim.node.getComponentsInChildren(cc.ParticleSystem);
    }

    currentIndex = 0
    // particles: cc.ParticleSystem[] = [];

    // playNextParticle() {
    //     let currentIndex = this.currentIndex;
    //     let particles = this.particles;
    //     // 停止当前粒子
    //     if (particles[currentIndex]) {
    //         particles[currentIndex].stopSystem();
    //     }

    //     // 更新索引
    //     this.currentIndex = (currentIndex + 1) % particles.length;
    //     // 播放下一个粒子
    //     particles[currentIndex].resetSystem();
    //     // 0.5秒后继续下一个
    //     this.scheduleOnce(() => {
    //         this.playNextParticle();
    //     }, 0.5);
    // }


    // 显示奖励
    protected showBouns(bouns: Array<ItemVo>): void {

        let str = LanguageMgr.getInstance().getLang("txt_complete_tips");
        this.auto.txt_complete.string = cc.js.formatStr(str, this._resultData.passWave, this._resultData.maxWave);

        if (GameControl.getInstance().isTeamBaid()) {
            let waveNum = GameControl.getInstance().getPassInfo().data.waves.length;
            this.auto.txt_complete.string = cc.js.formatStr(str, this._resultData.passWave, waveNum);
        }
        let root = this.auto.bounsRoot;



        if (bouns.length > 5) {
            let layout = root.getComponent(cc.Layout);
            layout.enabled = true;
            layout.type = cc.Layout.Type.GRID;
            layout.paddingLeft = 10;
            layout.spacingX = 30;
            layout.spacingY = 10;
        }
        root.removeAllChildren();
        for (let i = 0; i < bouns.length; i++) {
            let item = cc.instantiate(this.awardItemPrefab);
            item.active = true;
            item.scale = 1.0;
            if (bouns.length <= 5) {
                item.y = -60;
            }
            root.addChild(item);
            let itemUI = item.getComponent(AwardItemNew);
            let iData: ItemVo = bouns[i];
            itemUI.initItem(iData);
            this.rBonus.push(iData);
        }
    }


    // 点击打开宝箱
    protected openGetx2(): void {
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (b) {
                this.getx2();
            }
        }, this, { scene: "button_result_getx3" });
    }

    // 打开宝箱
    protected getx2() {
        this.rMul = 2; // 奖励倍数
        this.closeSelf();
    }

    // 点击复活
    protected onRelifeClicked(): void {
        // this.unschedule(this.cdRelife);
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (b) {
                this.relifed = true;
                this.closeSelf({ r: true });
            } else {
                // this.schedule(this.cdRelife, 1, this._cdRelife, 0); // 重新开始倒计时
            }
        }, this, { scene: "buttom_battle6" });
    }

    public onAfterHide(params: any): void {
        // GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame);
        if (this.relifed) {
            let speed = this.rParams.speed;
            GameControl.getInstance().sceneBattle.setGameSpeed(speed);
            return;
        }
        /**最新关卡记录结果 */
        // if (this.isNewLv) {
        //     GameUserData.getInstance().recordResultOfBattle(this.gameResult);
        // }

        // 添加奖励
        let bouns: ItemVo[] = [];
        for (let i = 0; i < this.rBonus.length; i++) {
            let iData: ItemVo = this.rBonus[i];
            let vo = new ItemVo(iData.itemID, iData.num * this.rMul);
            bouns.push(vo)
            UserItemsData.getInstance().pushItem(iData.itemID, iData.num * this.rMul);

        }

        this._closePram.bouns = bouns;
        this._closePram.isNewLv = this._resultData.isNewLv && this._resultData.isWin;

        /**战斗期间的离线奖励 */
        // let nowTime = Utils.getNowSecondTime();
        // let lastTime = GameGlobalData.getInstance().lastGetAwardTime;
        // if (nowTime - lastTime >= 1 * 60 && GameVehicleData.getInstance().getJXBLevel() >= 1) {
        //     //有奖励
        //     let addAward = GameGlobalData.getInstance().calculateRevenue(2);
        //     console.log("战斗期间收集的物资:", addAward);
        //     addAward.forEach((itemInfo) => {
        //         UserItemsData.getInstance().pushItem(itemInfo.itemID, itemInfo.num);
        //     })
        // }
        // GameGlobalData.getInstance().refreshLastGetAwardTime();

        // ToastMgr.clearToasts(UIConfig.ui_flyView.prefabUrl);

        console.error("战斗结束,关闭战斗结果界面", this._closePram);
        FormMgr.open(UIConfig.scene_main, this._closePram, { loadingForm: UIConfig.ui_loading });

        let result = this.rParams;
        //- 1=直接获胜。2=复活后获胜。 3=直接失败（即不使用复活的机会）。 4=复活后失败。 5=放弃。
        //GameTrackHelp.getInstance().track_PassResult(result.passId, result.isNewLv, result.isWin, result.relifeCount, result.maxWave)
        let resultWin = 1;
        //     export type GameResultType = {
        // isWin: boolean,   //是否胜利
        // chestID: number,  //宝箱ID
        // relifeCount: number, //复活次数
        // relifeMaxCount: number, //最大复活次数
        // bouns: Array<ItemVo> //奖励  [id:count ...]
        // isNewLv?: boolean,//是否是最新关卡
        // passWave: number,//通关波数
        // maxWave: number,//最大波数
        // passId?: number,//通关关卡
        // videoWave: number[],//视频波数

        if (result.isWin && result.relifeCount == 0) {
            resultWin = 1;
        }
        if (result.isWin && result.relifeCount > 0) {
            resultWin = 2;
        }
        if (!result.isWin && result.relifeCount == 0) {
            resultWin = 3;
        }
        if (!result.isWin && result.relifeCount > 0) {
            resultWin = 4;
        }
        let isNew: 0 | 1 = (result.isNewLv) ? 1 : 0;

        GameTrackHelp.getInstance().track_PassResult(resultWin, result.passId, result.passWave, isNew);

        let passWave = result.passWave;
        let pKey = 'battleWave_frist'
        if (result.isWin) {
            passWave += 1;
            pKey = 'battleWave_second'
        }
        let videoTime = result.videoWave;
        GameTrackHelp.getInstance().track_PassWave(pKey, result.passId, passWave, videoTime)
    }

    // update (dt) {}
}

