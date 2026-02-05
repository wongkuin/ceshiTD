import { RewardVideoEvent } from "../../../AdConstant";
import { RewardVideoInterface } from "../../../AdInterface";
// import XYSDK from "../../../XYSDK";

class Options implements RewardVideoOptionsBD {
    adUnitId: string;
}

export default class RewardVideoBD implements RewardVideoInterface {

    private ad: RewardVideoAdBD;
    private env: BDAPI = window["tt"];
    private errTryTime: number = 0;
    private isInPlay: boolean = false;

    public play(id: string, callFunc: (state: number, ...ret: any[]) => void) {
        try {
            if (this.isInPlay) return;
            if (!id || id.trim() == "") return;

            if (this.ad && this.ad.destroy) {
                this.ad.destroy()
                    .then(() => {
                        this.ad = null;
                        this.play(id, callFunc);
                    })
                    .catch((err) => {
                        console.log("video destroy err:", err);

                        this.errTryTime++;
                        if (this.errTryTime < 5)
                            this.play(id, callFunc);
                        else
                            callFunc(RewardVideoEvent.PlayErr, "视频播放错误");
                    });
            }
            else {
                let option = new Options();
                option.adUnitId = id;
                this.ad = this.env.createRewardedVideoAd(option);
                if (!this.ad) {
                    callFunc(RewardVideoEvent.PlayErr);
                    return;
                }

                let closeCall = (ret: RewardVideoCloseRetBD) => {
                    this.isInPlay = false;
                    if (!ret) { callFunc(RewardVideoEvent.Close); return; }
                    ret.isEnded ? callFunc(RewardVideoEvent.CloseReward) : callFunc(RewardVideoEvent.Close);
                    console.log("视频关闭:", ret.count, ret.isEnded);
                    this.ad.offClose(closeCall);
                    this.ad.offError(errorCall);
                };
                let errorCall = (ret: ErrBD) => {
                    this.isInPlay = false;
                    if (!ret) return;
                    console.log("视频播放失败:", ret.errCode, ret.errMsg);
                    this.errTryTime++;
                    if (this.errTryTime < 5)
                        this.play(id, callFunc);
                    else
                        callFunc(RewardVideoEvent.PlayErr, ret.errMsg, ret.errCode);
                    this.ad.offError(errorCall);
                    this.ad.offClose(closeCall);
                };

                this.ad.onClose(closeCall);
                this.ad.onError(errorCall);
                this.ad.show().then(() => {
                    console.log("视频播放成功");
                    // XYSDK.trackAdEvent({
                    //     adEvent: XYSDK.AD_EVENT.onshow,
                    //     adType: XYSDK.AD_TYPE.rewardVideo,
                    // });

                    this.errTryTime = 0;
                    this.isInPlay = true;
                    callFunc(RewardVideoEvent.PlaySuccess);
                });
            }
        } catch (error) {
            callFunc(RewardVideoEvent.PlayErr);
        }
    }

}
