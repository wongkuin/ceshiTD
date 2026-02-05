import { RewardVideoEvent } from "../../AdConstant";
import { RewardVideoInterface } from "../../AdInterface";
import { BiliAPI, RewardedVideoAdBili } from "../InterfaceBili";

export default class RewardVideoBili implements RewardVideoInterface {

    private ad: RewardedVideoAdBili;
    private env: BiliAPI = window["bl"];
    private errTryTime: number = 0;
    private isInPlay: boolean = false;

    public play(id: string, callFunc: (state: number, ...ret: any[]) => void) {
        if (this.isInPlay) return;
        if (!id || id.trim() == "") return;

        if (this.ad) this.ad.destroy();

        this.ad = this.env.createRewardedVideoAd({ adUnitId: id });
        if (!this.ad) {
            callFunc(RewardVideoEvent.PlayErr);
            return;
        }

        this.env.reportScene({sceneId: 1007});

        let closeCall = (ret: { isEnded: boolean }) => {
            this.isInPlay = false;
            if (!ret) { callFunc(RewardVideoEvent.Close); return; }
            ret.isEnded ? callFunc(RewardVideoEvent.CloseReward) : callFunc(RewardVideoEvent.Close);
            console.log("视频关闭:", ret.isEnded);
            this.ad.offClose(closeCall);
            this.ad.offError(errorCall);
        };
        let errorCall = (ret: { errMsg: string, errCode: number }) => {
            this.isInPlay = false;
            if (!ret) return;
            console.log("视频播放失败:", this.errTryTime, ret.errCode, ret.errMsg);
            this.errTryTime++;
            if (this.errTryTime < 5)
                this.play(id, callFunc);
            else {
                this.errTryTime = 0;
                callFunc(RewardVideoEvent.PlayErr, ret.errMsg, ret.errCode);
            }
                
            this.ad.offError(errorCall);
            this.ad.offClose(closeCall);
        };

        this.ad.onClose(closeCall);
        this.ad.onError(errorCall);

        this.ad.show().then(() => {
            console.log("视频播放成功1");
            this.errTryTime = 0;
            this.isInPlay = true;
            callFunc(RewardVideoEvent.PlaySuccess);
        })
        .catch(() => {
            this.ad.load()
            .then(() => {
                this.ad.show().then(() => {
                    console.log("视频播放成功2");
                    this.errTryTime = 0;
                    this.isInPlay = true;
                    callFunc(RewardVideoEvent.PlaySuccess); 
                })
            })
            .catch((err) => {
                console.error('激励视频 广告显示失败', err);
            })
        });

    }

}
