

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import SwitchBtn from "../../TRFrameWork/Common/Components/SwitchButton";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import GameControl from "../Battle/GameControl";
import UIConfig from "../config/UIConfig";
import GameGlobalData from "../Data/GameGlobalData";
import GameTrackHelp from "../Mgr/GameTrackHelp";
import UISceneMain from "./UISceneMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopGamePause extends UIWindow {

    @property(ButtonPlus)
    btnContinue: ButtonPlus = null;

    @property(ButtonPlus)
    btnExit: ButtonPlus = null;

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;


    @property(SwitchBtn)
    btnMusic: SwitchBtn = null;

    @property(SwitchBtn)
    btnEffect: SwitchBtn = null;

    @property(SwitchBtn)
    btnShock: SwitchBtn = null;


    // @property(cc.Label)
    // txt_msg: cc.Label = null;

    modalType = new ModalType(ModalOpacity.OpacityHalf, true);
    battleScene: string = ""

    public onInit(params: any): void {
        super.onInit(params);

        this.btnContinue.addClick(this.onBtnClicked, this);
        this.btnExit.addClick(this.onBtnClicked, this);
        this.btnClose.addClick(this.onBtnClicked, this);
    }

    onBtnMusic(isOpen) {
        GameGlobalData.getInstance().musicEnabled = isOpen;
        if (isOpen) {
            if (this.params?.target == "hall") {
                let main = SceneMgr.getCurrScene() as UISceneMain;
                main?.playBgMusic && main.playBgMusic();
            } else {
                let main = GameControl.getInstance().sceneBattle;//SceneMgr.getCurrScene() as UISceneBattle;
                main?.playBgMusic && main.playBgMusic();
            }
        } else {
            SoundMgr.getInstance().stopMusic();
        }
    }

    onBtnEffect(isOpen) {
        GameGlobalData.getInstance().effectEnabled = isOpen;
    }

    onBtnShock(isOpen) {
        GameGlobalData.getInstance().shockEnabled = isOpen;
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnContinue.node) {
            this.closeSelf();
        } else if (evt.target == this.btnExit.node) {
            this.onExitClicked();
        } else if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }


    public onExitClicked(): void {

        let data = { r: false }
        if (this.battleScene == "WBBattle") {
            data.r = true;
            this.closeSelf(data);
            return;
        }

        this.closeSelf();
        FormMgr.open(UIConfig.scene_main, { battleScene: this.battleScene }, { loadingForm: UIConfig.ui_loading });
    }

    result: any = null;
    params: any;
    public onShow(params: any): void {
        console.warn("PopGamePause onShow pauseGame");
        if (params?.battleScene != "TeamBattle") {
            GlobalEventMgr.getInstance().emit(GlobalEventID.pauseGame);
        }
        this.btnMusic.init(GameGlobalData.getInstance().musicEnabled, this.onBtnMusic.bind(this))
        this.btnEffect.init(GameGlobalData.getInstance().effectEnabled, this.onBtnEffect.bind(this))
        this.btnShock.init(GameGlobalData.getInstance().shockEnabled, this.onBtnShock.bind(this))
        this.params = params;
        if (params?.target == "hall") {
            this.btnContinue.node.active = false;
            this.btnExit.node.active = false;
        } else {
            this.btnContinue.node.active = true;
            const id = GameControl.getInstance().getPassInfo()?.data?.id || 1;
            this.btnExit.node.active = (id != 1);
        }

        if (params?.result) {
            this.result = params.result;
        }
        this.battleScene = "";
        if (params?.battleScene) {
            this.battleScene = params.battleScene;

        }


    }

    public onAfterHide(params: any): void {
        console.warn("PopGamePause onAfterHide resumeGame");
        if (this.battleScene != "TeamBattle") {
            GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame);
        }

        return;
        if (this.result) {

            let isNew: 0 | 1 = (this.result.isNewLv) ? 1 : 0;

            let resultWin = 5;

            GameTrackHelp.getInstance().track_PassResult(resultWin, this.result.passId, this.result.maxWave, isNew);

            let passWave = this.result.passWave;
            let pKey = 'battleWave_frist'
            // if (this.result.isWin) {
            //     passWave += 1;
            //     pKey = 'battleWave_second'
            // }
            let videoTime = this.result.videoWave;
            GameTrackHelp.getInstance().track_PassWave(pKey, this.result.passId, passWave, videoTime)
        }
    }

    // update (dt) {}
}

