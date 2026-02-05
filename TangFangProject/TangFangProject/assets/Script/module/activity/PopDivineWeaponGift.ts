import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { ArtifactGiftPackData, DailyGiftPackData, ItemBaseData } from "../../config/DataDef";
import UIConfig from "../../config/UIConfig";
import GameActivityData from "../../Data/GameActivityData";
import GameUserData from "../../Data/GameUserData";
import { ItemVo } from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";
import AwardItemNew from "./AwardItemNew";
import DailyGiftPackItem from "./DailyGiftPackItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PopDivineWeaponGift extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "当前关卡" })
    protected djsLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "奖励root" })
    protected content: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "奖励" })
    protected giftItem: cc.Prefab = null;


    @property({ type: cc.Button })
    btnDay1: cc.Button = null;

    @property({ type: cc.Button })
    btnDay2: cc.Button = null;

    @property({ type: cc.Button })
    btnDay3: cc.Button = null;


    @property({ type: cc.Button })
    btnGet: cc.Button = null;

    @property({ type: sp.Skeleton })
    spine: sp.Skeleton = null;

    @property({ type: cc.Node, tooltip: "按钮广告" })
    protected adNode: cc.Node = null;

    @property({ type: cc.Label, tooltip: "按钮文字" })
    protected btnLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "tips1" })
    protected tips1: cc.Label = null;

    @property({ type: cc.Label, tooltip: "tips2" })
    protected tips2: cc.Label = null;



    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, false);
    choiceBtn = 1;
    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onBtnClicked, this);


        this.btnDay1.node.on("click", this.onDay1, this)
        this.btnDay2.node.on("click", this.onDay2, this)
        this.btnDay3.node.on("click", this.onDay3, this)

        this.btnGet.node.on("click", this.onClickBtnGet, this)


        GameActivityData.getInstance().on(this.initView, this, nameof<GameActivityData>().dailyGiftIndex);

    }

    setBtnState() {

        this.btnDay1.node.getChildByName("Background").active = this.choiceBtn == 1;
        this.btnDay2.node.getChildByName("Background").active = this.choiceBtn == 2;
        this.btnDay3.node.getChildByName("Background").active = this.choiceBtn == 3;
    }

    onDay1() {
        if (this.choiceBtn == 1) {
            return;
        }
        this.choiceBtn = 1;

        this.setBtnState();
        this.initAward();
    }

    onDay2() {
        if (this.choiceBtn == 2) {
            return;
        }
        this.choiceBtn = 2;

        this.setBtnState();
        this.initAward();


    }

    onDay3() {
        if (this.choiceBtn == 3) {
            return;
        }
        this.choiceBtn = 3;

        this.setBtnState();
        this.initAward();
    }


    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }



    public onShow(params: any): void {
        super.onShow(params);
        this.choiceBtn = Math.min(3,GameActivityData.getInstance().divineWeaponGiftGetNum+1);
        this.initView();

    }

    initAward() {
        this.refreshBtnState();
        this.content.children.forEach((item) => {
            item.active = false;
        })
        let preview = ConfigMgr.getInstance().getById(this.choiceBtn, ArtifactGiftPackData).preview;
        for (let i = 0; i < preview.length; i = i + 2) {
            let item = this.content.children[i];
            if (!cc.isValid(item)) {
                item = cc.instantiate(this.giftItem);
                this.content.addChild(item);
            }
            item.active = true;
            item.getComponent(AwardItemNew).initItem({ itemID: preview[i], num: preview[i + 1] });
            let data = ConfigMgr.getInstance().getById(preview[i], ItemBaseData);
            item.getComponent(AwardItemNew).setName(data.name, cc.color().fromHEX("#FFC644"));
            item.getComponent(AwardItemNew).setBg(5);
        }
    }



    initView() {
        this.setBtnState();
        this.spine.node.active = false;
        this.scheduleOnce(() => {
            this.spine.node.active = true;
            this.spine.setAnimation(0, "anim_01", false);
            this.spine.addAnimation(0, "anim_02", true);
        }, 0.4)

        // this.spine.addAnimation(0, "anim_02", true);
        this.initAward();


    }

    refreshBtnState() {

        let data = ConfigMgr.getInstance().getById(this.choiceBtn, ArtifactGiftPackData);
        this.tips1.string = `通关第${data.unlock}关后`
        this.tips2.string = `看广告可领取第${this.choiceBtn}天奖励`;
        let getNum = GameActivityData.getInstance().divineWeaponGiftGetNum;
        let time = new Date().valueOf();
        let getTime = GameActivityData.getInstance().divineWeaponGiftGetTime;
        if (this.choiceBtn - 1 < getNum) {//已领
            Utils.setAllChildrenSpGray(this.btnGet.node, true);
            this.adNode.active = false;
            this.btnLab.string = "已领取";
            return;
        }
        if (Utils.isSameDay(time, getTime)) {
            Utils.setAllChildrenSpGray(this.btnGet.node, true);
            this.adNode.active = true;
            this.btnLab.string = "立即领取";
            return;
        }

        if (this.choiceBtn - 1 > getNum) {//今日不能领,美刀日期
            Utils.setAllChildrenSpGray(this.btnGet.node, true);
            this.adNode.active = true;
            this.btnLab.string = "立即领取";
        }



        if (this.choiceBtn - 1 == getNum) {//准备领取
            Utils.setAllChildrenSpGray(this.btnGet.node, false);
            this.adNode.active = true;
            this.btnLab.string = "可领取";
            if (GameUserData.getInstance().lastPassLv - 1 < data.unlock) {
                this.btnLab.string = "立即领取";
            }
        }


    }

    onClickBtnGet() {
        let data = ConfigMgr.getInstance().getById(this.choiceBtn, ArtifactGiftPackData);
        let getNum = GameActivityData.getInstance().divineWeaponGiftGetNum;
        let time = new Date().valueOf();
        let getTime = GameActivityData.getInstance().divineWeaponGiftGetTime;
        if (this.choiceBtn - 1 < getNum) {//已领
            return;
        }
        if (Utils.isSameDay(time, getTime)) {
            GameHelp.getInstance().showToast("未到领取时间")
            return;
        }

        if (this.choiceBtn - 1 > getNum) {//今日不能领,美刀日期
            GameHelp.getInstance().showToast("未到领取时间")
            return;
        }
        if (this.choiceBtn - 1 == getNum) {//今日是领取日期可领
            if (GameUserData.getInstance().lastPassLv - 1 < data.unlock) {
                GameHelp.getInstance().showToast(`通过第${data.unlock}关后可领取`);
                return;
            } else {//看广告
                PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                    if (!cc.isValid(this) || !b) return;
                    this.getAward();
                }, this, { scene: "divineWeapon" });
            }
        }


    }

    getAward() {
        let data = ConfigMgr.getInstance().getById(this.choiceBtn, ArtifactGiftPackData);
        let bouns1 = data.bouns1;
        let awardList: ItemVo[] = [];
        for (let i = 0; i < bouns1.length; i = i + 2) {
            awardList.push({ itemID: bouns1[i], num: bouns1[i + 1] });
        }
        let bouns2 = data.bouns2;
        if (bouns2.length > 0) {
            let award = GameHelp.getInstance().getDataList(bouns2[0], bouns2[1])
            awardList = awardList.concat(award);
        }

        if (awardList.length > 0) {
            awardList = GameHelp.getInstance().arrangeAwardList(awardList);
            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: awardList });
        } else {
            GameHelp.getInstance().showToast("没有可领取的奖励");
        }

        GameActivityData.getInstance().divineWeaponGiftGetNum++;
        GameActivityData.getInstance().divineWeaponGiftGetTime = new Date().valueOf();
        this.refreshBtnState();

    }
}

