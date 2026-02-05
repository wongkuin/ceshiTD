import HttpMgr, { HttpOptions, HttpType } from "../../../cocos-module/mgr/HttpMgr";
import UserKey from "../../UserKey";
import PlatformMgr from "../PlatformManager";
import XYSDK from "../XYSDK";
import RewardVideoKS from "./ad/RewardVideoKS";
import LoginKS from "./other/LoginKS";
import ShareKS from "./other/ShareKS";
import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";

export default class ApiKS extends AdInterface {
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
    public secret = "";

    private env: KSAPI = window["ks"];
    constructor(gameName?: string) {
        super();
        console.log("ApiKS.ts");
        this.sdkInit();
        this.video = new RewardVideoKS();
        this.share = new ShareKS();
        this.login = new LoginKS();

        this.env.onShow((res) => {
            // XYSDK.trackAdEvent({
            //     adEvent: XYSDK.AD_EVENT.onshow,
            //     adType: XYSDK.AD_TYPE.rewardVideo,
            // });
            console.log("ks-------onShow----", res);
        });

        this.env.onHide(() => {

        });
    }
    override get platformKey(): string {
        return ePlatformKey.ks;
    }
    checkScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }
    navigateToScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }

    public quit(): void {

    }

    vibrateShort(): void {
        this.env && this.env.vibrateShort();
    }

    private sdkInit() {
        //XYSDK.setLogEnable(true);
        // XYSDK.init({
        //     channelType: XYSDK.CHANNEL_TYPE.KS_MINI,
        //     packageId: `com.${PlatformMgr.instance.adConfig.AppId}.ks`,
        //     packageVersion: "1.0.5"
        // });

        console.log("ks-------init----", PlatformMgr.instance.adConfig.AppId);
    }

    /**
     * 将小游戏设为常用；
     * @param onSuccessFunc 成功回调
     * @param onFail 失败回调
     * @param target 完成回调
     */
    public addCommonUse(onSuccessFunc, onFail, target) {
        this.env.addCommonUse({
            success: (res) => {
                onSuccessFunc.call(target)
            },
            fail: (res) => {
                onFail.call(target)
            },
            complete: () => {
                onFail.call(target)
            },
        })
    }

    /**
    * 检查小游戏是否已经设为常用；
    * @param onSuccessFunc 成功回调
    * @param onFail 失败回调
    * @param target 完成回调
    */
    public checkCommonUse(): Promise<boolean> {
        return new Promise((resolve) => {
            this.env.checkCommonUse({
                success: (res) => {
                    console.log("checkCommonUseSuccess:", res);
                    if (res.code == 1 && res.isCommonUse) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                },
                fail: (res) => {
                    resolve(false)
                },
                complete: () => {
                    resolve(false)
                },
            })
        })

    }

    public getOpenId(func: (openid: string) => void) {
        // PlatformMgr.instance.loginReturnCode(
        //     (codeInfo: any) => {
        //         this.requestOpenId(codeInfo?.code);
        //     }
        // );
        this.login.loginReturnCode(
            (codeInfo: any) => {
                this.requestOpenId(codeInfo?.code, func);
            }
        );
    }

    private requestOpenId(code: string, func: (openid: string) => void) {
        console.log("获得用户code", code);
        let secret = PlatformMgr.instance?.adConfig?.AppSecrect;
        const options: HttpOptions =
        {
            httpType: HttpType.Get,
            url: "https://open.kuaishou.com/game/minigame/jscode2session" + "?app_id=" + PlatformMgr.instance.adConfig.AppId + "&app_secret=" + secret + "&js_code=" + code + "&grant_type=authorization_code",
            headers: [
                { key: "Content-Type", value: "application/json" }
            ],
            body:
            {
                "app_id": PlatformMgr.instance.adConfig.AppId,
                "app_secret": secret,
                "code": code,
                "grant_type": "authorization_code"
            },
            success: (response) => {
                console.log("请求openID", response)
                let openId = JSON.parse(response).open_id;
                UserKey.getInstance().userOpenID = openId;
                func && func(openId);
            },
            fail: () => {
            },
        };
        HttpMgr.getInstance().request(options);
    }

}
