
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import ConfigMgr from "../config/ConfigMgr";
import { GuideData } from "../config/DataDef";

import UIConfig from "../config/UIConfig";
import GameGlobalData from "../Data/GameGlobalData";
import GameUserData from "../Data/GameUserData";
import GuideComp from "./GuideComp";
import GuideCompRepreat from "./GuideCompRepreat";
import GuideCtrl from "./GuideCtrl";

const { ccclass, property } = cc._decorator;

// export type GuideConfig = {
//     gid: number, //引导id
//     desc: string, //引导描述
//     cname: string, //引导节点名称
// }


@ccclass
export default class GuideMgr extends Singleton<GuideMgr> {

    // @property(cc.Prefab)
    // guidePrefab: cc.Prefab = null;

    private tipNode: cc.Node = null;

    private _config: GuideData[] = [];

    private _curGid: number = 0;

    isValid: boolean = true; // 事件系统需要

    private _showedList: number[] = []; // 已经显示过的引导


    // private static instance: GuideMgr = null;
    // public static getInstance(): GuideMgr {

    //     return GuideMgr.instance;
    // }

    private _layerPrefab: cc.Prefab = null;

    constructor() {
        super();
        this.onLoad();
    }

    protected onLoad(): void {
        GlobalEventMgr.getInstance().on(GlobalEventID.GuideEnd, this.onGuideEnd, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.CloseRepeatGuide, this.onCloseRepeatGuide, this);
        this.loadConfig();
        // GuideMgr.instance = this;
    }

    protected loadConfig() {
        this._config = ConfigMgr.getInstance().getAll(GuideData);
    }

    public getConfig(gid: number): GuideData {
        return this._config.find((item) => {
            return item.id == gid;
        })
    }

    /**
     * @param gid  引导id
     * @param uiNode  ui跟节点
     * @param node  引导节点
     * @param txtPos  引导文本位置，世界坐标
     * @param isRepeat 是重复的
     * @param endPos 手指移动 
     * @returns 
     */
    public CheckShowGuid(gid: number, uiNode: cc.Node, node: cc.Node, txtPos?: cc.Vec2, isRepeat?: true, bgOpacity?: number): boolean {

        if (!GameGlobalData.getInstance().openGuide) {
            return false;
        }

        let result = false;
        if (this.havenGuide(gid)) {
            console.log("已经完成引导", gid);
            return result;
        }
        if (!this.checkPosible(node)) {
            console.log("引导位置不可见", gid);
            return result;
        }
        if (!this._config.find((item) => {
            return item.id == gid;
        })) {
            console.warn("没有找到引导配置", gid);
            return result;
        }


        result = true;
        //TimerUtils.instance.once(() => {
        GuideMgr.getInstance().delFun(gid, node, txtPos, 0, isRepeat, bgOpacity);
        //})
        return result;
    }

    /**
     * 处理引导具体显示 及数据保存
     * delFun
     * @param gid 
     * @returns  
     */
    async delFun(gid: number, node: cc.Node, txtPos?: cc.Vec2, extHight = 0, isRepeat?: boolean, bgOpacity?: number) {

        // console.log("处理引导具体显示 及数据保存")
        if (cc.isValid(this.tipNode) && this.tipNode.active) {
            console.error("正在显示引导，请勿重复调用", gid)
            return;
        }
        console.warn("gid:", gid);
        this._curGid = gid;
        this._showedList.push(gid);

        //!this._layerPrefab && (

        //this._layerPrefab = (await ResMgr.getInstance().loadRes("prefabs/guideLayer", cc.Prefab, 'Common')).asset,
        //this._layerPrefab.addRef()
        // );
        //     let res = this._layerPrefab;
        //     if(!res){
        //         debugger;
        //     }
        if (!cc.isValid(this.tipNode)) {
            this.tipNode = (await FormMgr.open(UIConfig.ui_GuideUI)).node;
        }
        // cc.instantiate(res);
        // cc.director.getScene().getChildByName('Canvas').addChild(this.tipNode, 9999);
        this.tipNode.active = true;
        let gCtrl = this.tipNode.getComponent(GuideCtrl);

        let config = this._config.find((item) => {
            return item.id == gid;
        });

        gCtrl.ShowGuide(node, config.tips, txtPos, extHight, bgOpacity);
        gCtrl.isRepeat = isRepeat;
        if (isRepeat) {
            node.addComponent(GuideCompRepreat);
        } else {
            node.addComponent(GuideComp);
        }
    }

    // 点击引导对象 引导结束
    onGuideEnd(node: cc.Node) {
        //console.log("onGuideEnd", this._curGid, this.tipNode?.getComponent(GuideCtrl).isRepeat)
        if (!cc.isValid(this.tipNode) || !this.tipNode.active || this.tipNode?.getComponent(GuideCtrl)?.isRepeat) {
            return;
        }
        this.checkFinishGroup(this._curGid);
        this.tipNode.active = false;
    }

    // 关闭重复引导
    protected onCloseRepeatGuide(gid: number) {
        cc.isValid(this.tipNode) && (this.tipNode.getComponent(GuideCtrl).isRepeat = false);
    }

    // 检查是否完成引导组
    protected checkFinishGroup(gid: number) {
        // GameUserData.getInstance().finishGuide(this._curGid);
        let config = this._config.find((item) => {
            return item.id == gid;
        });
        if (config && config.end == 1) {
            // TrackerMgr.instance?.sendGuide(config.type);
            // GameClubSDK.reportAnalytics("新手引导", config.type+"");
            GameUserData.getInstance().finishGuide(config.type);
            GameUserData.getInstance().save();
        }
    }

    public getGuideInfoByID(gid: number): GuideData {
        return this._config.find((item) => {
            return item.id == gid;
        });
    }


    // 已经引导过
    public havenGuide(gid: number): boolean {
        // 当前已经引导过
        if (this._showedList.find((item) => {
            return item == gid;
        })) {
            return true;
        }

        let config = this._config.find((item) => {
            return item.id == gid;
        });
        // 引导组已经完成
        return config && GameUserData.getInstance().isFinishGuide(config.type);
    }

    // 外部调用显示引导
    public outShowGuide(gid: number) {
        this._showedList.push(gid);
    }

    // 在界面内
    checkPosible(node: cc.Node): boolean {
        if (node == null) { return false; }
        let pos = node.parent.convertToWorldSpaceAR(node.position);
        let winSize = cc.winSize;
        let rect = cc.rect(0, 0, winSize.width, winSize.height);
        if (rect.contains(cc.v2(pos.x, pos.y))) {
            return true;
        }
        return true;
        // console.log("不在界面内")
        // return false;
    }
}
