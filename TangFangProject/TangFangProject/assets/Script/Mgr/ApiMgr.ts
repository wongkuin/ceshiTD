import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import HttpMgr, { requestParam, HttpType, HttpOptions } from "../../TRFrameWork/cocos-module/mgr/HttpMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import NanoServer from "../../TRFrameWork/nano/NanoServer";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import UserKey from "../../TRFrameWork/ThirdSDK/UserKey";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import UIConfig from "../config/UIConfig";
import GameUserData from "../Data/GameUserData";



export default class ApiMgr extends Singleton<ApiMgr> {

    readonly url = "https://server1.hnyouzong.com/nano/"

    readonly debugUrl = "http://192.168.0.18:7078/"

    readonly GameUrl = "https://gametype.pipixia.xin/"

    socket: string = "server1.hnyouzong.com"
    port: number = 5000
    debug_socket: string = "192.168.0.18"
    readonly port_socket = 7080


    readonly _routes = {
        login: "api/auth/login",    // 登录接口
        verify: "api/auth/verify",  // 验证token接口
        upRank: "operation/rank/updateRankInfo",
        getRank: "operation/rank/getRankInfoEx",
    }

    login(type: string, code: string, device_id: string, encryptedData?: string, iv?: string) {

        let url = this.url
        if (CC_DEBUG) {
            url = this.debugUrl
            console.warn(url);
            //return;
        }
        url += this._routes.login;

        // console.warn(code, PlatformMgr?.instance?.adConfig?.AppId);
        let reqParam: requestParam = {
            url: url,
            timeout: 1000,
            dataType: "text",
            contentType: ['Content-type', "application/json;charset=utf-8"],
            data: JSON.stringify({
                // code: code,
                // game_key: PlatformMgr?.instance?.adConfig?.AppId || "",
                login_type: type,
                data: {
                    device_id: device_id,
                    code: code,
                    game_key: PlatformMgr.instance.adConfig.GameID,
                    channel_key: PlatformMgr.instance.adConfig.Channel,
                    platform_key: PlatformMgr.instance.adConfig.platformType,
                    encryptedData: encryptedData,
                    iv: iv
                }
            }),
            method: HttpType.Post,
            success: (response) => {

                let data = JSON.parse(response);
                console.log("登录成功：", data);
                UserKey.getInstance().user_id = data.user_id;
                // GameHelp.getInstance().getRankInfoEx();
                // GameHelp.getInstance().UpdateRankInfo(1, 3);
                //GameHelp.getInstance().UpdateRankInfo(2,1)

                // WebSocketMgr.getInstance().connectWS().then(() => {
                //     ApiMgr.getInstance().registerWSHandlers(); // 注册 WebSocket 消息处理器
                // })


                //  "ws://localhost:7080/ws";
                let sk = this.socket
                let port = this.port
                let ws = "wss";
                if (CC_DEBUG) {
                    sk = this.debug_socket
                    port = this.port_socket
                    ws = "ws"
                }
                NanoServer.getInstance().init(sk, port, ws).then(() => {
                    // let passId = 1;
                    // let boCi = 1;
                    // let ext = {
                    //     maxLv: passId + "",
                    //     boci: boCi + "",
                    // }
                    // let score = passId * 10000 + boCi
                    // ApiMgr.getInstance().UpdateRankInfo("square_def_score", score, ext)
                    console.log("NanoServer init success");
                })
            },
            error: (err) => {
                console.error("登录失败：", err);
            },
        }
        HttpMgr.getInstance().sendReq(reqParam);
    }


    /**上报排名 */
    UpdateRankInfo(type: string, score: number, extra: any) {
        return;
        console.warn("上报排行榜数据：", type, score, extra);
        NanoServer.getInstance().request('rank.updatescore', {
            rank_type: type,
            userId: UserKey.getInstance().user_id,
            score: score,
            extra: extra
        }, (response) => {
            console.log('UpdateRankInfo:', response);
            if (response) {
                console.log('UpdateRankInfo:', response);
            } else {
            }
        });
    }

    /**获取排行榜数据 */
    getRankInfoEx(type: string, callback: Function) {

        /**\
         * 
         * {
            "success": true,
            "rankType": "square_def_score",
            "page": 1,
            "pageSize": 50,
            "total": 227,
            "ranks": [
                {
                    "user_id": 1763548678166300,
                    "nickname": "神秘旅行者729",
                    "avatar": "/avatars/avatar_1.png",
                    "score": 30005,
                    "rank": 1,
                    "extra": {
                        "boci": "5",
                        "maxLv": "3"
                    }
                },
                .....
            ],
            "selfRank": {
                "user_id": 1763548675749600,
                "nickname": "",
                "avatar": "",
                "score": 20002,
                "rank": 6,
                "extra": {
                    "boci": "2",
                    "maxLv": "2"
                }
            }
        }
         */
        NanoServer.getInstance().request('rank.getranklist', {
            rank_type: type,
            userId: UserKey.getInstance().user_id,
            page: 1,
            page_size: 50
        }, (response) => {
            if (response) {
                console.log('Rank List:', response);
                if (!response.success) {
                    console.error("获取排行榜信息失败", response);
                    return;
                }
                callback && callback(response);
            } else {
            }
        });

        // let url = this.url;
        // if (CC_DEBUG) {
        //     //return;
        //     CC_DEBUG && (url = this.debugUrl)
        // }

        // const options: HttpOptions =
        // {
        //     httpType: HttpType.Get,
        //     url: url + "/operation/rank/getRankInfoEx" + "?rank_id=" + "level_rank" + "&game_code=" + PlatformMgr.instance.adConfig.GameID + "&top_x=" + 50 + "&user_id=" + UserKey.getInstance().user_id + "&around_y=" + 0 + "&include_self=" + 0 + "&platform_type=" + PlatformMgr.instance.adConfig.platformType + "&time_window_id=all_time",
        //     headers: [
        //         { key: "Content-Type", value: "application/json" }
        //     ],
        //     body:
        //     {
        //     },
        //     success: (response) => {
        //         console.log("请求排行榜信息", response);
        //         let data = JSON.parse(response).data;
        //         FormMgr.open(UIConfig.ui_PopRank, { rankData: data })
        //     },

        //     fail: () => {
        //     },
        // };
        // // console.log(options.url)
        // HttpMgr.getInstance().request(options);
    }

    setNickName(nickname: string = '') {
        return
        let url = this.GameUrl + "detail";
        if (!nickname || !nickname.length) nickname = GameUserData.getInstance().getUserName();
        let data = {
            "openid": GameUserData.getInstance().getGameUid(),
            "avatarUrl": "",
            "nickName": nickname
        }
        let reqParam: requestParam = {
            url: url,
            timeout: 1000,
            dataType: "text",
            contentType: ['Content-type', "application/json;charset=utf-8"],
            data: JSON.stringify(data),
            method: HttpType.Post,
            success: (response) => {
                let data = JSON.parse(response);
                console.log("设置名字成功", data, 'UserID', GameUserData.getInstance().getGameUid());
            },
            error: (err) => {
                console.error("设置名字失败", err, 'UserID', GameUserData.getInstance().getGameUid());
            },
        }
        HttpMgr.getInstance().sendReq(reqParam);
    }

    updateAppid() {
        return;
        // let url = this.GameUrl + "update/appid";
        // let id = GameUserData.getInstance().getUIDCommon();
        // const ser = GameUserData.getInstance().getSerValue();
        // let data = {
        //     "gameType": 1,
        //     "appIdMap": {
        //         id: ser
        //     },
        //     "password": "RAARCJtT9G51Zbj7AkzsYWTyAXcQJ5zd"
        // }
        // let reqParam: requestParam = {
        //     url: url,
        //     timeout: 1000,
        //     dataType: "text",
        //     contentType: ['Content-type', "application/json;charset=utf-8"],
        //     data: JSON.stringify(data),
        //     method: HttpType.Post,
        // }
        // HttpMgr.getInstance().sendReq(reqParam);
    }

    setPassRankInfo(point: number = 0) {
        return;
        let url = this.GameUrl + "upload/rank";
        if (!point) point = GameUserData.getInstance().PASS_ID;
        let data = {
            "uid": GameUserData.getInstance().getGameUid(),
            "appid": GameUserData.getInstance().getUIDCommon(),
            "point": point,
            "rankType": 1,//全国，2全省
            "subRankType": 1
        }
        let reqParam: requestParam = {
            url: url,
            timeout: 1000,
            dataType: "text",
            contentType: ['Content-type', "application/json;charset=utf-8"],
            data: JSON.stringify(data),
            method: HttpType.Post,
            success: (response) => {
                let data = JSON.parse(response);
                console.log("排行榜设置分数成功", data);
            }
        }
        HttpMgr.getInstance().sendReq(reqParam);
    }

    getPassRankInfo(suc: Function = null, errFunc: Function = null) {
        return;
        let url = this.GameUrl + "get/rank";
        let id = GameUserData.getInstance().getUIDCommon(), commonSer = GameUserData.getInstance().getSerValue()
        let data = {
            "uid": commonSer,
            "appid": id,
            "rankType": 1,//全国，2全省
            "subRankType": 1
        }
        let reqParam: requestParam = {
            url: url,
            timeout: 1000,
            dataType: "text",
            contentType: ['Content-type', "application/json;charset=utf-8"],
            data: JSON.stringify(data),
            method: HttpType.Post,
            success: (response) => {
                let data = JSON.parse(response);
                if (!data.data) {
                    console.error(`请求排行榜失败`);
                    return;
                }
                console.log("请求排行榜成功", data.data);
                suc && suc(data.data);
            },
            error: (err) => {
                console.log("请求排行榜失败", err);
                errFunc && errFunc();
            },
        }
        HttpMgr.getInstance().sendReq(reqParam);
    }

    /**获取排行榜数据 */
    getSnowRankInfoEx() {
        NanoServer.getInstance().request('rank.getranklist', {
            rank_type: 'square_def_world',
            userId: UserKey.getInstance().user_id,
            page: 1,
            page_size: 100
        }, (response) => {
            if (response) {
                console.log('Rank List:', response);
                if (!response.success) {
                    console.error("获取排行榜信息失败", response);
                    return;
                }
                // debugger;
                GlobalEventMgr.getInstance().emit(GlobalEventID.getSownRankData, response)
            } else {
            }
        });
    }


    // Token 管理
    setToken(token) {
        UserKey.getInstance().saveJsonValue('user_token', token);
    }

    getToken() {
        return UserKey.getInstance().getJsonValue('user_token');
    }

    clearToken() {
        UserKey.getInstance().removeJsonValue('user_token');
    }

    getAuthHeaders() {
        const token = this.getToken();
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
        return {};
    }

}