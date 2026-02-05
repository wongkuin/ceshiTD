import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { DailyGiftPackData, ItemBaseData, KvData, OnlineBounsData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameActivityData from "../../Data/GameActivityData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";
import { FlyViewParams, eFlyAnimType } from "../../UI/FlyViewUI";
import UISceneMain from "../../UI/UISceneMain";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DailyGiftPackItem extends cc.Component {

    @property({ type: ButtonPlus, tooltip: "领取" })
    protected btnGet: ButtonPlus = null;

    @property({ type: SpriteFrame, tooltip: "背景" })
    protected bg: SpriteFrame = null;

    @property({ type: cc.Sprite, tooltip: "奖励图标" })
    protected icon: cc.Sprite = null;
    @property({ type: cc.Sprite, tooltip: "奖励图标背景" })
    protected iconBg: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "奖数量" })
    protected bounsNum: cc.Label = null;

    @property({ type: cc.Node, tooltip: "已领取标记" })
    protected ylqNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "红点" })
    protected redDot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "光" })
    protected guang: cc.Node = null;

    @property({ type: cc.Node, tooltip: "suo" })
    protected lockNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "广告" })
    protected ADNode: cc.Node = null;


    @property({ type: cc.Node, tooltip: "箭头root" })
    protected jtRoot: cc.Node = null;


    @property({ type: [cc.Node], tooltip: "箭头" })
    protected jtList: cc.Node[] = [];


    protected onLoad(): void {
        this.btnGet.addClick(this.onGetBouns, this)
        this.playGuangAni(this.guang);
    }


    data: DailyGiftPackData
    initItem(data: DailyGiftPackData, isLast: boolean = false) {
        this.data = data;
        let itemId = data.bouns[0];
        let itemNum = data.bouns[1];
        let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, this.icon, GameBundle.Bundle_commonRes);
        SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${itemData.colour || 3}`, this.iconBg, GameBundle.Bundle_commonRes);
        this.bounsNum.string = itemNum.toString();
        let index = (GameActivityData.getInstance().dailyGiftIndex < this.data.id) ? 1 : 0;
        this.bg.setFrameByIndex(index)
        let isGet = GameActivityData.getInstance().dailyGiftIndex > this.data.id;
        this.ylqNode.active = isGet;
        this.lockNode.active = GameActivityData.getInstance().dailyGiftIndex < this.data.id;
        this.ADNode.active = this.data.cost == 1;
        this.redDot.active = false;
        if (this.data.id == GameActivityData.getInstance().dailyGiftIndex) {
            this.guang.active = true;
            if (this.ylqNode.active) this.guang.active = false;
            if (this.data.cost == 0) {
                this.redDot.active = true;
            }
        } else {
            this.guang.active = false;
            this.bg.setFrameByIndex(1)
        }

        this.jtList.forEach((jt, index) => {
            jt.active = false;
        })
        let jtIndex = this.data.id % 4;
        if (jtIndex == 0) {
            jtIndex = 4;
        }
        this.jtList[jtIndex - 1].active = !isLast;
    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }



    onGetBouns() {

        if (GameActivityData.getInstance().dailyGiftIndex < this.data.id) {
            GameHelp.getInstance().showToast("当前礼包未解锁");
            return;
        } else if (GameActivityData.getInstance().dailyGiftIndex == this.data.id) {
            if (this.data.cost == 0) {
                this.playFlyAffect([{ itemID: this.data.bouns[0], num: this.data.bouns[1] }]);
                GameActivityData.getInstance().dailyGiftIndex++;
            } else {
                PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                    if (!cc.isValid(this)) return;
                    this.onSuccessFunc(b);
                }, this, { scene: "buttom_title2" })
            }
        }



    }

    onSuccessFunc(b) {
        if (!b) {
            return;
        }
        this.playFlyAffect([{ itemID: this.data.bouns[0], num: this.data.bouns[1] }]);
        GameActivityData.getInstance().dailyGiftIndex++;
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