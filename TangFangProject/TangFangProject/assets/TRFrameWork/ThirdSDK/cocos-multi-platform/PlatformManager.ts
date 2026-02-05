//广告多平台开放接口管理器
//启用前需要挂载到常驻节点下
import { RewardVideoEvent } from "./AdConstant";
import AdEventComponent from "./AdEventComponent";
import ApiBD from "./bytedance/script/ApiBD";
import ApiKS from "./ks/ApiKS";
import ApiQQ from "./qq/ApiQQ";
import AdUtils from "./script/AdUtils";
import ApiWechat from "./wechat/ApiWechat";
import ApiSec from "./sec/ApiSec";
import ApiBili from "./bili/ApiBili";
import GameUserData from "../../../Script/Data/GameUserData";
// import GameSupplyData from "../../../Script/Data/GameSupplyData";
import { Md5TS } from "../../Common/Utils/Md5TS";
import { AdInterface } from "./AdInterface";
import TrackerMgr from "./TrackerMgr";
import ApiWeb from "./web/ApiWeb";
import GameTrackHelp from "../../../Script/Mgr/GameTrackHelp";
import UIConfig from "../../../Script/config/UIConfig";
import FormMgr from "../../UIFrame/FormMgr";
import { UIToast } from "../../UIFrame/UIForm";
import ToastMgr from "../../UIFrame/ToastMgr";
import GameHelp from "../../../Script/Mgr/GameHelp";
import PlatformHelp from "./PlatformHelp";
import SceneMgr from "../../UIFrame/SceneMgr";
import ApiMgr from "../../../Script/Mgr/ApiMgr";
import { UserKeyType } from "../../../Script/Data/UserKeyType";
import UserKey from "../UserKey";

const { ccclass, property } = cc._decorator;

export enum PlatformEvent {
    VideoShowing = "VideoShowing",
    VideoShowOver = "VideoShowOver",
    VideoReward = "VideoReward",
    VideoErr = "VideoIsErr",
    ShareErr = "ShareErr",
    SideBarReward = "SideBarReward", //侧边栏奖励
}

type RewardVideoOption = {
    /**视频场景,视频打点用 */
    scene: string;
    key?: string;
}



export type AppConfig = {
    GameID: string,
    GameName: string;
    Banner: Array<{ id: string, interval: number }>;
    RewardVideos: Array<string>;
    Interstitial: Array<string>;
    TemplateId: string;
    Channel: string;
    AppId: string;
    AppSecrect: string;
    PlatformRewardVideo: Array<string>;
    platform: number; // 当前
    Tips: string;
    platformType: number;  // 平台类型
    gameVer: string, //游戏版本号
    svnVer: number, //svn版本号
}


@ccclass
export default class PlatformMgr extends AdEventComponent {

    // @property(cc.JsonAsset)
    // protected config: cc.JsonAsset = null;

    // @property({ tooltip: "看视频时是否调用全局暂停，动画暂停" })
    protected isVideoPause: boolean = false;

    private _platform: AdInterface;
    public get platform(): AdInterface {
        return this._platform;
    }

    private static _instance: PlatformMgr = null;

    public adConfig: AppConfig;
    public vibrateEnabled: boolean = true;

    private videoIndex: number = 0;

    private isPalyVideo: boolean = false;

    public get gameName(): string {
        return this.adConfig.GameName;
    }


    public static get instance(): PlatformMgr {
        if (!this._instance) {
            this._instance = new PlatformMgr();
        }
        return this._instance;
    }

    public init(appCofig: cc.JsonAsset) {

        this.adConfig = appCofig.json;
        console.log("platform", cc.sys.platform, this.adConfig.platform, cc.sys.isBrowser, cc.sys.os);
        this.initPlatform(this.adConfig);
    }

    protected initPlatform(adConfig: AppConfig) {
        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER || CC_DEBUG) {
            this._platform = new ApiWeb(this.adConfig?.GameName);
        }
        else if (this.isDouyin) this._platform = new ApiBD(this.adConfig?.GameName);
        else if (this.isKS) this._platform = new ApiKS(this.adConfig?.GameName);
        else if (this.isQQ) this._platform = new ApiQQ(this.adConfig?.GameName);
        else if (this.isWechat) this._platform = new ApiWechat(this.adConfig?.GameName);
        else if (this.isSec) this._platform = new ApiSec(this.adConfig?.GameName);
        else if (this.isBili) this._platform = new ApiBili(this.adConfig?.GameName);
        // else if (this.isBaidu) this._interface = new ApiBai(this.adConfig?.GameName);

        TrackerMgr.getInstance().initTrack(adConfig.GameID, adConfig.Channel, adConfig.gameVer, this._platform.platformKey)
    }

    public getLocakUUID(): string {
        let id = "";
        id += new Date().getTime().toString();
        id += cc.sys.os;
        id += Math.random();
        return Md5TS.hashStr(id);
    }


    //*********** 广告接口 ********************/
    public async showRewardVideo(rewardCall: (b: boolean, k: string) => void, caller?: any, option?: RewardVideoOption, force = false) {
        console.log("showRewardVideo")
        let scene = option && option.scene;
        let key = option && option.key;
        let sceneName = SceneMgr.getCurrScene().screenName;

        // //免广券逻辑
        // if (sceneName == "TeamBattle" && GameUserData.getInstance().ticketAD <= 0) {
        //     rewardCall.call(caller, false, key);
        //     GameHelp.getInstance().showToast("免广告券不足");
        //     return;
        // }
        //免广券逻辑
        // if ((sceneName == "UISceneBattle" || sceneName == "TeamBattle") && GameUserData.getInstance().ticketAD > 0) {
        if ((sceneName == "UISceneBattle") && GameUserData.getInstance().ticketAD > 0) {
            this.emit(PlatformEvent.VideoReward);
            rewardCall.call(caller, true, key);
            GameUserData.getInstance().useTicketAD();
            GameHelp.getInstance().showToast("已使用一次免广告券");
            return;
        }
        // if (!this.platform?.video || force) {
        if (true) {
            // GameSupplyData.getInstance().addWatchADNum();
            this.emit(PlatformEvent.VideoReward);
            rewardCall.call(caller, true, key);
            return;
        }

        let videoIds = this.adConfig.RewardVideos;
        if (!videoIds || videoIds.length <= 0) return;

        if (this.isPalyVideo) return
        this.isPalyVideo = true;

        let timestamp = new Date().getTime();
        let id = videoIds[0];
        if (id.length < 1) {
            rewardCall.call(caller, true, key);
            return;
        }
        this.videoIndex++;
        if (this.videoIndex >= videoIds.length) this.videoIndex = 0;
        let splash: UIToast = await FormMgr.open(UIConfig.ui_videoSplash) as UIToast;
        this.platform?.video.play(id, (state: number, ...ret: any[]) => {
            if (cc.isValid(splash)) {
                ToastMgr.close(splash, null);
                splash = null;
            }

            switch (state) {
                case RewardVideoEvent.CloseReward:
                    this.rewardVideoClose();
                    // GameSupplyData.getInstance().addWatchADNum();
                    rewardCall.call(caller, true, key);
                    this.emit(PlatformEvent.VideoReward);
                    this.reportVideoEvent(option.scene, '1');
                    break;
                case RewardVideoEvent.PlayErr:
                    this.rewardVideoClose();
                    rewardCall.call(caller, false, key);
                    this.onRewardVideoErrListener.call(this, ...ret);
                    this.reportVideoEvent(option.scene, '3');
                    break;
                case RewardVideoEvent.Close:
                    this.rewardVideoClose();
                    rewardCall.call(caller, false, key);
                    this.reportVideoEvent(option.scene, '2');
                    break;
                case RewardVideoEvent.PlaySuccess:
                    if (this.isVideoPause) {
                        AdUtils.pauseAllAnims();
                    }
                    cc.game.pause();

                    // TrackerMgr.getInstance().trackGMEvent({
                    //     event_id: TrackerMgr.AD_EVENT.onshow,
                    //     type_id: TrackerMgr.AD_TYPE.rewardVideo,
                    //     msg: new Map()
                    // });
                    break;
            }
            this.isPalyVideo = false;
        });
        this.emit(PlatformEvent.VideoShowing);
    }


    private onRewardVideoErrListener(errMsg: string, errCode: number) {
        this.emit(PlatformEvent.VideoErr, "视频拉取失败，请稍候再试");
    }

    private rewardVideoClose() {
        cc.game.resume();
        if (this.isVideoPause) {
            AdUtils.resumeAllAnims();
        }
        cc.audioEngine.pauseMusic();
        cc.audioEngine.pauseAllEffects();

        cc.audioEngine.resumeMusic();
        cc.audioEngine.resumeAllEffects();
        this.emit(PlatformEvent.VideoShowOver);
    }

    /**
   * 插屏广告
   * @param success 
   * @param fail 
   * @returns 
   */
    public showInterstitial(success?: () => void, fail?: () => void) {
        // this.platform.interface.interstitial
        let interID = this.adConfig.Interstitial;
        if (!interID || interID.length <= 0) return;
        this.platform.interstitial.show(interID[0], success, fail);
    }

    //*********** 广告接口 end  ********************/

    // 打开侧边栏
    public navigateToScene() {
        this.platform.navigateToScene(() => {
            this.emit(PlatformEvent.SideBarReward);
        }, () => {

        });
    }

    // 侧边栏 场景检查
    public checkScene(success: () => void, fail: () => void) {
        this.platform.checkScene(success, fail);
    }

    // 侧边栏 进入场景
    public enterScene(): string {
        return this.platform.enterScene();
    }


    //*********** 录频接口 ********************/

    /**
     * 开始录屏
     */
    public startRecord(call?: () => void) {
        this.platform?.share?.startRecord(call);
    }

    public stopRecord() {
        this.platform?.share?.stopRecord();
    }

    public pauseRecord() {
        this.platform?.share?.pauseRecord();
    }

    public resumeRecord() {
        this.platform?.share?.resumeRecord();
    }


    public shareVideo(success?: () => void, fail?: () => void) {
        if (!this.platform?.share) {
            return;
        }

        if (!this.platform?.share.canShare()) {
            this.emit(PlatformEvent.ShareErr, "正在加载中...");
            return;
        }

        this.platform?.share.shareRecordVideo(success, fail);
    }

    public getRecordState() {
        return this.platform?.share?.getRecordState();
    }

    public getRecordTime(): number {
        return this.platform?.share?.getRecordTime();
    }
    ///*********** 录频接口 end  ********************/

    public report(event: string, data: any) {
        this.platform?.open?.report(event, data);
    }

    public reportScene(object: { sceneId: number }) {
        this.platform?.open?.reportScene(object);
    }

    public canShare(): boolean {
        return this.platform?.share.canShare();
    }

    /**分享模板 */
    public shareTemplate(action: (result: boolean) => void, templateId?: string): void {
        if (!templateId) templateId = this.adConfig.TemplateId;
        this.platform?.share?.shareTemplate(templateId, action);
    }

    private reportVideoEvent(scene: string, result: string, fid: string = '0') {

        GameTrackHelp.getInstance().track_feedback_adv(scene, result)
        // if (!scene) return;
        // let keys = ["rewardvideoend", "rewardvideoclick", "rewardvideoshow"];
        // this.report(keys[index], { scene: scene, timestamp: timestamp, adid: id });
        // try {
        //     // TrackerMgr.instance?.sendVideo(scene, keys[index], timestamp);
        // } catch (error) {

        // }
        // if (index == 0) {
        //     this.report("rewardvideoclickcount", { count: 1 });
        // }
    }

    public checkShortcut(success?: Function, fail?: Function) {
        this.platform?.open?.checkShortcut(success, fail);
    }

    public addShortcut(success?: Function, fail?: Function) {
        this.platform?.open?.addShortcut(success, fail);
    }

    public alert(title: string, content: string) {
        this.platform?.open?.alert(title, content);
    }

    public vibrate(long: boolean = false) {
        if (!this.vibrateEnabled) return;

        long ? this.platform?.open?.vibrateLong() : this.platform?.open?.vibrateShort();
    }

    public enableVibrate(enable: boolean) {
        this.vibrateEnabled = enable;
    }

    /**检查更新 */
    public checkForUpdate(): void {
        this.platform?.update?.checkForUpdate();
    }

    /**登录,失败user为null */
    public login(action: (data: any) => void): void {
        action && action({});
        return;
        console.log("call login")
        if (this.platform.login.isLogin()) {
            action && action({});
            return;
        } else {
            this.platform.login.login((data) => {
                console.log("call login")
                action && action(data);

                let device_id = UserKey.getInstance().deviceId;
                console.log("登录参数:", JSON.stringify(data), device_id);
                ApiMgr.getInstance().login(data.login_type || 'guest', data.code || "", device_id)
                TrackerMgr.getInstance().loginTrack(data.code || "");
            });
        }
        // TrackerMgr.getInstance().loginTrack(openid);
        // let adConfig = this.adConfig;

    }

    // ///**获取用户信息 */
    public getUserInfo(action: (data: any) => void): void {
        return this.platform.login.getUserInfo(action);
    }

    /**获取openId */
    public getOpenId(): void {
        console.log('getOpenId')
        this.platform.getOpenId((openid: string) => {
            console.log("openid", openid)
        });
    }


    // /**登录, 返回用户code */
    // public loginReturnCode(action: (codeInfo: any) => void): void {
    //     this.platform?.login?.loginReturnCode(action);
    // }

    /**是否能使用关注功能 */
    public canUseFollow(): boolean {
        if (!this.platform || !this.platform.follow) return false;
        return this.platform?.follow?.canUseFollow() ?? false;
    }

    /**关注 */
    public follow(action: (b: boolean) => void): void {
        if (!this.platform?.follow) {
            if (action) action(false);
            return;
        }

        if (!this.platform?.login.isLogin()) {

            this.platform?.login.login((data) => {

                if (!data) {
                    if (action) action(true);
                    return;
                }

                this.platform?.follow?.follow(action);
            });

            return;
        }

        this.platform?.follow?.follow(action);
    }

    /**提交排行榜 */
    public commitRank(id: string, score: number, params?: object, groupId: string = "userGroup"): void {
        this.platform?.rank?.commit(id, score, params, groupId);
    }

    /**初始化排行榜 */
    public initRank(): void {
        this.platform?.rank?.init();
    }

    /**提交排行榜 */
    public emitRank(event: string, params?: object): void {
        this.platform?.rank?.emit(event, params);
    }

    /**是否支持群聊功能 */
    public get isSupportJoinGroup(): boolean {
        return this.platform?.group?.isSupport ?? false;
    }

    /**是否支持群聊功能 */
    public joinGroup(id: string, complete?: (ret: boolean) => void): void {
        this.platform.group.joinGroup(id, complete);
    }

    /**退出程序 */
    public quit(): void {
        this.platform.quit();
    }

    /**震动 */
    public vibrateShort(): void {
        this.platform.vibrateShort();
    }


    //平台判断

    /**是否为抖音平台 */
    public get isDouyin(): boolean {
        return PlatformHelp.getInstance().isDouyin(this.adConfig.platformType);
    }

    /**是否为QQ平台 */
    public get isQQ(): boolean {
        return PlatformHelp.getInstance().isQQ(this.adConfig.platformType);
    }

    /**是否为快手平台 */
    public get isKS(): boolean {
        return PlatformHelp.getInstance().isKS(this.adConfig.platformType);
    }

    /**是否为微信平台 */
    // 获取是否为微信平台
    public get isWechat(): boolean {
        return PlatformHelp.getInstance().isWechat(this.adConfig.platformType);
    }

    /**是否为bili平台 */
    public get isBili(): boolean {
        return PlatformHelp.getInstance().isBili(this.adConfig.platformType);
    }

    /**是否为百度平台 */
    public get isBaidu(): boolean {
        return PlatformHelp.getInstance().isBaidu(this.adConfig.platformType);
    }

    /**是否为sec平台 */
    public get isSec(): boolean {
        return PlatformHelp.getInstance().isSec(this.adConfig.platformType);
    }
    //-------------------------------

}
