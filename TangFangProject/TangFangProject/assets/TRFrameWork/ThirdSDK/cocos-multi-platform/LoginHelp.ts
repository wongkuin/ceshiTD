
// import GameHelp from "../../../Script/Mgr/GameHelp";
// import HttpMgr, { requestParam, HttpType } from "../../cocos-module/mgr/HttpMgr";
// import Singleton from "../../UIFrame/Singleton";
// import UserKey from "../UserKey";
// import PlatformMgr from "./PlatformManager";


// export default class LoginHelp extends Singleton<LoginHelp> {

//     url = "https://server1.hnyouzong.com:5053"

//     login(code: string) {
//         // if (CC_DEBUG) {
//         //return;
//         CC_DEBUG &&
//             (this.url = "http://192.168.0.19:8089")
//         // }
//         let jk = "/api/v1/miniprogram/login"
//         let url = this.url + jk;
//         if (CC_DEBUG) {
//             console.warn(url);
//             //return;
//         }
//         // console.warn(code, PlatformMgr?.instance?.adConfig?.AppId);

//         let reqParam: requestParam = {
//             url: url,
//             timeout: 1000,
//             dataType: "text",
//             contentType: ['Content-type', "text/plain; charset=utf-8"],
//             data: {
//                 code: code,
//                 appid: PlatformMgr?.instance?.adConfig?.AppId || "",
//                 game_id: PlatformMgr.instance.adConfig.GameID,
//                 channel: PlatformMgr.instance.adConfig.Channel,
//             },
//             method: HttpType.Post,
//             success: (response) => {
//                 // {
//                 //     "code": 0,
//                 //         "message": "string",
//                 //             "data": {
//                 //         "user_id": 0,
//                 //             "token": "string",
//                 //                 "expire_time": 0,
//                 //                     "user_info": {
//                 //             "id": 0,
//                 //                 "username": "string",
//                 //                     "nickname": "string",
//                 //                         "avatar": "string",
//                 //                             "gender": 0,
//                 //                                 "phone": "string",
//                 //                                     "email": "string",
//                 //                                         "register_time": "2025-09-17T10:06:05.032Z",
//                 //                                             "last_login_time": "2025-09-17T10:06:05.032Z",
//                 //                                                 "status": 0
//                 //         }
//                 //     }
//                 // }

//                 console.log("登录成功：", response);
//                 let data = JSON.parse(response).data;
//                 UserKey.getInstance().user_id = data.user_id;

//                 // GameHelp.getInstance().getRankInfoEx();
//                 // GameHelp.getInstance().UpdateRankInfo(1, 3);
//                 //GameHelp.getInstance().UpdateRankInfo(2,1)

//             },
//             error: (err) => {
//                 console.error("登录失败：", err);
//             },
//         }
//         HttpMgr.getInstance().sendReq(reqParam);

//     }


// }
