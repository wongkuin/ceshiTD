import { BiliAPI } from "../InterfaceBili";
// 开放接口
export default class OpenBiLi implements OpenInterface {
    
    public static gameName: string;

    private static env: BiliAPI = window["bl"];

    constructor(gameName: string)
    {
        OpenBiLi.gameName = gameName;
    }

    report(event: string, data: any) {

    }

    reportScene(object: {sceneId: number}) {
        OpenBiLi.env.reportScene({sceneId: object.sceneId});
    }

    checkShortcut(success1?: Function, fail1?: Function) {      
        
        OpenBiLi.env.checkShortcut({
            success: (ret)=>{
                if (ret)
                {
                    if (ret.status?.exist) {
                        if (success1) success1();
                    }
                    else {
                        if (fail1) fail1();
                    }
                }
            },
            fail: (ret)=>{
                if (fail1) fail1();
            }
        });
    }
    
    addShortcut(success?: Function, fail?: Function) {
        OpenBiLi.env.addShortcut({
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
