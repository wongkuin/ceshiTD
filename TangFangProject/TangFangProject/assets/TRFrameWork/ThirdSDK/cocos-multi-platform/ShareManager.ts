class Options implements ShareParamBD {
    // 转发内容类型
    channel: string;

    // 分享素材模板 id，指定通过平台审核的 templateId 来选择分享内容，需在平台设置且通过审核
    templateId: string;

    // 分享文案，不传则默认使用后台配置内容或游戏简介
    desc: string;

    // 转发标题，不传则默认使用后台配置或当前小游戏的名称
    title: string;

    // 转发显示图片的链接，支持本地沙盒目录（ttfile://）或 相对代码包根目录的图片路径，不支持网络图片路径。显示图片长宽比推荐 5:4，不传或使用网络图片路径则默认使用小游戏icon。当channel = video | picture时，该字段不生效
    imageUrl: string;

    // 查询字符串，必须是 key1=val1&key2=val2 的格式。从这条转发消息进入后，可通过 tt.getLaunchOptionsSync 或 tt.onShow 获取启动参数中的 query用来实现信息透传
    query: string;

    // 附加信息（仅channel == video | picture 时生效）
    extra: any;

    // 分享成功后执行的回调函数
    success: Function;

    // 分享失败或者用户取消发布器后执行的回调函数
    fail: Function;

    // 分享完成（无论成功与否）后执行的回调函数
    complete: Function;

    // 官方文档
    // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/retweet/share-param
}

export default class ShareManager {
    public static _instance: ShareManager = null

    public static get instance() {
        if (null == this._instance) {
            this._instance = new ShareManager();
        }
        return this._instance
    }

    /**
     * 抖音分享
     * 
     * 官方文档
     * https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/operation1/ability/gain-user/retweet
     * 
     * 使用审核通过的分享素材，需在站内进行素材提审-->运营-流量配置-分享设置
     */
    public DyShareAppMessage1(success: Function, fail: Function) {
        let option = new Options();
        option.templateId = "";
        option.success = success;
        option.fail = fail;
        window["tt"].shareAppMessage(option);
    }

    /**
     * 抖音分享
     * 
     * 代码指定分享内容（图片、标题、描述）
     */
    public DyShareAppMessage2(title: string, desc: string, imageUrl: string, success: Function, fail: Function) {
        let option = new Options();
        option.title = title;
        option.desc = desc;
        option.imageUrl = imageUrl;
        option.success = success;
        option.fail = fail;
        window["tt"].shareAppMessage(option);
    }

    /**
     * 抖音分享
     * 
     * 邀请好友
     */
    public DyShareAppMessage3(title: string, desc: string, imageUrl: string, query: string, success: Function, fail: Function) {
        let option = new Options();
        option.channel = "invite";
        option.title = title;
        option.desc = desc;
        option.imageUrl = imageUrl;
        option.success = success;
        option.fail = fail;
        window["tt"].shareAppMessage(option);
    }

    /**
     * 快手分享
     * 私信分享，需在站内设置允许分享
     * 
     * 官方文档
     * https://mp.kuaishou.com/docs/develop/functionAccessGuide/share.html
     */
    public async KsShareAppMssage1() {
        await window["ks"].showShareMenu();
    }

}