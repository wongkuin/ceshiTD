import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";

export interface AlertData {
    alertText: string;//文本
    sureCallFunc: Function;//确定回调
    cancelCallFunc?: Function; //取消回调
    titleText?: string;//标题
    cancelText?: string; //取消
    sureText?: string;  //确定
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopAlert extends UIWindow {
    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);


    @property({ type: cc.Label, tooltip: "名字" })
    protected titleLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "文本" })
    protected alertLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "取消文本" })
    protected cancelLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "确定文本" })
    protected sureLab: cc.Label = null;

    @property({ type: ButtonPlus, tooltip: "关闭" })
    protected btnClose: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "取消" })
    protected btnCancel: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "确定" })
    protected btnSure: ButtonPlus = null;



    // @property({ type: sp.Skeleton, tooltip: "升级动效" })
    // protected lvUpSpine: sp.Skeleton = null;

    sureCallFunc: Function;
    cancelCallFunc: Function;

    public onInit(params: AlertData): void {
        this.btnClose.node.on("click", this.onClose, this);
        this.btnCancel.node.on("click", this.onCancel, this);
        this.btnSure.node.on("click", this.onSure, this);
        this.sureCallFunc = params?.sureCallFunc;
        this.cancelCallFunc = params?.cancelCallFunc;

    }

    onSure() {
        this.sureCallFunc && this.sureCallFunc();
        this.onClose();
    }

    onCancel() {
        this.cancelCallFunc && this.cancelCallFunc();
        this.onClose();
    }



    public onShow(params: AlertData): void {

        this.initView(params);
    }



    onClose() {
        // UIMgr.getInstance().hide(this.node);
        this.closeSelf()
    }

    initView(params: AlertData) {
        this.titleLab.string = params?.titleText || "提示";
        this.alertLab.string = params.alertText;
        this.cancelLab.string = params?.cancelText || "取消";
        this.sureLab.string = params?.sureText || "确定";

        this.btnCancel.node.active = params?.cancelCallFunc ? true : false;
        if (this.btnCancel.node.active) {
            this.btnCancel.node.x = -150;
            this.btnSure.node.x = 150;
        } else {
            this.btnSure.node.x = 0;
        }
    }







}