import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { OnlineBounsData } from "../../config/DataDef";
import OnlineBounsItem from "./OnlineBounsItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PopOnlineBouns extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;
    
     @property(cc.Node)
    content: cc.Node = null;

      @property(cc.Prefab)
    bounsItem: cc.Prefab = null;

 
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onBtnClicked, this);
      
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }

  

    public onShow(params: any): void {
        super.onShow(params);
        this.initView();
        this.schedule(this.initView,5);
        // FormMgr.open(UIConfig.ui_game3in1);
    }

    initView(){
        let data = ConfigMgr.getInstance().getAll(OnlineBounsData);
           this.content.children.forEach((node) => {
            node.active = false;
        });
       
       
        data.forEach((vo, index) => {
            let node = this.content.children[index];
            if (!node) {
                node = cc.instantiate(this.bounsItem);
                this.content.addChild(node);
            }
            node.active = true;
            node.getComponent(OnlineBounsItem).initItem(vo);
        })
    }

    public onAfterHide(params: any): void {
    }

    // update (dt) {}
}

