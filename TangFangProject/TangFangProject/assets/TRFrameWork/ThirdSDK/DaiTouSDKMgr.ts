 

// const {ccclass, property} = cc._decorator;

// /** 代投抖音小游戏SDK */
// @ccclass
// export default class DaiTouSDKMgr {
//     public wftSdk = null;
    
//     private static _instance: DaiTouSDKMgr;
//     public static get instance(): DaiTouSDKMgr
//     {
//         if (!this._instance)
//         {
//             this._instance =new DaiTouSDKMgr();
//         }
//         return this._instance;
//     }

//     /** sdk初始化 */
//     public initSdk(appKey: string) {
//         this.wftSdk = window["WftSdk"]?new window["WftSdk"]({ appKey: appKey, debug: true}):null; 
//     }

//     /** sdk登陆 */
//     public loginSdk(openId: string) {
//        this.wftSdk.reportActive({ openId: openId });
//     }

//     /** sdk激励视频广告上报 */
//     public reportAdSdk(videoId: string, isEnded: boolean, count: number, openId: string) {
//        this.wftSdk.reportAd({ adUnitId: videoId, isEnded: isEnded, count: count, openId: openId});
//     }

//     /** sdk插屏广告上报 */
//     public reportAdInterstitial(videoId: string, openId: string) {
//         this.wftSdk.reportAdInterstitial({ adUnitId: videoId, openId: openId});
//      }

//      /** sdkBanner广告上报 */
//     public reportAdBanner(videoId: string, openId: string) {
//         this.wftSdk.reportAdBanner({ adUnitId: videoId, openId: openId});
//      }

// }
