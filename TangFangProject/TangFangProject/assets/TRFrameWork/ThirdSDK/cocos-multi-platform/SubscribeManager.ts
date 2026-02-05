class Options {
    tmplIds: Array<string>;

    success: Function;

    fail: Function;

    complete: Function;
}

export default class SubscribeManager {
    public static _instance: SubscribeManager = null

    public static get instance() {
        if (null == this._instance) {
            this._instance = new SubscribeManager();
        }
        return this._instance
    }

    /**
     * 抖音订阅
     * 
     * 只允许在以下时机中调用：点击事件、支付回调函数。
     * 最多一次可以传入三个模版 ID。
     * 模版分为一次性模版和长期性模版，一次性模版 ID 和长期性模版 ID 不可同时使用。
     * 版本更新提醒需要单独订阅。与其他混合的情况下会产生 1005 错误。
     * 
     * 消息ID（MSG开头）例 tmplIds: ['MSG13715']
     * 
     * 官方文档
     * https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/open-capacity/subscribe-message/tt-request-subscribe-message
     * 
     * 服务端发送订阅消息
     * https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/server/subscribe-notification/notify/
     */
    public DySubscribeMessage(tmplIds: Array<string>, success: Function, fail: Function) {
        let options = new Options();
        options.tmplIds = tmplIds;
        options.success = success;
        options.fail = fail;
        window["tt"].requestSubscribeMessage(options);
    }

    /**
     * 快手订阅
     * 登录 https://mp.kuaishou.com/ 在“模版消息”模块申请消息模版，审核通过后可以得到对应的“模版ID”
     * 
     * 例 tmplIds: ['YOUR_TEMPLATE_ID']
     * 
     * requestSubscribeMessage 返回值 Promise<Record<string, 'ACCEPT' | 'REFUSE'>>
     * 
     * 官方文档
     * https://mp.kuaishou.com/docs/develop/functionAccessGuide/message.html
     * 
     * 服务端发送订阅消息
     * https://mp.kuaishou.com/docs/develop/server/sendMessage.html
     */
    public async KSSubscribeMessage(tmplIds: Array<string>, success: Function, fail: Function) {
        let options = new Options();
        options.tmplIds = tmplIds;
        options.success = success;
        options.fail = fail;
        let res = await window["ks"].requestSubscribeMessage(options);
        if (res.YOUR_TEMPLATE_ID === 'ACCEPT') {
            // 用户同意订阅消息
            success();
        }
        else {
            // 用户拒绝订阅消息
            fail();
        }
    }
}