import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { ClearanceRewardsData } from "../../config/DataDef";
import GameActivityData from "../../Data/GameActivityData";
import GameUserData from "../../Data/GameUserData";
import AwardItemNew from "./AwardItemNew";




const { ccclass, property } = cc._decorator;

@ccclass
export default class PassAwardItem extends cc.Component {

    @property({ type: cc.Node, tooltip: "" })
    protected guang: cc.Node = null;


    @property({ type: cc.Label, tooltip: "奖数量" })
    protected passNum: cc.Label = null;

    @property({ type: cc.Node, tooltip: "get" })
    protected getNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "选择" })
    protected xzNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "可领奖" })
    protected xzNode1: cc.Node = null;

    @property({ type: cc.Node, tooltip: "root" })
    protected root: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "awardItem" })
    protected awardItem: cc.Prefab = null;




    id: number = 0;
    data: ClearanceRewardsData = null;
    xzId: number = 0;
    protected onLoad(): void {
        this.node.getComponent(ButtonPlus).addClick(this.onItemClicked, this);
        //this.playGuangAni(this.guang);
    }


    initItem(data: ClearanceRewardsData, xzId: number) {
        this.data = data;
        this.id = data.id;
        this.xzId = xzId;
        this.xzNode1.active = false;
        this.xzNode.active = false;
        this.showXz1(this.xzId == this.id);
        this.getNode.active = GameActivityData.getInstance().passRewardGetList.indexOf(this.id) != -1;
        this.passNum.string = `第${data.unlock}关`;
        this.initAwardItem();
    }

    initAwardItem() {
        let child = this.root.children[0];
        let awardItem: cc.Node = null;
        if (cc.isValid(child)) {
            awardItem = child;
        } else {
            awardItem = cc.instantiate(this.awardItem);
            this.root.addChild(awardItem);
        }

        awardItem.scale = 0.7;
        let canGet = GameUserData.getInstance().lastPassLv - 1 >= this.data.unlock && GameActivityData.getInstance().passRewardGetList.indexOf(this.id) == -1
        awardItem.getComponent(AwardItemNew).initItem({ itemID: this.data.bouns[0], num: this.data.bouns[1] }, true);
        this.guang.active = canGet;

    }


    showXz(show: boolean) {
        this.xzNode.active = show;
    }


    showXz1(show: boolean) {
        this.xzNode1.active = show;
    }

    onItemClicked() {
        GlobalEventMgr.getInstance().emit(GlobalEventID.xzPassReward, this.id);
    }










}