
/**信息 */
interface SystemInfoQQ {
    /**	设备品牌	 */
    brand: string;
    /**	设备型号	 */
    model: string;
    /** 设备像素比	*/
    pixelRatio: number;
    /**屏幕宽度，单位dp	 */
    screenWidth: number;
    /**	屏幕高度，单位dp */
    screenHeight: number;
    /**可使用窗口宽度，单位dp */
    windowWidth: number;
    /**可使用窗口高度，单位dp */
    windowHeight: number;
    /**状态栏的高度，单位dp */
    statusBarHeight: number;
    /**QQ设置的语言	 */
    language: string;
    /**QQ版本号	 */
    version: string;
    /**操作系统及版本	 */
    system: string;
    /**	客户端平台	 */
    platform: string;
    /**App平台，手机QQ为'qq'	 */
    AppPlatform: string;
    /**	用户字体大小（单位px）。以QQ客户端「我 - 设置 - 通用 - 字体大小」中的设置为准	 */
    fontSizeSetting: number;
    /**客户端基础库版本	 */
    SDKVersion: string;
    /**	设备性能等级（仅Android小游戏）。取值为：-2 或 0（该设备无法运行小游戏），-1（性能未知），>= 1（设备性能值，该值越高，设备性能越好，目前最高不到50） */
    benchmarkLevel: number;
    /**允许QQ使用相册的开关（仅 iOS 有效）	 */
    albumAuthorized: boolean;
    /**允许QQ使用摄像头的开关	 */
    cameraAuthorized: boolean;
    /**	允许QQ使用定位的开关	 */
    locationAuthorized: boolean;
    /**	允许QQ使用麦克风的开关	 */
    microphoneAuthorized: boolean;
    /**	允许QQ通知的开关（仅 iOS 有效）	 */
    notificationAuthorized: boolean;
    /**	允许QQ通知带有提醒的开关（仅 iOS 有效）	 */
    notificationAlertAuthorized: boolean;
    /**允许QQ通知带有标记的开关（仅 iOS 有效）	 */
    notificationBadgeAuthorized: boolean;
    /**允许QQ通知带有声音的开关（仅 iOS 有效）	 */
    notificationSoundAuthorized: boolean;
    /**蓝牙的系统开关	 */
    bluetoothEnabled: boolean;
    /**地理位置的系统开关	 */
    locationEnabled: boolean;
    /**Wi - Fi 的系统开关	 */
    wifiEnabled: boolean;
    /**右上角胶囊位置(仅Android小游戏)	 */
    navbarPosition: {
        /**距离屏幕顶部的距离 单位px */
        marginTop: number;
        /**胶囊的高度 单位px */
        navbarHeight: number;
        /**距离屏幕右侧的距离 单位px */
        marginRight: number;
        /**胶囊的宽度 单位px */
        navbarWidth: number;
    };
    /**在竖屏正方向下的安全区域	1.17.0 */
    safeArea: {
        /**	安全区域左上角横坐标 */
        left: number;
        /**安全区域右下角横坐标 */
        right: number;
        /**安全区域左上角纵坐标 */
        top: number;
        /**安全区域右下角纵坐标 */
        bottom: number;
        /**安全区域的宽度，单位逻辑像素 */
        width: number;
        /**安全区域的高度，单位逻辑像素 */
        height: number;
    };
}

/**
 * 更新 
*/
interface UpdateManagerQQ {
    onCheckForUpdate(action: (hasUpdate: boolean) => void): void;
    onUpdateReady(action: () => void): void;
    onUpdateFailed(action: (err: string) => void): void;
    applyUpdate(): void;
}

interface ModalOptionQQ {
    /**提示的标题 */
    title: string;
    /**提示的内容 */
    content: string;
    /**是否显示取消按钮 */
    showCancel?: boolean;
    /**取消按钮的文字，最多 4 个字符 */
    cancelText?: string;
    /**	取消按钮的文字颜色，必须是 16 进制格式的颜色字符串 */
    cancelColor?: string;
    /**确认按钮的文字，最多 4 个字符 */
    confirmText?: string;
    /**确认按钮的文字颜色，必须是 16 进制格式的颜色字符串 */
    confirmColor?: string;
    success?: (res: { confirm: boolean, cancel: boolean }) => void;
    fail?: () => void;
    complete?: () => void;
}

interface ToastOptionQQ {
    /**提示的内容	 */
    title: string;
    /**图标	 */
    icon?: "success" | "loading" | "none";
    /**自定义图标的本地路径，image 的优先级高于 icon	 */
    image?: string;
    /**提示的延迟时间 */
    duration?: number;
    /**是否显示透明蒙层，防止触摸穿透	 */
    mask?: boolean;
    /**接口调用成功的回调函数	 */
    success?: () => void;
    /**	接口调用失败的回调函数	 */
    fail?: () => void;
    /**	接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void;
}

interface RewardedVideoAdQQ {
    load(): Promise<void>;
    show(): Promise<void>;

    onLoad(action: () => void): void;
    offLoad(action: () => void): void;

    onClose(action: (res: { isEnded: boolean }) => void): void;
    offClose(action: (res: { isEnded: boolean }) => void): void;

    onError(action: (res: { errMsg: string, errCode: number }) => void): void;
    offError(action: (res: { errMsg: string, errCode: number }) => void): void;
}

interface QQAPI {

    /**
   * @link https://q.qq.com/wiki/develop/game/API/basic/miniprogram.html#qq-onshow
   */
    onHide(action?: () => void): void;
    /**
     * @link https://q.qq.com/wiki/develop/game/API/basic/miniprogram.html#qq-onhide
     */
    onShow(action?: () => void): void;
    /**
     * @link https://q.qq.com/wiki/develop/game/API/basic/system.html#qq-getsysteminfo
     */
    getSystemInfoSync(): SystemInfoQQ;
    /**
         * @link https://q.qq.com/wiki/develop/game/API/basic/system.html#qq-getsysteminfo
         */
    getSystemInfo(options: {
        success?: (res: SystemInfoQQ) => void
        , fail?: () => void
        , complete?: () => void
    });

    /**
     * @link https://q.qq.com/wiki/develop/game/API/basic/update.html#qq-getupdatemanager
     */
    getUpdateManager(): UpdateManagerQQ;

    /**
    * @link https://q.qq.com/wiki/develop/game/API/interface/interaction.html#qq-showmodal
    */
    showModal(options: ModalOptionQQ): void;

    /**
    * @link https://q.qq.com/wiki/develop/game/API/interface/interaction.html#qq-showtoast
    */
    showToast(options: ToastOptionQQ): void;

    /**
     * @link https://q.qq.com/wiki/develop/game/API/equipment/vibrate.html#qq-vibrateshort 
     * */
    vibrateShort(option: {
        success?: () => void
        , fail?: () => void
        , complete?: () => void
    }): void;

    /**
     * @link https://q.qq.com/wiki/develop/game/API/equipment/vibrate.html#qq-vibratelong
     * */
    vibrateLong(option: {
        success?: () => void
        , fail?: () => void
        , complete?: () => void
    }): void;

    /**
     * @link https://q.qq.com/wiki/develop/game/API/ad/qq.createRewardedVideoAd.html
     */
    createRewardedVideoAd(options: { adUnitId: string }): RewardedVideoAdQQ;

    /**
     * 
     * @link https://q.qq.com/wiki/develop/game/API/#%E5%B0%8F%E6%B8%B8%E6%88%8F
     */
    onAudioInterruptionEnd(action: () => void): void;

    /**
     * @link https://q.qq.com/wiki/develop/game/API/basic/miniprogram.html#qq-exitminiprogram 
    */
    exitMiniProgram():void;
}
