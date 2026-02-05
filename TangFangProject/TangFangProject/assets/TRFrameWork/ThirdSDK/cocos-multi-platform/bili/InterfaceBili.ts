
export interface RewardedVideoAdBili {
    load(): Promise<void>;
    show(): Promise<void>;

    onLoad(action: (res) => void): void;
    offLoad(action: (res) => void): void;

    onClose(action: (res: { isEnded: boolean }) => void): void;
    offClose(action: (res) => void): void;

    onError(action: (res: { errMsg: string, errCode: number }) => void): void;
    offError(action: (res) => void): void;
    destroy(): void;
    
}

interface CheckSceneOptionsBiLi {
    scene: string;
    success: Function;
    complete: Function;
    fail: Function;
}

interface NavigateToSceneOptionsBiLi {
    scene: string;
    success: Function;
    complete: Function;
    fail: Function;
}

interface OnShowInfoBiLi {
    query: Object;
    refererInfo: Object;
    scene: string;
    launch_from: string;
    location: string;
}

interface RewardVideoOptionsBiLi {
    /**
     * 广告位 id
     * 必填
     */
    adUnitId: string;
}

interface ShortCutOptionBiLi {
    success: Function;
    fail: Function;
}

export interface BiliAPI {

    /**
     * @link https://miniapp.bilibili.com/small-game-doc/api/base/applet/onHide/
     */
    onHide(action?: () => void): void;
    /**
     * @link https://miniapp.bilibili.com/small-game-doc/api/base/applet/onShow/
     */
    onShow(action?: (res: OnShowInfoBiLi) => void): void;

    checkScene(options: CheckSceneOptionsBiLi): void;

    navigateToScene(options: NavigateToSceneOptionsBiLi): void;

    /**
     * @link https://miniapp.bilibili.com/small-game-doc/open/ad/IncentiveVideo/
     */
    createRewardedVideoAd(options: RewardVideoOptionsBiLi): RewardedVideoAdBili;
    
    reportScene(object: {sceneId: number}): void;
    addShortcut(options: ShortCutOptionBiLi): void;
    checkShortcut(options: ShortCutOptionBiLi): void;

    login(options: {
        success?: (res) => void
        , fail?: (res) => void
        , complete?: (res) => void
    }): void;

    /**
     * @link 
    */
    exitMiniProgram(): void;
}
