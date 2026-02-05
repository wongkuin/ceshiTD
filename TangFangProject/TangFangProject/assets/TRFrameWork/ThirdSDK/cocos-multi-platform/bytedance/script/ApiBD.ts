import HttpMgr, { HttpOptions, HttpType } from "../../../../cocos-module/mgr/HttpMgr";
import UserKey from "../../../UserKey";
import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../../AdInterface";
import PlatformMgr from "../../PlatformManager";
import TrackerMgr from "../../TrackerMgr";
import RewardVideoBD from "./ad/RewardVideoBD";
import FollowDB from "./other/FollowBD";
import GridGameBD from "./other/GridGamePanelBD";
import GroupBD from "./other/GroupBD";
import LoginBD from "./other/LoginBD";
import OpenBD from "./other/OpenBD";
import RankDB from "./other/RankDB";
import ShareBD from "./other/ShareBD";
import UpdateBD from "./other/UpdateBD";

export default class ApiBD extends AdInterface {
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
    public gridGamePanel: GridGamePanelInterface;
    public launch_from: string;
    public location: string;

    url_session: string = "https://minigame.zijieapi.com/mgplatform/api/apps/jscode2session";


    private env: BDAPI = window["tt"];
    constructor(gameName?: string) {
        super();
        console.log("Api BD");
        this.sdkInit();
        this.open = new OpenBD(gameName);
        this.video = new RewardVideoBD();
        this.share = new ShareBD();
        this.update = new UpdateBD();
        this.follow = new FollowDB();
        this.login = new LoginBD();
        this.rank = new RankDB();
        this.gridGamePanel = new GridGameBD();

        this.group = new GroupBD(this.login);

        this.launch_from = "";
        this.location = "";

        this.env.onShow((res) => {
            this.launch_from = res.launch_from; //侧边栏返回值 "homepage"
            this.location = res.location; //侧边栏返回值 "sidebar_card"

            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();
            cc.audioEngine.resumeMusic();
            cc.audioEngine.resumeAllEffects();

        });

        this.env.onHide(() => {

        });
    }

    override get platformKey(): string {
        return ePlatformKey.douyin;
    }

    vibrateShort(): void {
        this.env && this.env.vibrateShort();
    }

    enterScene(): string {
        return cc.js.formatStr("%s_%s", this.launch_from, this.location);
    }

    public getLaunchOptions(): object {
        return this.env.getLaunchOptionsSync();
    }

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
        this.env.exitMiniProgram(
            {
                success: () => {

                }
            });
    }

    private sdkInit() {
        //XYSDK.setLogEnable(true);
        // XYSDK.init({
        //     channelType: XYSDK.CHANNEL_TYPE.DY_MINI,
        //     packageId: `com.${PlatformMgr.instance.adConfig.AppId}.dy`,
        //     packageVersion: "1.0.1"
        // });

        // let obj = {
        //     channelType: XYSDK.CHANNEL_TYPE.DY_MINI,
        //     packageId: `com.${PlatformMgr.instance.adConfig.AppId}.dy`,
        //     packageVersion: "1.0.1"
        // }

        // TrackerMgr.getInstance().initTrack()
        // console.log("dy-------init----", PlatformMgr.instance.adConfig.AppId);
    }

    public getOpenId(func: (openId: string) => void) {
        // this.login.loginReturnCode((codeInfo: any) => {
        //     this.requestOpenId(codeInfo?.code, func);
        // });
        super.getOpenId(func);
    }

    // private requestOpenId(code: string, func: (openId: string) => void) {
    //     let secret: string = PlatformMgr.instance.adConfig.AppSecrect;

    //     let rUrl = this.url_session + "?appid=" + PlatformMgr.instance.adConfig.AppId + "&secret=" + secret + "&code=" + code;
    //     console.log("获得用户code", code, secret, rUrl)
    //     const options: HttpOptions =
    //     {
    //         httpType: HttpType.Get,
    //         url: rUrl,
    //         headers: [
    //             { key: "Content-Type", value: "application/json" }
    //         ],
    //         body:
    //         {
    //             "appid": PlatformMgr.instance.adConfig.AppId,
    //             "secret": secret,
    //             "code": code
    //         },
    //         success: async (response) => {
    //             let jRes = JSON.parse(response);
    //             console.log("请求openID", jRes);
    //             if (jRes.error == 0) {
    //                 let openId = jRes.openid;
    //                 UserKey.getInstance().userOpenID = openId;
    //                 func && func(openId);
    //             } else {
    //                 console.error("请求openID失败", response);
    //             }
    //         },
    //         fail: () => {
    //         },
    //     };
    //     HttpMgr.getInstance().request(options);
    // }
}
