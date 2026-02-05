import GlobalEventMgr from "../../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../../TRFrameWork/UIFrame/UIForm";
import GameControl from "../../../Battle/GameControl";
import PowUpEffectMgr from "../../../Battle/PowUpEffectMgr";
import ConfigMgr from "../../../config/ConfigMgr";
import { KvData, PowUpData, SnowBossData, WapenTableData } from "../../../config/DataDef";
import GameHelp from "../../../Mgr/GameHelp";
import Laba from "./Laba";
import ResultGroup from "./ResultGroup";

export interface slotData {
    /** 类型，//1:格子升级；2：强化效果*/
    type: number;
    /**幸运值类型，1,2,3 */
    luckType: number;
    /**武器id */
    wapenId: number;
    /**武器数据 */
    wapenData: number[];//
    /**幸运格子数，只有格子升级有 */
    luckValue?: number;

}



const { ccclass, property } = cc._decorator;

@ccclass
export default class PopSlot extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnDraw: ButtonPlus = null;

    @property([cc.Node])
    labaList: cc.Node[] = [];
    @property([cc.Node])
    resultList: cc.Node[] = [];

    @property([cc.Sprite])
    bgList: cc.Sprite[] = [];

    @property([cc.Node])
    mbList: cc.Node[] = [];


    @property([cc.SpriteFrame])
    bgSpList: cc.SpriteFrame[] = [];

    @property(cc.Node)
    bigNode: cc.Node = null

    @property({ type: cc.Label, tooltip: "铜币" })
    protected coinLab: cc.Label = null;

    @property(cc.Node)
    tipRoot: cc.Node = null

    @property(cc.RichText)
    tipLab: cc.RichText = null

    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, false);

    /**脏标记 */
    dirtyFlag: boolean = false;

    _dt: number = 0;

    _isDraw: boolean = false;

    wapenList = []; // [1, 2, 3, 4, 5, 6, 7, 8];


    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 15 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;
            this.initView();
        }
    }

    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onClose, this);
        this.btnDraw.addClick(this.onDraw, this);
        this.wapenList = params.wapenList;
        GlobalEventMgr.getInstance().on(GlobalEventID.Up_Slot_Wapen, this.upWapenList, this);
    }

    upWapenList(data) {
        this.wapenList = data.wapenList;
    }

    checkWapenList() {
        if (this.wapenList.length == 0) {
            this.closeSelf();
        }
    }

    public onShow(params: any): void {
        console.warn("PopSlot onShow pauseGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.pauseGame); //暂停游戏
        this.tipRoot.active = false;
        this.setCoinColor();

    }

    onClose() {
        this._isDraw = false;
        if (this._isDraw) {
            GameHelp.getInstance().showToast("正在抽奖中，请稍后");
            return;
        }
        this.closeSelf();
    }


    initView() {

    }

    setCoinColor() {
        let color = cc.Color.WHITE;
        let cost = parseInt(ConfigMgr.getInstance().getById(42, SnowBossData).val);
        // cost = 0;
        if (GameControl.getInstance().getPassInfo().gameCoin < cost) {
            color = cc.Color.RED;
        }
        this.coinLab.node.color = color;

    }

    onDraw() {
        this.tipRoot.active = false;
        let cost = parseInt(ConfigMgr.getInstance().getById(42, SnowBossData).val);
        // cost = 0;

         if (this._isDraw) {
            GameHelp.getInstance().showToast("正在抽奖中，请稍后");
            return;
        }
        if (GameControl.getInstance().getPassInfo().gameCoin >= cost) {
            this._isDraw = true;
            GameControl.getInstance().getPassInfo().gameCoin -= cost;
             this.setCoinColor();
            this.onStartMove();
        } else {
            GameHelp.getInstance().showToast("铜币不足");
        }
    }


    onStartMove() {
        let _resultgroupid = 0;
        this.initBg();
        let speed = GameControl.getInstance().getPassInfo().gameSpeed
        this.schedule(() => {
            // console.log("this._groupid=",this._groupid)
            // this.onUpResultGroup();
            let resultNode = this.resultList[_resultgroupid];
            resultNode.getComponent(ResultGroup).onStartUpResultGroup();
            _resultgroupid++;
        }, 0.05 * speed, 4, 0);

        let slotData = this.onGetRealDrawData();
        console.log("slotData=", slotData);

        this.scheduleOnce(() => {
            // console.log("this._groupid=",this._groupid)
            // this.onUpResultGroup();
            for (let i = 0; i < 5; i++) {
                let type = slotData.wapenData[i] == slotData.wapenId ? slotData.type : 1;
                this.resultList[i].getComponent(ResultGroup).initData(type, slotData.wapenData[i]);
            }

        }, 0.5 * speed);

        this.scheduleOnce(() => {
            // console.log("this._groupid=",this._groupid)
            // this.onUpResultGroup();
            for (let i = 0; i < 5; i++) {
                this.labaList[i].getComponent(Laba).stopLaba(0.1 * i);
            }

        }, 2 * speed);
        this.scheduleOnce(() => {
            SoundMgr.getInstance().playSound("lottery2");
            this.addBuff(slotData);
            this.showBounsEffect(slotData);
        }, 2.4 * speed)



    }

    addBuff(slotData: slotData) {
        console.log("addBuff slotData=", slotData);
        if (slotData.type == 2) {
            let PopCfg = ConfigMgr.getInstance().getById(slotData.wapenId, PowUpData);
            PowUpEffectMgr.getInstance().addPowUpEffect([PopCfg]);
        } else if (slotData.type == 1) {
            let data = { wapenId: slotData.wapenId, luckNum: slotData.luckValue || 1 };
            console.warn("addBuff data=", data);
            GlobalEventMgr.getInstance().emit(GlobalEventID.Post_Slot_Result, data);
        }

    }

    setBg(slotData, ind) {
        let speed = GameControl.getInstance().getPassInfo().gameSpeed
        this.scheduleOnce(() => {
            let item = this.bgList[ind];
            let zjIndex = slotData.luckType;
            let index = slotData.wapenData[ind] == slotData.wapenId ? zjIndex : 0;
            item.spriteFrame = this.bgSpList[index];

            this.mbList[ind].active = slotData.wapenData[ind] != slotData.wapenId;
        }, ind * speed * 0.08 + 0.2)
    }

    showBounsEffect(slotData: slotData) {
        //slotData =  {type: 2, luckType: 3, wapenId: 1306, wapenData:[1306, 1306, 1306, 1306, 1306]}
        this.bgList.forEach((item, idx) => {
            this.setBg(slotData, idx);
        })

        let string = "";
        if (slotData.type == 2) {
            let note = ConfigMgr.getInstance().getById(slotData.wapenId, PowUpData).note;
            string = CommonUtils.addOutline(GameHelp.replaceColorStr(note), 2, '#000000');
        } else if (slotData.type == 1) {
            let wapenCfg = ConfigMgr.getInstance().getById(slotData.wapenId, WapenTableData);
            let note = `全场任意<g>${slotData.luckValue}</g>个未满级<g>${wapenCfg.name}</g>提升1级`
            string = CommonUtils.addOutline(GameHelp.replaceColorStr(note), 2, '#000000');
        }
        this.tipLab.string = string;
        this.tipRoot.active = true;
        console.warn("slotData.luckType=", slotData);
        if (slotData.luckType == 3) {
            this.scheduleOnce(() => {
                cc.Tween.stopAllByTarget(this.bigNode);
                this.bigNode.y = -100;
                this.bigNode.scaleY = 0;
                this.bigNode.active = true;
                cc.tween(this.bigNode)
                    .to(0.4, { scaleY: 1 }, { easing: 'quadIn' })
                    .delay(0.5)
                    .to(0.6, { y: 100 }, { easing: 'quadOut' })
                    .to(0.2, { opacity: 50 })
                    .call(() => {
                        this._isDraw = false;
                        this.bigNode.opacity = 255;
                        this.bigNode.active = false;
                        this.checkWapenList();
                    }).start();

            }, 0.5)
        } else {
            this._isDraw = false;
            this.checkWapenList();
        }

    }

    initBg() {
        this.bgList.forEach((item, idx) => {
            this.mbList[idx].active = false;
            item.spriteFrame = this.bgSpList[0];
        })

    }

    onGetRealDrawData() {
        let result: slotData = {
            type: 0,
            luckType: 0,
            wapenId: 0,
            wapenData: []
        };
        let list = ConfigMgr.getInstance().getById(43, SnowBossData).val.split(",").map((item) => {
            return parseInt(item);
        })
        let total = list[0]+list[1];
        let random = Random.range(0, total);
        let type = 0;//1:格子升级；2：强化效果

        if (random <=  list[0]) {
            type = 1;
        } else {
            type = 2;
        }

        let luckType  //幸运类型
        let luckValue//幸运格子数
        let wapenId //武器id
        let wapenData;

        switch (type) {
            case 1://格子升级
                let cfg46 = ConfigMgr.getInstance().getById(46, SnowBossData).val.split(",").map((item) => {
                    return parseInt(item);
                })
                let list = [];
                for (let i = 0; i < cfg46.length; i = i + 3) {
                    var obj = { id: i, weight: cfg46[i] };
                    list.push(obj);
                }
                let index = Utils.getRandDataOfWeightObjectList(list).data.id;

                luckType = cfg46[index + 1]; //幸运类型
                luckValue = cfg46[index + 2];//幸运格子数
                wapenId = this.ranDomWapen();//武器id
                wapenData = this.getAllWapenData(luckType, wapenId);
                result.luckValue = luckValue;
                break;
            case 2://强化效果
                let cfg45 = ConfigMgr.getInstance().getById(45, SnowBossData).val.split(",").map((item) => {
                    return parseInt(item);
                })
                let list45 = [];
                for (let i = 0; i < cfg45.length; i = i + 3) {
                    var obj = { id: i, weight: cfg45[i] };
                    list45.push(obj);
                }
                let index1 = Utils.getRandDataOfWeightObjectList(list45).data.id;
                luckType = cfg45[index1 + 1]; //幸运类型
                wapenId = cfg45[index1 + 2];//武器id
                wapenData = this.getAllWapenData(luckType, wapenId);

                break;
        }

        result.type = type;
        result.luckType = luckType;
        result.wapenId = wapenId;
        result.wapenData = wapenData;
        return result;


    }

    ranDomWapen() {
        let random = Random.range(0, this.wapenList.length - 1);
        return this.wapenList[random];
    }

    randomWapenOther(wapenId, num): number[] {
        let list = [];
        let wapenList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        wapenList.forEach((item) => {
            if (item != wapenId) {
                list.push(item);
            }
        })
        let result = []
        for (let i = 0; i < num; i++) {
            let random = Random.range(0, list.length - 1);
            result.push(list[random]);
        }
        console.error(wapenId, num, "randomWapenOther=", result);
        return result;


    }

    getAllWapenData(luckType, wapenId) {

        let otherList = []

        if (luckType == 1) {
            otherList = this.randomWapenOther(wapenId, 2);
        } else if (luckType == 2) {
            otherList = this.randomWapenOther(wapenId, 1);
        } else if (luckType == 3) {
            otherList = [];
        }
        let num = 5 - otherList.length;
        for (let i = 0; i < num; i++) {
            let random = Random.range(0, otherList.length - 1);
            otherList.splice(random, 0, wapenId);
        }

        return otherList;
    }


    public onAfterHide(params: any): void {
        console.warn("PopSlot onAfterHide resumeGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame); //恢复游戏
    }







}

