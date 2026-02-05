import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { EquipSkillExData, WapenTableData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import GameHelp from "../../Mgr/GameHelp";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopWapenLock extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, true);



    @property({ type: cc.Sprite, tooltip: "图片" })
    protected img: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    // @property({ type: cc.RichText, tooltip: "武器描述" })
    // protected descLab: cc.RichText = null;


    public onInit(params: any): void {

    }




    public onShow(params: any): void {
        this.initView(params.wapenId);
    }

    initView(wapenId) {
        let wpaenCfg = ConfigMgr.getInstance().getById(wapenId, WapenTableData);
        SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${wpaenCfg.img}`, this.img, GameBundle.Bundle_commonRes);

        this.nameLab.string = wpaenCfg.name;
        //let desc = skillVo.note2.replace("<name1>", wpaenCfg.name);
        //  this.descLab.string = CommonUtils.addOutline(GameHelp.replaceColorStr(desc), 2, '#000000');

    }





}