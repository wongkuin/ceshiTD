import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import List from "../../../TRFrameWork/Common/scrollview/List";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { ClearanceRewardsData, DailyGiftPackData, WapenFusionData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameActivityData from "../../Data/GameActivityData";
import GameUserData from "../../Data/GameUserData";
import { ItemVo } from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";
import DailyGiftPackItem from "./DailyGiftPackItem";
import PassAwardItem from "./PassAwardItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PopPassAward extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnGet: ButtonPlus = null;

    @property(List)
    list: List = null;

    @property({ type: cc.RichText, tooltip: "当前关卡" })
    protected curPassLv: cc.RichText = null;

    @property({ type: cc.Label, tooltip: "领取条件" })
    protected getTips: cc.Label = null;

    @property({ type: cc.Label, tooltip: "领取条件" })
    protected getLab: cc.Label = null;


    @property({ type: cc.RichText, tooltip: "当前关卡" })
    protected lockTips: cc.RichText = null;

    @property({ type: cc.Sprite, tooltip: "武器icon" })
    protected wapenIcon: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "武器icon" })
    protected bg: cc.Sprite = null;


    @property({ type: cc.Node, tooltip: "effectRoot" })
    protected effectRoot: cc.Node = null;


    @property({ type: cc.Prefab, tooltip: "item" })
    protected listItem: cc.Prefab = null;


    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);
    curDatas: ClearanceRewardsData[] = [];

    xzId: number = 0;
    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onBtnClicked, this);
        this.btnGet.addClick(this.onGetBtnClicked, this);
        GameActivityData.getInstance().on(this.initView, this, nameof<GameActivityData>().dailyGiftIndex);
        GlobalEventMgr.getInstance().on(GlobalEventID.xzPassReward, this.onXzPassReward, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.closeAwardPop, this.onCloseAwardPop, this);


    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }



    public onShow(params: any): void {
        super.onShow(params);
        this.curDatas = ConfigMgr.getInstance().getAll(ClearanceRewardsData);
        this.xzId = GameActivityData.getInstance().getCurPassId();
        this.initView();

        // FormMgr.open(UIConfig.ui_game3in1);
    }

    initView() {
        let curPassLvStr = `<color=#ffffff>通关章节进度</c><color=#21dd17>${GameUserData.getInstance().lastPassLv - 1}</c><color=#ffffff>/${this.curDatas.length}</c>`
        this.curPassLv.string = CommonUtils.addOutline(curPassLvStr, 2, '#000000');


    }

    onAfterShow() {
        this.list.numItems = this.curDatas.length;
        this.list.scrollTo(this.xzId - 1, 0);
        console.log("afterShow", this.list.numItems);
        this.onXzPassReward(this.xzId, true);

    }

    protected onRenderEvent(item: cc.Node, index: number) {

        let data = this.curDatas[index];
        // console.log("onRenderEvent", data, this.xzId);
        item.getComponent(PassAwardItem).initItem(data, this.xzId);
    }


    refreshXzItem() {
        let children = this.list.content.children;
        for (let i = 0; i < children.length; i++) {
            let item = children[i].getComponent(PassAwardItem);
            if (item.id == this.xzId) {
                item.showXz(true);
            } else {
                item.showXz(false);
            }
        }
        this.getTips.string = `通过第${ConfigMgr.getInstance().getById(this.xzId, ClearanceRewardsData).unlock}关解锁`;
        if (GameUserData.getInstance().lastPassLv - 1 >= ConfigMgr.getInstance().getById(this.xzId, ClearanceRewardsData).unlock) {
            this.getTips.string = "已解锁";
        }
    }

    onXzPassReward(id, isFirst = false) {

        if (!isFirst && this.xzId == id) {
            return;
        }
        this.xzId = id;
        this.refreshXzItem();
        this.refreshBtnState();

        let data = ConfigMgr.getInstance().getById(this.xzId, ClearanceRewardsData);
        let wapendata = ConfigMgr.getInstance().getById(data.preview, WapenFusionData);
        this.loadSpirteFrame(`texture/passAward/${data.animation}`, this.bg, GameBundle.Bundle_Act);
        this.loadSpirteFrame(`wapen/${wapendata.animation}`, this.wapenIcon, GameBundle.Bundle_commonRes);

        this.lockTips.string = CommonUtils.addOutline(GameHelp.replaceColorStr(wapendata.note), 2, '#000000');

        this.effectRoot.removeAllChildren();
        console.log("special", "effect/prefabs/" + data.special);
        this.loadRes("effect/prefabs/" + data.special, cc.Prefab, GameBundle.Bundle_commonRes).then((res: cc.Prefab) => {
            let effectNode = cc.instantiate(res);
            this.effectRoot.addChild(effectNode, 0, "effectNode");
            if (!effectNode) return;
            effectNode?.setPosition(0, 0);
            if (data.special == "special_105") {
                effectNode.scale = 1.3;
            }
            let anims = effectNode.getComponent(cc.Animation);
            if (anims && anims.getClips().length > 0) {
                let clip = anims.getClips()[0];
                let name = clip.name;
                anims.play(name);
            }
        })

    }

    onCloseAwardPop() {
        let children = this.list.content.children;
        for (let i = 0; i < children.length; i++) {
            let item = children[i].getComponent(PassAwardItem);
            item.initItem(item.data, this.xzId)
        }
        this.refreshBtnState();
    }

    refreshBtnState() {
        if (GameActivityData.getInstance().passRewardGetList.indexOf(this.xzId) != -1) {
            this.getLab.string = "已领取";

            Utils.setAllChildrenSpGray(this.btnGet.node, true);
        } else {

            if (GameUserData.getInstance().lastPassLv - 1 >= ConfigMgr.getInstance().getById(this.xzId, ClearanceRewardsData).unlock) {

                this.getLab.string = "领取";

                Utils.setAllChildrenSpGray(this.btnGet.node, false);

            } else {
                this.getLab.string = "未解锁";

                Utils.setAllChildrenSpGray(this.btnGet.node, true);

            }

        }
    }

    onGetBtnClicked() {
        if (GameActivityData.getInstance().passRewardGetList.indexOf(this.xzId) != -1) {
            GameHelp.getInstance().showToast("奖励已领取");
        } else {

            if (GameUserData.getInstance().lastPassLv - 1 >= ConfigMgr.getInstance().getById(this.xzId, ClearanceRewardsData).unlock) {
                let bouns = this.getAllBouns();
                FormMgr.open(UIConfig.ui_PopGetReward, { rewards: bouns });

            } else {
                GameHelp.getInstance().showToast(`通过第${ConfigMgr.getInstance().getById(this.xzId, ClearanceRewardsData).unlock}关解锁`);
            }

        }
    }

    getAllBouns() {
        let bouns: ItemVo[] = [];
        let getList = [];
        for (let i = 0; i < this.curDatas.length; i++) {
            let data = this.curDatas[i];
            if (GameActivityData.getInstance().passRewardGetList.indexOf(data.id) == -1 && GameUserData.getInstance().lastPassLv - 1 >= data.unlock) {
                bouns.push(new ItemVo(data.bouns[0], data.bouns[1]));
                getList.push(data.id);
            }
        }
        getList.forEach(id => {
            GameActivityData.getInstance().addPassRewardGetId(id);
        });

        return bouns;
    }








}

