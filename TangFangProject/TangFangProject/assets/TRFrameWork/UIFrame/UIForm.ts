
import { IPool } from "../Common/Utils/Pool";
import CocosHelper from "./CocosHelper";
import { FormType, ModalOpacity } from "./config/SysDefine";
import FormMgr from "./FormMgr";
import { ECloseType, ModalType } from "./Struct";
import UIBase from "./UIBase";


export class UIScreen extends UIBase {
    formType = FormType.Screen;
    closeType = ECloseType.CloseAndDestory;
    /**自定义场景名 */
    screenName: string = "";
}

export class UIWindow extends UIBase {
    formType = FormType.Window;
    modalType = new ModalType(ModalOpacity.OpacityFull);                // 阴影类型
    closeType = ECloseType.LRU;



    // // 隐藏回调
    // public onHide(params: any) {
    //      let kvId =  21;
    //     let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
    //     SoundMgr.getInstance().playSound(soundName);

    // }


    /** 显示效果 */
    public async showEffect() {
        this.node.scale = 0;
        await CocosHelper.runTweenSync(this.node, cc.tween().to(0.3, { scale: 1 }, cc.easeBackOut()));
    }
}

export class UIFixed extends UIBase {
    formType = FormType.Fixed;
    closeType = ECloseType.LRU;
}

export class UITips extends UIBase {
    formType = FormType.Tips;
    closeType = ECloseType.CloseAndHide;
}

export class UIToast extends UIBase implements IPool {
    formType = FormType.Toast;
    prefabUrl: string = ""
    public use() {

    }

    public free() {

    }

    public async closeSelf(): Promise<boolean> {
        return await FormMgr.close({ prefabUrl: this.fid, type: this.formType });
    }
}


// // @ts-ignore
// cc.UIScreen = UIScreen;
// // @ts-ignore
// cc.UIWindow = UIWindow;
// // @ts-ignore
// cc.UIFixed = UIFixed;
// // @ts-ignore
// cc.UITips = UITips;
// // @ts-ignore
// cc.UIToast = UIToast;
