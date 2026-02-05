import { RewardVideoEvent } from "../../AdConstant";
import { RewardVideoInterface } from "../../AdInterface";

class Options implements RewardVideoOptionsKS
{
     adUnitId: string;
}

export default class RewardVideoKS implements RewardVideoInterface {

    private ad: RewardVideoAdKS;
    private env: KSAPI = window["ks"];
    private isInPlay: boolean = false;

    public play(id: string, callFunc: (state: number, ...ret: any[])=>void)
    {
        if (this.isInPlay) return;
        if (!id || id.trim() == "") return;

        this.ad?.destroy();

        let option = new Options();
        option.adUnitId = id;
        this.ad = this.env.createRewardedVideoAd(option);

        let closeCall = (ret)=>{
            this.isInPlay = false;
            if (!ret) {callFunc(RewardVideoEvent.Close); return;}
            ret.isEnded?callFunc(RewardVideoEvent.CloseReward):callFunc(RewardVideoEvent.Close);
            console.log("视频关闭:", ret.isEnded);
            this.ad?.offClose(closeCall);
            this.ad?.offError(errorCall);
        };

        let errorCall = (ret: ErrKS)=>{
            if (!ret) return;
            this.isInPlay = false;
            console.log("视频播放失败:", ret.code, ret.msg);
            callFunc(RewardVideoEvent.PlayErr, ret.msg, ret.code);
            this.ad?.offClose(closeCall);
            this.ad?.offError(errorCall);
        };

        this.ad.onClose(closeCall);
        this.ad.onError(errorCall);
        this.ad.show().then(()=>{
            console.log("视频播放成功");
            this.isInPlay = true;
            callFunc(RewardVideoEvent.PlaySuccess);
        });
    }

}
