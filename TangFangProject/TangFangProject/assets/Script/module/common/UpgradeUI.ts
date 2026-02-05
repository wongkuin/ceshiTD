import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import ResMgr from "../../../TRFrameWork/cocos-module/mgr/ResMgr";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import ToastMgr from "../../../TRFrameWork/UIFrame/ToastMgr";
import { UIToast } from "../../../TRFrameWork/UIFrame/UIForm";


const { ccclass, property } = cc._decorator;
@ccclass
export default class UpgradeUI extends UIToast {

    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);


    @property({ type: cc.Node, displayName: "bg" })
    bg: cc.Node = null;

    @property({ type: cc.Node, displayName: "img" })
    img: cc.Node = null;

    @property({ type: SpriteFrame, displayName: "jt" })
    jt: SpriteFrame = null;

    @property({ type: cc.Label, displayName: "total" })
    totalLab: cc.Label = null;

    @property({ type: cc.Label, displayName: "增加" })
    addLab: cc.Label = null;


    total;
    public onInit(params: any): void {
        this.node.zIndex = 100;
    }

    onShow(params) {

        let total = params.total || 0;
        let add = params.add || 0;
        if (add == 0) {
            this.closeSelf();
            // UIMgr.getInstance().hide(this.node);
        }

        this.node.opacity = 255;
        this.total = total;
        this.totalLab.string = total + "";
        this.addLab.string = Math.abs(add) + "";
        let index = (add > 0) ? 1 : 0;
        this.jt.setFrameByIndex(index);

        cc.Tween.stopAllByTarget(this.node);
        this.titleAction(total - add);
        // UpgradeUI.creatOneSuccessImg();

    }


    titleAction(num) {

        let obj = { num: null };
        obj.num = num;
        this.totalLab.string = num.toString();
        cc.tween(obj).to(0.5, { num: this.total }, {
            progress: (start, end, current, t) => {

                if (this.totalLab == null) {
                    return;
                }

                this.totalLab.string = (Math.ceil(start + (end - start) * t)).toString();
                return start + (end - start) * t;
            }
        }).call(() => {
            this.totalLab.string = this.total + "";
            this.hide();
        }).start();

    }
    hide() {
        cc.tween(this.node)
            .delay(0.5)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this.closeSelf();
                // UIMgr.getInstance().hide(this.node);
            }).start();
    }

    public closeSelf(): Promise<boolean> {
        ToastMgr.close(this, null)
        return Promise.resolve(true);
    }

}