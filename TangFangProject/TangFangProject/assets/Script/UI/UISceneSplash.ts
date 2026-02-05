import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import { UIScreen } from "../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../config/ConfigMgr";
import { BulletData, BulltetSpEffData, DrawSubData, ShootBagData, WaveTimesData } from "../config/DataDef";
import { BulletInfo } from "../config/DataInfo";
import { MonsterBrithType, MonsterType } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UISceneSplash extends UIScreen {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    public onInit(params: any): void {

    }

    public onShow(params: any): void {
        ConfigMgr.getInstance().loadAll().then(() => {
            PlatformMgr.instance.login((codeInfo) => {
                console.warn(`登录 condInfo`, codeInfo);
                this.loadNext();
                // PlatformMgr.instance.getOpenId();
            })

        });
    }

    protected async loadNext() {
        // await FormMgr.load(UIConfig.scene_login);we
        CC_DEBUG && this.checkConfigData();
        this.goToLogin();

    }

    goToLogin() {
        FormMgr.open(UIConfig.scene_login, null, { quick: true });
    }

    checkConfigData() {
        console.log("checkConfigData");
        let allWData = ConfigMgr.getInstance().getAll(WaveTimesData);

        console.log('check shoot bag')
        let allShootBag = ConfigMgr.getInstance().getAll(ShootBagData);
        for (const element of allShootBag) {
            let intervalLen = element.interval.length;
            let bids = element.bulletIds.length;
            let angles = element.angle.length;
            if (intervalLen == bids && angles == bids) {
                ;
            } else {
                console.warn(`shootbag error id=${element.id}, interval=${element.interval.toString()}, bulletIds=${element.bulletIds.toString()},angles=${element.angle.toString()}`);
            }
        }

        console.log('check Bullet');
        let allBullet = ConfigMgr.getInstance().getAll(BulletData);
        for (const element of allBullet) {
            new BulletInfo(element.id);
        }

        console.log('check bullet res');
        let allBulletRes = ConfigMgr.getInstance().getAll(BulltetSpEffData);
        for (const element of allBulletRes) {
            if (!element.spMain || element.spMain.length <= 0) {
                console.error(`bullet res error id=${element.id}, spMain=${element.spMain}`);
            }
        }
    }

    // update (dt) {}
}
