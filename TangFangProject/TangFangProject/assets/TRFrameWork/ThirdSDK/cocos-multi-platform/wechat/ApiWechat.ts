import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";
import InterstitialWechat from "./ad/InterstitialWechat";
import RewardVideoWechat from "./ad/RewardVideoWechat";
import { WechatAPI } from "./InterfaceWechat";
import LoginWechat from "./other/LoginWechat";
import WechatShare from "./other/share";


export default class ApiWechat extends AdInterface {
    public banner: BannerInterface;
    public video: RewardVideoInterface;
    public interstitial: InterstitialInterface;
    public share: ShareInterface;
    public open: OpenInterface;
    public update: UpdateInterface;
    public follow: FollowInterface;
    public login: LoginInterface;
    public rank: RankInterface;
    public group: GroupInterface;

    private env: WechatAPI = window["wx"];
    constructor(gameName?: string) {
        super();
        console.log("api wechat init")
        this.video = new RewardVideoWechat();
        this.interstitial = new InterstitialWechat();
        this.login = new LoginWechat();
        WechatShare.SetShareMenu();

        this.env.onShow(() => {
            // audioEngine.pauseMusic();
            // audioEngine.pauseAllEffects();

            // audioEngine.resumeMusic();
            // audioEngine.resumeAllEffects();
        });

        this.env.onAudioInterruptionEnd(() => {
            // audioEngine.pauseMusic();
            // audioEngine.pauseAllEffects();

            // audioEngine.resumeMusic();
            // audioEngine.resumeAllEffects();
        });
    }
    // enterScene(): string {
    //     return "";
    // }

    override get platformKey(): string {
        return ePlatformKey.wx;
    }


    vibrateShort(): void {
        this.env && this.env.vibrateShort();
    }

    checkScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }

    navigateToScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }

    public quit(): void {
        this.env.exitMiniProgram();
    }

    // public getOpenId() {
    //     let oid = UserKey.getInstance().getJsonValue('wx_openid');
    //     if (oid) {
    //         UserKey.getInstance().userOpenID = oid;
    //     } else {
    //         oid = PlatformMgr.instance.getLocakUUID();
    //         UserKey.getInstance().saveJsonValue('wx_openid', oid);
    //         UserKey.getInstance().userOpenID = oid;
    //     }
    // }
}
