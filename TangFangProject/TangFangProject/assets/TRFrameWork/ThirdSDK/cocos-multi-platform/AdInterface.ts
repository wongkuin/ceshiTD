import UserKey from "../UserKey";
import PlatformMgr from "./PlatformManager";

export enum ePlatformKey {
    baidu = "baidu",
    bili = "bili",
    douyin = "douyin",
    ks = "ks",
    qq = "qq",
    sec = "sec",
    web = "web",
    wx = "wx",
}

/** Banner广告 */
export interface BannerInterface {
    init(id: string, interval?: number, width?: number, x?: number, y?: number): void;

    show(successCall?: Function, failCall?: Function, caller?: any): void;

    hide(): void;

    destroy(): void;

    setloadCallBack(successCall: Function, failCall: Function, caller: any): void;
}

/**激励视频 */
export interface RewardVideoInterface {
    play(id: string, callFunc: (state: number, ...ret: any[]) => void): void;
}

/**插屏广告 */
export interface InterstitialInterface {
    show(id: string, successCall?: () => void, failCall?: () => void): void;
    destroy(): void;
}

export interface OpenInterface {
    report(event: string, data: any): void;

    reportScene(object: { sceneId: number }): void;

    checkShortcut(success?: Function, fail?: Function): void;

    addShortcut(success?: Function, fail?: Function): void;

    alert(title: string, content: string): void;

    vibrateLong(): void;

    vibrateShort(): void;
}

/**分享相关 */
export interface ShareInterface {
    startRecord(call?: () => void): void;

    stopRecord(): void;

    pauseRecord(): void;

    resumeRecord(): void;

    shareVideo(path: string, success?: Function, fail?: Function): void;

    shareRecordVideo(success?: Function, fail?: Function): void;

    canShare(): boolean;

    getRecordState(): number;
    getRecordTime(): number;
    shareTemplate(templateId: string, action?: (result: boolean) => void): void;
}

/**更新接口 */
export interface UpdateInterface {
    checkForUpdate(): void;
}

/**登录接口 */
export interface LoginInterface {
    login(action: (userInfo: any) => void): void;
    loginReturnCode(action: (codeInfo: any) => void): void;
    getUserInfo(action: (userInfo: any) => void): void;
    isLogin(): boolean;

}

/**排行榜相关接口 */
export interface RankInterface {
    commit(id: string, score: number, params?: object, groupId?: string,): void;
    emit(event: string, params?: object): void;
    init(): void;
}

/**关注接口 */
export interface FollowInterface {
    follow(complete: (followed: boolean) => void): void;
    canUseFollow(): boolean;
}

/**群聊相关 */
export interface GroupInterface {
    joinGroup(id: string, complete?: (ret: boolean) => void): void;
    readonly isSupport: boolean;
}

export abstract class AdInterface {
    banner: BannerInterface;
    video: RewardVideoInterface;
    interstitial: InterstitialInterface;
    share: ShareInterface;
    open: OpenInterface;
    update: UpdateInterface;
    follow: FollowInterface;
    login: LoginInterface;
    rank: RankInterface;
    group: GroupInterface;
    abstract get platformKey(): string;
    abstract quit(): void;

    abstract navigateToScene(success: Function, fail: Function): void;
    abstract checkScene(success: Function, fail: Function): void;


    enterScene(): string { return ""; }
    vibrateShort(): void {
        console.log("vibrateShort");
    }

    getOpenId(func: (openId: string) => void) {
        let oid = UserKey.getInstance().getJsonValue('gm_openid');
        if (oid) {
            UserKey.getInstance().userOpenID = oid;
            UserKey.getInstance().deviceId = oid;
        } else {
            oid = PlatformMgr.instance.getLocakUUID();
            UserKey.getInstance().saveJsonValue('gm_openid', oid);
            UserKey.getInstance().userOpenID = oid;
            UserKey.getInstance().deviceId = oid;
        }
        func && func(oid);
    }

}


export abstract class ITrackBase {
    packageVersion: string = "";
    packageId: string = '';
    userData: userDataParam;

    requestParamUrl: "https://sdk2.haotgame.com/applets/fx/getKeyValueByAppletId";

    userSaveKey: string = "USER-DATA";

    abstract init(version: string);
    abstract login(openid: string);
    abstract trackAdEvent(pram: trackEventParam);

    // 请求数据
    getQueryStr(launchOpt: any) {
        return "";
    }
    /** 数据存放 */
    saveData(k: string, v: string) {
        let key = "XYSDK-" + k;
        UserKey.getInstance().saveJsonValue(key, v);
    }
    /** 数据读取 */
    getData(k: string) {
        let key = "XYSDK-" + k;
        // return cc.sys.localStorage.getItem(key);
        return UserKey.getInstance().getJsonValue(key);
    }

    getUUID() {
        return PlatformMgr.instance.getLocakUUID();
    }

    /** 当前sdk版本号 */
    version() {
        return "1.0.4";
    }
}

/** 上报事件参数 */
export interface trackEventParam {
    event_id: string;
    /** 广告类型 */
    type_id: string;
    /** 备注信息，非必需 */
    msg: Map<string, string>;
}

/** 用户数据 */
export interface userDataParam {
    userMark: string;
    openId: string;
    clickId: string;
    requestId: string;
    // queryStr: string;
}

