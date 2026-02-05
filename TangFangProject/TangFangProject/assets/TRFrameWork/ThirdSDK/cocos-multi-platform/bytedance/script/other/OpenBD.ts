// 开放接口

import { OpenInterface } from "../../../AdInterface";

class ModalOptions implements ModalOptionBD
{
    title: string;
    content: string;
    confirmText: string;
    showCancel: boolean;
    cancelText: string;
    success: Function;
    fail: Function;
    complete: Function;
}

export default class OpenBD implements OpenInterface {
    
    public static gameName: string;

    private static env: BDAPI = window["tt"];

    constructor(gameName: string)
    {
        OpenBD.gameName = gameName;
    }

    report(event: string, data: any) {
        OpenBD.env.reportAnalytics(event, data);
    }

    reportScene(object: {sceneId: number}) {

    }

    checkShortcut(success?: Function, fail?: Function)
    {
        if (cc.sys.os == cc.sys.OS_IOS)
        {
            if (fail) fail();
            return;
        }
        
        OpenBD.env.checkShortcut({
            success: (ret)=>{
                if (ret)
                {
                    if (ret.status?.exist)
                        if (success) success();
                    else
                        if (fail) fail();
                }
            },
            fail: ()=>{
                if (fail) fail();
            }
        });
    }
    
    addShortcut(success?: Function, fail?: Function)
    {
        OpenBD.env.addShortcut({
            success: success,
            fail: fail
        });
    }

    alert(title: string, content: string) {
        OpenBD.showTipAlert(title, content);
    }

    vibrateLong()
    {
        OpenBD.env.vibrateLong();
    }

    vibrateShort()
    {
        OpenBD.env.vibrateShort();
    }

    public static showTipAlert(title: string, content: string)
    {
        let option = new ModalOptions();
        option.title = title;
        option.content = content;
        option.showCancel = false;
        OpenBD.env.showModal(option);
    }

}
