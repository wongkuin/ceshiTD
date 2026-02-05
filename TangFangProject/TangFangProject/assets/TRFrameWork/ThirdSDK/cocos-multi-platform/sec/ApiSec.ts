import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";
import LoginSec from "./other/LoginSec";
import RewardVideoSec from "./ad/RewardVideoSec";


export default class ApiSec extends AdInterface {
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

    constructor(gameName?: string) {
        super();
        console.log("ApiSec");
        this.video = new RewardVideoSec();
        this.login = new LoginSec();
        cc.view.enableAutoFullScreen(false);
        window["SecSDK"].launch();

    }

    override get platformKey(): string {
        return ePlatformKey.sec;
    }

    checkScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }
    navigateToScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }

    vibrateShort(): void {
        throw new Error("Method not implemented.");
    }


    static syncDataWithCounter(chestID: number) {
        window["SecSDK"].syncDataWithCounter({
            data: {
                taskValue: chestID // 达成的关卡值或等级
            },
            onSuccess() {
                // 上报成功，
                console.debug("Success:" + chestID);
            },
            onError() {
                // 上报失败
                console.debug("fail:" + chestID);
            }
        })
    }


    public quit(): void {

    }

    public getOpenId() {

    }

}
