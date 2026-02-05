import HttpMgr, { HttpOptions, HttpType } from "../../../cocos-module/mgr/HttpMgr";
import UserKey from "../../UserKey";
import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";
import PlatformMgr from "../PlatformManager";
import RewardVideoBaidu from "./ad/RewardVideoBaidu";
import { BaiduAPI } from "./InterfaceBaidu";
import LoginBaidu from "./other/LoginBaidu";
import OpenBaidu from "./other/OpenBaidu";

export default class ApiBaidu extends AdInterface {
   
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

    private env: BaiduAPI = window["swan"];
    constructor(gameName?: string) {
        super();
        this.video = new RewardVideoBaidu();
        this.open = new OpenBaidu(gameName);
        this.login = new LoginBaidu();
        this.scene = "";

        this.env.onShow((res) => {
            this.scene = res.scene; //侧边栏返回值 "021036"

        });

        this.env.onHide(() => {

        });
    }

    override get platformKey(): string {
        return ePlatformKey.baidu;
    }
    // enterScene(): string {
    //     throw new Error("Method not implemented.");
    // }

    //确认当前宿主版本是否支持跳转某个小游戏入口场景，目前仅支持「侧边栏」场景。
    public checkScene(isSuccess: () => void, isFail: () => void) {
        this.env.checkScene({
            scene: "sidebar",
            success: (res) => {

                if (res.isExist == true) //res.isExist == true res.errMsg == "checkScene:ok"
                {
                    isSuccess();
                }
                else {
                    isFail();
                }
            },
            complete: (res) => {
                console.log("check scene complete: ");

            },
            fail: (res) => {
                console.log("check scene fail:", res);
                isFail();
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

    public getOpenId(func: (openId: string) => void) {
        // PlatformMgr.instance.loginReturnCode(
        //     (codeInfo:any)=> {
        //         this.requestOpenId(codeInfo?.code);
        //     }
        // );
        this.login.loginReturnCode(
            (codeInfo: any) => {
                this.requestOpenId(codeInfo?.code, func);
            }
        );

    }

    private requestOpenId(code: string, func: (openId: string) => void): void {
        console.log("获得用户code", code)
        let secret: string = PlatformMgr.instance?.adConfig?.AppSecrect;
        const options: HttpOptions =
        {
            httpType: HttpType.Get,
            url: "https://spapi.baidu.com/oauth/jscode2sessionkey" + "?client_id=" + PlatformMgr.instance?.adConfig?.AppId + "&sk=" + secret + "&code=" + code,
            headers: [
                { key: "Content-Type", value: "application/json" }
            ],
            body:
            {
                "client_id": PlatformMgr.instance?.adConfig?.AppId,
                "sk": secret,
                "code": code
            },
            success: async (response) => {
                console.log("请求openID", response)
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
