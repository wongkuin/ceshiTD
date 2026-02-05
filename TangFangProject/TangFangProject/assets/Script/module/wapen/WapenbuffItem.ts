import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { EquipSkillExData, WapenTableData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import GameWapenData from "../../Data/GameWapenData";
import GameHelp from "../../Mgr/GameHelp";


const { ccclass, property } = cc._decorator;
@ccclass
export default class WapenbuffItem extends cc.Component {


    @property({ type: cc.Sprite, tooltip: "物品背景" })
    protected imgBg: cc.Sprite = null;

    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.RichText, tooltip: "文本提示" })
    protected descLab: cc.RichText = null;


    @property({ type: cc.Node, tooltip: "蒙版" })
    protected markNode: cc.Node = null;


    @property({ type: cc.Node, tooltip: "lockNode" })
    protected lockNode: cc.Node = null;


    initItem(wapenId: number, skillExId: number) {
        let wapenVo = GameWapenData.getInstance().getWapenById(wapenId);
        let wpaenCfg = ConfigMgr.getInstance().getById(wapenId, WapenTableData);
        let skillVo = ConfigMgr.getInstance().getById(skillExId, EquipSkillExData);
        SceneMgr.getCurrScene().loadSpirteFrame(`texture/${this.getBgUrl(skillVo)}`, this.imgBg, GameBundle.Bundle_commonRes);
        //SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${skillVo.colour}`, this.imgBg, GameBundle.Bundle_common);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${skillVo.icon}`, this.img, GameBundle.Bundle_commonRes);
        this.markNode.active = this.lockNode.active = skillVo.lv > (wapenVo?.level || 0);
        let desc = skillVo.note2.replace("<name1>", wpaenCfg.name);
        if (skillVo.lv > (wapenVo?.level || 0)) {
            desc = "Lv." + skillVo.lv + " " + desc;
        }

        this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(desc), 2, '#000000');
        this.nameLab.string = skillVo.note;

    }

    getBgUrl(wpaenCfg: EquipSkillExData) {
        let str = "";
        switch (parseInt(wpaenCfg.colour)) {
            case 1:
                str = "ui_k_lv";
                break;
            case 2:
                str = "ui_k_lan";
                break;
            case 3:
                str = "ui_k_zi";
                break;
            case 4:
                str = "ui_k_jin";
                break;
            case 5:
                str = "ui_k_hong";
                break;
        }
        return str;
    }



}