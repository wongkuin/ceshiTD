

import Singleton from "../../UIFrame/Singleton";

enum PlatformCustomType {
    Platform_Web = 0,
    Platform_Dy = 1,
    Platform_Wx = 2,
    Platform_Ks = 3,
    Platform_Sec = 4,
    Platform_Bili = 5,
    Platform_Baidu = 6,
    Platform_QQ = 7,
}

export default class PlatformHelp extends Singleton<PlatformHelp> {


    /**是否为抖音平台 */
    public isDouyin(type: PlatformCustomType): boolean {
        return type == PlatformCustomType.Platform_Dy && cc.sys.platform == cc.sys.BYTEDANCE_GAME;
    }

    /**是否为QQ平台 */
    public isQQ(type: PlatformCustomType): boolean {
        //if (window["qq"]) return true;
        return type == PlatformCustomType.Platform_QQ && cc.sys.platform == cc.sys.QQ_PLAY;
    }

    /**是否为快手平台 */
    public isKS(type: PlatformCustomType): boolean {
        // if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return false
        return type == PlatformCustomType.Platform_Ks
    }

    /**是否为微信平台 */
    public isWechat(type: PlatformCustomType): boolean {
        // 如果当前平台为桌面浏览器，则返回false
        // if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return false
        return type == PlatformCustomType.Platform_Wx && cc.sys.platform == cc.sys.WECHAT_GAME;
    }

    /**是否为bili平台 */
    public isBili(type: PlatformCustomType): boolean {
        // if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return false
        // return this.adConfig.platformType == PlatformCustomType.Platform_Bili;
        return type == PlatformCustomType.Platform_Bili;
    }

    /**是否为百度平台 */
    public isBaidu(type: PlatformCustomType): boolean {
        // if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return false
        // return this.adConfig.platformType == PlatformCustomType.Platform_Baidu;
        return type == PlatformCustomType.Platform_Baidu && cc.sys.platform == cc.sys.BAIDU_GAME;

    }

    /**是否为sec平台 */
    public isSec(type: PlatformCustomType): boolean {
        //if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return false
        // if (!window["SecSDK"]) return false;
        // return this.adConfig.platformType == PlatformCustomType.Platform_Sec;
        return type == PlatformCustomType.Platform_Sec && window["SecSDK"];
    }

}
