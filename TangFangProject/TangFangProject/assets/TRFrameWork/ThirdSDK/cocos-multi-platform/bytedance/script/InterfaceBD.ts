
interface RewardVideoOptionsBD {
    /**
     * 广告位 id
     * 必填
     */
    adUnitId: string;
}

interface RewardVideoAdBD {
    show();
    onError(callFunc: (ret: ErrBD) => void);
    onClose(callFunc: (ret: RewardVideoCloseRetBD) => void);
    offError(Function);
    offClose(Function);
    destroy();
}

interface RewardVideoCloseRetBD {
    isEnded: boolean;
    count: number;
}

interface GameRecorderManagerBD {
    start: Function;
    pause: Function;
    resume: Function;
    stop: Function;
    onStart: Function;
    onPause: Function;
    onStop: Function;
    onError: Function;
}

interface CheckSceneOptionsBD {
    scene: string;
    success: Function;
    complete: Function;
    fail: Function;
}

interface NavigateToSceneOptionsBD {
    scene: string;
    success: Function;
    complete: Function;
    fail: Function;
}

interface OnShowInfoBD {
    query: Object;
    refererInfo: Object;
    scene: string;
    launch_from: string;
    location: string;
}

interface RecordStartOptionsBD {
    /**
     * 录屏的时长，单位 s，必须大于 3s，最大值 300s（5 分钟）。
     */
    duration: number;

    /**
     * 是否添加水印，会在录制出来的视频上添加默认水印，目前不支持自定义水印图案。
     */
    isMarkOpen: boolean;

    /**
     * 水印距离屏幕上边界的位置，单位为 dp。
     */
    locTop: number;

    /**
     * 水印距离屏幕左边界的位置，单位为 dp。
     */
    locLeft: number;

    /**
     * 	设置录屏帧率，对于性能较差的手机可以调低参数以降低录屏性能消耗。
     */
    frameRate: number;
}
/**分享 */
interface ShareParamBD {
    channel: string;

    templateId: string;

    desc: string;

    title: string;

    imageUrl: string;

    query: string;

    extra: any;

    success: Function;

    fail: Function;

    complete: Function;
}

interface ErrBD {
    errMsg: string;
    errCode: number;
}

interface ModalOptionBD {
    title: string;
    content: string;
    confirmText: string;
    showCancel: boolean;
    cancelText: string;
    success?: Function;
    fail?: Function;
    complete?: Function;
}

interface ShortCutOptionBD {
    success: Function;
    fail: Function;
}

interface RankDB {
    commitRank(id: string, params: object): void;
}

interface UpdateManagerDB {
    onCheckForUpdate(action: (hasUpdate: boolean) => void): void;
    onUpdateReady(action: () => void): void;
    onUpdateFailed(action: (err: string) => void): void;
    applyUpdate(): void;
}


interface GroupInfo {
    /**群头像**/
    avatar_uri: string
    /**群描述**/
    description: string;
    /**	群门槛，如“无要求，万粉” */
    entry_limit: Array<any>;
    /**群现有人数**/
    exist_num: number;
    /**群 ID**/
    group_id: string;
    /* 群名 */
    group_name: string
    /* 群最大支持进入人数 */
    max_num: number;
    /* 群状态，正常:normal, 封禁:ban, 已满:full */
    status: string;
    /* 群标签，如活跃群，群主近期发言 */
    tags: Array<string>;
}

interface GridGamePanelInterface{
    /**展示 */
   play(position?:cc.Vec2):void
}

interface GridGamePanelBD {
    show();
    hide();
    destroy();
}

interface GridGamePanelOptionsBD{
    gridCount:string,
    size:string,
}



interface BDAPI {
    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/system/lifecycle/tt-on-hide/
     */
    onHide(action?: () => void): void;
    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/system/lifecycle/tt-on-show/
     */
    onShow(action?: (res: OnShowInfoBD) => void): void;

    getLaunchOptionsSync(): any;

    checkScene(options: CheckSceneOptionsBD): void;

    navigateToScene(options: NavigateToSceneOptionsBD): void;

    createRewardedVideoAd(options: RewardVideoOptionsBD): RewardVideoAdBD;

    createGridGamePanel(options):GridGamePanelBD; 

    reportAnalytics(eventName: string, data: any): void;

    getGameRecorderManager(): GameRecorderManagerBD;

    shareAppMessage(options: ShareParamBD): void;
    /**
     * @link  https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/interface/interfeedback/tt-show-modal/
     */
    showModal(options: ModalOptionBD): void;

    addShortcut(options: ShortCutOptionBD): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/device/shake/tt-vibrate-long/
     */
    checkShortcut(options: ShortCutOptionBD): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/device/shake/tt-vibrate-long/
     */
    vibrateLong(): void;
    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/device/shake/tt-vibrate-short/
     */
    vibrateShort(): void;

    /**
     * @lonk https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/log-in/tt-login
     */
    login(options: {
        force: boolean
        , success?: (res: { errMsg: string, code: string, anonymousCode: string, isLogin: boolean }) => void
        , fail?: (res: { errMsg: string }) => void
        , complete?: (res: { errMsg: string, code: string, anonymousCode: string, isLogin: boolean }) => void
    }): void

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/log-in/tt-check-session/
     */
    checkSession(options: {
        success?: (res: { errMsg: string }) => void
        , fail?: (res: { errMsg: string }) => void
        , complete?: (res: { errMsg: string }) => void
    }): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/user-information/tt-get-user-info/
     */
    getUserInfo(options: {
        withCredentials: boolean
        , success?: (res: { errMsg: string, rawData: string, userInfo: any }) => void
        , fail?: (res: { errMsg: string }) => void
        , complete?: (res: { errMsg: string, rawData: string, userInfo: any }) => void
    }): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/follow/tt-open-aweme-user-profile/
     */
    openAwemeUserProfile(options: {
        success?: (res: { errMsg: string }) => void,
        fail?: (res: { errMsg: string, errNo: number }) => void,
        complete?: (res: { errMsg: string, errNo?: number }) => void
    }): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/follow/tt-follow-aweme-user/
     */
    checkFollowAwemeState(options: {
        success?: (data: { errMsg: string, hasFollowed: boolean }) => void,
        fail?: (data: { errMsg: string }) => void,
        complete?: (data: { errMsg: string, hasFollowed: boolean }) => void
    }): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/device/system-information/tt-get-system-info-sync/
     */
    getSystemInfoSync(useCache: boolean): {
        /**操作系统版本 */
        system: string,
        /**操作系统类型 */
        platform: string,
        /**手机品牌**/
        brand: string,
        /**手机型号**/
        model: string,
        /**宿主 App 版本号（宿主指今日头条、抖音等）**/
        version: string,
        /**宿主 APP 名称，详情见 appName 说明**/
        appName: "Toutiao" | "Douyin" | "news_article_lite" | "live_stream" | "XiGua" | "PPX" | "douyin_lite" | "live_stream_lite" | "novel_fm" | "novelapp" | "reading"
        /**客户端基础库版本**/
        SDKVersion: string,
        /**屏幕宽度**/
        screenWidth: number,
        /**屏幕高度**/
        screenHeight: number,
        /**可使用窗口宽度**/
        windowWidth: number,
        /**可使用窗口高度**/
        windowHeight: number,
        /**设备像素比**/
        pixelRatio: number,

        /**状态栏的高度，单位 px**/
        statusBarHeight: number,

        /**在竖屏正方向下的安全区域 */
        safeArea: {
            left: number,
            right: number,
            top: number,
            bottom: number,
            width: number,

            height: number
        },

        /**电池电量 */
        battery: number,
        /**字体大小**/
        fontSizeSetting: string

        /**系统语言 */
        language: string
    };

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/foundation/tt-can-i-use/
     */
    canIUse(schema: string): boolean;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/open-capacity/user-information/set/tt-get-setting/
     */
    getSetting(options: {
        success?: (res: {
            errMsg: string
            , authSetting: {
                "scope.userInfo": boolean
                , "scope.userLocation": boolean
                , "scope.address": boolean
                , "scope.record": boolean
                , "scope.album": boolean
                , "scope.camera": boolean
                , "scope.calendar": boolean
            }
        }) => void,
        complete?: (res: {
            errMsg: string
            , authSetting: {
                "scope.userInfo": boolean
                , "scope.userLocation": boolean
                , "scope.address": boolean
                , "scope.record": boolean
                , "scope.album": boolean
                , "scope.camera": boolean
                , "scope.calendar": boolean
            }
        }) => void,
        fail?: (res: {
            errMsg: string
            , authSetting: {
                "scope.userInfo": boolean
                , "scope.userLocation": boolean
                , "scope.address": boolean
                , "scope.record": boolean
                , "scope.album": boolean
                , "scope.camera": boolean
                , "scope.calendar": boolean
            }
        }) => void
    }): void;

    setUserGroup(option: {
        groupId: string
        , success?: () => void
        , fail?: () => void
        , complete?: () => void
    }): void;

    /**https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/open-capacity/relationship-chain/open-data-area/tt-get-open-data-context/ */
    getOpenDataContext(): {
        canvas: {
            width: number,
            height: number,
            getContext(contextType: "2d" | "webgl"): void,
            toTempFilePath(object: object): void,
            toTempFilePathSync(object: object): void,
            toDataURL(): string,
            dispose(): void
        },
        postMessage(msg: object): void,
    };

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/system/lifecycle/tt-exit-mini-program/
     **/
    exitMiniProgram(options?: {
        /**	是否完全关闭小游戏，当该值为 true 时，会完全关闭小游戏，下次打开将重新进*/
        isFullExit?: boolean,
        success?: () => void,
        fail?: () => void,
        complete?: () => void,
    }): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/open-capacity/im-group/joinGroup
     */
    joinGroup(options: {
        groupid: string,
        success: (ret: { errMsg: string, data: string }) => void,
        fail: (ret: { errMsg: string }) => void,
        sessionFrom?: string,
        extraInfo?: string,
    }): void;

    /**
     * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/open-capacity/im-group/checkGroupInfo
     */
    checkGroupInfo(options: {
        openid: string,
        success: (ret: { errMsg: string, data: { group_info_list: Array<GroupInfo> } }) => void,
        fail: (ret: { errMsg: string }) => void,
        sessionFrom?: string,
        extraInfo?: string,
    }): void;
}
