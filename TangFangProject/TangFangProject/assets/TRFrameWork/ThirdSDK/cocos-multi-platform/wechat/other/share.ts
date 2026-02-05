

export default class share {

    private static readonly titleArray: Array<string> = ["斩妖除魔就在现在，快来组队!",
    ];
    private static readonly imageUrl = "https://www.pipixia.xin/tt/loding.png";
    private static readonly imageUrlId = "bZQJfbtpTki+Vi5bM7ogag==";

    //----------------------------------------------------------------------
    /**
     * 打开微信左上角分享转发点击事件,在游戏逻辑中调用一次即可
     * 注意此方法只会在真机上执行，在微信模拟器环境下点击转发按钮什么都不会发生
     * 
     * @static
     * @param {string} titel 分享标题
     * @param {string} imageUrl 分享图片地址
     * @param {Function} [success] 成功回调函数(可不填)
     * @param {Function} [fail] 失败回调函数(可不填)
     * @param {Function} [complate] 完成回调函数，成功失败都会执行(可不填)
     * @memberof WXAPI
     */
    public static SetShareMenu(success?: Function, fail?: Function, complate?: Function) {
        if (window["wx"] && cc.sys.platform == cc.sys.WECHAT_GAME) {
            console.log("小游戏设置转发按钮");
            window["wx"].showShareMenu({
                withShareTicket: false,
                menus: ['shareAppMessage', 'shareTimeline'],
                success: success,
                fail: fail,
                complete: complate
            });

            window["wx"].onShareTimeline(function () {
                return {
                    title: share.titleArray[Math.floor(Math.random() * share.titleArray.length)],
                    imageUrl: share.imageUrl,
                    imageUrlId: share.imageUrlId
                }
            });

            window["wx"].onShareAppMessage(function () {
                return {
                    title: share.titleArray[Math.floor(Math.random() * share.titleArray.length)],
                    imageUrl: share.imageUrl,
                    imageUrlId: share.imageUrlId
                }
            });
        }
    }

    /**微信主动分享 */
    public static shareAppMessage(success?: Function) {
        window["wx"]?.shareAppMessage(function () {
            return {
                title: share.titleArray[Math.floor(Math.random() * share.titleArray.length)],
                imageUrl: share.imageUrl,
                imageUrlId: share.imageUrlId
            }
        });
    }
    protected static _onShow: Function = null;
    protected static _lastShareTime: number = 0;
    public static share_Menu(success?: Function) {

        if (window["wx"] && cc.sys.platform == cc.sys.WECHAT_GAME) {
            share._onShow = () => {
                window["wx"].offShow(share._onShow)
                share._onShow = null;
                var c = Date.now() - this._lastShareTime;
                if (success) {
                    if (Date.now() - this._lastShareTime > 2000) {
                        success();
                    }
                    else {
                        // complate(false)
                    }
                }
            }
            window["wx"].onShow(share._onShow)
            this._lastShareTime = Date.now();
            window["wx"].shareAppMessage(
                {
                    title: share.titleArray[Math.floor(Math.random() * share.titleArray.length)],
                    imageUrl: share.imageUrl,
                    imageUrlId: share.imageUrlId
                }
            );
        }
    }
}


