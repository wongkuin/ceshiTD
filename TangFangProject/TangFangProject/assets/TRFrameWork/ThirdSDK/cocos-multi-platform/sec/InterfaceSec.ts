
export interface RewardedVideoAdSec {
    load(): Promise<void>;
    show(): Promise<void>;

    onLoad(action: () => void): void;
    offLoad(action: () => void): void;

    onClose(action: (res: { isEnded: boolean }) => void): void;
    offClose(action: (res: { isEnded: boolean }) => void): void;

    onError(action: (res: { errMsg: string, errCode: number }) => void): void;
    offError(action: (res: { errMsg: string, errCode: number }) => void): void;
}

export interface InterstitialAd {
    show(): Promise<void>;
    load(): Promise<void>;
    destroy(): void;

    onLoad(action: () => void): void;
    offLoad(action: () => void): void;
    onError(action: (res: { errMsg: string, errCode: number }) => void): void;
    offError(action: () => void): void;

    onClose(action: () => void): void;
    offClose(action: () => void): void;

}

export interface SecAPI {

    /**
   * @link https://developers.weixin.qq.com/minigame/dev/api/base/app/life-cycle/wx.onHide.html
   */
    onHide(action?: () => void): void;
    /**
     * @link https://developers.weixin.qq.com/minigame/dev/api/base/app/life-cycle/wx.onShow.html
     */
    onShow(action?: () => void): void;

    /**
     * @link https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createRewardedVideoAd.html
     */
    createRewardedVideoAd(options: { adUnitId: string }): RewardedVideoAdSec;

    /**
    * 
    * @link https://developers.weixin.qq.com/minigame/dev/api/base/app/app-event/wx.onAudioInterruptionEnd.html
    */
    onAudioInterruptionEnd(action: () => void): void;

    /**
     * @link https://developers.weixin.qq.com/minigame/dev/api/navigate/wx.exitMiniProgram.html
    */
    exitMiniProgram(): void;

    /**
     * @link https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createInterstitialAd.html
     */
    createInterstitialAd(object: { adUnitId: string }): InterstitialAd;
}
