import { BaiduAPI } from "../InterfaceBaidu";
// 开放接口
export default class OpenBaidu implements OpenInterface {
    
    public static gameName: string;

    private static env: BaiduAPI = window["swan"];

    constructor(gameName: string)
    {
        OpenBaidu.gameName = gameName;
    }

    report(event: string, data: any) {
        OpenBaidu.env.reportAnalytics(event, data);
    }

    reportScene(object: {sceneId: number}) {

    }

    checkShortcut(success?: Function, fail?: Function) {      
        if (cc.sys.os == cc.sys.OS_IOS)
        {
            if (fail) fail();
            return;
        }
        
        OpenBaidu.env.checkShortcut({
            success: (ret)=>{
                if (ret) {
                    if (ret.status?.exist)
                        if (success) success();
                    else
                        if (fail) fail();
                }
            },
            fail: (ret)=>{
                if (fail) fail();
            }
        });
    }
    
    addShortcut(success?: Function, fail?: Function) {
        OpenBaidu.env.addShortcut({
            success: success,
            fail: fail
        });
    }

    alert(title: string, content: string) {

    }

    vibrateLong()
    {

    }

    vibrateShort()
    {

    }

}
