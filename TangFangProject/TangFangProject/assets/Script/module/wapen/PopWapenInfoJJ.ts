import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { WapenFusionData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopWapenInfoJJ extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, true);

    @property({ type: [cc.Sprite], tooltip: "物品" })
    protected imgList: cc.Sprite[] = [];

    @property({ type: [cc.Label], tooltip: "物品信息" })
    protected numLabList: cc.Label[] = [];

    @property({ type: ButtonPlus, tooltip: "关闭" })
    protected btnClose: ButtonPlus = null;


    public onInit(params: any): void {
        this.btnClose.node.on("click", this.onClose, this);
    }




    public onShow(params: any): void {
        this.initView(params.wapenId);
    }

    initView(wapenId: number) {
        let list = ConfigMgr.getInstance().getAll(WapenFusionData).filter((item) => {
            return item.typeId == wapenId
        })
        list.sort((a, b) => {
            return a.id - b.id;
        })

        for (let i = 0; i < 5; i++) {
            SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${list[i].animation}`, this.imgList[i], GameBundle.Bundle_commonRes);
            this.numLabList[i].string = list[i].note2;
            this.numLabList[i].node.x = 53;
        }
    }



    onClose() {
        // UIMgr.getInstance().hide(this.node);
        this.closeSelf()
    }



    public onAfterHide(params: any): void {
        GlobalEventMgr.getInstance().emit(GlobalEventID.checkWapenGuide);
    }





}