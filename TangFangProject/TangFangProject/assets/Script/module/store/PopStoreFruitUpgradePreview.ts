import AdapterMgr from "../../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { ShopBoxData } from "../../config/DataDef";
import GameStoreData from "../../Data/GameStoreData";
import { ItemVo } from "../../Data/UserItemsData";
import AwardItemNew from "../activity/AwardItemNew";
import BoxAwardItem from "./BoxAwardItem";




const { ccclass, property } = cc._decorator;

@ccclass
export default class PopStoreFruitUpgradePreview extends UIWindow {

    @property(cc.Label)
    protected lvLab: cc.Label = null;
    @property(cc.Node)
    protected itemRoot1: cc.Node = null;

    @property(cc.Node)
    protected itemRoot2: cc.Node = null;


    @property(cc.Prefab)
    protected awardItem: cc.Prefab = null;

    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, true);
  

    public onInit(params: any): void {
        // this.node.on("click", this.closeSelf, this)

        this.node.setContentSize(AdapterMgr.getInstance().visibleSize);
       // this.setBlockInput(true); //屏蔽点击事件
        super.onInit(params);

    }

    public onShow(params: any): void {
        super.onShow(params);
        //this.setBlockInput(true); //屏蔽点击事件

        this.initView();
    }


    initView() {
        let cfg = ConfigMgr.getInstance().getById(GameStoreData.getInstance().curLv, ShopBoxData);
           this.lvLab.string = GameStoreData.getInstance().curLv + "";
        

        this.itemRoot1.children.forEach((node) => {
            node.active = false;
        })

          this.itemRoot2.children.forEach((node) => {
            node.active = false;
        })
        this.itemRoot1.getComponent(cc.Layout).spacingY = (cfg.preview1.length<10)?12:5;
        this.itemRoot2.getComponent(cc.Layout).spacingY = (cfg.preview2.length<10)?12:5;
        for (let i = 0; i < cfg.preview1.length; i = i + 2) {
            let itemVo: ItemVo = { itemID: cfg.preview1[i], num: cfg.preview1[i + 1] };

            let node = this.itemRoot1.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.awardItem);
                this.itemRoot1.addChild(node);
            } else {
                node.active = true;
            }
           
            node.getComponent(BoxAwardItem).initItem(itemVo);
            node.y =0;
        }

        for (let i = 0; i < cfg.preview2.length; i = i + 2) {
            let itemVo: ItemVo = { itemID: cfg.preview2[i], num: cfg.preview2[i + 1] };
            // let item = cc.instantiate(this.awardItem);
            // this.itemRoot2.addChild(item);

              let node = this.itemRoot2.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.awardItem);
                this.itemRoot2.addChild(node);
            } else {
                node.active = true;
            }

            node.getComponent(BoxAwardItem).initItem(itemVo);
            node.y =0;
        }
    }



}

