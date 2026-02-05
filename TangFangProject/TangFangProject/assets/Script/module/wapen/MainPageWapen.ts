import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { WapenTableData } from "../../config/DataDef";
import GameRelicData from "../../Data/GameRelicData";
import GameUserData from "../../Data/GameUserData";
import GameWapenData, { WapenType, WapenVo } from "../../Data/GameWapenData";
import GuideMgr from "../../Guide/GuideMgr";
import MainPageBase from "../../UI/MainPageBase";
import UISceneMain from "../../UI/UISceneMain";
import WapenItem, { WapenItemType } from "./WapenItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPageWapen extends MainPageBase {

    @property({ type: cc.Node, tooltip: "武器item节点" })
    protected wapenLayout: cc.Node = null;

    @property({ type: cc.Node, tooltip: "技能item父节点" })
    protected skillLayout: cc.Node = null;
    @property(cc.Layout)
    allRootLayout: cc.Layout = null;

    @property(cc.Node)
    wapenBg: cc.Node = null;


    @property({ type: cc.ScrollView, tooltip: "容器" })
    protected scroll: cc.ScrollView = null;

    @property({ type: cc.Prefab, tooltip: "item" })
    protected fruitItem: cc.Prefab = null;

    /**脏标记 */
    dirtyFlag: boolean = false;
    choiceBtn: 1 | 2 = 1; //2技能 1武器
    _dt: number = 0;

    isEditState: boolean = false;
    public onInit(params: any): void {

        GlobalEventMgr.getInstance().on(GlobalEventID.checkWapenGuide, this.refreshGuideStep, this);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().yuanbao);
        GameWapenData.getInstance().on(this.setDirtyFlag, this);
        GameRelicData.getInstance().on(this.setDirtyFlag, this);
    }

    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 20 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;
            this.initView();
        }
    }

    onShow(params) {
        super.onShow(params);
        this.choiceBtn = 1;
        this.isEditState = false;
        this.initView();
        this.scheduleOnce(this.onCheckAllGuide);
    }

    onCheckAllGuide() {
        const wapenOne = this.wapenLayout.children[0];
        //引导1 
        if (GameWapenData.getInstance().checkRedDotByWapenId(1) &&
            GuideMgr.getInstance().CheckShowGuid(1, this.node, wapenOne)) {
            return;
        }
    }

    initView() {
        this.initFightWapenView();
        this.initWapenView();
        this.initSkillView();
    }

    initFightWapenView() {
        // this.figthLab.string = `上阵武器：${GameWapenData.getInstance().fightList.length}/${GameUserData.getInstance().curSlotNum}`
        // this.fightWapenLayout.children.forEach((node) => {
        //     node.active = false;
        // })
        // for (let i = 0; i < 8; i++) {
        //     let id = GameWapenData.getInstance().getFightVoByPosIndex(i)?.id || null;
        //     let node = this.fightWapenLayout.children[i]
        //     if (!cc.isValid(node)) {
        //         node = cc.instantiate(this.fruitItem);
        //         this.fightWapenLayout.addChild(node);
        //     } else {
        //         node.active = true;
        //     }
        //     node.getComponent(WapenItem).initItem(WapenItemType.fight, id, this.isEditState, i);
        // }

    }

    initWapenView() {
        let ori_has = GameWapenData.getInstance().getHasWapenAndNoFight(),
            ori_fight = GameWapenData.getInstance().getAllFightWapen();
        //拥有的武器
        let list_Wapen = [];
        let sortWapens = ori_has.concat(ori_fight).sort((a: WapenVo, b: WapenVo) => {
            let dataA = ConfigMgr.getInstance().getById(a.id, WapenTableData);
            let dataB = ConfigMgr.getInstance().getById(b.id, WapenTableData);
            return dataA.colour - dataB.colour;
        })
        sortWapens.forEach(o => { if (list_Wapen.indexOf(o.id) < 0) list_Wapen.push(o.id); });
        //解锁的武器
        let list_lockWapen = GameWapenData.getInstance().getNoHasWapenList();
        let allList = Array.from(new Set(list_Wapen.concat(list_lockWapen)));
        let showList = [];
        for (let i = 0; i < allList.length; i++) {
            let id = allList[i]
            if (id == 30 || id == 31) continue;
            let dataWapen = ConfigMgr.getInstance().getById(id, WapenTableData);
            if (!dataWapen.open) continue;
            if (dataWapen.wapenType != WapenType.wapen) continue;
            showList.push(id);
        }
        showList = showList.sort((idA, idB) => {
            const wapenA = ConfigMgr.getInstance().getById(idA, WapenTableData);
            const wapenB = ConfigMgr.getInstance().getById(idB, WapenTableData);
            let sortA = wapenA.sort, stageUnlockA = wapenA.id || 0;
            let sortB = wapenB.sort, stageUnlockB = wapenB.id || 0;
            if (sortA > sortB) {
                return 1
            } else if (sortA < sortB) {
                return -1
            } else if (sortA == sortB) {
                return stageUnlockA - stageUnlockB;
            }
        })
        for (let i = 0; i < showList.length; i++) {
            let id = showList[i], type = WapenItemType.have;
            let node = this.wapenLayout.children[i];
            if (!this.wapenLayout.getChildByName(`name${i}`)) {
                node = cc.instantiate(this.fruitItem);
                this.wapenLayout.addChild(node, i, `name${i}`);
                node.active = true;
            }

            type = WapenItemType.have;
            let dataWapen = ConfigMgr.getInstance().getById(id, WapenTableData);
            if (GameUserData.getInstance().lastPassLv < dataWapen.stageUnlock) {
                type = WapenItemType.lock;
            }
            node.getComponent(WapenItem).initItem(type, id, false);
        }
        const _this = this;
        setTimeout(() => {
            _this.wapenBg.setContentSize(_this.wapenBg.width, _this.wapenLayout.height + 100);
            this.wapenLayout.getComponent(cc.Layout).updateLayout();
            this.wapenLayout.getComponent(cc.Widget).updateAlignment();
            this.allRootLayout.updateLayout();
        }, 500);
    }


    initSkillView() {
        let list = GameWapenData.getInstance().getItmeListByType(WapenType.skil);
        this.skillLayout.active = list.length > 0;
        if (list.length == 0) {
            return;
        }
        this.skillLayout.children.forEach((node) => {
            node.active = false;
        })
        for (let i = 0; i < list.length; i++) {
            let id = list[i];
            let node = this.skillLayout.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.fruitItem);
                this.skillLayout.addChild(node);
            } else {
                node.active = true;
            }
            // debugger;
            node.getComponent(WapenItem).initItem(WapenItemType.skill, id, false);
        }
        this.skillLayout.getComponent(cc.Layout).updateLayout();

    }

    public onAfterShow(params: any): void {
        this.setBlockInput(false)
        this.scheduleOnce(() => {
            this.refreshGuideStep();
        }, 0.1)

    }

    refreshGuideStep() {

        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.curPage) {
            return;
        }
        // let node = this.fightWapenLayout.children[0];
        // let wapenItem = node.getComponent(WapenItem);

        // //引导2，武器升级
        // if (wapenItem?.wapenId&&GameWapenData.getInstance().checkRedDotByWapenId(wapenItem.wapenId) && GuideMgr.getInstance().CheckShowGuid(2, this.node, wapenItem.node)) {
        //     return;
        // }

        // //引导4，
        // if (GuideMgr.getInstance().CheckShowGuid(4, this.node, main.btn_talent.node)) {
        //     return;
        // }
    }


    // update (dt) {}
}
