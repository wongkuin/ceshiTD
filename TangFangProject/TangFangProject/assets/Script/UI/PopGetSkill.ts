import SpriteFrame from "../../TRFrameWork/cocos-module/component/SpriteFrame";
import AdapterMgr from "../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import { GameBundle } from "../config/GameEnum";
import { ItemVo } from "../Data/UserItemsData";



const { ccclass, property } = cc._decorator;
/**获得技能 */
@ccclass
export default class PopGetSkill extends UIWindow {





    @property(cc.Sprite)
    protected skillImg: cc.Sprite = null;


    @property(cc.Sprite)
    protected skillImgBg: cc.Sprite = null;



    @property(cc.Label)
    protected skillNameLab: cc.Label = null;




    modalType = new ModalType(ModalOpacity.OpacityHigh, true);
    // closeType = ECloseType.CloseAndDestory;

    hangNum = 5;
    showNodeNum = 0;
    // isFinish = false;
    list: ItemVo[]
    public onInit(params: any): void {
        // this.node.on("click", this.closeSelf, this)

        this.node.setContentSize(AdapterMgr.getInstance().visibleSize);
        super.onInit(params);

    }

    public onShow(params: { skillImg: string, skillImgBg: string, skillName: string }): void {
        super.onShow(params);
        this.setBlockInput(true); //屏蔽点击事件
        SceneMgr.getCurrScene().loadSpirteFrame(params.skillImg, this.skillImg, GameBundle.Bundle_Hero);
        SceneMgr.getCurrScene().loadSpirteFrame(params.skillImgBg, this.skillImgBg, GameBundle.Bundle_commonRes);
        this.skillNameLab.string = params.skillName;

    }

    public onAfterShow(params: any): void {
        this.setBlockInput(false);
    }


    public async closeSelf(params?: any): Promise<boolean> {
        // if (!this.isFinish) {
        //     return;
        // 
        return super.closeSelf(params);
    }


}

