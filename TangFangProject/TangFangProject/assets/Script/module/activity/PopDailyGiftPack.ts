import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { DailyGiftPackData } from "../../config/DataDef";
import GameActivityData from "../../Data/GameActivityData";
import DailyGiftPackItem from "./DailyGiftPackItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PopDailyGiftPack extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "当前关卡" })
    protected djsLab: cc.Label = null;

    @property({ type: cc.Node, tooltip: "奖励" })
    protected content: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "奖励" })
    protected giftItem: cc.Prefab = null;


    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onBtnClicked, this);
        GameActivityData.getInstance().on(this.initView, this, nameof<GameActivityData>().dailyGiftIndex);

    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }



    public onShow(params: any): void {
        super.onShow(params);

        this.initView();
        this.schedule(this.djs, 1);
        // FormMgr.open(UIConfig.ui_game3in1);
    }

    initView() {

        this.djs();

        let data = ConfigMgr.getInstance().getAll(DailyGiftPackData);
        data.sort((a, b) => a.id - b.id);
        this.content.children.forEach((item => {
            item.active = false;
        }))
        let length = (data.length % 3 == 0) ? data.length + 1 : data.length;

        for (let i = 0; i < length; i++) {
            let item = this.content.children[i];
            if (!cc.isValid(item)) {
                item = cc.instantiate(this.giftItem);
                item.parent = this.content;

            }
            item.active = true;
            let vo = ((i + 1) % 4 == 0) ? data[i - 1] : data[i];
            if ((i + 1) % 4 == 3) {
                vo = data[i + 1];
            } else if ((i + 1) % 4 == 0) {
                vo = data[i - 1];
            }

            if (vo) {
                item.opacity = 255;
                item.getComponent(DailyGiftPackItem).initItem(vo, vo.id == data.length);
            } else {
                item.opacity = 0;
            }




        }
    }



    djs() {
        let time = this.getTimeRemainingToMidnightFormatted();
        this.djsLab.string = time;

    }


    getTimeRemainingToMidnightFormatted(now: number = Date.now()): string {
        // 创建当前时间的Date对象
        const currentDate = new Date(now);

        // 创建当天午夜0点的Date对象（下一天的0点）
        const midnight = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + 1,
            0, 0, 0, 0
        );

        // 计算剩余的总毫秒数
        const totalMilliseconds = midnight.getTime() - currentDate.getTime();

        // 计算小时、分钟和秒
        const totalSeconds = Math.floor(totalMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // 格式化为两位数（补零）
        const pad = (num: number): string => num.toString().padStart(2, '0');

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }






    // update (dt) {}
}

