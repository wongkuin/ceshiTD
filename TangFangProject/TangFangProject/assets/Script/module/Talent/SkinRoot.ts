import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ActSkillData, HeroData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import GameUserData from "../../Data/GameUserData";
import GameHelp from "../../Mgr/GameHelp";
import SkinItem from "./SkinItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SkinRoot extends cc.Component {

    @property({ type: sp.Skeleton, tooltip: "buff1" })
    protected spine: sp.Skeleton = null;

    @property({ type: cc.Label, tooltip: "掉落途径" })
    protected dropLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected skinName: cc.Label = null;

    @property({ type: cc.RichText, tooltip: "" })
    protected skillLab: cc.RichText = null;

    @property({ type: cc.RichText, tooltip: "" })
    protected descLab: cc.RichText = null;

    @property({ type: cc.Node, tooltip: "父节点" })
    protected content: cc.Node = null;

    @property({ type: cc.Sprite, tooltip: "bg" })
    protected skillIcon: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "技能名字" })
    protected skillName: cc.Label = null;

    @property({ type: cc.Prefab, tooltip: "skinItem" })
    protected skinItem: cc.Prefab = null;

    @property({ type: cc.Node, tooltip: "cc.Node" })
    protected btnRoot: cc.Node = null;



    xzSkinId: number = 0;
    initRoot() {

    }

    refreshHero() {
    
    }

    initContent() {
    }

    xuanZheSkin(skinId: number) {

    }



}