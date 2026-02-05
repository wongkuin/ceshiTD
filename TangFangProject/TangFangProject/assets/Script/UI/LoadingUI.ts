

import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import { UIFixed, UITips } from "../../TRFrameWork/UIFrame/UIForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingUI extends UITips {
    @property(cc.Label)
    jzLab: cc.Label = null;


    playID: number = 0;
    public onInit(params: any): void {
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        // this.node.width = cc.view.getFrameSize().width;
        // this.node.height = cc.view.getFrameSize().height;
        this.setBlockInput(true);
        super.onInit(params);
    }

    protected onDestroy(): void {
        if (this.playID) {
            clearInterval(this.playID);
            this.playID = 0;
        }
    }

    public onShow(params): void {
        super.onShow(params);
        this.schedule(() => {
            if (this.num == 0) {
                this.jzLab.string = "Loading"
            } else if (this.num == 1) {
                this.jzLab.string = "Loading."
            } else if (this.num == 2) {
                this.jzLab.string = "Loading.."
            } else if (this.num == 3) {
                this.jzLab.string = "Loading..."
            }
            this.num++;
            if (this.num > 3) {
                this.num = 0;
            }
        }, 0.3)
    }
    num = 0;

    // update (dt) {}
}
