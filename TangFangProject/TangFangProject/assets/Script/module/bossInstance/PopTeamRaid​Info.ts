import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import Random from "../../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import AdapterMgr, { AdapterType } from "../../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { TeamCopyKvData, TeamCopyDailyData, WapenTableData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import GameBossInstanceData from "../../Data/GameBossInstanceData";
import GameHelp from "../../Mgr/GameHelp";
import UISceneMain from "../../UI/UISceneMain";




const { ccclass, property } = cc._decorator;

@ccclass
export default class PopTeamRaidInfo extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnWen: ButtonPlus = null;

    @property(ButtonPlus)
    btnStart: ButtonPlus = null;


    @property(ButtonPlus)
    btnRuleClose: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "当前关卡" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "倒计时" })
    protected djsTime: cc.Label = null;


    @property({ type: cc.Label, tooltip: "startLab1" })
    protected startLab1: cc.Label = null;

    @property({ type: cc.Label, tooltip: "startLab2" })
    protected startLab2: cc.Label = null;

    @property({ type: cc.Label, tooltip: "startLab3" })
    protected startLab3: cc.Label = null;

    @property({ type: cc.Node, tooltip: "adNode" })
    protected adNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "任务" })
    protected ruleRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "武器root" })
    protected wapenRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "武器" })
    protected wapenItem: cc.Node = null;



    @property({ type: cc.Prefab, tooltip: "prefab" })
    protected awardItem: cc.Prefab = null;

    //--------------------------------------------

    @property({ type: cc.Node, tooltip: "user1" })
    protected user1: cc.Node = null;

    @property({ type: cc.Node, tooltip: "user2" })
    protected user2: cc.Node = null;

    @property({ type: cc.Node, tooltip: "hyNode" })
    protected hyNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "" })
    protected loadPointNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "" })
    protected successNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "" })
    protected guangNode: cc.Node = null;

    @property({ type: cc.Label, tooltip: "" })
    protected fightDJS: cc.Label = null;


    @property(ButtonPlus)
    btn_qxpp: ButtonPlus = null;


    @property({ type: cc.Label, tooltip: "" })
    protected jsLab: cc.Label = null;


    @property({ type: cc.Label, tooltip: "" })
    protected woNameNode: cc.Label = null;

    @property({ type: cc.Label, tooltip: "" })
    protected teamNameNode: cc.Label = null;

    @property({ type: cc.Node, tooltip: "" })
    protected wenHaoNode: cc.Node = null;








    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, false);

    teamerId: number = 0;

    public onInit(params: any): void {
        super.onInit(params);
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        GameBossInstanceData.getInstance().initData();
        //  GlobalEventMgr.getInstance().on(GlobalEventID.closeAwardPop, this.initProgress, this);
        this.btnClose.addClick(this.onClose, this);
        this.btnWen.addClick(this.openRule, this);
        this.btnStart.addClick(this.onStart, this);
        this.btn_qxpp.addClick(this.onQxpp, this);
        this.ruleRoot.getComponent(ButtonPlus).addClick(this.onCloseRule, this)
        this.btnRuleClose.addClick(this.onCloseRule, this)

    }

    onClose() {

        let scene = SceneMgr.getCurrScene() as UISceneMain;
        scene.showTabRelic();
        this.closeSelf();
    }




    public onShow(params: any): void {
        super.onShow(params);
        // GameBossInstanceData.getInstance().snowMaxHurt= 210000;
        this.initView();

        // FormMgr.open(UIConfig.ui_game3in1);
    }
    onCloseRule() {
        this.ruleRoot.active = false;
    }

    openRule() {
        this.ruleRoot.active = true;
    }



    calcDJS() {
        let tomorrow = this.getTomorrow();
        let now = new Date().getTime();
        let cha = Math.floor((tomorrow - now) / 1000);
        this.djsTime.string = "刷新倒计时:" + Utils.getTimeFormatClock(cha);
        if (cha <= 0) {
            GameBossInstanceData.getInstance().initData();
        }
    }

    getTomorrow() {
        let now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1); // 加 1 天
        tomorrow.setHours(0, 0, 0, 0); // 时、分、秒、毫秒归零

        // 获取时间戳（毫秒）
        const timestamp = tomorrow.getTime();
        return timestamp;
    }

    initPlayNum() {
        let numList = ConfigMgr.getInstance().getById(1, TeamCopyKvData).val.split(",").map((item) => {
            return parseInt(item);
        });

        let freeNum = numList[0];
        let adNum = numList[1];
        let playNum = GameBossInstanceData.getInstance().teamRaidPlayNum;
        Utils.setAllChildrenSpGray(this.btnStart.node, false);
        this.btnStart.interactable = true;
        if (playNum < freeNum) {
            this.adNode.active = false;
            this.startLab1.string = "剩余免费次数";
            this.startLab2.string = (freeNum - playNum) + "";
            this.startLab2.node.color = cc.Color.GREEN;
            this.startLab3.string = "/" + freeNum;
        } else if (playNum < (freeNum + adNum)) {
            this.adNode.active = true;
            this.startLab1.string = "剩余广告免费次数";
            this.startLab2.string = (adNum + freeNum - playNum) + "";
            this.startLab2.node.color = cc.Color.GREEN;
            this.startLab3.string = "/" + adNum;
        } else if (playNum >= (freeNum + adNum)) {
            this.adNode.active = true;
            this.startLab1.string = "剩余广告免费次数";
            this.startLab2.string = (0) + "";
            this.startLab2.node.color = cc.Color.RED;
            Utils.setAllChildrenSpGray(this.btnStart.node, true);
            this.btnStart.interactable = false;
            this.startLab3.string = "/" + adNum;
        }
    }

    initView() {
        this.calcDJS();
        this.schedule(this.calcDJS, 1);
        this.loadPointNode.parent.active = false;
        this.initPlayNum();


        this.ruleRoot.active = false;
        // this.initProgress();
        this.initWapen();

        this.initUser();

    }

    initWapen() {
        this.wapenRoot.removeAllChildren();
        let day = new Date().getDate();
        let wapenData = ConfigMgr.getInstance().getById(day, TeamCopyDailyData).weaponAdd.split(",").map((item) => {
            return parseInt(item);
        });
        for (let i = 0; i < wapenData.length; i = i + 3) {
            let wapenItem = cc.instantiate(this.wapenItem);
            wapenItem.active = true;

            let wapenCfg = ConfigMgr.getInstance().getById(wapenData[i], WapenTableData);
            let bg = wapenItem.getChildByName("bg").getComponent(cc.Sprite);
            this.loadSpirteFrame(`ItemIcon/itemBg${wapenData[i + 2]}`, bg, GameBundle.Bundle_commonRes);
            let name = wapenItem.getChildByName("wapenName").getComponent(cc.Label);
            name.string = "伤害+" + wapenData[i + 1] + "%";
            let icon = wapenItem.getChildByName("icon").getComponent(cc.Sprite);
            this.loadSpirteFrame(`wapen/${wapenCfg.img}`, icon, GameBundle.Bundle_commonRes);
            // let btn = wapenItem.getComponent(ButtonPlus);
            // this.addClickSkill(btn);
            this.wapenRoot.addChild(wapenItem);
        }
    }

    // addClickSkill(btn) {
    //     this.scheduleOnce(() => {
    //         btn.addClick(this.clickSkill, this)
    //     })

    // }
    // clickSkill(evt) {
    //     let btnItem = evt.target;
    //     let skillId = btnItem["skillId"];

    //     let skillVo = ConfigMgr.getInstance().getById(skillId, ActSkillData);
    //     // this.skillName.string = skillVo.name;
    //     // this.skillDesc.string = skillVo.note;
    //     // this.skillName.node.parent.y = btnItem.y + 290;

    // }

    onStart() {
        let numList = ConfigMgr.getInstance().getById(1, TeamCopyKvData).val.split(",").map((item) => {
            return parseInt(item);
        });

        let freeNum = numList[0];
        let adNum = numList[1];
        let playNum = GameBossInstanceData.getInstance().teamRaidPlayNum;

        if (playNum < freeNum) {
            this.showLoading();
        } else if (playNum < (freeNum + adNum)) {
            PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                if (!cc.isValid(this) || !b) return;
                this.showLoading();
            }, this, { scene: "snow_boss_startAD" });
        }
    }

    onQxpp() {
        this.loadPointNode.active = false;
        this.loadPointNode.parent.active = false;
        this.successNode.active = false;
        this.hyNode.getComponent(SpriteFrame).setFrameByIndex(0);
        this.unscheduleAllCallbacks();
        this.btn_qxpp.node.active = false;
    }

    startGame() {
        GameHelp.getInstance().goToBattleTeam(1002, this.teamerId);
    }

    initUser() {
        this.woNameNode.node.active = false;
        this.teamNameNode.node.active = false;
    }

    playTeamerSpine() {

        let spine = this.user2.getComponentInChildren(sp.Skeleton);
        spine.node.active = true;
        let spineName = "hero_0" + this.teamerId;
        SceneMgr.getCurrScene().loadRes(`spine/${spineName}`, sp.SkeletonData, GameBundle.Bundle_Stick).then((res: sp.SkeletonData) => {
            if (cc.isValid(spine.node) && res) {
                let spCom: any = spine;
                spCom.skeletonData = res;
                spCom.setAnimation(0, "idle", true);
            }
        });

    }

    private dotIndex = 0;
    private runLoadPoint(): void {
        const n = this.loadPointNode.children[this.dotIndex % this.loadPointNode.children.length];
        this.dotIndex++;
        cc.tween(n)
            .by(0.1, { y: 10 })
            .by(0.1, { y: -10 })
            .call(() => this.runLoadPoint())
            .start();
    }

    showLoading() {
        this.loadPointNode.active = true;
        this.loadPointNode.parent.active = true;
        this.successNode.active = false;
        this.btn_qxpp.node.active = true;
        this.unschedule(this.showHdNode);
        this.schedule(this.showHdNode, 0.1);
        this.ppjs = 0;
        this.jsLab.string = Utils.getTimeFormatClock(this.ppjs, false);
        this.schedule(this.onPPjs, 1);
        this.runLoadPoint();
        this.scheduleOnce(() => {
            this.showSuccessState();
        }, Random.range(3, 6))
    }
    hdIndex = 0;
    showHdNode() {
        this.hyNode.active = true;
        this.hyNode.getComponent(SpriteFrame).setFrameByIndex(this.hdIndex);
        this.hdIndex++;
        if (this.hdIndex >= 4) {
            this.hdIndex = 0;
        }

    }

    onPPjs() {
        this.ppjs++;
        this.jsLab.string = Utils.getTimeFormatClock(this.ppjs, false);
    }

    showSuccessState() {
        this.wenHaoNode.active = false;
        this.woNameNode.node.active = true;
        this.teamNameNode.node.active = true;
        this.unschedule(this.showHdNode);
        this.hyNode.active = false;
        this.teamerId = Random.range(1, 4);
        this.playTeamerSpine();
        GameBossInstanceData.getInstance().teamRaidPlayNum++;
        this.initPlayNum();
        this.loadPointNode.active = false;
        this.successNode.parent.active = true;
        this.successNode.scale = 0.1;
        this.successNode.active = true;
        cc.tween(this.successNode)
            .to(0.2, { scale: 1 })
            .start();
        this.playGuangAni(this.guangNode);
        this.showSuccessDJS()
    }
    ppjs: number = 0;
    successTime
    showSuccessDJS() {
        this.jsLab.node.active = false;
        this.btn_qxpp.node.active = false;
        this.successTime = 5;
        this.fightDJS.string = this.successTime.toString() + "秒后自动进入";
        this.schedule(() => {
            this.successTime--;
            this.fightDJS.string = this.successTime.toString() + "秒后自动进入";
            if (this.successTime <= 0) {
                this.startGame();
                this.unscheduleAllCallbacks();
            }
        }, 1, 4)

    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }
}

