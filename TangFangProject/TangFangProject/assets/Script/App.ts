import GlobalEventMgr from "../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../TRFrameWork/cocos-module/utils/GlobalEvent";
import PlatformMgr from "../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../TRFrameWork/UIFrame/FormMgr";
import UIConfig from "./config/UIConfig";
import GameActivityData from "./Data/GameActivityData";
import { saveAll } from "./Data/UserKeyType";
import GameHelp from "./Mgr/GameHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class App extends cc.Component {

    @property(cc.JsonAsset)
    appConfig: cc.JsonAsset = null;

    /**存档CD */
    private save_once_time: number = 0;


    start() {
        // SceneMgr.open(UIConfig.scene_splash);
        window['DATABOARD'] = false;  //数据面板
        // cc.macro.ENABLE_MULTI_TOUCH = false; //关闭多点
        PlatformMgr.instance.init(this.appConfig);
        FormMgr.open(UIConfig.scene_splash, { config: this.appConfig });
        this.addTime();
        this.schedule(this.addTime, 1); //每秒存档一次
        GameHelp.getInstance().Init(); //初始化游戏帮助
        GlobalEventMgr.getInstance().on(GlobalEventID.upPower, this.onPowerUpgrade, this);
    }

    // update (dt) {}

    private addTime() {
        this.save_once_time++;
        if (this.save_once_time % 5 == 0) {
            saveAll();
            GameActivityData.getInstance().onlineTime += 5;
            this.save_once_time = 0;
        }
    }
    /**
     * 战力更新，total为当前战力，add为增加的战力;
     * @param params {total,add}
     */
    onPowerUpgrade(params) {
        console.warn("战力更新", params);
        FormMgr.open(UIConfig.ui_PopUpgrade, { total: params.total, add: params.add });
    }
}


