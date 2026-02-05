import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import List from "../../../TRFrameWork/Common/scrollview/List";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import AdapterMgr, { AdapterType } from "../../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { ActSkillData, SnowBossDamBounsData, SnowBossData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameBossInstanceData from "../../Data/GameBossInstanceData";
import { ItemVo } from "../../Data/UserItemsData";
import ApiMgr from "../../Mgr/ApiMgr";
import GameHelp from "../../Mgr/GameHelp";
import UISceneMain from "../../UI/UISceneMain";
import AwardItemNew from "../activity/AwardItemNew";
import SnowRankItem from "./SnowRankItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PopSnowBossInfo extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnWen: ButtonPlus = null;

    @property(ButtonPlus)
    btnStart: ButtonPlus = null;

    @property(ButtonPlus)
    btnSkillLoyout: ButtonPlus = null;
    @property(ButtonPlus)
    btnRuleClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnRank: ButtonPlus = null;




    @property({ type: cc.Label, tooltip: "当前关卡" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "倒计时" })
    protected djsTime: cc.Label = null;

    @property({ type: cc.Label, tooltip: "最高伤害" })
    protected maxHurtLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "startLab1" })
    protected startLab1: cc.Label = null;

    @property({ type: cc.Label, tooltip: "startLab2" })
    protected startLab2: cc.Label = null;

    @property({ type: cc.Label, tooltip: "startLab3" })
    protected startLab3: cc.Label = null;

    @property({ type: cc.Label, tooltip: "skillName" })
    protected skillName: cc.Label = null;

    @property({ type: cc.Label, tooltip: "skillDesc" })
    protected skillDesc: cc.Label = null;


    @property({ type: cc.ProgressBar, tooltip: "进度" })
    protected progressBar: cc.ProgressBar = null;

    @property({ type: cc.Node, tooltip: "jdtbar" })
    protected pgBar: cc.Node = null;

    @property({ type: cc.Node, tooltip: "adNode" })
    protected adNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "skillItem" })
    protected skillItem: cc.Node = null;


    @property({ type: cc.Node, tooltip: "奖励root" })
    protected awardRoot: cc.Node = null;


    @property({ type: cc.Node, tooltip: "奖励root" })
    protected skillRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "任务" })
    protected ruleRoot: cc.Node = null;


    @property({ type: cc.Prefab, tooltip: "prefab" })
    protected awardItem: cc.Prefab = null;

    //-------------------------------------

    @property({ type: cc.Node, tooltip: "排行榜root" })
    protected rankRoot: cc.Node = null;

    @property({ type: cc.Label, tooltip: "自己" })
    protected myRankNumLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "自己" })
    protected myRankhurtLab: cc.Label = null;

    @property({ type: List })
    rankList: List = null;



    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, false);

    public onInit(params: any): void {
        super.onInit(params);
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        GameBossInstanceData.getInstance().initData();
        GlobalEventMgr.getInstance().on(GlobalEventID.closeAwardPop, this.initProgress, this);
        this.btnClose.addClick(this.onClose, this);
        this.btnWen.addClick(this.openRule, this);
        this.btnStart.addClick(this.onStart, this);
        this.ruleRoot.getComponent(ButtonPlus).addClick(this.onCloseRule, this)
        this.btnRuleClose.addClick(this.onCloseRule, this)
        this.btnSkillLoyout.addClick(this.onHideSkillLoyout, this);
        this.btnRank.addClick(this.onOpenRank, this)
        GlobalEventMgr.getInstance().on(GlobalEventID.getSownRankData, this.onGetRankData, this)
        this.rankRoot.active = false;
        ApiMgr.getInstance().getSnowRankInfoEx();
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

    onHideSkillLoyout() {
        this.btnSkillLoyout.node.active = false;
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

    initView() {
        this.calcDJS();
        this.schedule(this.calcDJS, 1);
        let freeNum = parseInt(ConfigMgr.getInstance().getById(1, SnowBossData).val);
        let adNum = parseInt(ConfigMgr.getInstance().getById(2, SnowBossData).val);
        let playNum = GameBossInstanceData.getInstance().snowPlayNum;
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
        this.skillItem.active = false;
        this.btnSkillLoyout.node.active = false;
        this.ruleRoot.active = false;
        this.initProgress();
        this.initSkill();

    }

    initSkill() {
        this.skillRoot.removeAllChildren();
        let skillData = ConfigMgr.getInstance().getById(8, SnowBossData).val.split(",").map((item) => {
            return parseInt(item);
        });
        for (let i = 0; i < skillData.length; i++) {
            let skillItem = cc.instantiate(this.skillItem);
            skillItem.active = true;
            skillItem.x = 0;
            skillItem["skillId"] = skillData[i];
            let skillVo = ConfigMgr.getInstance().getById(skillData[i], ActSkillData);
            this.loadSpirteFrame(`ItemIcon/${skillVo.icon}`, skillItem.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
            let btn = skillItem.getComponent(ButtonPlus);
            this.addClickSkill(btn);
            this.skillRoot.addChild(skillItem);
        }
    }

    addClickSkill(btn) {
        this.scheduleOnce(() => {
            btn.addClick(this.clickSkill, this)
        })

    }

    caleProgressNum() {

        let snowMaxHurt = GameBossInstanceData.getInstance().snowMaxHurt;
        let progressCfg: SnowBossDamBounsData[] = ConfigMgr.getInstance().getAll(SnowBossDamBounsData)
        let index = 0;
        let progressNum = 0;
        let length = progressCfg.length - 1;
        for (let i = 0; i < progressCfg.length; i++) {
            if (snowMaxHurt >= progressCfg[i].dam) {
                index++;
            } else if (index == 0) {
                let progressNum = 0;
            } else {
                let cha = snowMaxHurt - (progressCfg[i - 1]?.dam || 0);
                progressNum = (index - 1) / length + (cha) / (progressCfg[i].dam - (progressCfg[i - 1]?.dam || 0)) / length;
                break;
            }
            if (index == length) {
                progressNum = 1;
            }

        }


        return progressNum;


    }

    getHurtLab(hurt: number, xiaoshu: number = 1): string {
        let str = "";
        if (hurt >= 10000 && hurt < 100000000) {
            let num = hurt % 10000;
            if (num > 0) {
                str = (hurt / 10000).toFixed(1) + "万";
            } else {
                str = (hurt / 10000).toFixed(0) + "万";
            }
        } else if (hurt > 100000000) {
            str = (hurt / 100000000).toFixed(xiaoshu) + "亿";
        } else {
            str = hurt + "";
        }

        return str;
    }


    initProgress() {

        let progressCfg: SnowBossDamBounsData[] = ConfigMgr.getInstance().getAll(SnowBossDamBounsData)
        // let progressCfg = ConfigMgr.getInstance().getById(3, SnowBossData).val.split(",").map((item) => {
        //     return parseInt(item);
        // });
        let cfgNum = progressCfg.length - 1;
        let length = Math.max(cfgNum * 180, 587);
        this.pgBar.width = length;
        this.progressBar.node.width = length + 7;
        this.awardRoot.removeAllChildren();
        let snowRewardHurt = GameBossInstanceData.getInstance().snowRewardHurt;
        let snowMaxHurt = GameBossInstanceData.getInstance().snowMaxHurt;
        this.maxHurtLab.string = "最高伤害:" + this.getHurtLab(snowMaxHurt) + "";
        this.progressBar.totalLength = length;
        this.progressBar.progress = this.caleProgressNum();
        for (let i = 0; i < progressCfg.length; i++) {
            let awardItem = cc.instantiate(this.awardItem);
            awardItem.scale = 0.8;
            awardItem.x = (i) / (progressCfg.length - 1) * length;
            let guang = snowMaxHurt >= progressCfg[i].dam;

            awardItem.getComponent(AwardItemNew).initItem({ itemID: progressCfg[i].preview[0], num: progressCfg[i].preview[1] }, guang);
            awardItem.getComponent(AwardItemNew).setRedDot(guang);
            this.awardRoot.addChild(awardItem);
            if (snowRewardHurt >= progressCfg[i].dam) {
                awardItem.getComponent(AwardItemNew).setGetActive(true);
            }
            let sp = awardItem.getComponent(AwardItemNew);
            sp.setName(this.getHurtLab(progressCfg[i].dam, 0) + "伤害");
            awardItem["mobiao"] = progressCfg[i].dam;

            let btn = awardItem.addComponent(ButtonPlus);
            btn.addClick(this.getAward, this)


        }
    }

    getAward(evt) {
        let node = evt.target;
        let mobiao = node["mobiao"];
        if (mobiao > GameBossInstanceData.getInstance().snowMaxHurt) {
            GameHelp.getInstance().showToast("奖励暂未达成");
            return;
        }
        let awardList: ItemVo[] = [];
        let progressCfg: SnowBossDamBounsData[] = ConfigMgr.getInstance().getAll(SnowBossDamBounsData)
        let snowRewardHurt = GameBossInstanceData.getInstance().snowRewardHurt;
        let snowMaxHurt = GameBossInstanceData.getInstance().snowMaxHurt;
        for (let i = 0; i < progressCfg.length; i++) {

            if (snowMaxHurt >= progressCfg[i].dam && snowRewardHurt < progressCfg[i].dam) {
                //awardList.push({ itemID: progressCfg[i + 1], num: progressCfg[i + 2] });

                let bouns1 = progressCfg[i].bouns1;
                for (let i = 0; i < bouns1.length; i = i + 2) {
                    awardList.push({ itemID: bouns1[i], num: bouns1[i + 1] });
                }
                let bouns2 = progressCfg[i].bouns2;
                if (bouns2.length > 0) {
                    let award = GameHelp.getInstance().getDataList(bouns2[0], bouns2[1])
                    awardList = awardList.concat(award);
                }



                GameBossInstanceData.getInstance().snowRewardHurt = progressCfg[i].dam;
            }
        }

        if (awardList.length > 0) {
            awardList = GameHelp.getInstance().arrangeAwardList(awardList);
            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: awardList });
        } else {
            GameHelp.getInstance().showToast("没有可领取的奖励");
        }

    }

    clickSkill(evt) {
        let btnItem = evt.target;
        let skillId = btnItem["skillId"];
        this.btnSkillLoyout.node.active = true;
        let skillVo = ConfigMgr.getInstance().getById(skillId, ActSkillData);
        this.skillName.string = skillVo.name;
        this.skillDesc.string = skillVo.note;
        this.skillName.node.parent.y = btnItem.y + 290;

    }

    onStart() {
        let freeNum = parseInt(ConfigMgr.getInstance().getById(1, SnowBossData).val);
        let adNum = parseInt(ConfigMgr.getInstance().getById(2, SnowBossData).val);
        let playNum = GameBossInstanceData.getInstance().snowPlayNum;

        if (playNum < freeNum) {
            this.startGame();
        } else if (playNum < (freeNum + adNum)) {
            PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                if (!cc.isValid(this) || !b) return;
                this.startGame();
            }, this, { scene: "snow_boss_startAD" });
        }
    }

    startGame() {
        GameBossInstanceData.getInstance().snowPlayNum++;
        GameHelp.getInstance().goToBattleWordBoss(1001);
    }



    onGetRankData(data) {
        this.rankData = data;
        this.curDatas = data.ranks;
        this.rankRoot.active = true;
        this.rankList.numItems = this.curDatas.length;
        this.myRankhurtLab.string = this.getHurtLab(this.rankData?.selfRank?.score || 0);
        this.myRankNumLab.string = this.rankData?.selfRank?.rank || "未上榜" + "";
    }

    rankData
    curDatas
    protected onRenderEvent(item: cc.Node, index: number) {

        let data = this.curDatas[index];
        item.getComponent(SnowRankItem).initItem(data);


    }

    onOpenRank() {
        FormMgr.open(UIConfig.ui_PopHurtRank, { rankData: this.rankData })
    }


}

