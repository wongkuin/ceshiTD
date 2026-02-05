import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import List from "../../../TRFrameWork/Common/scrollview/List";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { TalentData } from "../../config/DataDef";
import GameRelicData from "../../Data/GameRelicData";
import GameUserData from "../../Data/GameUserData";
import GuideMgr from "../../Guide/GuideMgr";
import MainPageBase from "../../UI/MainPageBase";
import UISceneMain from "../../UI/UISceneMain";
import RelicRoot from "../relic/RelicRoot";
import SkinRoot from "./SkinRoot";
import TalentItem from "./TalentItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPageTalent extends MainPageBase {

    // closeType = ECloseType.CloseAndDestory;
    // modalType = new ModalType(ModalOpacity.None, false);

    @property({ type: List })
    TalentList: List = null;

    @property({ type: cc.Label })
    hpLab: cc.Label = null;

    @property({ type: cc.Label })
    powerLab: cc.Label = null;

    @property({ type: cc.Label })
    fyLab: cc.Label = null;

    @property({ type: cc.Node })
    telentRoot: cc.Node = null;

    @property({ type: cc.Node })
    relicRoot: cc.Node = null;

    @property({ type: cc.Button })
    btnTalent: cc.Button = null;

    @property({ type: cc.Button })
    btnRelic: cc.Button = null;


    /**脏标记 */
    dirtyFlag: boolean = false;

    _dt: number = 0;
    initFinish = false;
    choiceBtn: 1 | 2 | 3 = 1; //2天赋 1皮肤
    public onInit(params: any): void {
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().breakthrough);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().lingshi);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().talentHpLv);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().talentAtkLv);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().talentSpLv);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().breakthroughLv);

        GlobalEventMgr.getInstance().on(GlobalEventID.checkTalentGuide, this.refreshGuideStep, this);
        GameRelicData.getInstance().on(this.initView, this);

        this.btnTalent.node.on("click", this.openTalentRoot, this)
        this.btnRelic.node.on("click", this.openRelicRoot, this)

    }
    totalHp: number = 0;
    totalAtk: number = 0;
    totalSp: number = 0;

    curDatas: TalentData[] = [];


    openTalentRoot() {
        this.choiceBtn = 2;
        this.telentRoot.active = true;
        this.relicRoot.active = false;
        this.setBtnState();
        this.onAfterShow(null);

    }

    openRelicRoot() {
        this.choiceBtn = 3;
        this.telentRoot.active = false;
        this.relicRoot.active = true;
        this.relicRoot.getComponent(RelicRoot).onShow();
        this.setBtnState();
    }


    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 20 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;
            if (this.initFinish)
                this.refreshView();
        }
    }

    refreshView() {
        this.btnTalent.node.getChildByName("redDot").active = GameUserData.getInstance().checkTalentRedDot();
        this.getTotalAttrByType();
        let children = this.TalentList?.content?.children || [];
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            let data = item.getComponent(TalentItem).data;
            item.getComponent(TalentItem).initItem(data);
        }
    }



    onShow(params) {
        super.onShow(params);
        this.initFinish = true;
        this.choiceBtn = 1;
        this.openTalentRoot();
        this.initView();
        this.getTotalAttrByType();
        this.refreshGuideStep();

    }

    refreshGuideStep() {
        //引导5，聚焦【天赋】
        if (GameUserData.getInstance().talentAtkLv == 0 && GuideMgr.getInstance().CheckShowGuid(5, this.node, this.btnTalent.node)) {
            return;
        }
        let children = this.TalentList?.content?.children[1];
        let node: cc.Node;
        if (children) {
            node = Utils.getWidget("item2", children)?.getChildByName("itemBg");
        }
        //引导6，聚焦【天赋】
        if (cc.isValid(node) && GameUserData.getInstance().talentAtkLv == 0 && GuideMgr.getInstance().CheckShowGuid(6, this.node, node)) {
            return;
        }
        //关闭后聚焦【战斗】，显示文字【你已经变得很强了，继续战斗吧！

        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.btn_pass) {
            return;
        }
        if (GuideMgr.getInstance().CheckShowGuid(7, main.node, main.btn_pass.node)) {
            return;
        }


    }

    public onAfterHide(params: any): void {
        this.initFinish = false;
    }

    setBtnState() {
        this.btnTalent.node.getChildByName("Background").active = this.choiceBtn == 2;
        this.btnRelic.node.getChildByName("Background").active = this.choiceBtn == 3;
    }


    public onAfterShow(params: any): void {
        this.initDatas();
        this.TalentList.numItems = this.curDatas.length;
        let maxlv = Math.max(GameUserData.getInstance().talentHpLv, GameUserData.getInstance().talentSpLv, GameUserData.getInstance().talentAtkLv)
        let index = this.curDatas.length - 1 - maxlv - 2;

        this.TalentList.scrollTo(index, 0.3);
        this.scheduleOnce(this.refreshGuideStep, 0.3)
    }

    initDatas() {
        this.curDatas = JSON.parse(JSON.stringify(ConfigMgr.getInstance().getAll(TalentData)));
        this.curDatas.sort((a, b) => a.lv - b.lv);

        for (let i = this.curDatas.length - 1; i >= 0; i--) {
            let data = this.curDatas[i];
            data["itemType"] = 1;
            if (data.costBreak.length > 0) {
                let data0 = JSON.parse(JSON.stringify(data));
                data0["itemType"] = 2;
                this.curDatas.splice(i + 1, 0, data0);
            }
        }
    }

    protected onRenderEvent(item: cc.Node, index: number) {
        let length = this.curDatas.length - 1;
        let data = this.curDatas[length - index];
        item.getComponent(TalentItem).initItem(data);
        item.zIndex = length - index;
        if (index == 0) {
            item.getComponent(TalentItem).hideJdt();
        }
    }


    onCheckAllGuide() {

    }

    initView() {
        this.btnRelic.node.getChildByName("redDot").active = GameRelicData.getInstance().checkAllRedDot();
        this.btnTalent.node.getChildByName("redDot").active = GameUserData.getInstance().checkTalentRedDot();
    }
    totalAtkNum = 0;
    getTotalAttrByType() {
        this.totalHp = this.totalAtk = this.totalAtkNum = this.totalSp = 0;
        ConfigMgr.getInstance().getAll(TalentData).forEach((data) => {

            if (data.lv <= GameUserData.getInstance().talentHpLv) {
                this.totalHp += data.hp;
            }
            if (data.lv <= GameUserData.getInstance().talentAtkLv) {
                if (data.atk[0] == 0) {
                    this.totalAtkNum += data.atk[1];
                }
                if (data.atk[0] == 1) {
                    this.totalAtk += data.atk[1];
                }
            }
            if (data.lv <= GameUserData.getInstance().talentSpLv) {
                this.totalSp += data.sp;
            }
        })

        this.hpLab.string = "+" + Math.floor(this.totalHp).toString();
        this.powerLab.string = "+" + Math.floor(this.totalAtk).toString() + "% +" + Math.floor(this.totalAtkNum);
        this.fyLab.string = "+" + Math.floor(this.totalSp).toString();


    }
}
