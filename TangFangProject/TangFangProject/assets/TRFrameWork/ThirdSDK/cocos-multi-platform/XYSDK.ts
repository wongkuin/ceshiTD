
/**
 * 新游SDK，目前暂定用于【字节小游戏】、【快手小游戏】投放使用
 * 必须要在我们后台录入相关游戏信息
 */


declare let tt: any;
declare let ks: any;
declare let wx: any;

class ServerParam {
    ydk;
    oObj = {};
    log_Key: "log";

    parse(request) {
        if (request == null || request == 'undefined') {
            return;
        }

        let jsonObj = JSON.parse(request);
        this.ydk = jsonObj.ydk;

        if (this.isEmptyObj(jsonObj.kvvo)) return;
        for (let i = 0; i < jsonObj.kvvo.length; i++) {
            let vo = jsonObj.kvvo[i];
            if (this.isEmptyObj(vo) || this.isEmptyObj(vo.key) || this.isEmptyObj(vo.values)) continue;

            if (!this.isEmptyObj(vo.key.keyName)) {
                let keyName: string = vo.key.keyName + "";

                if (keyName == "O") {
                    this.oObj = {};
                    for (let j = 0; j < vo.values.length; j++) {
                        const v = vo.values[j];
                        if (this.isEmptyObj(v) || this.isEmptyObj(v.value) || this.isEmptyObj(v.valueDetails)) continue;

                        this.oObj[v.value + ""] = v.valueDetails + "";
                    }
                    continue;
                }

            }

        }
    }

    getLog() {
        if (this.isEmptyObj(this.oObj) || this.isEmptyObj(this.oObj[this.log_Key])) return 0;
        if (Number.isNaN(this.oObj[this.log_Key])) return 0;
        return Number.parseInt(this.oObj[this.log_Key])
    }
    isEmptyObj(obj): boolean {
        return obj == null || obj == '' || obj == 'undefined';
    }
}

class XMLHttpTool {
    /**
         * 封装原生的XMLHttpRequest
         * 使其用法像ajax
         *
         * url          请求链接【必须】
         * method       请求类型【默认 GET】
         * data         请求数据
         * timeout      超时时间【默认5000毫秒】
         * contentType  请求协议头 [['Content-type', application/x-www-form-urlencoded]]
         * dataType     返回数据类型【默认text】【arraybuffer blob document json text】
         * success      成功时回调
         * error        失败时回调
         * context      上下文环境
         */
    sendReq(params: requestParam) {
        // 必要参数判断
        if (!params) {
            cc.error('http请求参数为空');
            return;
        }
        if (!params.url) {
            cc.error('http请求url为空');
            return;
        }

        // 默认参数补齐
        // success error context 不设置默认
        params.method = (params.method || 'GET').toUpperCase();
        params.data = params.data || {};
        params.timeout = params.timeout || 5000;
        params.contentType = params.contentType || [];
        params.dataType = params.dataType || '';

        // 对XHMHttp对象进行设置
        let xhr = new XMLHttpRequest();
        xhr.timeout = params.timeout;
        xhr.onload = e => {
            // 非200的都认为是失败
            // 假如服务器返回数据不规范，用了非200作为成功标志，这里会出现判断异常
            if (xhr.status == 200) {
                if (params.success) {
                    if (params.context) {
                        params.success.call(params.context, xhr.response);
                    } else {
                        params.success(xhr.response);
                    }
                }
            } else {
                if (params.error) {
                    if (params.context) {
                        params.error.call(
                            params.context,
                            'status:' + xhr.status
                        );
                    } else {
                        params.error('status:' + xhr.status);
                    }
                }
            }
        };
        xhr.ontimeout = e => {
            if (params.error) {
                if (params.context) {
                    params.error.call(params.context, e);
                } else {
                    params.error(e);
                }
            }
        };
        xhr.onerror = e => {
            if (params.error) {
                if (params.context) {
                    params.error.call(params.context, e);
                } else {
                    params.error(e);
                }
            }
        };
        xhr.onabort = e => {
            if (params.error) {
                if (params.context) {
                    params.error.call(params.context, e);
                } else {
                    params.error(e);
                }
            }
        };


        if (params.method == 'GET') {
            let str = "?"
            let num = 0;
            for (let i in params.data) {
                if (num != 0) str += "&"
                str += `${i}=${params.data[i] + ''}`
                num++;
            }
            params.url += str
        }
        // console.log("params.url", params.url)

        xhr.open(params.method, params.url, true);
        for (let i = 0; i < params.contentType.length; i += 2) {
            xhr.setRequestHeader(params.contentType[0], params.contentType[1]);
        }
        xhr.responseType = params.dataType;

        if (params.method == 'POST') {
            xhr.send(params.data);
        } else {
            xhr.send();
        }
    }
}

export default class XYSDK {

    static SDK_CONFIG = {
        logEnable: false,
        userSaveKey: "USER-DATA",
        requestParamUrl: "https://sdk2.haotgame.com/applets/fx/getKeyValueByAppletId",

        WX_loginUrl: "https://cplogin.mingdaa.cn/wx/cpLogin",

        DY_loginUrl: "https://cplogin.mingdaa.cn/dy/cpLogin",
        DY_CMY_ReportBaseUrl: "https://cp2.mingdaa.cn/dy",
        DY_CMY_ReportBaseUrl_onshow: "https://cp3.mingdaa.cn/dy/onshow",
        DY_GEV_ReportBaseUrl: "https://cp1.mingdaa.cn/dy",

        KS_loginUrl: "https://cplogin.mingdaa.cn/ks/cpLogin",
        KS_CMY_ReportBaseUrl: "http://cp2.mingdaa.cn:9876/ks",
        KS_CMY_ReportBaseUrl_onshow: "http://cp3.mingdaa.cn:8080/ks/onshow",
        KS_GEV_ReportBaseUrl: "http://cp1.mingdaa.cn:9876/ks",
    }

    /** 上报广告事件类型 */
    static AD_EVENT = {
        /** 广告展示 */
        onshow: "onshow",
    }

    /** 游戏事件 */
    static GAME_EVENT = {
        lv: "lv",
        rvshow: "rvshow",
        rvend: "rvend",
    }

    /** 广告类型 */
    static AD_TYPE = {
        /** 激励视频 */
        rewardVideo: "rewardVideo",
        /** 多次激励视频 */
        rewardVideoMulti: "rewardVideo",
    }

    /** 渠道类型 */
    static CHANNEL_TYPE = {
        /** 微信小游戏 */
        WX_MINI: 1,
        /** 抖音小游戏 */
        DY_MINI: 2,
        /** 快手小游戏 */
        KS_MINI: 3,
    }

    /**
     * 日志控制
     * @param enable 是否开启
     */
    static setLogEnable(enable) {
        this.SDK_CONFIG.logEnable = enable;
    }

    static log(...param) {
        if (!this.SDK_CONFIG.logEnable) return;

        console.log("XYSDK===:", param);
    }
    static error(...param) {
        if (!this.SDK_CONFIG.logEnable) return;

        console.error("XYSDK===:", param);
    }

    /** 用户数据 */
    static userData: userDataParam;
    static packageId: string; // 包名
    static packageVersion: string; //包版本
    static channelType: number; // 渠道类型
    static serverParam: ServerParam = null;

    /**
     * 初始化
     * @param param 初始化参数
     */
    static init(param: initParam) {
        this.log("开始初始化");
        if (!this.serverParam) this.serverParam = new ServerParam();
        this.packageId = param.packageId;
        this.packageVersion = param.packageVersion;
        this.channelType = param.channelType;
        this.userData = {
            userMark: "",
            openId: "",
            clickId: "",
            requestId: "",
            queryStr: "",
        };

        let launchOption = this.getLaunchOpt();
        if (!launchOption) {
            this.error("平台初始化错误，请检查.")
            return;
        }

        let d = this.getData(this.SDK_CONFIG.userSaveKey);
        if (!d || d == '') {
            this.userData.clickId = launchOption.query.clickid || '';
            this.userData.requestId = launchOption.query.requestid || '';
            this.userData.openId = '';

            if (!param.userMark || param.userMark.trim() == "") {
                param.userMark = this.getUUID();
            }
            this.userData.userMark = param.userMark;
            this.userData.queryStr = this.getQueryStr(launchOption);

            let str = JSON.stringify(this.userData);
            this.saveData(this.SDK_CONFIG.userSaveKey, str);

            this.log("新用户数据：", str);
        }
        else {
            this.userData = JSON.parse(d);

            this.log("旧用户数据：", d);
        }

        this.log("初始化完成");
    }

    static getUUID() {
        let id = "";
        id += new Date().getTime().toString();
        id += cc.sys.os;
        id += Math.random();
        return Md5.hashStr(id);
    }

    //获取启动参数
    static getLaunchOpt() {
        switch (this.channelType) {
            case this.CHANNEL_TYPE.DY_MINI:
                return tt.getLaunchOptionsSync();
            case this.CHANNEL_TYPE.KS_MINI:
                return ks.getLaunchOptionsSync();
            case this.CHANNEL_TYPE.WX_MINI:
                return wx.getLaunchOptionsSync();
        }
        return null;
    }

    static getQueryStr(launchOpt) {
        switch (this.channelType) {
            case this.CHANNEL_TYPE.DY_MINI:
                return `${launchOpt.query.adid || ''}@*${launchOpt.query.aid || ''}@*${launchOpt.query.appId || ''}@*${launchOpt.query.clickid || ''}@*${launchOpt.query.creativeid || ''}@*${launchOpt.query.creativetype || ''}@*${launchOpt.query.mpVersion || ''}@*${launchOpt.query.projectid || ''}@*${launchOpt.query.promotionid || ''}@*${launchOpt.query.requestid || ''}@*${launchOpt.scene || ''}`
            case this.CHANNEL_TYPE.KS_MINI:
                return `${launchOpt.query.callback || ''}@*${launchOpt.query.account_id || ''}@*${launchOpt.query.campaign_id || ''}@*${launchOpt.query.unit_id || ''}@*${launchOpt.query.creative_id || ''}@*${launchOpt.query.gsid || ''}@*${launchOpt.from || ''}`;
        }
        return "";
    }

    /**
     * 登录,请在平台的login回调里面调用
     * @param param 登录参数
     * @param succCB 登录成功回调，返回json字符串
     * @param failCB 登录失败回调
     * @returns 
     */
    static login(param: loginParam, succCB: Function, failCB: Function) {

        if (this.userData.openId != undefined && this.userData.openId != null && this.userData.openId != '' && this.userData.openId != '-') {
            this.log("login:openId 已经存在，不需要重新获取");
            succCB && succCB(JSON.stringify({ openid: this.userData.openId }));
            this.requestServerParam();
            return;
        }

        //登录请求参数
        let params = {
            code: param.code,
            loginType: this.channelType,
            appId: param.appId,
            clickId: this.userData.clickId || '',
            requestId: this.userData.requestId || '',
            userMark: this.userData.userMark || '',
            brand: cc.sys.os || '',
        }

        this.log("login:", params);

        let url = ""
        switch (this.channelType) {
            case this.CHANNEL_TYPE.DY_MINI:
                url = this.SDK_CONFIG.DY_loginUrl;
                break;
            case this.CHANNEL_TYPE.KS_MINI:
                url = this.SDK_CONFIG.KS_loginUrl;
                break;
            case this.CHANNEL_TYPE.WX_MINI:
                url = this.SDK_CONFIG.WX_loginUrl;
                break;
        }
        if (url == "") {
            this.error("登录平台错误，请检查。")
            return;
        }

        let self = this;
        //网络请求参数
        let reqParam = {
            url: url,
            data: params,
            method: "GET",
            success: (result) => {
                self.log("login-success call back:", result);
                succCB && succCB(result);

                //解析openid
                let resObj = JSON.parse(result);
                self.userData.openId = resObj.openid;
                self.saveData(self.SDK_CONFIG.userSaveKey, JSON.stringify(self.userData));

                self.requestServerParam();
            },
            error: (errMsg) => {
                self.log("login-fail call back:", errMsg);

                failCB && failCB(errMsg)
            },
        }

        new XMLHttpTool().sendReq(reqParam);
    }

    private static requestServerParam() {

        this.log("start request server param");

        let params = {};

        params["appletId"] = this.packageId;
        params["packageName"] = this.packageId + `(${this.version()}_${this.packageVersion})`;
        params["userMark"] = this.userData.userMark;
        params["clickid"] = this.userData.clickId;
        params["oaid"] = this.userData.openId;
        params["brand"] = cc.sys.os || '';
        params["userLocalTime"] = new Date().getTime() + "";
        params["extension"] = this.userData.queryStr;

        let realUrl = this.SDK_CONFIG.requestParamUrl + '?';
        for (let i in params) {
            realUrl += `${i}=${params[i] + ""}&`;
        }

        this.log("请求 url:");
        this.log(realUrl);

        let self = this;
        let reqParam = {
            url: realUrl,
            timeout: 1000,
            method: "POST",
            success: (requester) => {
                self.log(`request:${requester}`);
                self.serverParam.parse(requester);
            },
            error: (err) => {
                self.log("请求参数失败：");
                self.log(err);
            },
        }
        new XMLHttpTool().sendReq(reqParam);
    }

    //#region CMY

    /**
     * 上报广告信息
     * @param param 广告事件参数
     */
    static trackAdEvent(param: adEventParam) {
        switch (this.channelType) {
            case this.CHANNEL_TYPE.DY_MINI:
                this.dyTrackAdEvent(param);
                return;
            case this.CHANNEL_TYPE.KS_MINI:
                this.ksTrackAdEvent(param);
                return;
        }
    }

    private static dyTrackAdEvent(param: adEventParam) {
        if (param.msg && param.msg.length >= 480)
            param.msg = param.msg.substring(0, 480);

        let params = {};
        params["a"] = "CMY"
        params["b"] = param.adEvent;
        params["c"] = this.userData.userMark;
        params["d"] = this.packageId + `(${this.version()}_${this.packageVersion})`;
        params["e"] = this.userData.openId;
        params["f"] = param.adType + '_dy';
        params["g"] = new Date().getTime() + "";

        this.log("dyTrackAdEvent:", params);

        //非实际抖音平台不发送
        if (typeof tt === 'undefined')
            return;

        //网络请求参数
        let self = this;
        let reqParam = {
            retryTimes: 0,
            url: param.adEvent == this.AD_EVENT.onshow ? this.SDK_CONFIG.DY_CMY_ReportBaseUrl_onshow : this.SDK_CONFIG.DY_CMY_ReportBaseUrl,
            data: params,
            method: "POST",
            contentType: ['Content-Type', 'application/x-www-form-urlencoded'],
            success: (requester) => {
                self.log("抖音事件上报成功", requester);
            },
            error: (errMsg) => {
                self.log("上报失败", errMsg);
            },
        }
        new XMLHttpTool().sendReq(reqParam);
    }

    private static ksTrackAdEvent(param: adEventParam) {
        if (param.msg && param.msg.length >= 480)
            param.msg = param.msg.substring(0, 480);

        let params = {};
        params["a"] = "CMY"
        params["b"] = param.adEvent;
        params["c"] = this.userData.userMark;
        params["d"] = this.packageId + `(${this.version()}_${this.packageVersion})`;
        params["e"] = this.userData.openId;
        params["f"] = param.adType + '_ks';
        params["g"] = new Date().getTime() + "";

        this.log("快手事件:", params);

        //非实际抖音平台不发送
        if (typeof ks === 'undefined')
            return;

        //网络请求参数
        let self = this;
        let reqParam = {
            retryTimes: 0,
            url: param.adEvent == this.AD_EVENT.onshow ? this.SDK_CONFIG.KS_CMY_ReportBaseUrl_onshow : this.SDK_CONFIG.KS_CMY_ReportBaseUrl,
            data: params,
            method: "POST",
            contentType: ['Content-Type', 'application/x-www-form-urlencoded'],
            success: (requester) => {
                self.log("快手事件上报成功", requester);
            },
            error: (errMsg) => {
                self.log("上报失败", errMsg);
            },
        }
        new XMLHttpTool().sendReq(reqParam);
    }

    //#endregion

    //#region GEV

    /**
     * 上报关卡开始
     * @param mode 当前关卡的模式/章节
     * @param lvId 关卡ID
     * @param userTag 用户标签，abTest的功能
     */
    static lvStart(mode: string, lvId: string, userTag: string = "a") {
        var v = `${mode || ""}|${lvId || ""}|${"3"}|${0}|${userTag || ""}`;
        this.trackGameEvent(this.GAME_EVENT.lv, "lvType|lvId|result|time|config", v);
    }

    /**
     * 上报关卡结束
     * @param mode 当前关卡的模式/章节
     * @param lvId 关卡ID
     * @param lvState 关卡结束的状态，胜利0，输1，主动退出2
     * @param lvUseTime 关卡开始到结束的时间，单位秒
     * @param userTag 用户标签，abTest的功能
     * @returns 
     */
    static lvEnd(mode: string, lvId: string, lvState: string, lvUseTime: number, userTag: string = "a") {
        if (lvState != "0" && lvState != "1" && lvState != "2") {
            this.error("lvState 的值必须为0，1，2这三者之一!");
            return;
        }
        var v = `${mode || ""}|${lvId || ""}|${lvState}|${Math.floor(lvUseTime)}|${userTag || ""}`;
        this.trackGameEvent(this.GAME_EVENT.lv, "lvType|lvId|result|time|config", v);
    }

    /**
     * 上报激励视频广告展示，在show的then里面调用
     * @param adSpot 广告点名称
     * @param mode 当前关卡的模式/章节，非关卡内广告点传0
     * @param lvId 关卡ID，非关卡内广告点传0
     * @param userTag 用户标签，abTest的功能
     */
    static rvShow(adSpot: string, mode: string, lvId: string, userTag: string = "a") {
        var v = `${adSpot || "unknow"}|${mode || ""}|${lvId || ""}|${userTag || ""}`;
        this.trackGameEvent(this.GAME_EVENT.rvshow, "scene|lvType|lvId|config", v);
    }

    /**
     * 上报激励视频广告结束
     * @param adSpot 广告点名称
     * @param isGetReward 
     * @param mode 当前关卡的模式/章节，非关卡内广告点传0
     * @param lvId 关卡ID，非关卡内广告点传0
     * @param userTag 用户标签，abTest的功能
     */
    static rvClose(adSpot: string, isGetReward: boolean, mode: string, lvId: string, userTag: string = "a") {
        var v = `${adSpot || "unknow"}|${mode || ""}|${lvId || ""}|${userTag || ""}|${isGetReward ? "0" : "1"}`;
        this.trackGameEvent(this.GAME_EVENT.rvend, "scene|lvType|lvId|config|end", v);
    }

    private static trackGameEvent(event, param_name, param_value) {
        if (param_name && param_name.length >= 480)
            param_name = param_name.substring(0, 480);

        let params = {};
        params["a"] = "GEV"
        params["b"] = event;
        params["c"] = this.userData.userMark;
        params["d"] = this.packageId + `(${this.version()}_${this.packageVersion})`;
        params["e"] = param_value;
        params["f"] = param_name;
        params["g"] = new Date().getTime() + "";


        let realUrl = "";
        switch (this.channelType) {
            case this.CHANNEL_TYPE.DY_MINI:
                if (((1 << 2) & this.serverParam.getLog()) != 0) {
                    this.log("抖音GEV事件已关闭");
                    return;
                }
                realUrl = this.SDK_CONFIG.DY_GEV_ReportBaseUrl;
                break
            case this.CHANNEL_TYPE.KS_MINI:
                if (((1 << 3) & this.serverParam.getLog()) != 0) {
                    this.log("快手GEV事件已关闭");
                    return;
                }
                realUrl = this.SDK_CONFIG.KS_GEV_ReportBaseUrl;
                break;
        }

        if (realUrl == "")
            return;
        this.log("游戏事件上报：", params);

        if (cc.sys.platform == cc.sys.WIN32 ||
            cc.sys.platform == cc.sys.MACOS ||
            cc.sys.platform == cc.sys.DESKTOP_BROWSER ||
            cc.sys.platform == cc.sys.MOBILE_BROWSER)
            return;

        let self = this;
        let data = {
            url: realUrl,
            data: params,
            method: "POST",
            contentType: ['Content-Type', 'application/x-www-form-urlencoded'],
            success: (requester) => {
                self.log("游戏事件上报成功：", requester);
            },
            error: (errMsg) => {
                self.log("游戏事件上报失败：", errMsg);

            },
        }

        new XMLHttpTool().sendReq(data);
    }

    //#endregion

    /** 当前sdk版本号 */
    static version() {
        /** 修改上报地址，优化初始化流程 */
        return "1.0.4";
        /** 增加游戏事件上报 —— 20240408 */
        return "1.0.3";
        /** 增加快手 —— 20240320 */
        return "1.0.2";
        /** 初步版本 —— 20240312 */
        return "1.0.1";
    }

    /** 数据存放 */
    static saveData(k: string, v: string) {
        let key = "XYSDK-" + k;
        cc.sys.localStorage.setItem(key, v);
    }
    /** 数据读取 */
    static getData(k: string) {
        let key = "XYSDK-" + k;
        return cc.sys.localStorage.getItem(key);
    }


}

/** 初始化参数 */
export interface initParam {
    /** 渠道类型，请使用 XYSDK.CHANNEL_TYPE 限定值 */
    channelType: number,
    /** 包名，组成规则【com.appid.wx】或者【com.appid.dy】等 */
    packageId: string;
    /** 游戏版本号，组成规则【1.0.1】，勿取0开头 */
    packageVersion: string;
    /** 玩家唯一ID，尽量生成的ID串是唯一，用于后端每个用户区分 */
    userMark?: string;
}

/** 登录参数 */
export interface loginParam {
    /** 平台登录回调的code */
    code: string;
    /** 平台appid */
    appId: string,
};

/** 上报事件参数 */
export interface adEventParam {
    /** 事件类型，请使用 XYSDK.AD_EVENT 限定值 */
    adEvent: string;
    /** 广告类型 */
    adType: string;
    /** 备注信息，非必需 */
    msg?: string;
}

/** 网络请求参数 */
interface requestParam {
    url: string; // 请求链接【必须】
    method?: string; // 请求类型【默认 GET】
    data?; // 请求数据【POST时才有效】
    timeout?: number; // 超时时间【默认5000毫秒】
    contentType?; // 请求协议头 [['Content-type', application/x-www-form-urlencoded]]
    dataType?; // 返回数据类型【默认text】【arraybuffer blob document json text】
    success?: Function; // 成功时回调
    error?: Function; // 失败时回调
    context?; // 上下文环境
}

/** 用户数据 */
interface userDataParam {
    userMark: string;
    openId: string;
    clickId: string;
    requestId: string;
    queryStr: string;
}


class Md5 {

    // One time hashing functions
    public static hashStr(str: string, raw?: false): string
    public static hashStr(str: string, raw?: true): Int32Array
    public static hashStr(str: string, raw: boolean = false) {
        return this.onePassHasher
            .start()
            .appendStr(str)
            .end(raw);
    }

    public static hashAsciiStr(str: string, raw?: false): string
    public static hashAsciiStr(str: string, raw?: true): Int32Array
    public static hashAsciiStr(str: string, raw: boolean = false) {
        return this.onePassHasher
            .start()
            .appendAsciiStr(str)
            .end(raw);
    }
    // Private Static Variables
    private static stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);
    private static buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    private static hexChars = '0123456789abcdef';
    private static hexOut: string[] = [];

    // Permanent instance is to use for one-call hashing
    private static onePassHasher = new Md5();

    private static _hex(x: any): string {
        const hc = Md5.hexChars;
        const ho = Md5.hexOut;
        let n;
        let offset;
        let j;
        let i;

        for (i = 0; i < 4; i += 1) {
            offset = i * 8;
            n = x[i];
            for (j = 0; j < 8; j += 2) {
                ho[offset + 1 + j] = hc.charAt(n & 0x0F);
                n >>>= 4;
                ho[offset + 0 + j] = hc.charAt(n & 0x0F);
                n >>>= 4;
            }
        }
        return ho.join('');
    }

    private static _md5cycle(x: Int32Array | Uint32Array, k: Int32Array | Uint32Array) {
        let a = x[0];
        let b = x[1];
        let c = x[2];
        let d = x[3];
        // ff()
        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[10] - 42063 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        // gg()
        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        // hh()
        a += (b ^ c ^ d) + k[5] - 378558 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        // ii()
        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
        b = (b << 21 | b >>> 11) + c | 0;

        x[0] = a + x[0] | 0;
        x[1] = b + x[1] | 0;
        x[2] = c + x[2] | 0;
        x[3] = d + x[3] | 0;
    }

    private _dataLength: number;
    private _bufferLength: number;

    private _state: Int32Array = new Int32Array(4);
    private _buffer: ArrayBuffer = new ArrayBuffer(68);
    private _buffer8: Uint8Array;
    private _buffer32: Uint32Array;

    constructor() {
        this._buffer8 = new Uint8Array(this._buffer, 0, 68);
        this._buffer32 = new Uint32Array(this._buffer, 0, 17);
        this.start();
    }

    public start() {
        this._dataLength = 0;
        this._bufferLength = 0;
        this._state.set(Md5.stateIdentity);
        return this;
    }

    // Char to code point to to array conversion:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
    // #Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
    public appendStr(str: string) {
        const buf8 = this._buffer8;
        const buf32 = this._buffer32;
        let bufLen = this._bufferLength;
        let code;
        let i;

        for (i = 0; i < str.length; i += 1) {
            code = str.charCodeAt(i);
            if (code < 128) {
                buf8[bufLen++] = code;
            } else if (code < 0x800) {
                buf8[bufLen++] = (code >>> 6) + 0xC0;
                buf8[bufLen++] = code & 0x3F | 0x80;
            } else if (code < 0xD800 || code > 0xDBFF) {
                buf8[bufLen++] = (code >>> 12) + 0xE0;
                buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                buf8[bufLen++] = (code & 0x3F) | 0x80;
            } else {
                code = ((code - 0xD800) * 0x400) + (str.charCodeAt(++i) - 0xDC00) + 0x10000;
                if (code > 0x10FFFF) {
                    throw new Error('Unicode standard supports code points up to U+10FFFF');
                }
                buf8[bufLen++] = (code >>> 18) + 0xF0;
                buf8[bufLen++] = (code >>> 12 & 0x3F) | 0x80;
                buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                buf8[bufLen++] = (code & 0x3F) | 0x80;
            }
            if (bufLen >= 64) {
                this._dataLength += 64;
                Md5._md5cycle(this._state, buf32);
                bufLen -= 64;
                buf32[0] = buf32[16];
            }
        }
        this._bufferLength = bufLen;
        return this;
    }

    public appendAsciiStr(str: string) {
        const buf8 = this._buffer8;
        const buf32 = this._buffer32;
        let bufLen = this._bufferLength;
        let i;
        let j = 0;

        for (; ;) {
            i = Math.min(str.length - j, 64 - bufLen);
            while (i--) {
                buf8[bufLen++] = str.charCodeAt(j++);
            }
            if (bufLen < 64) {
                break;
            }
            this._dataLength += 64;
            Md5._md5cycle(this._state, buf32);
            bufLen = 0;
        }
        this._bufferLength = bufLen;
        return this;
    }

    public appendByteArray(input: Uint8Array) {
        const buf8 = this._buffer8;
        const buf32 = this._buffer32;
        let bufLen = this._bufferLength;
        let i;
        let j = 0;

        for (; ;) {
            i = Math.min(input.length - j, 64 - bufLen);
            while (i--) {
                buf8[bufLen++] = input[j++];
            }
            if (bufLen < 64) {
                break;
            }
            this._dataLength += 64;
            Md5._md5cycle(this._state, buf32);
            bufLen = 0;
        }
        this._bufferLength = bufLen;
        return this;
    }

    public getState() {
        const self = this;
        const s = self._state;

        return {
            buffer: String.fromCharCode.apply(null, self._buffer8),
            buflen: self._bufferLength,
            length: self._dataLength,
            state: [s[0], s[1], s[2], s[3]]
        };
    }

    public setState(state: any) {
        const buf = state.buffer;
        const x = state.state;
        const s = this._state;
        let i;

        this._dataLength = state.length;
        this._bufferLength = state.buflen;
        s[0] = x[0];
        s[1] = x[1];
        s[2] = x[2];
        s[3] = x[3];

        for (i = 0; i < buf.length; i += 1) {
            this._buffer8[i] = buf.charCodeAt(i);
        }
    }

    public end(raw: boolean = false) {
        const bufLen = this._bufferLength;
        const buf8 = this._buffer8;
        const buf32 = this._buffer32;
        const i = (bufLen >> 2) + 1;
        let dataBitsLen;

        this._dataLength += bufLen;

        buf8[bufLen] = 0x80;
        buf8[bufLen + 1] = buf8[bufLen + 2] = buf8[bufLen + 3] = 0;
        buf32.set(Md5.buffer32Identity.subarray(i), i);

        if (bufLen > 55) {
            Md5._md5cycle(this._state, buf32);
            buf32.set(Md5.buffer32Identity);
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        dataBitsLen = this._dataLength * 8;
        if (dataBitsLen <= 0xFFFFFFFF) {
            buf32[14] = dataBitsLen;
        } else {
            const matches = dataBitsLen.toString(16).match(/(.*?)(.{0,8})$/);
            if (matches === null) {
                return;
            }

            const lo = parseInt(matches[2], 16);
            const hi = parseInt(matches[1], 16) || 0;

            buf32[14] = lo;
            buf32[15] = hi;
        }

        Md5._md5cycle(this._state, buf32);

        return raw ? this._state : Md5._hex(this._state);
    }
}
