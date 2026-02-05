

import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../config/ConfigMgr";
import { KvData } from "../config/DataDef";
import UIConfig from "../config/UIConfig";
import GameGlobalData from "../Data/GameGlobalData";
import GameUserData from "../Data/GameUserData";
import UserItemsData from "../Data/UserItemsData";
import LanguageMgr from "../lang/LanguageMgr";
import GameHelp from "../Mgr/GameHelp";
import GameTrackHelp from "../Mgr/GameTrackHelp";
import { eFlyAnimType, FlyViewParams } from "./FlyViewUI";
import MainPagePass from "./MainPagePass";
import UISceneMain from "./UISceneMain";

const { ccclass, property } = cc._decorator;

type eGemConfig = {
    max_day: number, // 每天最大购买次数
    cost_gem: number,  // 花费钻石
    energy: number      // 获得体力
}

type eVideoConfig = {
    max_day: number, // 每天最大观看次数
    energy: number     // 获得体力
}

@ccclass
export default class PopBuyEnergy extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btn_gem: ButtonPlus = null;

    @property(ButtonPlus)
    btn_video: ButtonPlus = null;

    @property(cc.Label)
    txt_gem_add: cc.Label = null;

    @property(cc.Label)
    txt_gem_tips: cc.Label = null;

    @property(cc.Label)
    txt_gem_btn: cc.Label = null;

    @property(cc.Label)
    txt_video_add: cc.Label = null;

    @property(cc.Label)
    txt_video_tips: cc.Label = null;

    @property(cc.Label)
    txt_video_btn: cc.Label = null;

    @property(cc.Node)
    tili1: cc.Node = null;

    @property(cc.Node)
    tili2: cc.Node = null;

    // @property(ButtonPlus)
    // btnExit: ButtonPlus = null;

    protected gemConfig: eGemConfig = null;
    protected videoConfig: eVideoConfig = null;

    modalType = new ModalType(ModalOpacity.OpacityHalf, true);
    closeType: ECloseType.CloseAndDestory;


    public onInit(params: any): void {
        super.onInit(params);

        this.btnClose.addClick(this.onBtnClicked, this);
        this.btn_gem.addClick(this.onBtnClicked, this);
        this.btn_video.addClick(this.onBtnClicked, this);
        // this.btnExit.addClick(this.onBtnClicked, this);

        let v = ConfigMgr.getInstance().getById(74, KvData).val.split(",");
        this.gemConfig = {
            max_day: parseInt(v[0]),
            cost_gem: parseInt(v[1]),
            energy: parseInt(v[2])
        }

        v = ConfigMgr.getInstance().getById(75, KvData).val.split(",");
        this.videoConfig = {
            max_day: parseInt(v[0]),
            energy: parseInt(v[1])
        }

        this.txt_gem_add.string = "+" + this.gemConfig.energy;
        this.txt_video_add.string = "+" + this.videoConfig.energy;

        this.txt_gem_btn.string = this.gemConfig.cost_gem.toString();
        //this.txt_video_btn.string = LanguageMgr.getInstance().getLang("get_energy_now");
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        } else if (evt.target == this.btn_gem.node) {
            this.onGemBtnClicked();
        } else if (evt.target == this.btn_video.node) {
            this.onVideoBtnClicked();
        }
    }

    protected onGemBtnClicked(): void {

        if (GameUserData.getInstance().lingshi < this.gemConfig.cost_gem) {
            let str = LanguageMgr.getInstance().getLang("diamond_notEnough")
            GameHelp.getInstance().showToast(str);
            return;
        }

        if (GameGlobalData.getInstance().getDailyData().gem_energy >= this.gemConfig.max_day) {
            let str = LanguageMgr.getInstance().getLang("get_energy_max")
            GameHelp.getInstance().showToast(str);
            return;
        }
        UserItemsData.getInstance().pushItem(4, -this.gemConfig.cost_gem)
        // GameUserData.getInstance().changeDiamond(-this.gemConfig.cost_gem);
        GameUserData.getInstance().changeEnergy(this.gemConfig.energy);
        GameGlobalData.getInstance().addDailyGemEnergy();
        GameTrackHelp.getInstance().track_button_physical_diamond();
        this.addSuiPianEffect(this.tili1)
        this.closeSelf();
        GameTrackHelp.getInstance().track_button_physical_diamond();
    }

    protected onVideoBtnClicked(): void {
        if (GameGlobalData.getInstance().getDailyData().video_energy >= this.gemConfig.max_day) {
            let str = LanguageMgr.getInstance().getLang("get_energy_max")
            GameHelp.getInstance().showToast(str);
            return;
        }

        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!b) {
                return;
            }
            GameUserData.getInstance().changeEnergy(this.videoConfig.energy);
            this.addSuiPianEffect(this.tili2)
            GameGlobalData.getInstance().addDailyVideoEnergy();
            this.closeSelf();
        }, this, { scene: "button_physical_adv" });

    }

    public onShow(params: any): void {
        this.refurshUI();
    }

    protected refurshUI(): void {
        let gDaily = this.gemConfig.max_day - GameGlobalData.getInstance().getDailyData().gem_energy;
        if (gDaily <= 0) {
            gDaily = 0;
        }
        this.txt_gem_tips.string = gDaily + "";

        let vDaily = this.videoConfig.max_day - GameGlobalData.getInstance().getDailyData().video_energy;
        if (vDaily <= 0) {
            vDaily = 0;
        }
        this.txt_video_tips.string = vDaily + "";
    }

    public onAfterHide(params: any): void {

    }

    // 飞icon动画
    public addSuiPianEffect(sIcon: cc.Node): FlyViewParams {
        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.curPage) {
            return;
        }
        // let passPage = main.curPage as MainPagePass;
        // if (!passPage.btn_energy) {
        //     return
        // }

        // let startPos = sIcon.parent.convertToWorldSpaceAR(sIcon.position);
        // let eIcon: cc.Node = passPage.btn_energy.node;
        // let endPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);
        // let node = cc.instantiate(sIcon);
        // let fp: FlyViewParams = {
        //     startPos: startPos,
        //     endPos: endPos,
        //     target: node,
        //     duration: 0.3,
        //     scale: [sIcon.scale, 0.5],
        //     blockInput: false, // 阻挡输入
        //     callBack: null,  // 回调
        //     animType: eFlyAnimType.Line
        // }
        // let list = [];
        // list.push(fp)
        // FormMgr.open(UIConfig.ui_flyView, list, { quick: true });
    }

    // update (dt) {}
}

