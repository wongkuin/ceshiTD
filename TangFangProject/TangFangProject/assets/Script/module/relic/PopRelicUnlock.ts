import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { PassiveSkillData, RelicsCategoryData, RelicsUpData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import GameRelicData, { RelicVo } from "../../Data/GameRelicData";
import GameHelp from "../../Mgr/GameHelp";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopRelicUnlock extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);


    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.RichText, tooltip: "满级文本提示" })
    protected descLab: cc.RichText = null;


    // @property({ type: sp.Skeleton, tooltip: "升级动效" })
    // protected lvUpSpine: sp.Skeleton = null;

    public onInit(params: any): void {

    }

    public onShow(params: any): void {
        this.initView(params.relicId);
    }
    relicId: number = 0; //当前宝物id
    RelicCfg: RelicsCategoryData = null; //当前宝物配置
    itemVo: RelicVo = null; //当前宝物数据
    initView(relicId) {
        this.itemVo = GameRelicData.getInstance().getRelicById(relicId);
        let RelicCfg = this.RelicCfg = ConfigMgr.getInstance().getById(relicId, RelicsCategoryData);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${RelicCfg.img}`, this.img, GameBundle.Bundle_commonRes);
        this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(this.getAttrLab()), 2, '#000000');
    }

    getAttrLab() {
        let attrList: number[] = [];
        let level = (this.itemVo.level) > 0 ? this.itemVo.level : 1;
        let nextRelicUp = ConfigMgr.getInstance().getById(level, RelicsUpData);
        if (nextRelicUp) {
            attrList = nextRelicUp["attribute" + this.RelicCfg.relicscUp] || [];
        }
        let str = "";
        for (let i = 0; i < attrList.length; i++) {
            let passiveSkillCfg = ConfigMgr.getInstance().getById(attrList[i], PassiveSkillData);
            let huanghang = `\n`;
            str += passiveSkillCfg.note;
            if (i < attrList.length - 1) {
                str += huanghang;
            }
        }

        return str;
    }










}