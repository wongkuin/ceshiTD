import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, KvData, OnlineBounsData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameActivityData from "../../Data/GameActivityData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";
import { FlyViewParams, eFlyAnimType } from "../../UI/FlyViewUI";
import UISceneMain from "../../UI/UISceneMain";


const { ccclass, property } = cc._decorator;

@ccclass
export default class OnlineBounsItem extends cc.Component {

    @property({ type: ButtonPlus, tooltip: "领取" })
    protected btnGet: ButtonPlus = null;

    @property({ type: cc.Sprite, tooltip: "奖励图标" })
    protected icon: cc.Sprite = null;
    @property({ type: cc.Sprite, tooltip: "奖励图标背景" })
    protected iconBg: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "奖数量" })
    protected bounsNum: cc.Label = null;

    @property({ type: cc.Label, tooltip: "描述" })
    protected descLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "进度" })
    protected jdLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "按钮字" })
    protected btnLab: cc.Label = null;

    @property({ type: cc.ProgressBar, tooltip: "进度条" })
    protected progressBar: cc.ProgressBar = null;

    @property({ type: cc.Node, tooltip: "已领取标记" })
    protected ylqNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "红点" })
    protected redDot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "光" })
    protected guang: cc.Node = null;


    protected onLoad(): void {
        this.btnGet.addClick(this.onGetBouns, this)
        this.playGuangAni(this.guang);
    }


    data: OnlineBounsData
    initItem(data: OnlineBounsData) {
        this.data = data;
        let needTime = Math.floor(data.time / 1000 / 60);
        let nowTime = Math.floor(GameActivityData.getInstance().onlineTime / 60);

        let jd = nowTime / needTime;


        let itemId = data.bouns[0];
        let itemNum = data.bouns[1];
        let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);


        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, this.icon, GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${itemData.colour || 3}`, this.iconBg, GameBundle.Bundle_commonRes);
        this.bounsNum.string = itemNum.toString();
        this.jdLab.string = `${nowTime}/${needTime}`;
        this.progressBar.progress = jd;
        this.descLab.string = `累计在线${needTime}分钟`;

        let isGet = GameActivityData.getInstance().onlineBounsGetIdList.indexOf(data.id) >= 0;
        this.ylqNode.active = isGet;
        this.btnGet.node.active = !isGet;
        this.redDot.active = false;
        this.guang.active = false;
        if (needTime <= nowTime) {//达成
            this.btnLab.string = "";
            if (isGet) {
            } else {
                this.guang.active = true;
                this.btnLab.string = "领取";
                this.redDot.active = true;
            }
        } else {
            this.btnLab.string = "未达成";
        }




    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    onGetBouns() {

        let needTime = Math.floor(this.data.time / 1000 / 60);
        let nowTime = Math.floor(GameActivityData.getInstance().onlineTime / 60);

        if (needTime > nowTime) {
            GameHelp.getInstance().showToast("累计时间未达成");
            return;
        } else {
            GameActivityData.getInstance().addOnlineBounsId(this.data.id);
            this.initItem(this.data);
        }

        this.playFlyAffect([{ itemID: this.data.bouns[0], num: this.data.bouns[1] }]);
    }



    playFlyAffect(award: ItemVo[]) {
        let idList = [1, 2, 3];
        let fpList = [];
        award.forEach((item, index) => {
            if (idList.indexOf(item.itemID) >= 0) {
                let itemNode = this.iconBg.node;
                fpList.push(this.addPropEffect(itemNode, item.itemID, item.num));
            } else {
                UserItemsData.getInstance().pushItem(item.itemID, item.num);
            }


        })
        if (fpList.length > 0) {
            //  console.log(fpList);
            FormMgr.open(UIConfig.ui_flyView, fpList, { quick: true });
        }
    }

    // 飞银币动画
    public addPropEffect(node1: cc.Node, itemId, itemNum) {
        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.btn_equip || !cc.isValid(node1)) {
            return;
        }
        let sIcon = Utils.getWidget("icon", node1);
        let startPos = sIcon.parent.convertToWorldSpaceAR(sIcon.position);
        let eIcon: cc.Node
        switch (itemId) {
            case 1://元宝
                eIcon = main.btn_yuanbao.node.getChildByName('icon');
                break;
            case 2://灵石
                eIcon = main.btn_lingshi.node.getChildByName('icon');
                break;

            case 3://免广
                eIcon = main.btn_adTiket.node.getChildByName('icon');
                break;


        }
        let endPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);

        let node = cc.instantiate(sIcon);

        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: node,
            duration: 0.4,
            scale: [sIcon.scale, 0.6],
            blockInput: false, // 阻挡输入
            callBack: () => {
                UserItemsData.getInstance().pushItem(itemId, itemNum);
                let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
                if (itemData.type == 0) {
                    let kvId = (itemData.typeArgs == 1) ? 18 : 19;
                    let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
                    SoundMgr.getInstance().playSound(soundName);
                }
            },  // 回调
            animType: eFlyAnimType.Line,
            nodeNum: Math.min(8, itemNum)
        }
        return fp;
    }







}