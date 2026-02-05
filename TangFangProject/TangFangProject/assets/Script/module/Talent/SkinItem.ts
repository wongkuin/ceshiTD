import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { HeroData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import SkinRoot from "./SkinRoot";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SkinItem extends cc.Component {

    @property({ type: cc.Node, tooltip: "选中光" })
    protected xzGuang: cc.Node = null;

    @property({ type: cc.Sprite, tooltip: "bg" })
    protected iconBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "bg" })
    protected icon: cc.Sprite = null;

    @property({ type: cc.Node, tooltip: "选中光" })
    protected suoNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "上阵选中" })
    protected isFightNode: cc.Node = null;

    skinId: number = 0;
    parent: SkinRoot = null;
    protected onLoad(): void {
        this.node.on("click", this.onClickItem, this)
    }
    initItem(skinId: number, parent: SkinRoot) {

    }

    setXuanZhong(skinId: number) {
    }

    onClickItem() {

    }

}