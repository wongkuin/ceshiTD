

import SpriteFrame from "../../TRFrameWork/cocos-module/component/SpriteFrame";
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
//import GameSpeedManger from "../../TRFrameWork/Common/Utils/GameSpeedManger";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import { DEBUG_APP } from "../AppDefual";
import GameControl from "../Battle/GameControl";
import PowUpEffectMgr from "../Battle/PowUpEffectMgr";
import { PowUpData } from "../config/DataDef";
import GameDrawHelp from "../Data/GameDrawHelp";
import GamePowUpData from "../Data/GamePowUpData";
import LanguageMgr from "../lang/LanguageMgr";
import GameHelp from "../Mgr/GameHelp";
import GameTrackHelp from "../Mgr/GameTrackHelp";
import PowupItemUI from "./PowupItemUI";

const { ccclass, property } = cc._decorator;



@ccclass
export default class PopGame3in1 extends UIWindow {

    // closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHigh, false);
    closeType = ECloseType.CloseAndHide;

    @property(ButtonPlus)
    btn_videoHuan: ButtonPlus = null;

    @property(ButtonPlus)
    btn_videoAll: ButtonPlus = null;

    @property(cc.RichText)
    huanTxt: cc.RichText = null;

    @property(cc.RichText)
    allTxt: cc.RichText = null;

    @property(cc.RichText)
    powupDesc: cc.RichText = null;

    @property([cc.Node])
    itemNodes: cc.Node[] = [];

    // @property([cc.SpriteFrame])
    // sp_blockBG: cc.SpriteFrame[] = [];

    // @property([cc.SpriteFrame])
    // item_bg: cc.SpriteFrame[] = [];

    // @property([cc.SpriteFrame])
    // item_bgH: cc.SpriteFrame[] = [];

    @property(cc.EditBox)
    debugEditor: cc.EditBox = null;

    protected _data: {
        value1: number[],
        value2: number[],
        value3: number[],
    } = null;

    outLines: string[] = ['#584131', '#584131', '#584131'];

    private curAllData: PowUpData[] = [];

    private isClose = false;

    protected _orginItemPos: cc.Vec2[] = [];

    // protected _lvUpWapeonMain: Array<{ id: number, weapon: number[] }> = [];

    public onInit(params: any): void {
        super.onInit(params);

        this.btn_videoAll.addClick(this.onBtnClicked, this);
        this.btn_videoHuan.addClick(this.onBtnClicked, this);
        for (const element of this.itemNodes) {
            let bt = element.addComponent(ButtonPlus)
            bt.addClick(this.onItemClicked, this);
            bt.transition = ButtonPlus.Transition.SCALE;
        }
        // this.allTxt.node.active = false;
        // this.huanTxt.node.active = false;
        for (const element of this.itemNodes) {
            this._orginItemPos.push(cc.v2(element.x, element.y));
        }
    }

    public onItemClicked(evt: cc.Event.EventTouch): void {
        if (this.isClose) return;

        if (evt.target.getComponent(PowupItemUI).needVideo) {

            PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                if (!cc.isValid(this)) return;
                if (b) {
                    this.addPowupIdx([evt.target]);
                }
            }, this, { scene: "buttom_battle8" });
        } else {
            this.addPowupIdx([evt.target]);
        }
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (this.isClose) return;

        if (evt.target == this.btn_videoAll.node) {
            this.onAllGetClicked();
        } else if (evt.target == this.btn_videoHuan.node) {
            this.onHuanClicked();
        }
    }

    protected refrushBtnHuan() {
        // let scene = SceneMgr.getCurrScene() as UISceneBattle;
        // add AD Reward
        this.btn_videoHuan.node.getChildByName("New Node").getChildByName('icon').active = GameControl.getInstance().getPassInfo().video3in1Cur > 0;
        // let index = (scene.getPassControl().getPassInfo().video3in1Cur > 0) ? 0 : 1;
        // Utils.getWidget("huanyipi", this.btn_videoHuan.node).getComponent(SpriteFrame).setFrameByIndex(index);
        // this.btn_videoHuan.node.getComponent(SpriteFrame).setFrameByIndex(index);
        this.huanTxt.node.active = GameControl.getInstance().getPassInfo().video3in1Cur > 0;

    }

    // 添加道具升级索引
    protected addPowupIdx(targets: cc.Node[]) {
        // 定义一个PowUpData类型的数组
        let sList: PowUpData[] = [];
        for (const element of targets) {
            let idx = this.itemNodes.indexOf(element);
            let select = this.curAllData[idx];
            sList.push(select);
            // 添加银币
            // if (select.money > 0) {
            //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_addSilver, select.money, element.parent.convertToWorldSpaceAR(element.position), 5);
            // }
            // 英雄能量 填充
            // if (select.cd > 0) {
            //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_mp_addpre, select.cd);
            // }

            // if (select.hp > 0) {
            //     // GlobalEventMgr.getInstance().emit(GlobalEventID.game_lvUpWapeon, select.lvUpWapeon, select.id);
            //     // 升级效果滞后
            //     // this._lvUpWapeonMain.push({ id: select.id, weapon: select.lvUpWapeon });
            //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_hp_addPre, select.hp);
            // }

            // if (select.skillCD == 1) {
            //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_revive_skillCD);
            // }

            // if (select.getWapeon.length > 0) {
            //     GlobalEventMgr.getInstance().emit(GlobalEventID.game_extWapeon, select.getWapeon, select.id);
            // }


            if (select.HPAdd != 0) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_hp_add, 0, select.HPAdd);
            }


            if (select.SPMul != 0) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_sp_add, 1, select.SPMul);
            }

            if (select.money != 0) {
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_addMoney, select.money, element.parent.convertToWorldSpaceAR(element.position));
            }
            PowUpEffectMgr.getInstance().addPowUpEffect(sList);
            this.closeSelf();
            // PowUpEffectMgr.getInstance().showDebug();
        }
    }

    public onShow(params: any): void {
        super.onShow(params);
        this._data = params.data;

        this.isClose = false;
        console.warn("PopGame3in1 onShow pauseGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.pauseGame);
        // this.getPowupData(11);
        //this.getPowupData(this._data.value1);
        for (const element of this.itemNodes) {
            // element.x = 750;
            // element.getComponent(ButtonPlus).interactable = false;
        }

        this.refrushHuanTxt();
        this.refrushAllTxt();
        this.getPowupData(this._data.value1);

        // let rData = GameDrawHelp.getInstance().drawByMainKeyList<PowUpData>(this._data.value1);
        // let cData = rData.rData;
        // this.curAllData = cData;

        // let tj: number[] = [];
        // let maxColor = 0;
        // for (let i = 0; i < cData.length; i++) {
        //     tj.push(cData[i].colour >= 3 ? cData[i].colour : 0);
        //     maxColor = Math.max(maxColor, cData[i].colour);
        // }
        // if (maxColor == 4) {
        //     for (let i = 0; i < cData.length; i++) {
        //         tj.push(cData[i].colour >= 4 ? cData[i].colour : 0);
        //         maxColor = Math.max(maxColor, cData[i].colour);
        //     }
        // }

        // let index = 0;
        // for (const element of this.itemNodes) {
        //     element.getComponent(PowupItemUI).setItem(cData[index], this, rData.videoList[index], tj[index] > 0);
        //     index++;
        // }

        this.debugEditor.node.parent.active = false;
        if (DEBUG_APP) {
            // PowUpEffectMgr.getInstance().showDebug();
            // this.showDebugPowup();
        }
        this.refrushBtnHuan();

        let str = '(<color=#ffb92a>金</c>><color=#bc6eff>紫</color>><color=#4eb6ff>蓝</c>><color=#88df42>绿</color>)';
        this.powupDesc.string = CommonUtils.addOutline(str, 2, '#000000');
    }

    public onAfterHide(params: any): void {
        console.warn("PopGame3in1 onAfterHide resumeGame");
        GlobalEventMgr.getInstance().emit(GlobalEventID.resumeGame);
        this.resetView();
    }

    private resetView() {
        for (let i = 0; i < this.itemNodes.length; i++) {
            this.itemNodes[i].x = this._orginItemPos[i].x;
            this.itemNodes[i].getComponent(PowupItemUI).resetView();
        }

    }

    public hideEffect(): Promise<void> {
        return new Promise((resolve, reject) => {

            for (const element of this.itemNodes) {
                cc.tween(element).to(0.2, { x: 750 }).start();
            }
            this.scheduleOnce(() => {
                resolve();
            }, 0.2);
        });
    }



    // 刷新换一批 文本
    protected refrushHuanTxt() {

        // let scene = SceneMgr.getCurrScene() as UISceneBattle;
        let rst = `${GameControl.getInstance().getPassInfo().video3in1Max - GameControl.getInstance().getPassInfo().video3in1Cur}/${GameControl.getInstance().getPassInfo().video3in1Max}`;
        let txt = cc.js.formatStr(LanguageMgr.getInstance().getLang('txt_shengyue'), rst);
        this.huanTxt.string = CommonUtils.addOutline(txt, 2, '#584131');
    }


    // 刷新全都要 文本
    protected refrushAllTxt() {
        // let scene = SceneMgr.getCurrScene() as UISceneBattle;
        let rst = `${GameControl.getInstance().getPassInfo().videoAllPowupMax - GameControl.getInstance().getPassInfo().videoAllPowupCur}/${GameControl.getInstance().getPassInfo().videoAllPowupMax}`;
        let txt = cc.js.formatStr(LanguageMgr.getInstance().getLang('txt_shengyue'), rst);
        this.allTxt.string = CommonUtils.addOutline(txt, 2, '#584131');
    }

    // 点击全都要
    protected onAllGetClicked() {
        console.log("btn_videoAll");
        if (GameControl.getInstance().getPassInfo().videoAllPowupMax - GameControl.getInstance().getPassInfo().videoAllPowupCur <= 0) {
            let txt = LanguageMgr.getInstance().getLang('txt_video3in1_max');
            GameHelp.getInstance().showToast(txt);
            return;
        }

        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onAllGetVideoCallback(b);
        }, this, { scene: "buttom_battle4" });
    }

    onAllGetVideoCallback(b: boolean) {
        if (b) {

            GameControl.getInstance().getPassInfo().videoAllPowupCur += 1;
            this.addPowupIdx(this.itemNodes);
        } else {
            // GameHelp.getInstance().showToast('视频播放失败');
        }

    }

    // 点击换一批
    protected onHuanClicked() {
        console.log("btn_videoHuan");

        let scene = GameControl.getInstance().sceneBattle;// SceneMgr.getCurrScene() as UISceneBattle;
        if (scene.getPassControl().getPassInfo().video3in1Max - scene.getPassControl().getPassInfo().video3in1Cur <= 0) {
            let txt = LanguageMgr.getInstance().getLang('txt_video3in1_max');
            GameHelp.getInstance().showToast(txt);
            return;
        }

        if (scene.getPassControl().getPassInfo().video3in1Cur < 1) {
            this.onHuanVideoCallback(true);
            GameTrackHelp.getInstance().track_button_battle_strengthen_replace_free();
            return;
        }

        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onHuanVideoCallback(b);
        }, this, { scene: "buttom_battle3" });

    }


    onHuanVideoCallback(b: boolean) {
        if (!b) {
            return;
        }
        // let scene = SceneMgr.getCurrScene() as UISceneBattle;
        // add AD Reward
        let o: Record<string, number> = { _value: 1 };
        Object.defineProperty(o, 'value', {
            get: () => o._value,
            set: (v: number) => {
                o._value = v;
                for (const element of this.itemNodes) {
                    element.scaleY = v;
                }
            },
        });

        this.itemNodes.forEach((element) => {
            // element.getComponent(ButtonPlus).interactable = false;
        })

        let mkey = this._data.value2; //12
        // if (scene.getPassControl().getPassInfo().video3in1Cur < 1) {
        //     mkey = this._data.value3 //13;
        // // }
        // cc.tween(o).to(0.2, { value: 0 }).call(() => {
        //     this.getPowupData(mkey);
        // }).delay(0.3).to(0.2, { value: 1 })//.call(
        //     // () => {
        //     //     this.itemNodes.forEach((element) => {
        //     //         element.getComponent(ButtonPlus).interactable = true;
        //     //     })
        //     // }
        //     // )
        //     .start();
        this.getPowupData(mkey);
        GameControl.getInstance().getPassInfo().video3in1Cur += 1;
        this.refrushHuanTxt();
        this.refrushBtnHuan();
    }


    // 获取 强化数据
    protected getPowupData(mKey: number[]) {
        let rData = GameDrawHelp.getInstance().drawByMainKeyList<PowUpData>(mKey);
        let cData = rData.rData;
        this.curAllData = cData;

        let tj: number[] = [];
        let maxColor = 0;
        for (let i = 0; i < cData.length; i++) {
            tj.push(cData[i].colour >= 2 ? cData[i].colour : 0);
            maxColor = Math.max(maxColor, cData[i].colour);
        }
        if (maxColor == 3) {
            for (let i = 0; i < cData.length; i++) {
                tj.push(cData[i].colour >= 3 ? cData[i].colour : 0);
                maxColor = Math.max(maxColor, cData[i].colour);
            }
        }

        CommonUtils.shuffle(this.itemNodes);
        for (let index = 0; index < this.itemNodes.length; index++) {
            // this.setAItem(this.itemNodes[index], cData.length > index ? cData[index] : null);
            // this.itemNodes[index].getComponent(PowupItemUI).setItem(cData.length > index ? cData[index] : null, this);
            this.itemNodes[index].getComponent(PowupItemUI).resetItem(cData.length > index ? cData[index] : null, this, rData.videoList[index], tj[index] > 0);
        }
    }

    public closeSelf(params?: any): Promise<boolean> {
        this.isClose = true;
        return super.closeSelf(params);
    }

    // // 设置强化显示
    // protected setAItem(iNode: cc.Node, data: ExStreData) {
    //     if (!data) {
    //         iNode.active = false;
    //         return;
    //     }
    //     iNode.active = true;
    //     // let sp = iNode.getChildByName('img').getComponent(cc.Sprite);
    //     // let path = `ui_bt/powUp/${data.icon}`;
    //     // this.loadRes(path, cc.SpriteFrame, GameBundle.Bundle_common).then((res: cc.SpriteFrame) => {
    //     //     cc.isValid(sp) && (sp.spriteFrame = res);
    //     //     if (cc.isValid(sp) && res) {
    //     //         sp.spriteFrame = res;
    //     //     } else if (res) {
    //     //         // FromResMgr.getInstance().destoryDynamicRes(this.fid);
    //     //     } else {
    //     //         console.log("res is null of path =", path);
    //     //     }
    //     // });
    //     console.log("itemNmae", iNode.name);
    //     let rTxt = iNode.getChildByName('txt').getComponent(cc.RichText);

    //     rTxt.string = CommonUtils.addOutline(GameHelp.replaceColorStr(data.note), 2, this.outLines[data.colour]);
    //     cc.Tween.stopAllByTarget(rTxt.node);
    //     rTxt.node.active = false;
    //     cc.tween(rTxt.node)
    //         .delay(0.2)
    //         .call(() => {
    //             rTxt.node.active = true;
    //         })
    //         .to(0.15, { scale: 1.15 })
    //         .to(0.15, { scale: 1 })
    //         .call(() => {
    //             iNode.getComponent(ButtonPlus).interactable = true;
    //         })
    //         .start();

    //     let bg = iNode.getChildByName('bg').getComponent(cc.Sprite);
    //     bg.spriteFrame = this.sp_blockBG[data.colour];
    //     cc.Tween.stopAllByTarget(bg.node);
    //     cc.tween(bg.node)
    //         .delay(0.2)
    //         .to(0.2, { opacity: 255 })
    //         .start();

    //     // console.log("1111", data.colour);
    //     iNode.getChildByName('UI_ziseguang').active = data.colour == 2;
    //     iNode.getComponentInChildren(PowupIconUI).initData(data, this, true);

    // }

    // private showDebugPowup() {
    //     this.debugEditor.node.parent.active = true;
    // }

    // onAddDebugPowup() {
    //     let id = this.debugEditor.string;
    //     let pData = GamePowUpData.getInstance().getPowUpDataByID(id);
    //     if (pData) {
    //         PowUpEffectMgr.getInstance().addPowUpEffect([pData]);
    //         PowUpEffectMgr.getInstance().showDebug();
    //     } else {
    //         GameHelp.getInstance().showToast('无效的强化ID=' + id);
    //     }
    // }

    // update (dt) {}
}
