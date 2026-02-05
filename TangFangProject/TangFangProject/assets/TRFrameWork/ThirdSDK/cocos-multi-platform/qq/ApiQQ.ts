import { AdInterface, BannerInterface, ePlatformKey, FollowInterface, GroupInterface, InterstitialInterface, LoginInterface, OpenInterface, RankInterface, RewardVideoInterface, ShareInterface, UpdateInterface } from "../AdInterface";
import RewardVideoQQ from "./ad/RewardVideoQQ";
import UpdateQQ from "./other/UpdateQQ";

export default class ApiQQ extends AdInterface {
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

    private env: QQAPI = window["qq"];
    constructor(gameName?: string) {
        super();
        console.log("ApiQQ");
        this.video = new RewardVideoQQ();
        this.update = new UpdateQQ();

        this.env.onShow(() => {
            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();

            cc.audioEngine.resumeMusic();
            cc.audioEngine.resumeAllEffects();
        });

        this.env.onAudioInterruptionEnd(() => {
            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();

            cc.audioEngine.resumeMusic();
            cc.audioEngine.resumeAllEffects();
        });
    }

    override get platformKey(): string {
        return ePlatformKey.qq;
    }
    // enterScene(): string {
    //     return "";
    // }
    checkScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }
    navigateToScene(success: Function, fail: Function): void {
        throw new Error("Method not implemented.");
    }

    vibrateShort(): void {
        throw new Error("Method not implemented.");
    }

    public quit(): void {
        this.env.exitMiniProgram();
    }


}
