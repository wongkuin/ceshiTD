import PlatformMgr from "./cocos-multi-platform/PlatformManager";
import checkWhiteList from "../cocos-module/component/UserWhiteList";


export default class UserKey {
    public static getInstance<T extends {}>(this: new () => T): T {
        if (!(<any>this).ins) {
            (<any>this).ins = new this();
        }
        return (<any>this).ins;
    }
    /**可以看成用户id */
    userOpenID: string = "";
    deviceId: string = "";
    user_id: number = 0;
    /**体力*/
    

    openCloudDBList: string[] = [
        "tt3d984b25a292c8c302",
    ]

    getUserOnlyKey(key: string): string {
        let userOnlyKey = key;
        return userOnlyKey;
    }

    getJsonValue(key: string): any {
        let jsonValue = null;
        if (PlatformMgr.instance?.isDouyin) {
            jsonValue = window["tt"].getStorageSync(key);
            if (jsonValue) {
                return jsonValue;
            }
        } else if (PlatformMgr.instance.isSec) {
            jsonValue = window["SecSDK"].storage.get(key);
            if (jsonValue) {
                return jsonValue;
            }
        } else {
            jsonValue = cc.sys.localStorage.getItem(key);
            if (jsonValue) {
                return jsonValue;
            }
        }
        return null;
    }

    removeJsonValue(key: string): void {
        if (PlatformMgr.instance.isDouyin) {
            window["tt"].removeStorageSync(key);
            // let key1 = key.split("_")[2];
            // window["tt"].removeStorageSync(key1);
        } else if (PlatformMgr.instance.isSec) {
            window["SecSDK"].storage.remove(key);
            // window["SecSDK"].storage.remove(key.split("_")[2]);
        } else {
            cc.sys.localStorage.removeItem(key);
        }
    }

    saveJsonValue(key: string, value: any): void {
        if (PlatformMgr.instance.isDouyin) {
            window["tt"].setStorageSync(key, value);
        } else if (PlatformMgr.instance.isSec) {
            window["SecSDK"].storage.set(key, value);
        } else {
            cc.sys.localStorage.setItem(key, value);
        }
    }

    // isOpenCloudDB(): boolean {
    //     let isOpen = false;
    //     if (PlatformMgr.instance?.isDouyin && this.openCloudDBList.includes(PlatformMgr?.instance?.adConfig?.AppId) && checkWhiteList(this.userOpenID)) {
    //         isOpen = true;
    //     }
    //     return isOpen
    // }

    // getCloudDBEnvID(): string {
    //     let envID = "";
    //     let isTest = false;
    //     let appid = PlatformMgr?.instance?.adConfig?.AppId;
    //     if (isTest) {
    //         if (appid = "tt3d984b25a292c8c302") {
    //             envID = "env-1oAbFXwiPu"
    //         }
    //     } else {
    //         if (appid = "tt3d984b25a292c8c302") {
    //             envID = "env-DXgs8IQ0iU"
    //         }
    //     }
    //     return envID;
    // }

    // getCloudDBServiceID(): string {
    //     let serviceID = "";
    //     let appid = PlatformMgr?.instance?.adConfig?.AppId;
    //     if (appid = "tt3d984b25a292c8c302") {
    //         serviceID = "1k4ip06jlmtjd"
    //     }

    //     return serviceID;
    // }

}