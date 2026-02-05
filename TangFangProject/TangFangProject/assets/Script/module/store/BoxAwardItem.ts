import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, ShopData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameStoreData, { StoreItemVo, StoreBuyType } from "../../Data/GameStoreData";
import GameWapenData from "../../Data/GameWapenData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import LanguageMgr from "../../lang/LanguageMgr";
import GameHelp from "../../Mgr/GameHelp";
import GameTrackHelp from "../../Mgr/GameTrackHelp";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BoxAwardItem extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "iconBg" })
    protected icon: cc.Sprite = null;


    @property({ type: cc.Node, tooltip: "碎片" })
    protected suiPianNode: cc.Node = null;


    @property({ type: cc.Label, tooltip: "numLab" })
    protected numLab: cc.Label = null;






    protected onLoad(): void {

    }

    static choiseIndex: number;
    initItem(vo: ItemVo) {
        let itemData = ConfigMgr.getInstance().getById(vo.itemID, ItemBaseData);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, this.icon, GameBundle.Bundle_commonRes);
        this.suiPianNode.active = itemData.type == 5;

        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/sp${itemData.colour || 3}`, this.suiPianNode.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
        this.numLab.string = "x" + vo.num.toString();



    }




}