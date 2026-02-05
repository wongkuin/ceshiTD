// import { TimerUtils } from "../Common/Utils/TimeUtils";
// import GlobalEventMgr from "../cocos-module/mgr/GlobalEventMgr";
// import Utils from "../cocos-module/utils/Utils";
// import ADMgr from "./ADMgr";
// import PlatformMgr from "./cocos-multi-platform/PlatformManager";

// const { ccclass, property } = cc._decorator;

// @ccclass
// export default class OhayooAdMgr {
//     private static _instance: OhayooAdMgr;
//     private static iswuguang: boolean = true;
//     private static guanggaotime: number = 0;
//     private static max_guanggao_time = 800;

//     public static get instance(): OhayooAdMgr {
//         if (this._instance == null) {
//             this._instance = new OhayooAdMgr();
//         }
//         return this._instance;
//     }

//     public h5AdCallback(key: string, isSuccess: string = "", caller: string = "") {
//         setTimeout(() => {
//             let isAdSuccess: boolean = (isSuccess == "true" ? true : false);
//             GlobalEventMgr.getInstance().emit(key, isAdSuccess);
//         }, 100);
//     }

//     public AdCallback(key: string, isSuccess: string = "", caller: string = "") {
//         const isAdSuccess: boolean = (isSuccess == "true" ? true : false);
//         console.log("视频播放成功回调11111", key, isAdSuccess)
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             // if (isAdSuccess) {
//             console.log("视频播放成功回调", key, isAdSuccess)
//             // setTimeout(() => {
//             //     GlobalEventMgr.getInstance().emit(key, isAdSuccess);
//             // }, 100);
//             TimerUtils.instance.once(() => {
//                 GlobalEventMgr.getInstance().emit(key, isAdSuccess);
//             })
//             // }
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             console.log("视频播放成功回调", key)
//             //setTimeout(() => {
//             // GlobalEventMgr.getInstance().emit(key, isAdSuccess);
//             //}, 100);
//             TimerUtils.instance.once(() => {
//                 GlobalEventMgr.getInstance().emit(key, isAdSuccess);
//             })
//         }

//     }

//     public ShowRewardAd(caller_key: string, ad_position_type?: string, ad_position?: string) {
//         // if (this.isRealplatform()) {
//         //     ADMgr.getInstance().showRewardVideo({ scene: ad_position, key: caller_key });
//         //     return;
//         // }

//         // if (OhayooAdMgr.iswuguang) {
//         //     GlobalEventMgr.getInstance().emit(caller_key, true);
//         //     return;
//         // }


//         // if ((Utils.getNowSecondTime() - OhayooAdMgr.guanggaotime) < OhayooAdMgr.max_guanggao_time) {
//         //     return;
//         // }
//         // OhayooAdMgr.guanggaotime = Utils.getNowSecondTime();

//         // if (!cc.sys.isNative) { return; }
//         // if (cc.sys.platform == cc.sys.ANDROID) {
//         //     jsb.reflection.callStaticMethod("main/Application", "showRewardAd", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", caller_key, ad_position_type, ad_position);
//         // }
//         // else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//         //     jsb.reflection.callStaticMethod("AppController", "showVedio:withad_postion_type:withad_postion:", caller_key, ad_position_type, ad_position);
//         // }

//     }

//     public reportGameInit(initid: string, initname: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportGameInit", "(Ljava/lang/String;Ljava/lang/String;)V", initid, initname);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportGameInit:withName:", initid, initname);
//         }
//     }

//     public reportLevel(level: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportLevel", "(Ljava/lang/String;)V", level);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportLevel:", level);
//         }
//     }

//     public reportGuide(guideid: string, guidedesc: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportGuide", "(Ljava/lang/String;Ljava/lang/String;)V", guideid, guidedesc);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportGuide:withGuideDesc:", guideid, guidedesc);
//         }
//     }


//     public reportLevelUp(beflevel: string, aflevel: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportLevelUp", "(Ljava/lang/String;Ljava/lang/String;)V", beflevel, aflevel);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportLevelUp:withaflevel:", beflevel, aflevel);
//         }
//     }

//     public reportTaskFinish(taskid: string, taskname: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportTaskFinish", "(Ljava/lang/String;Ljava/lang/String;)V", taskid, taskname);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportTaskFinish:withtaskname:", taskid, taskname);
//         }
//     }

//     public reportUnlock(unlockname: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportUnlock", "(Ljava/lang/String;)V", unlockname);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportUnlock:", unlockname);
//         }
//     }

//     public reportAdBtnShow(ad_position: string, ad_position_type: string) {
//         if (!cc.sys.isNative) { return; }
//         if (cc.sys.platform == cc.sys.ANDROID) {
//             jsb.reflection.callStaticMethod("main/Application", "reportAdBtnShow", "(Ljava/lang/String;Ljava/lang/String;)V", ad_position, ad_position_type);
//         }
//         else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
//             jsb.reflection.callStaticMethod("AppController", "reportAdBtnShow:withad:", ad_position, ad_position_type);
//         }
//     }

//     public isRealplatform(): boolean {
//         return false;
//         // return PlatformMgr.instance?.platform?.isDouyin || PlatformMgr.instance?.platform?.isKS || PlatformMgr.instance?.platform?.isQQ || PlatformMgr.instance?.platform?.isWechat || PlatformMgr.instance?.platform?.IsSec || PlatformMgr.instance?.platform?.isBili || PlatformMgr.instance?.platform?.isBaidu
//     }
// }
