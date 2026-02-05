import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import GameRelicData, { RelicType } from "../../Data/GameRelicData";
import GameUserData from "../../Data/GameUserData";
import MainPageBase from "../../UI/MainPageBase";
import WapenItem from "./RelicItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RelicRoot extends cc.Component {

    // closeType = ECloseType.CloseAndDestory;
    // modalType = new ModalType(ModalOpacity.None, false);


    @property({ type: cc.Node, tooltip: "一般item父节点" })
    protected normalLayout: cc.Node = null;

    @property({ type: cc.Node, tooltip: "一般root" })
    protected normalRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "稀有item父节点" })
    protected rateLayout: cc.Node = null;

    @property({ type: cc.Node, tooltip: "稀有root" })
    protected rateRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "传奇 item父节点" })
    protected legendLayout: cc.Node = null;

    @property({ type: cc.Node, tooltip: "传奇 root" })
    protected legendRoot: cc.Node = null;



    @property({ type: cc.ScrollView, tooltip: "容器" })
    protected scroll: cc.ScrollView = null;

    @property({ type: cc.Prefab, tooltip: "item" })
    protected relicItem: cc.Prefab = null;

    /**脏标记 */
    dirtyFlag: boolean = false;

    _dt: number = 0;
    public onLoad(): void {


        GameRelicData.getInstance().on(this.setDirtyFlag, this);
        // this.scroll.node.on('touch-up', this.onScrollEvent, this);
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

    onShow() {
        this.initView();
        this.scheduleOnce(this.onCheckAllGuide);
    }

    onCheckAllGuide() {

    }

    initView() {
        this.initViewByType(RelicType.normal);
        this.initViewByType(RelicType.rare);
        this.initViewByType(RelicType.epic);
        // this.initFruitView();
        // this.initWapenView();
        // this.initSkillView();
        // this.initBuffView();
    }




    initViewByType(type: RelicType) {
        let list = GameRelicData.getInstance().getItmeListByType(type);
        let root: cc.Node;
        let layout: cc.Node;
        switch (type) {
            case RelicType.normal:
                root = this.normalRoot;
                layout = this.normalLayout;
                break;
            case RelicType.rare:
                root = this.rateRoot;
                layout = this.rateLayout;
                break;
            case RelicType.epic:
                root = this.legendRoot;
                layout = this.legendLayout;
                break;
        }
        root.active = list.length > 0;
        if (list.length == 0) {
            return;
        }
        layout.children.forEach((node) => {
            node.active = false;
        })
        for (let i = 0; i < list.length; i++) {
            let id = list[i];
            let node = layout.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.relicItem);
                layout.addChild(node);
            } else {
                node.active = true;
            }
            node.getComponent(WapenItem).initItem(id);
        }
    }


   
    // update (dt) {}
}
