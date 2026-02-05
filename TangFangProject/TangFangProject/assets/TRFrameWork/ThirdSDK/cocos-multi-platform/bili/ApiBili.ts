import HttpMgr, { HttpOptions, HttpType } from "../../../cocos-module/mgr/HttpMgr";
import UserKey from "../../UserKey";
import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";
import PlatformMgr from "../PlatformManager";
import RewardVideoBili from "./ad/RewardVideoBili";
import { BiliAPI } from "./InterfaceBili";
import LoginBiLi from "./other/LoginBiLi";
import OpenBiLi from "./other/OpenBiLi";

export default class ApiBili extends AdInterface {
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
    public scene: string;

    private env: BiliAPI = window["bl"];
    constructor(gameName?: string) {
        super();
        console.log("ApiBili");
        this.video = new RewardVideoBili();
        this.open = new OpenBiLi(gameName);
        this.login = new LoginBiLi();
        this.scene = "";

        this.env.onShow((res) => {
            this.scene = res.scene; //侧边栏返回值 "021036"

        });

        this.env.onHide(() => {

        });
    }


    override get platformKey(): string {
        return ePlatformKey.bili;
    }

    enterScene(): string {
        return this.scene;
    }

    //确认当前宿主版本是否支持跳转某个小游戏入口场景，目前仅支持「侧边栏」场景。
    public checkScene(isSuccess: () => void, isFail: () => void) {
        this.env.checkScene({
            scene: "sidebar",
            success: (res) => {
                if (res.isExist == true) {//res.isExist == true res.errMsg == "checkScene:ok"{
                    isSuccess && isSuccess();
                }
                else {
                    isFail && isFail();
                }
            },
            complete: (res) => {
                console.log("check scene complete: ");

            },
            fail: (res) => {
                console.log("check scene fail:", res);
                isFail && isFail();
            }
        });
    }

    //调用该API可以跳转到某个小游戏入口场景，目前仅支持跳转「侧边栏」场景
    public navigateToScene(isSuccess: () => void, isFail: () => void) {
        this.env.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("navigate to scene success");
                isSuccess();
            },
            complete: (res) => {
                console.log("navigate to scene complete: ");

            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                // 跳转失败回调逻辑
                isFail();
            },
        });
    }

    public quit(): void {
        this.env.exitMiniProgram();
    }

    vibrateShort(): void {
        throw new Error("Method not implemented.");
    }

    public getOpenId(func: (openId: string) => void) {
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

    private requestOpenId(code: string, func: (openId: string) => void) {
        console.log("获得用户code", code)
        let secret: string = PlatformMgr.instance?.adConfig?.AppSecrect;
        const options: HttpOptions =
        {
            httpType: HttpType.Get,
            url: "https://miniapp.bilibili.com/api/sns/jscode2session" + "?appid=" + PlatformMgr.instance?.adConfig?.AppId + "&secret=" + secret + "&js_code=" + code + "&grant_type=authorization_code",
            headers: [
                { key: "Content-Type", value: "application/json" }
            ],
            body:
            {
                "appid": PlatformMgr.instance?.adConfig?.AppId,
                "secret": secret,
                "js_code": code,
                "grant_type": "authorization_code"
            },
            success: async (response) => {
                console.log("请求openID", response);
                let openId = JSON.parse(response).openid;
                UserKey.getInstance().userOpenID = openId;
                func && func(openId);
            },
            fail: () => {

            },
        };
        HttpMgr.getInstance().request(options);
    }

}
