

import BattleCharUI from "./BattleCharUI";
import GameControl from "./GameControl";
import GameResLoad from "./GameResLoad";
import TurretBaseUI from "./TurretBaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WapenItemUI extends cc.Component {

    idx: number = 0;

    @property(cc.Node)
    wRoot: cc.Node = null;

    @property(cc.Label)
    wapenName: cc.Label = null;

    @property(cc.Label)
    wapenPrice: cc.Label = null;

    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    unlock: cc.Node = null;

    @property(cc.Node)
    ad_icon: cc.Node = null;


    private _name: string = "";
    private _price: number = 0;

    private _tNode: cc.Node = null;
    private _video: boolean = false;

    public isChar: boolean = false

    start() {

    }

    public getPrice() {
        return this._price;
    }

    public addTurre(tNode: cc.Node) {

        this._tNode = tNode;
        this.wRoot.addChild(tNode);

        tNode.setPosition(0, 0);
        let tInfo = tNode.getComponent(TurretBaseUI).turretInfo;
        this._name = tInfo.getWapenName();
        this._video = tInfo.needVideo;

        if (this._video) {
            this._price = 0;
        } else {
            this._price = tInfo.getWapenPrice();
        }
        // this.refrushUI();
        this.showAnim();
    }

    public addChar(tNode: cc.Node) {
        this.isChar = true;
        this._tNode = tNode;
        this.wRoot.addChild(tNode);

        tNode.setPosition(- tNode.height / 2, 0);
        let tInfo = tNode.getComponent(BattleCharUI).charInfo;
        this._name = tInfo.getName();
        this._video = tInfo.needVideo;

        if (this._video) {
            this._price = 0;
        } else {
            this._price = tInfo.getPrice();
        }
        // this.refrushUI();
        this.showAnim();
    }

    public removeTurret() {
        this._tNode = null;
        this.wRoot.removeAllChildren();
    }

    public getTurretNode() {
        return this._tNode;
    }

    public buyItemNow() {

        let tNode = this.getTurretNode();
        if (!tNode) {
            return;
        }

        let tInfo = tNode.getComponent(TurretBaseUI).turretInfo;
        this._name = tInfo.getWapenName();
        this._video = false;
        this._price = 0;
        tInfo.needVideo = false;
        tInfo.buyed = true;
        this.refrushUI();
    }

    public cleanItem() {
        for (const element of this.wRoot.children) {
            GameResLoad.putNode(element);
        }
        this.removeTurret();
    }

    protected refrushUI() {
        this.wapenName.string = this._name;
        this.refrushPrice();
    }
    public refrushPrice() {
        this.wapenPrice.string = this._price.toString();
        let pInfo = GameControl.getInstance().getPassInfo();

        let tNode = this.getTurretNode();
        if (!tNode) {
            return;
        }

        let tInfo = tNode.getComponent(TurretBaseUI).turretInfo;
        if (tInfo.buyed) {
            this.ad_icon.active = false;
            this.wapenPrice.node.parent.active = false;
            return;
        }

        if (this._video) {
            this.ad_icon.active = true;
            this.wapenPrice.node.parent.active = false;
        } else {
            this.ad_icon.active = false;
            this.wapenPrice.node.parent.active = true;
        }

        if (pInfo.gameCoin >= this._price) {
            this.wapenPrice.node.color = cc.Color.WHITE.clone();
        } else {
            this.wapenPrice.node.color = cc.Color.RED.clone();
        }
    }

    public showAnim() {
        this.node.stopAllActions();
        this.node.scaleX = 1;
        this.node.skewY = 0;

        cc.tween(this.node)
            .to(0.1, { scaleX: 0, y: 20 })
            .to(0.1, { scaleX: 1, y: 0 })
            .union()
            .repeat(1)
            .call(() => {
                this.node.skewY = 0;
                this.root.active = true;
                this.unlock.active = false;
                this.refrushUI();
                // GlobalEventMgr.getInstance().emit(GlobalEventID.ShowGame3in1Btns);
            })
            .start();
    }

    // update (dt) {}
}
