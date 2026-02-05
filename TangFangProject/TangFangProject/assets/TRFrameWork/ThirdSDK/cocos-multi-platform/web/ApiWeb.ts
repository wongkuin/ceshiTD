import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";
import LoginWeb from "./LoginWeb";




export default class ApiWeb extends AdInterface {
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
        this.login = new LoginWeb();
        console.log("ApiWeb");
    }
    override get platformKey(): string {
        return ePlatformKey.web;
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
        console.log("vibrateShort");
    }

}
