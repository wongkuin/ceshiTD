

import GameUserData from "../../../Script/Data/GameUserData";
import { nameof } from "../../cocos-module/component/Watch";
import PlatformMgr from "../cocos-multi-platform/PlatformManager";

const { ccclass, property, menu } = cc._decorator;


@ccclass
@menu("SidleBar/SidleBarBtn")
export default class SidleBarBtn extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // GlobalEventMgr.getInstance().on(GlobalEvent.onSideBarGift, this.onSideBarGiftEvent, this);
        this.refreshSideBar();
        GameUserData.getInstance().on(this.onSideBarGiftEvent, this, nameof<GameUserData>().sideBarReward);
    }

    protected onEnable(): void {
        this.refreshSideBar();
    }

    onSideBarGiftEvent() {
        console.log("onSideBarGiftEvent");
        this.refreshSideBar();
    }

    refreshSideBar() {
        if (PlatformMgr.instance.isDouyin) {
            PlatformMgr.instance.checkScene(
                () => {
                    if (GameUserData.getInstance().sideBarReward > 0) {
                        this.node.active = false;
                    }
                    else {
                        this.node.active = true;
                    }
                },
                () => {
                    this.node.active = false;
                },
            );
            // } else if (PlatformMgr.instance?.isKS) {
            //     PlatformMgr.instance.platform?.ks.checkCommonUse().then((result: boolean) => {
            //         if (result) {
            //             this.node.active = false;
            //         } else {
            //             this.node.active = true;
            //         }
            //     });
        } else if (PlatformMgr.instance?.isBili) {
            PlatformMgr.instance.checkScene(
                () => {
                    if (GameUserData.getInstance().sideBarReward > 0) {
                        this.node.active = false;
                    }
                    else {
                        this.node.active = true;
                    }
                },
                () => {
                    this.node.active = false;
                },
            );
        }
        else {
            this.node.active = false;
            // if (GameUserData.getInstance().sideBarReward > 0) {
            //     this.node.active = false;
            // }
        }
    }

    // update (dt) {}
}
