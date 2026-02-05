
interface RewardVideoOptionsKS
{
    /**
     * 广告位 id
     * 必填
     */
    adUnitId: string;
}

interface RewardVideoAdKS
{
    show();
    onError(callFunc: (ret: ErrKS) => void);
    onClose(callFunc: (ret: RewardVideoCloseRetKS) => void);
    destroy();
    offClose(callFunc: Function);
    offError(callFunc: Function);
}

interface RewardVideoCloseRetKS
{
    isEnded: boolean;
}

interface GameRecorderManagerKS
{
    start: Function;
    pause: Function;
    resume: Function;
    stop: Function;
    /**
     * 
     * @param event [start, stop, pause, resume, abort, error]
     * @param func 只有error和stop事件有参数返回
     */
    on: (event: string, func: (res: any) => void) => void;
    off: (event: string, func: (res: any) => void) => void;

    publishVideo: (options: RecorderPublishOptionsKS) => void;
}

interface RecorderPublishOptionsKS
{
    callback: (ret: RecorderErrKs) => void;

    /**
     * 分享文案模板id
     */
    mouldId: string;

    /**
     * 待发布的视频片段 videoID 或 videoID 数组。如果不传该字段，则默认发布最后一次 start，stop 之间生成的视频数据。若录屏失败则不会生成videoID，发布录屏会失败
     */
    video: number | number[];

    /**
     * 发布录屏携带字段信息，支持格式为格式为aaa=bbb&ccc=ddd。通过发布的视频打开游戏可以通过ks.getLaunchOptionsSync的query字段获取，此时获取的是一个object
     */
    query: string;

}

interface ErrKS
{
    msg: string;
    code: number;
}

interface RecorderErrKs
{
    error: {code: number, msg: string};
}

interface KSAPI
{
	onHide(action?: () => void): void;
	onShow(action?: (res: OnShowInfoBD) => void): void;

    createRewardedVideoAd(options: RewardVideoOptionsKS): RewardVideoAdKS;

    getGameRecorder(): GameRecorderManagerKS;

    vibrateShort(): void;
	
	login(options: {
        force: boolean
        , success?: (res: { errMsg: string, code: string, anonymousCode: string, isLogin: boolean }) => void
        , fail?: (res: { errMsg: string }) => void
        , complete?: (res: { errMsg: string, code: string, anonymousCode: string, isLogin: boolean }) => void
    }): void
	
	getUserInfo(options: {
        withCredentials: boolean
        , success?: (res: { errMsg: string, rawData: string, userInfo: any }) => void
        , fail?: (res: { errMsg: string }) => void
        , complete?: (res: { errMsg: string, rawData: string, userInfo: any }) => void
    }): void;

    checkCommonUse(options: {
        success: (res: { code: number,  msg: string, isCommonUse: boolean }) => void
        , fail: (res: {  code: number,errMsg: string }) => void
        , complete?: () => void
    }): void

    addCommonUse(options: {
        success: (res: { code: number,  msg: string, isCommonUse: boolean }) => void
        , fail: (res: {  code: number,errMsg: string }) => void
        , complete?: () => void
    }): void
	
}
