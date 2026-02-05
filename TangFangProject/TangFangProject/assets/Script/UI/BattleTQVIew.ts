

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ConfigMgr from "../config/ConfigMgr";
import { KvData } from "../config/DataDef";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleTQVIew extends cc.Component {
    // 战斗天气组件
    @property(cc.Node)
    bg1_rain: cc.Node = null;

    @property(cc.Node)
    bg1_zap: cc.Node = null;

    @property(cc.Node)
    bg1_smoke: cc.Node = null;

    @property(cc.Node)
    bg1_snow: cc.Node = null;

    protected _nextZapTime: number = 0; // 下次闪电时间
    protected _needZap: boolean = false; // 是否需要闪电

    start() {
        this.registerTianqi();
        this.hideTianqi();
    }


    protected registerTianqi() {
        GlobalEventMgr.getInstance().on(GlobalEventID.TQ_SHOW_RAIN, this.showRain, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TQ_SHOW_SMOKE, this.showSmoke, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TQ_SHOW_SNOW, this.showSnow, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TQ_HIDE_ALL, this.hideTianqi, this);
    }


    protected hideTianqi() {
        this.bg1_smoke.active = false;
        this.bg1_rain.active = false;
        this._needZap = false;
        this.bg1_snow && (this.bg1_snow.active = false);
    }

    protected showRain(param: any) {
        this.bg1_rain.active = true;
        this.bg1_rain.getComponent(sp.Skeleton).setAnimation(0, 'rain', true);

        this._needZap = param.zap || false;
        let time = param.t || 0;
    }

    protected showSmoke() {
        this.bg1_smoke.active = true;
        this.bg1_smoke.getComponent(sp.Skeleton).setAnimation(0, 'smoke', true);
    }

    protected showSnow() {
        if (!this.bg1_snow) {
            return;
        }
        this.bg1_snow.active = true;
    }

    protected showzap() {
        this.bg1_zap.active = true;
        let aName = 'zap_' + Math.ceil(Math.random() * 3);
        this.bg1_zap.getComponent(sp.Skeleton).setAnimation(0, aName, false);
        let sList = ConfigMgr.getInstance().getById(29, KvData).val.split(',');
        let sName = sList[Math.floor(Math.random() * sList.length)];
        SoundMgr.getInstance().playSound(sName);
        this._nextZapTime = Math.random() * 13 + 8;
    }


    protected updateTianqi(dt) {
        if (this._needZap && this._nextZapTime >= 0) {
            this._nextZapTime -= dt;
            if (this._nextZapTime <= 0) {
                this.showzap();
            }
        }
    }

    update(dt) {
        this.updateTianqi(dt);
    }
}
