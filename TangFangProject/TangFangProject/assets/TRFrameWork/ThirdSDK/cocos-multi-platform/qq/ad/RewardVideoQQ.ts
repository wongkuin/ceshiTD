import { RewardVideoEvent } from "../../AdConstant";


export default class RewardVideoQQ implements RewardVideoInterface {

    private ad: RewardedVideoAdQQ;
    private env: QQAPI = window["qq"];
    private errTryTime: number = 0;
    private isInPlay: boolean = false;

    public play(id: string, callFunc: (state: number, ...ret: any[]) => void) {
        if (this.isInPlay) return;
        if (!id || id.trim() == "") return;
        
        this.ad = this.env.createRewardedVideoAd({ adUnitId: id });
        
        const closeCall = (ret: { isEnded: boolean }) => {
            this.ad.offClose(closeCall);
            this.ad.offError(errorCall);

            this.isInPlay = false;
            if (!ret) { callFunc(RewardVideoEvent.Close); return; }
            ret.isEnded ? callFunc(RewardVideoEvent.CloseReward) : callFunc(RewardVideoEvent.Close);
            cc.log("视频关闭:", ret.isEnded);
        };

        const errorCall = (ret: { errMsg: string, errCode: number }) => {
            this.ad.offError(errorCall);
            this.ad.offClose(closeCall);

            this.isInPlay = false;
            if (!ret) return;
            cc.log("视频播放失败:", ret.errCode, ret.errMsg);
            this.errTryTime++;
            if (this.errTryTime < 5)
                this.play(id, callFunc);
            else
                callFunc(RewardVideoEvent.PlayErr, ret.errMsg, ret.errCode);
        };

        this.ad.onClose(closeCall);
        this.ad.onError(errorCall);
        this.isInPlay = true;

        this.ad.load().then(() => { }).catch()

        this.ad.load().then(() => {

            this.ad.show().then(() => {
                console.log("视频播放成功");
                this.errTryTime = 0;
                callFunc(RewardVideoEvent.PlaySuccess);
            });

        });


        this.ad.show().then(() => {
            console.log("视频播放成功");
            this.errTryTime = 0;
            callFunc(RewardVideoEvent.PlaySuccess);
        }).catch(() => {
            this.ad.load().then(() => this.ad.show());
        });

    }

}
