import ConfigMgr from "../../config/ConfigMgr";
import { ActiveEntranceData } from "../../config/DataDef";
import GameBossInstanceData from "../../Data/GameBossInstanceData";
import MainPageBase from "../../UI/MainPageBase";
import EnterItem from "./EnterItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPageBossInstance extends MainPageBase {

    // closeType = ECloseType.CloseAndDestory;
    // modalType = new ModalType(ModalOpacity.None, false);

    @property({ type: cc.Node })
    itemRoot: cc.Node = null;

    @property({ type: cc.Prefab })
    itemPfb: cc.Prefab = null;

    /**脏标记 */
    dirtyFlag: boolean = false;
    _dt: number = 0;

    public onInit(params: any): void {


        // this.scroll.node.on('touch-up', this.onScrollEvent, this);
    }


    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 20 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;

            this.initView();
        }
    }




    onShow(params) {
        super.onShow(params);

        this.initView();



    }

    public onAfterHide(params: any): void {

    }


    initView() {
      
        let allCfg = ConfigMgr.getInstance().getAll(ActiveEntranceData);

        this.itemRoot.children.forEach((item) => {
            item.active = false;
        });
      
        for (let i = 0; i <= allCfg.length; i++) {
            let item = this.itemRoot.children[i];
            if (!cc.isValid(item)) {
                item = cc.instantiate(this.itemPfb);
                this.itemRoot.addChild(item);
            }
            item.active = true;
            let id = (i < allCfg.length) ? allCfg[i].id : null;
            item.getComponent(EnterItem).initItem(id);
        }

    }





    // update (dt) {}
}
