// import AdManager from "../../cocos-multi-platform/AdManager";
// import UserKey from "../component/UserKey";
// import SlsTracker from '@aliyun-sls/web-track-mini'

import GameUserData from "../../../Script/Data/GameUserData";
import HttpMgr, { HttpType, requestParam } from "../../cocos-module/mgr/HttpMgr";
import Singleton from "../../UIFrame/Singleton";
import UserKey from "../UserKey";
import { trackEventParam, ITrackBase } from "./AdInterface";
import TrackBD from "./bytedance/script/TrackBD";
import PlatformMgr from "./PlatformManager";


export default class TrackerMgr extends Singleton<TrackerMgr> {

    private _trackerTask: any;
    private _trackerVideo: any;

    //yz = 'https://server1.hnyouzong.com:5000/api/log_global_common'
    yz = `https://server1.hnyouzong.com:5052/api/v1/tracking/event`;



    private _track: ITrackBase = null;

    private _gameid: string = "";
    private _channelid: string = 'null';
    private _version: string = ""
    private _platform: string = 'web';
    // private get _openid(): string {
    //     return UserKey.getInstance().userOpenID;
    // };


    /** 上报广告事件类型 */
    static AD_EVENT = {
        /** 广告展示 */
        onshow: "onshow",
    }

    /** 广告类型 */
    static AD_TYPE = {
        /** 激励视频 */
        rewardVideo: "rewardVideo",
        /** 多次激励视频 */
        rewardVideoMulti: "rewardVideo",
    }


    constructor() {
        super();
        this.doInit();
    }

    private doInit() {
        if (PlatformMgr.instance.isDouyin) {
            this._track = new TrackBD();
        }
    }

    public initTrack(gameid: string, channelid: string, version: string, platform: string) {
        // this._gameid = gameid;
        this._gameid = gameid;
        this._channelid = channelid;
        this._version = version;
        this._platform = platform;
        console.log("initTrack", gameid, channelid, version, platform);
        if (this._track) {
            this._track.init(version);
        }
    }

    public loginTrack(code: string) {
        if (this._track) {
            this._track.login(code);
        }
    }

    public trackGMEvent(parm: trackEventParam) {
        return;
        const jsonObj: Record<string, string> = {};
        parm.msg.forEach((value, key) => {
            jsonObj[key] = value;
        });

        if (this._track) {
            this._track.trackAdEvent(parm);
        }
        console.warn("打点上报:", JSON.stringify(parm), JSON.stringify(jsonObj));
        this.trackYZ(parm, jsonObj);
    }

    private trackYZ(pram: trackEventParam, jsonObj: Record<string, string>) {


        let url = this.yz;
        if (CC_DEBUG) {
            url = "http://192.168.0.18:8090/api/v1/tracking/event";
        }
        // if (CC_DEBUG) {
        //     console.warn(url);
        //     return;
        // }
        // let PlatformGameID = PlatformMgr.instance.isDouyin ? "dy_wjzl_001" : "wx_jcxmrc_001";
        // console.error("统计 请求参数：", PlatformGameID);

        let gCode = this._gameid;
        let channel = this._channelid;

        // console.error("统计 渠道", channel);
        let data = {
            "channel_id": this._channelid,
            // "device_info": {
            //     "additionalProp1": {}
            // },
            "duration": 0,
            "event_data": jsonObj, // JSON.stringify(jsonObj),
            "event_id": pram.event_id,
            "event_type": pram.type_id,
            "open_id": UserKey.getInstance().userOpenID,
            // "page_path": "string",
            "platform": this._platform.toString(),
            // "session_id": "string",
            "timestamp": Date.now(),
            "user_id": UserKey.getInstance().user_id + "",
            "version": this._version
        }

        let reqParam: requestParam = {
            url: url,
            timeout: 1000,
            dataType: "text",
            contentType: ['Content-type', "application/json;charset=utf-8", "X-Platform-Game-ID", channel, "X-Game-Code", gCode],
            data: JSON.stringify(data),
            method: HttpType.Post,
            success: (requester) => {
                console.log("统计 请求参数成功：", requester);
            },
            error: (err) => {
                console.log("统计 请求参数失败：", err);
            },
        }
        HttpMgr.getInstance().sendReq(reqParam);
        //console.log("统计 请求参数：", JSON.stringify(data));

    }


}