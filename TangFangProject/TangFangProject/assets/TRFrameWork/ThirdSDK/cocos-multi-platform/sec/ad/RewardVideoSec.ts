import { RewardVideoEvent } from "../../AdConstant";
import { RewardVideoInterface } from "../../AdInterface";


export default class RewardVideoSec implements RewardVideoInterface {
    private isInPlay: boolean = false;

    public play(id: string, callFunc: (state: number, ...ret: any[]) => void) {
        if (this.isInPlay) return;
        //if (!id || id.trim() == "") return;

        this.isInPlay = true;
        window["SecSDK"].displayVideoAd({
            onSuccess() {
                console.log("已成功获得视频广告激励");
                callFunc(RewardVideoEvent.CloseReward);
            },
            onError() {
                console.log("视频广告播放失败");
                callFunc(RewardVideoEvent.Close);
            },
        });
        this.isInPlay = false;
    }

}
