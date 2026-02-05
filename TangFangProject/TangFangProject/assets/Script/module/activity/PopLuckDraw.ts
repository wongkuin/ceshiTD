import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import AdapterMgr, { AdapterType } from "../../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { ActSkillData, KvData, SnowBossData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameActivityData from "../../Data/GameActivityData";
import { ItemVo } from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";
import AwardItemNew from "./AwardItemNew";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PopLuckDraw extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnWen: ButtonPlus = null;

    @property(ButtonPlus)
    btnStart: ButtonPlus = null;

    @property(ButtonPlus)
    btnRuleClose: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "当前关卡" })
    protected drawNumLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "倒计时" })
    protected djsTime: cc.Label = null;


    @property({ type: cc.ProgressBar, tooltip: "进度" })
    protected progressBar: cc.ProgressBar = null;


    @property({ type: cc.Node, tooltip: "奖励root" })
    protected awardRoot: cc.Node = null;


    @property({ type: cc.Node, tooltip: "任务" })
    protected ruleRoot: cc.Node = null;


    @property({ type: cc.Prefab, tooltip: "prefab" })
    protected awardItem: cc.Prefab = null;
    @property({ type: cc.Node, tooltip: "广告" })
    protected adNode: cc.Node = null;

    // @property({ type: cc.Node, tooltip: "广告" })
    // protected redDot: cc.Node = null;

    @property([cc.Node])
    cardList: cc.Node[] = [];

    @property([cc.Node])//手指
    fingerList: cc.Node[] = [];


    cardPosList: cc.Vec2[] = [cc.v2(-220, 292), cc.v2(220, 292), cc.v2(0, 70), cc.v2(-220, -124), cc.v2(220, -124)];



    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, false);

    /**脏标记 */
    dirtyFlag: boolean = false;

    _dt: number = 0;
    /**能否翻牌 */
    cardInteractable: boolean = false;
    /**能否洗牌 */
    drawInteractable: boolean = false;

    xzCard: cc.Node = null;
    needHuifu: boolean = false;

    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 15 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;
            this.initView();
        }
    }

    public onInit(params: any): void {
        super.onInit(params);
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        GameActivityData.getInstance().resetLuckDrewData();
        GameActivityData.getInstance().on(this.setDirtyFlag, this, nameof<GameActivityData>().drawNum);
        GameActivityData.getInstance().on(this.setDirtyFlag, this, nameof<GameActivityData>().drawRewardNum);
        GlobalEventMgr.getInstance().on(GlobalEventID.closeAwardPop, this.onCloseAwardPop, this);
        this.btnClose.addClick(this.closeSelf, this);
        this.btnWen.addClick(this.openRule, this);
        this.btnStart.addClick(this.onRestart, this);
        this.ruleRoot.getComponent(ButtonPlus).addClick(this.onCloseRule, this)
        this.btnRuleClose.addClick(this.onCloseRule, this)

    }

    onCloseAwardPop() {
        this.initProgress();
        this.huifu();
    }

    playFingerAni() {

        this.fingerList.forEach((item) => {
            cc.Tween.stopAllByTarget(item);
            item.setPosition(90, -124)
            cc.tween(item)
                .to(0.5, { x: 90 - 20, y: -124 + 40 })
                .to(0.5, { x: 90, y: -124 })
                .union()
                .repeatForever()
                .start()
        });

    }



    //  let list = [];
    //         for (let i = 0; i < zhekouCfg.length; i++) {
    //             var obj = { id: i+1 , weight: zhekouCfg[i] };
    //             list.push(obj);
    //         }
    //         let zhekou = Utils.getRandDataOfWeightObjectList(list).data.id;
    //         return zhekou;

    getCardAward(ind): string[] {
        let awardList = ConfigMgr.getInstance().getById(39, KvData).val.split(",");
        let list = [];
        for (let i = 0; i < awardList.length; i = i + 4) {
            if (GameActivityData.getInstance().cardStateList.indexOf(i) == -1) {
                var obj = { id: i, weight: parseInt(awardList[i]) };
                list.push(obj);
            }

        };
        let index = Utils.getRandDataOfWeightObjectList(list).data.id;
        GameActivityData.getInstance().cardStateList[ind] = index;

        return [awardList[index], awardList[index + 1], awardList[index + 2], awardList[index + 3]];
    }

    showNormalCard() {
        //8000,2,100,zs_2,1000,2,200,zs_2,800,2,300,zs_3,150,2,500,zs_4,50,2,800,zs_5
        let awardList = ConfigMgr.getInstance().getById(39, KvData).val.split(",");

        let sortAwardList = [];//随机取它
        for (let i = 0; i < awardList.length; i = i + 4) {
            if (GameActivityData.getInstance().cardStateList.indexOf(i) == -1) {
                sortAwardList.push(i);
            }

        };
        console.log("sortAwardList", sortAwardList);
        let isGaiPai = false
        for (let i = 0; i < this.cardList.length; i++) {
            let cardNode = this.cardList[i];
            let cardState = GameActivityData.getInstance().cardStateList[i];
            let root = cardNode.getChildByName("root");
            let finger = cardNode.getChildByName("guideFinger");
            finger.active = false;
            root.active = true;
            let icon = root.getChildByName("zs_2").getComponent(cc.Sprite);
            let labNum = root.getChildByName("startLab3").getComponent(cc.Label);
            let index = -1;
            if (cardState == -1) {
                let random = Random.range(0, sortAwardList.length - 1)
                index = sortAwardList[random];
                sortAwardList.splice(index, 1);
            } else {
                index = cardState;
            }

            cardNode.getChildByName("adNode").active = false;
            this.loadSpirteFrame(`texture/luckDraw/${awardList[index + 3]}`, icon, GameBundle.Bundle_Act);
            labNum.string = "x" + awardList[index + 2];
            cardNode.getChildByName("bg").active = true;
            cardNode.getChildByName("bg").getComponent(SpriteFrame).setFrameByIndex(1);
            cardNode.x = this.cardPosList[i].x;
            cardNode.y = this.cardPosList[i].y;
            cardNode.getComponent(ButtonPlus).addClick(this.onClickCard, this);

            if (cardState == -1) {
                isGaiPai = true;

                cc.tween(cardNode)
                    .delay(0.8)
                    .to(0.2, { scaleX: 0 })
                    .call(() => {
                        root.active = true;
                        cardNode.getChildByName("bg").getComponent(SpriteFrame).setFrameByIndex(0);
                        cardNode.getChildByName("adNode").active = !GameActivityData.getInstance().todayFreeDraw;
                        cardNode.getChildByName("root").active = false;
                    })
                    .to(0.2, { scaleX: 1 })
                    .delay(0.15)
                    .to(0.3, { x: this.cardPosList[2].x, y: this.cardPosList[2].y })
                    .to(0.3, { x: this.cardPosList[i].x, y: this.cardPosList[i].y })
                    .call(() => {
                        this.cardInteractable = true;
                        this.drawInteractable = true;
                        this.playFingerAni();
                        this.fingerList.forEach((item, i) => {
                            let state = GameActivityData.getInstance().cardStateList[i];
                            item.active = state == -1;
                        });
                        this.setStartBtnState();
                    }).start();
            }

            if (!isGaiPai) {
                this.cardInteractable = true;
                this.drawInteractable = true;
                this.playFingerAni();
                this.fingerList.forEach((item, i) => {
                    let state = GameActivityData.getInstance().cardStateList[i];
                    item.active = state == -1;
                });
                this.setStartBtnState();
            }

        }

    }
    /**洗牌 */
    xipai() {
        let hasFankai = false;
        for (let val of GameActivityData.getInstance().cardStateList) {
            if (val != -1) {
                hasFankai = true;
                break;
            }
        }
        this.cardInteractable = false;
        for (let i = 0; i < this.cardList.length; i++) {
            let cardNode = this.cardList[i];

            let cardState = GameActivityData.getInstance().cardStateList[i];
            let root = cardNode.getChildByName("root");
            let finger = cardNode.getChildByName("guideFinger");
            cardNode.getChildByName("bg").active = true;
            finger.active = false;

            cc.Tween.stopAllByTarget(cardNode);
            let delay = 0.5;
            if (!hasFankai) {
                delay = 0.2;
            }
            if (cardState > -1) {
                cc.tween(cardNode)
                    .to(0.2, { scaleX: 0 })
                    .call(() => {
                        root.active = false;
                        cardNode.getChildByName("bg").getComponent(SpriteFrame).setFrameByIndex(0);
                        cardNode.getChildByName("adNode").active = !GameActivityData.getInstance().todayFreeDraw;
                    })
                    .to(0.2, { scaleX: 1 })
                    .start();
            }
            console.error("delay", hasFankai, delay);
            cc.tween(cardNode)
                .delay(delay + 0.2)
                .call(() => {
                    GameActivityData.getInstance().resetStateList();
                })

                .to(0.3, { x: this.cardPosList[2].x, y: this.cardPosList[2].y })
                .to(0.3, { x: this.cardPosList[i].x, y: this.cardPosList[i].y })
                .delay(0.1)
                .call(() => {
                    let finger = cardNode.getChildByName("guideFinger");
                    finger.active = true;
                    this.playFingerAni();
                    this.cardInteractable = true;
                    this.drawInteractable = true;
                })
                .start();
        }

    }

    onRestart() {
        if (!this.drawInteractable) {
            return;
        }
        this.drawInteractable = true;
        this.xipai();
    }





    onClickCard(evt) {

        if (!this.cardInteractable) {
            return;
        }

        let index = -1;
        for (let i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i] == evt.target) {
                index = i;
                break;
            }
        }

        if (GameActivityData.getInstance().cardStateList[index] != -1) {
            return;
        }
        this.cardInteractable = false;
        this.drawInteractable = false;
        if (GameActivityData.getInstance().todayFreeDraw) {
            GameActivityData.getInstance().todayFreeDraw = false;
            this.showFanPaiResult(evt);
        } else {
            PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                if (!b) {
                    this.cardInteractable = true;
                    this.drawInteractable = true;
                }
                if (!cc.isValid(this) || !b) return;
                this.showFanPaiResult(evt);
            }, this, { scene: "fanpai" });
        }

    }

    showFanPaiResult(evt) {
        GameActivityData.getInstance().drawNum++;
        this.fingerList.forEach((item) => {
            item.active = false;
        });

        let cardNode = evt.target;
        let index = -1;
        for (let i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i] == evt.target) {
                index = i;
                break;
            }
        }




        this.xzCard = cardNode;
        let root = cardNode.getChildByName("root");
        cardNode.getChildByName("adNode").active = false;
        let icon = root.getChildByName("zs_2").getComponent(cc.Sprite);
        let labNum = root.getChildByName("startLab3").getComponent(cc.Label);
        let award = this.getCardAward(index);

        root.active = false;
        this.loadSpirteFrame(`texture/luckDraw/${award[3]}`, icon, GameBundle.Bundle_Act);
        labNum.string = "x" + award[2];


        cardNode.getChildByName("bg").active = false;
        cardNode.getChildByName("bg").getComponent(SpriteFrame).setFrameByIndex(1);
        let spine = cardNode.getChildByName("spine").getComponent(sp.Skeleton);
        spine.node.active = true
        spine.setAnimation(0, "animation", false);
        spine.setEventListener((trackEntry, event) => {
            if (event.data.name === "chuxian") {
                console.log("收到 Spine 自定义事件:", event.data.name);
                // 在这里处理自定义事件
                cardNode.getChildByName("bg").active = true;
                root.active = true;
                spine.setEventListener(null);

            }
        });

        spine.setCompleteListener((trackEntry) => {
            spine.node.active = false;
            spine.setCompleteListener(null);
            this.cardInteractable = true;
            this.drawInteractable = true;
            this.needHuifu = true;

            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: [{ itemID: parseInt(award[1]), num: parseInt(award[2]) }] });

        });

    }

    huifu() {
        if (!this.needHuifu || !cc.isValid(this.xzCard)) {
            return;

        }
        this.needHuifu = false;
        let root = this.xzCard.getChildByName("root");
        this.playFingerAni();
        this.fingerList.forEach((item, i) => {
            let state = GameActivityData.getInstance().cardStateList[i];
            item.active = state == -1;
        });

        for (let i = 0; i < this.cardList.length; i++) {
            let cardNode = this.cardList[i];
            cardNode.getChildByName("adNode").active = !GameActivityData.getInstance().todayFreeDraw;
            let state = GameActivityData.getInstance().cardStateList[i];
            if (state != -1) {
                cardNode.getChildByName("adNode").active = false;
            }
        }

    }


    setStartBtnState() {
        this.btnStart.node.active = true;//this.drawInteractable;
    }




    public onShow(params: any): void {
        super.onShow(params);
        this.playFingerAni();
        this.initView();
        // if (!GameActivityData.getInstance().getADButNoAward) {
        this.showNormalCard();
        // } else {
        //this.showDrewCard();
        // }
        this.setStartBtnState();


        // FormMgr.open(UIConfig.ui_game3in1);
    }
    onCloseRule() {
        this.ruleRoot.active = false;
    }

    openRule() {
        this.ruleRoot.active = true;
    }


    calcDJS() {
        let now = new Date().getTime();
        let tomorrow = this.getNextMondayMidnightTimestamp(now);

        let cha = Math.floor((tomorrow - now) / 1000);
        this.djsTime.string = "" + Utils.formatSecondsToDHMS(cha);
        if (cha < 0) {
            GameActivityData.getInstance().resetLuckDrewData();
        }
    }

    /**得到下一个星期 */
    getNextMondayMidnightTimestamp(currentTimestamp: number): number {
        const date = new Date(currentTimestamp);

        // 获取当前是星期几（0-6，0 是星期日，1 是星期一，...）
        const currentDay = date.getDay();

        // 计算距离下周一还有多少天
        let daysUntilNextMonday;
        if (currentDay === 1) { // 如果今天是周一
            daysUntilNextMonday = 7; // 直接跳到下周一
        } else {
            daysUntilNextMonday = (8 - currentDay) % 7; // 否则计算剩余天数
        }

        // 设置到下周一 0 点
        date.setDate(date.getDate() + daysUntilNextMonday);
        date.setHours(0, 0, 0, 0); // 时、分、秒、毫秒归零

        return date.getTime(); // 返回时间戳
    }




    initView() {
        this.calcDJS();
        this.schedule(this.calcDJS, 1);
        let drawNum = GameActivityData.getInstance().drawNum;
        this.drawNumLab.string = drawNum + "";
        this.btnStart.interactable = true;
        this.adNode.active = false;
        this.ruleRoot.active = false;
        this.initProgress();
        // this.redDot.active = GameActivityData.getInstance().todayFreeDraw;


    }





    caleProgressNum() {
        let drawNum = GameActivityData.getInstance().drawNum;
        let progressCfg = ConfigMgr.getInstance().getById(40, KvData).val.split(",").map((item) => {
            return parseInt(item);
        });
        let index = 0;
        let progressNum = 0;
        let length = progressCfg.length / 3;
        for (let i = 0; i < progressCfg.length; i = i + 3) {
            if (drawNum >= progressCfg[i]) {
                index++;
            } else {
                let cha = drawNum - (progressCfg[i - 3] || 0);
                progressNum = index / length + (cha) / (progressCfg[i] - (progressCfg[i - 3] || 0)) / length;
                break;
            }
            if (index == length) {
                progressNum = 1;
            }
        }
        console.warn("progressNum", progressNum);
        return progressNum;
    }




    initProgress() {
        let progressCfg = ConfigMgr.getInstance().getById(40, KvData).val.split(",").map((item) => {
            return parseInt(item);
        });
        console.log("progressCfg", progressCfg);

        this.awardRoot.children.forEach((item) => {
            item.active = false;
        });
        let drawNum = GameActivityData.getInstance().drawNum;
        let drawRewardNum = GameActivityData.getInstance().drawRewardNum;
        let length = this.progressBar.totalLength;
        this.progressBar.progress = this.caleProgressNum();
        for (let i = 0; i < progressCfg.length; i = i + 3) {
            let awardItem = this.awardRoot.children[i];
            if (!cc.isValid(awardItem)) {
                awardItem = cc.instantiate(this.awardItem);
                this.awardRoot.addChild(awardItem);
            }
            awardItem.active = true;
            awardItem.scale = 0.8;
            awardItem.x = (Math.floor(i / 3) + 1) / (progressCfg.length / 3) * length;
            let guang = drawNum >= progressCfg[i];
            awardItem.getComponent(AwardItemNew).initItem({ itemID: progressCfg[i + 1], num: progressCfg[i + 2] }, guang);
            awardItem.getComponent(AwardItemNew).setRedDot(guang);
            if (drawRewardNum >= progressCfg[i]) {
                awardItem.getComponent(AwardItemNew).setGetActive(true);
            }
            let sp = awardItem.getComponent(AwardItemNew);
            sp.setName(progressCfg[i] + "次抽奖");

            let btn = awardItem.getComponent(ButtonPlus);
            if (!btn) {
                btn = awardItem.addComponent(ButtonPlus);
            }
            awardItem["mobiao"] = progressCfg[i];
            btn.addClick(this.getAward, this)


        }
    }

    getAward(evt) {
        let node = evt.target;
        let mobiao = node["mobiao"];
        if (mobiao > GameActivityData.getInstance().drawNum) {
            GameHelp.getInstance().showToast("奖励暂未达成");
            return;
        }
        let awardList: ItemVo[] = [];
        let progressCfg = ConfigMgr.getInstance().getById(40, KvData).val.split(",").map((item) => {
            return parseInt(item);
        });
        let drawNum = GameActivityData.getInstance().drawNum;
        let drawRewardNum = GameActivityData.getInstance().drawRewardNum;
        for (let i = 0; i < progressCfg.length; i = i + 3) {

            if (drawNum >= progressCfg[i] && drawRewardNum < progressCfg[i]) {
                awardList.push({ itemID: progressCfg[i + 1], num: progressCfg[i + 2] });
                GameActivityData.getInstance().drawRewardNum = progressCfg[i];
            }
        }

        if (awardList.length > 0) {
            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: awardList });
        } else {
            GameHelp.getInstance().showToast("没有可领取的奖励");
        }

    }






}

