import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import { ItemVo } from "../Data/UserItemsData";
import AwardItemNew from "../module/activity/AwardItemNew";


const { ccclass, property } = cc._decorator;



@ccclass
export default class PopAllDrop extends UIWindow {

    // closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityZero, true);
    closeType = ECloseType.CloseAndHide;

    @property(cc.Node)
    rootNode: cc.Node = null;

    @property(cc.Prefab)
    awardItem: cc.Prefab = null;


    public onInit(params: any): void {
        super.onInit(params);
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        GlobalEventMgr.getInstance().on(GlobalEventID.closeDropPop, this.onClosePop, this);
    }

    public onShow(params: any): void {
        super.onShow(params);
        this.rootNode.removeAllChildren();
        let awardList: ItemVo[] = params.awardList;
        for (let i = 0; i < awardList.length; i++) {
            let item = cc.instantiate(this.awardItem);
            item.getComponent(AwardItemNew).initItem(awardList[i], true);
            this.rootNode.addChild(item);
            item.scale = 0.85;
        }
    }

    onClosePop(){
        this.closeSelf();
    }


}
