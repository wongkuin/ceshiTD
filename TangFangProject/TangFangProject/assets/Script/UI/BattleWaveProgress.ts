

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleWaveProgress extends cc.Component {

    @property
    spaceX: number = 140;

    @property(cc.Node)
    pBg: cc.Node = null;

    @property(cc.Node)
    pBar: cc.Node = null;

    @property(cc.Node)
    itemNode: cc.Node = null;

    @property(cc.Node)
    itemRoot: cc.Node = null;

    outLine = 320;

    onLoad() {
        this.itemRoot.getComponent(cc.Layout).spacingX = this.spaceX;
        // this.itemRoot.getComponent(cc.Layout).paddingLeft = this.spaceX;
    }

    start() {
        GlobalEventMgr.getInstance().on(GlobalEventID.game_wave_parogress, this.setProgress, this);
        this.setProgress(0, 0);
    }

    doInit(waves: number) {
        this.pBg.width = this.spaceX * (waves);
        this.pBar.width = 0;

        for (let i = 0; i <= waves; i++) {
            let item = cc.instantiate(this.itemNode);
            item.active = true;
            item.parent = this.itemRoot;
            item.getChildByName('txt').getComponent(cc.Label).string = (i).toString();
        }
    }


    protected setProgress(wave: number, progress: number) {
        if (wave < 0) return;
        if (wave > this.itemRoot.children.length) return;

        if (wave >= 0) {
            let item = this.itemRoot.children[wave];
            if (item) {
                item.getChildByName('light').active = true;
            }
        }
        if (wave < this.itemRoot.children.length) {
            this.pBar.width = wave * this.spaceX + progress * this.spaceX;
            if (this.pBar.width > this.outLine && this.itemRoot.parent.x + this.pBg.width > this.outLine) {
                this.itemRoot.parent.x = - this.pBar.width;
            }
        }
    }

    // wave = 0;
    // progress = 0;
    // cd: number = 0;
    // protected update(dt: number): void {
    //     //this.txt_his.string = '历史最高波数：' + (cc.sys.localStorage.getItem('maxWave') || 0);
    //     if (this.cd < 0) {
    //         this.progress += 0.01;
    //         if (this.progress >= 1) {
    //             this.progress = 0;
    //             this.wave++;
    //             this.cd = 0.5;
    //         }
    //         this.setProgress(this.wave, this.progress);
    //     } else {
    //         this.cd -= dt;
    //     }
    // }

    // update (dt) {}
}
