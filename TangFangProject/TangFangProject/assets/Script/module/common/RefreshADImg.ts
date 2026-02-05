import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import GameControl from "../../Battle/GameControl";
import { GameBundle } from "../../config/GameEnum";
import GameUserData from "../../Data/GameUserData";
const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
@menu("UI/RefreshADImg")

export default class RefreshADImg extends cc.Component {

    protected onLoad(): void {
        GameUserData.getInstance().on(this.refreshADIcon, this, nameof<GameUserData>().ticketAD);
    }

    protected onEnable(): void {
        this.refreshADIcon();
    }

    refreshADIcon() {
        let sprite = this.node.getComponent(cc.Sprite);

        if (GameUserData.getInstance().ticketAD > 0 || GameControl.getInstance().isTeamBaid()) {
            this.node.scale = Math.min(0.7, this.node.scale);
            SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/item_3`, sprite, GameBundle.Bundle_commonRes);
        } else {
            this.node.scale = Math.max(1, this.node.scale);
            SceneMgr.getCurrScene().loadSpirteFrame(`ui_bt/ui_sxt`, sprite, GameBundle.Bundle_commonRes);
        }
    }

}