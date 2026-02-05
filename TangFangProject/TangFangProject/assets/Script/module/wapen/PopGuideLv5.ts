import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import GameControl from "../../Battle/GameControl";
import ConfigMgr from "../../config/ConfigMgr";
import { WapenFusionData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopGuideLv5 extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityZero, false);




    @property({ type: cc.Node, tooltip: "tips" })
    protected rootNode: cc.Node = null;


    

  
    public onInit(params: any): void {


    }






    public onShow(params): void {
        this.rootNode.opacity = 100;
        this.rootNode.x=750;
        let speed = GameControl.getInstance()?.getPassInfo()?.gameSpeed||1;
        cc.tween(this.rootNode)
        .to(0.2*speed, { opacity: 255, x: 0 },{ easing: 'sineIn' })
        .delay(1.6*speed)
        .to(0.25*speed, { x: -750, opacity: 100},{ easing: 'sineOut' })
        .call(() => {
            this.closeSelf();
        })
        .start();
    }




}