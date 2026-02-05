import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import GameUserData from "../../Data/GameUserData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TopRoot extends cc.Component {

    @property({ type: cc.Label, tooltip: "元宝" })
    protected ybNumLab: cc.Label = null;
    @property({ type: cc.Label, tooltip: "灵石" })
    protected lsNumLab: cc.Label = null;
    @property({ type: cc.Label, tooltip: "突破丹" })
    protected tpNumLab: cc.Label = null;
    @property({ type: cc.Label, tooltip: "广告券" })
    protected adNumLab: cc.Label = null;


    protected onLoad(): void {
        GameUserData.getInstance().on(this.initLab, this, nameof<GameUserData>().lingshi);
        GameUserData.getInstance().on(this.initLab, this, nameof<GameUserData>().yuanbao);
        GameUserData.getInstance().on(this.initLab, this, nameof<GameUserData>().ticketAD);
        GameUserData.getInstance().on(this.initLab, this, nameof<GameUserData>().breakthrough);
    }
    protected start(): void {
        this.initLab();
    }

    initLab(){
        this.ybNumLab.string = CommonUtils.formatNumber(GameUserData.getInstance().yuanbao )+ "";
        this.lsNumLab.string = CommonUtils.formatNumber(GameUserData.getInstance().lingshi) + "";
        this.tpNumLab.string = CommonUtils.formatNumber(GameUserData.getInstance().breakthrough )+ "";
        this.adNumLab.string = CommonUtils.formatNumber(GameUserData.getInstance().ticketAD) + "";
    }



}