
export interface RewardedVideoAdBaidu {
    load(): Promise<void>;
    show(): Promise<void>;

    onLoad(action: () => void): void;
    offLoad(action: () => void): void;

    onClose(action: (res: { isEnded: boolean }) => void): void;
    offClose(action: (res) => void): void;

    onError(action: (res: { errMsg: string, errCode: number }) => void): void;
    offError(action: (res) => void): void;
    destroy(): void;
    
}

interface CheckSceneOptionsBaidu {
    scene: string;
    success: Function;
    complete: Function;
    fail: Function;
}

interface NavigateToSceneOptionsBaidu {
    scene: string;
    success: Function;
    complete: Function;
    fail: Function;
}

interface OnShowInfoBaidu {
    query: Object;
    refererInfo: Object;
    scene: string;
    launch_from: string;
    location: string;
}

interface RewardVideoOptionsBaidu {
    /**
     * 广告位 id
     * 必填
     */
    adUnitId: string;
    appSid: string;
}

interface ShortCutOptionBaidu {
    success: Function;
    fail: Function;
}

export interface BaiduAPI {


    onHide(action?: () => void): void;

    onShow(action?: (res: OnShowInfoBaidu) => void): void;

    checkScene(options: CheckSceneOptionsBaidu): void;

    navigateToScene(options: NavigateToSceneOptionsBaidu): void;

    createRewardedVideoAd(options: RewardVideoOptionsBaidu): RewardedVideoAdBaidu;
    reportAnalytics(eventName: string, data: any): void;
    addShortcut(options: ShortCutOptionBaidu): void;
    checkShortcut(options: ShortCutOptionBaidu): void;

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
