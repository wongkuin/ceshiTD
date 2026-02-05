import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ShopBoxData } from "../../config/DataDef";
import UIConfig from "../../config/UIConfig";
import GameStoreData from "../../Data/GameStoreData";
import StoreFruitBox from "./StoreFruitBox";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StoreFruitRoot extends cc.Component {

    // //#region 新增果蔬礼包 ------------------------------------- 

    @property({ type: cc.Label, tooltip: "lv" })
    protected lvLab: cc.Label = null;

    
    @property({ type: cc.Label, tooltip: "exp" })
    protected expLab: cc.Label = null;

    @property({ type: cc.ProgressBar, tooltip: "进度条" })
    protected progress: cc.ProgressBar = null;

    @property({ type: ButtonPlus, tooltip: "wenhao" })
    protected btnWen: ButtonPlus = null;

    @property({ type: [cc.Node], tooltip: "宝箱" })
    protected boxList: cc.Node[] = [];




    protected onLoad(): void {
        this.btnWen.addClick(this.onClickWen, this);
         GlobalEventMgr.getInstance().on(GlobalEventID.closeAwardPop,this.onDealLvUpgrade,this);
    }

    onClickWen() {
        FormMgr.open(UIConfig.ui_PopStoreFruitPreview);
    }

    onEnable() {
        this.initStoreFruit();
        this.boxList[0].getComponent(StoreFruitBox).initItem(1);
        this.boxList[1].getComponent(StoreFruitBox).initItem(2);

    }

    initStoreFruit() {
        this.lvLab.string ="Lv." +GameStoreData.getInstance().curLv + "";
        let nextCfg = ConfigMgr.getInstance().getById(GameStoreData.getInstance().curLv + 1, ShopBoxData);
        if (!nextCfg) {
            this.progress.node.active = true;
            this.progress.progress =1;
            this.expLab.string ="max";
        } else {
            this.progress.node.active = true;
            let needExp =nextCfg.exp;
            this.progress.progress = GameStoreData.getInstance().totalExp / needExp;
            this.expLab.string = GameStoreData.getInstance().totalExp + "/" + needExp;
        }
        
    }

    onDealLvUpgrade(){
        let nextCfg = ConfigMgr.getInstance().getById(GameStoreData.getInstance().curLv + 1, ShopBoxData);
        if (nextCfg) {
            this.progress.node.active = true;
            let nextCfg = ConfigMgr.getInstance().getById(GameStoreData.getInstance().curLv + 1, ShopBoxData);
            let needExp =nextCfg.exp;
             this.expLab.string = GameStoreData.getInstance().totalExp + "/" + needExp;
            cc.tween(this.progress)
            .to(0.4,{progress:GameStoreData.getInstance().totalExp / needExp})
            .call(()=>{
                //等级提升；
                if(GameStoreData.getInstance().checkLvUpgrade()){
                    GameStoreData.getInstance().lvUpgrade();
                    FormMgr.open(UIConfig.ui_PopStoreFruitUpgradePreview);
                    this.initStoreFruit();
                }
            }).start()
        }
    }


}

