import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, IFormData, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../config/ConfigMgr";
import { ItemsData } from "../config/DataDef";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopItemInfo extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);


    //------------------------------------- 纯文本---------------------------
    @property({ type: cc.RichText, displayName: "信息" })
    infoLab: cc.RichText = null;

    @property(cc.Node)
    protected root: cc.Node = null;
    @property(cc.Node)
    protected bg: cc.Node = null;
   
    public onInit(params: any): void {
       this.formData.quick = true;
        super.onInit(params);
      //  this.btnClose.on("click", this.onClose, this);
    }

    public onShow(params: any): void {
        this.initUI(params.itemId,params?.wpos)
    }

    onClose() {
        this.closeSelf();
       // UIMgr.getInstance().hide(this.node);
    }
  

   initUI(itemId:number|string,wpos?:cc.Vec2) {
       // console.log("111:",typeof(itemId));
       let note = "";
        if(typeof(itemId)!="string"){
            let itemData =ConfigMgr.getInstance().getById(itemId,ItemsData);
            note = itemData.describe;
        }else{
          note = itemId;
        }

        let green = "<color=#13f548>";
        let red = "<color=#ff0707>";
        let blue = "<color=#b1edeb>";

        // let note =(jiesuo)?buffVo.note:"LV."+needLevel+"解锁:"+buffVo.note;
        let note1 = note.replace(/<g>/g, green);
        let note2 = note1.replace(/<r>/g, red);
        let note3 = note2.replace(/<\/g>/g, "</c>");
        let note4 = note3.replace(/<\/r>/g, "</c>");
        note4 = note4.replace(/<b>/g, blue);
        note4 = note4.replace(/<\/b>/g, "</c>");


        //  console.error(buffVo.note);
        this.infoLab.string = CommonUtils.addOutline(note4, 2, '#5d3b34');

       
        // this.nameLab["_forceUpdateRenderData"]();
        // this.nameLab.node.parent.getComponent(cc.Layout).updateLayout();

        
        this.scheduleOnce(()=>{
            this.bg.getComponent(cc.Layout).updateLayout();
        })
        
        //this.root.getComponent(cc.Layout).updateLayout();

        if(!wpos){
            return;
        }
        let pos = this.node.parent.convertToNodeSpaceAR(wpos);
        if(pos.y>0){
            this.bg.y=pos.y-40;
        }else{
            this.bg.y = pos.y+this.bg.height+40;
        }
       // this.bg.y = 0;
        // this.scheduleOnce(()=>{
        //     this.infoLab.node.parent.opacity = 255;
        //     this.infoLab.node.parent.getComponent(cc.Layout).updateLayout();
        // })
    }


  



}