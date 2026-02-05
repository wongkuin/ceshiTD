

import HttpMgr, { HttpType, requestParam } from "../../../../cocos-module/mgr/HttpMgr";
import { trackEventParam, ITrackBase } from "../../AdInterface";
import PlatformMgr from "../../PlatformManager";
import TrackerMgr from "../../TrackerMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TrackBD extends ITrackBase {
    private tt: BDAPI = window["tt"];
    appid: string = "";

    // DY_loginUrl: "https://cplogin.mingdaa.cn/dy/cpLogin";
    // DY_CMY_ReportBaseUrl: "https://cp2.mingdaa.cn/dy";
    // DY_CMY_ReportBaseUrl_onshow: "https://cp3.mingdaa.cn/dy/onshow";
    // DY_GEV_ReportBaseUrl: "https://cp1.mingdaa.cn/dy";



    url_analytics = "https://analytics.oceanengine.com/api/v2/conversion"

    init(version: string, userMark?: string) {

        this.appid = PlatformMgr.instance.adConfig.AppId;
        // if (!this.serverParam) this.serverParam = new ServerParam();
        this.packageId = `com.${PlatformMgr.instance.adConfig.AppId}.dy`
        this.packageVersion = version;
        this.userData = {
            userMark: "",
            openId: "",
            clickId: "",
            requestId: "",
            // queryStr: "",
        };

        let launchOption = this.tt.getLaunchOptionsSync();
        console.log("抖音启动参数：", launchOption);
        if (!launchOption) {
            cc.error("抖音平台初始化错误，请检查.")
            return;
        }

        let d = this.getData(this.userSaveKey);
        if (!d || d == '') {
            this.userData.clickId = launchOption.query.clickid || '';
            this.userData.requestId = launchOption.query.requestid || '';
            this.userData.openId = '';

            if (!userMark || userMark.trim() == "") {
                userMark = this.getUUID();
            }
            this.userData.userMark = userMark;

            // this.userData.queryStr = this.getQueryStr(launchOption);

            let str = JSON.stringify(this.userData);
            this.saveData(this.userSaveKey, str);

            console.log("新用户数据：", str);
        }
        else {
            this.userData = JSON.parse(d);
            console.log("旧用户数据：", d);
        }
        console.log("初始化完成");
    }


    login(openid: string) {
        //登录请求参数
        // let params = {
        //     code: openid,
        //     appId: this.appid,
        //     clickId: this.userData.clickId || '',
        //     requestId: this.userData.requestId || '',
        //     userMark: this.userData.userMark || '',
        //     brand: cc.sys.os || '',
        // }
        // console.log("登陆上报 login:", params);
        this.BDAnalytics();
    }


    private BDAnalytics() {
        let params = {
            "event_type": "active",
            "context": {
                "ad": {
                    "callback": this.userData.clickId,
                }
            },
            "timestamp": new Date().getTime(),
        }
        let realUrl = this.url_analytics;
        // this.log(realUrl);
        let reqParam: requestParam = {
            url: realUrl,
            timeout: 1000,
            data: params,
            dataType: "json",
            contentType: ['Content-type', "application/json"],
            method: HttpType.Post,
            success: (requester) => {
                // self.log(`request:${requester}`);
                // self.serverParam.parse(requester);
                console.log("抖音 请求参数成功：", requester);
            },
            error: (err) => {
                console.log("抖音 请求参数失败：", err);
            },
        }
        HttpMgr.getInstance().sendReq(reqParam);

    }



    trackAdEvent(param: trackEventParam) {
        console.log("抖音事件上报", param);
        // if (param.msg && param.msg.length >= 480)
        //     param.msg = param.msg.substring(0, 480);

        // let params = {};
        // params["a"] = "CMY"
        // params["b"] = param.adEvent;
        // params["c"] = this.userData.userMark;
        // params["d"] = this.packageId + `(${this.version()}_${this.packageVersion})`;
        // params["e"] = this.userData.openId;
        // params["f"] = param.adType + '_dy';
        // params["g"] = new Date().getTime() + "";

        // console.log("dyTrackAdEvent:", params);

        // //非实际抖音平台不发送
        // if (!this.tt)
        //     return;

        // //网络请求参数
        // let self = this;
        // let reqParam = {
        //     retryTimes: 0,
        //     url: param.adEvent == TrackerMgr.AD_EVENT.onshow ? this.DY_CMY_ReportBaseUrl_onshow : this.DY_CMY_ReportBaseUrl,
        //     data: params,
        //     method: "POST",
        //     contentType: ['Content-Type', 'application/x-www-form-urlencoded'],
        //     success: (requester) => {
        //         console.log("抖音事件上报成功", requester);
        //     },
        //     error: (errMsg) => {
        //         console.log("上报失败", errMsg);
        //     },
        // }
        // HttpMgr.getInstance().sendReq(reqParam);
    }


    getQueryStr(launchOpt: any) {
        return `${launchOpt.query.adid || ''}@*${launchOpt.query.aid || ''}@*${launchOpt.query.appId || ''}@*${launchOpt.query.clickid || ''}@*${launchOpt.query.creativeid || ''}@*${launchOpt.query.creativetype || ''}@*${launchOpt.query.mpVersion || ''}@*${launchOpt.query.projectid || ''}@*${launchOpt.query.promotionid || ''}@*${launchOpt.query.requestid || ''}@*${launchOpt.scene || ''}`
    }
}
