
import { InterstitialInterface } from "../../AdInterface";
import { InterstitialAd, WechatAPI } from "../InterfaceWechat";

export default class InterstitialWechat implements InterstitialInterface {

    private env: WechatAPI = window["wx"];
    private ad: InterstitialAd = null;

    show(id: string, successCall?: () => void, failCall?: () => void): void {
        this.ad = this.env.createInterstitialAd({ adUnitId: id });
        this.ad?.load().then(() => {

            this.ad?.show().then(() => {
                if (successCall) successCall();
            }).catch(e => {
                console.log("InterstitialBD", e);
                if (failCall) failCall();
            });

        }).catch(e => {
            console.log("InterstitialBD", e);
            if (failCall) failCall();
        });
    }


    destroy(): void {
        this.ad?.destroy();
        this.ad = null;
    }

}