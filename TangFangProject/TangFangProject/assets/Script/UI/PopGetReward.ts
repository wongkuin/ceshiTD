import SpriteFrame from "../../TRFrameWork/cocos-module/component/SpriteFrame";
import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import AdapterMgr from "../../TRFrameWork/UIFrame/AdapterMgr";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../config/ConfigMgr";
import { ItemBaseData, ShopData } from "../config/DataDef";
import { GameBundle } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import UserItemsData, { ItemVo } from "../Data/UserItemsData";
import AwardItemNew from "../module/activity/AwardItemNew";

import { eFlyAnimType, FlyViewParams } from "./FlyViewUI";
import UISceneMain from "./UISceneMain";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PopGetReward extends UIWindow {

    @property(cc.Prefab)
    protected item: cc.Prefab = null;
    @property(cc.Node)
    protected itemRoot: cc.Node = null;

    @property(cc.Node)
    protected tipsLab: cc.Node = null;

    @property(cc.Node)
    protected boxBg: cc.Node = null;

    @property({ type: sp.Skeleton, tooltip: "icon" })
    protected spine: sp.Skeleton = null;




    @property(cc.Node)
    protected root: cc.Node = null;


    @property(cc.Node)
    protected bgRoot: cc.Node = null;

    @property(cc.Node)
    protected libaoTitle: cc.Node = null;

    @property(cc.Node)
    protected openTips: cc.Node = null;

    @property(ButtonPlus)
    protected btnOpen: ButtonPlus = null;


    modalType = new ModalType(ModalOpacity.OpacityHigh, true);
    // closeType = ECloseType.CloseAndDestory;

    hangNum = 5;
    showNodeNum = 0;
    // isFinish = false;
    list: ItemVo[]
    public onInit(params: any): void {
        // this.node.on("click", this.closeSelf, this)

        this.node.setContentSize(AdapterMgr.getInstance().visibleSize);
        this.btnOpen.addClick(this.onOpenBox, this)
        this.setBlockInput(true); //屏蔽点击事件
        super.onInit(params);

    }

    onOpenBox() {
        this.openTips.active = false;
        this.onOpenStoreBox();
    }

    public onShow(params: any): void {
        super.onShow(params);
        this.setBlockInput(true); //屏蔽点击事件

        this.tipsLab.active = false;
        this.list = params.rewards;
        this.root.active = false;
        this.itemRoot.removeAllChildren();
        this.spine.node.active = false;
        this.bgRoot.active = false;
        this.libaoTitle.active = false;
        if (params?.stroeBox) {
            this.bgRoot.active = true;
            this.libaoTitle.active = true;
            this.openTips.active = true;
            this.boxBg.active = true;

            this.libaoTitle.getComponent(cc.Label).string = (params?.boxType == 1) ? "普通宝箱" : "豪华宝箱";
            //this.libaoTitle.getComponent(SpriteFrame).setFrameByIndex(params?.boxType - 1);

            this.playSpineBoxAni(params?.stroeBox, params?.boxType);
        } else if (params?.battleChest) {
            this.playSpineAni(params?.battleChest);
        } else {
            this.init(this.list);
        }
    }

    playSpineBoxAni(stroeBox, boxType) {

        // let node: cc.Node = cc.instantiate(stroeBox as cc.Node);
        // this.spine.node.parent.addChild(node, cc.macro.MAX_ZINDEX);
        let totalNum = 0;
        this.list.forEach((item) => {
            if (item.itemID != 1 && item.itemID != 2) {//铜钱不算
                totalNum += item.num;
            } else {
                totalNum += 1;
            }

        })
        // let redDot = node.getChildByName("redDot");
        // let numLab = redDot.getChildByName("numLab");
        // redDot.active = true;
        // numLab.getComponent(cc.Label).string = totalNum + "";


        let btn = this.spine.node.getComponent(ButtonPlus);




        // this.spine.node.off('click');

        this.btnOpen.interactable = false;
        let index = boxType;
        this.root.active = false;
        this.spine.node.active = false;
        this.spine.setCompleteListener(null)
        SceneMgr.getCurrScene().loadRes(`spine/baoxiang_0${index}`, sp.SkeletonData, GameBundle.Bundle_commonRes).then((res: sp.SkeletonData) => {
            if (cc.isValid(this.spine) && res) {
                this.spine.skeletonData = res;
                this.spine.node.active = true;
                this.btnOpen.interactable = true;
                this.spine.setAnimation(0, "idle", true);
                this.spine.node.scale = 1.5;
                this.setBlockInput(false);
                // this.spine.node.off('click');


                // this.spine.node.on("click", (param: cc.Button) => {
                //     cc.log("11111");

                // }, this)
            }
        });
    }

    onOpenStoreBox() {



        //-----------------------------------------------------

        this.spine.node.active = true;
        this.spine.setAnimation(0, "open", false);



        this.spine.setCompleteListener(() => {
            // this.spine.node.active = false;
            this.libaoTitle.active = false;
            this.libaoTitle.active = false;
            this.boxBg.active = false;
            this.init(this.list);
        })
    }


    playSpineAni(battleChest) {
        // let finishLoading = false;
        // let finishFly = false;
        // let node: cc.Node = cc.instantiate(battleChest.boxNode as cc.Node);
        // this.spine.node.parent.addChild(node);
        // node.scale = 1;
        // node.position = this.spine.node.parent.convertToNodeSpaceAR(battleChest.boxNode.parent.convertToWorldSpaceAR(battleChest.boxNode.position));
        // cc.tween(node)
        //     .to(0.5, { position: this.spine.node.position, scale: 2 }, { easing: "sineOut" })
        //     .call(() => {
        //         finishFly = true;
        //         if (finishLoading) {
        //             if (cc.isValid(node))
        //                 node.destroy();
        //             this.playSpine();
        //         }
        //     }).start();

        // let index = 1//GameBattleChestData.getInstance().getBoxIdx(battleChest.boxVo);
        // this.root.active = false;
        // this.spine.node.active = false;
        // SceneMgr.getCurrScene().loadRes(`spine/baoxiang_${index}`, sp.SkeletonData, GameBundle.Bundle_common).then((res: sp.SkeletonData) => {
        //     if (cc.isValid(this.spine) && res) {
        //         this.spine.skeletonData = res;
        //         this.spine.node.scale = 2;

        //     }
        //     finishLoading = true;
        //     if (finishFly) {
        //         if (cc.isValid(node))
        //             node.destroy();
        //         this.playSpine();
        //     }
        // });
    }

    playSpine() {
        this.spine.node.active = true;

        this.spine.setAnimation(0, "animation", false);
        this.spine.setCompleteListener(() => {
            this.spine.node.active = false;
            this.init(this.list);
        })
    }


    init(list: ItemVo[]) {
        this.root.active = true;
        // this.spine.setAnimation(0,"animation",false);
        // this.spine.addAnimation(0,"loop",true);
        this.itemRoot.removeAllChildren();
        // console.error(this.list.length);
        for (let i = 0; i < this.list.length; i++) {
            let itemData = ConfigMgr.getInstance().getById(this.list[i].itemID, ItemBaseData);
            let num = UserItemsData.getInstance().getRealAwardNum(itemData.id, this.list[i].num);
            let st: boolean = this.list[i].st;

            let node = cc.instantiate(this.item);
            node.getComponent(AwardItemNew).initItem({ itemID: itemData.id, num: num, st: st }, true,)
            this.itemRoot.addChild(node);
            node.active = false;

            // if (itemData.type == 1 && !GameFruitData.getInstance().checkFruitNeedSuiPianById(itemData.value1)) {
            //     let cost = parseInt(ConfigMgr.getInstance().getById(18, ShopData).val);
            //     UserItemsData.getInstance().pushItem(2, this.list[i].num * cost);
            // } else {
            UserItemsData.getInstance().pushItem(this.list[i].itemID, this.list[i].num);
            // }

        }

        // for (let i = 0; i < this.list.length; i++) {
        //     this.addItem(i);
        //     /**提前加数量 */
        // }
        this.addItem(this.list.length - 1);

    }

    addItem(delayTime) {
        this.showNodeNum = this.list.length;
        this.scheduleOnce(() => {
            // let scale = this.spine.node.scale;
            // cc.tween(this.spine.node)
            //     .to(0.08, { scaleX: 1.2 * scale, scaleY: 0.8 * scale })
            //     .to(0.08, { scaleX: 1 * scale, scaleY: 1 * scale })
            //     .start();
            // let crewId = this.list[delayTime].itemId;

            // let itemData = ConfigMgr.getInstance().getById(this.list[delayTime].itemID, ItemBaseData);
            // let num = UserItemsData.getInstance().getRealAwardNum(itemData.id, this.list[delayTime].num);
            // let st: boolean = this.list[delayTime].st;

            // let node = cc.instantiate(this.item);
            // node.getComponent(AwardItem).initItem({ itemID: itemData.id, num: num, st: st }, true, true, true)
            // let img = node.getChildByName('icon').getComponent(cc.Sprite);
            // let bgImg = node.getChildByName('bg').getComponent(cc.Sprite);
            // SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, img, GameBundle.Bundle_common);
            // SceneMgr.getCurrScene().loadSpirteFrame(`ItemBg/bg${itemData.colour}`, bgImg, GameBundle.Bundle_common);
            // let newNode = node.getChildByName('new');
            // newNode.active = UserItemsData.getInstance().getItemNum(itemData.id) == 0 && (itemData.type != 0 && itemData.type != 1);
            // let numLab = node.getChildByName('numLab');
            // numLab.getComponent(cc.Label).string = "x" + num;
            // let nameLab = node.getChildByName('nameLab');
            // nameLab.getComponent(cc.Label).string = itemData.name;
            // let suipian = node.getChildByName('suipian');
            // suipian.active = itemData.type == 1;
            let children = this.itemRoot.children;
            //this.showNodeNum++;
            let node = children[this.showNodeNum - 1];
            // node.active = true;
            // node.scale = 0;
            // node.setPosition(this.spine.node.x, this.spine.node.y);

            let length1 = Math.min(this.showNodeNum, 5);
            let length2 = Math.floor(this.showNodeNum % 5);
            if (this.showNodeNum % 5 == 0 && this.showNodeNum / 5 > 0) {
                length2 = 5;
            }
            let line = 5;
            // if(children.length>5){
            //     length1 = Math.ceil(children.length/2);
            //     line = Math.ceil(children.length/2);
            //     length2 = children.length - length1;
            // }

            let initY = this.showNodeNum > line ? 170 : 130;
            for (let i = 0; i < this.showNodeNum; i++) {
                let hang = Math.floor(i / line);
                let lie = i % line;
                let length = (i <= Math.floor(this.showNodeNum / line) * line - 1) ? length1 : length2;
                let totleLength = length * node.width + (length - 1) * 10;
                let initX = -totleLength / 2;
                let x = initX + node.width / 2 + (lie) * (node.width + 10);
                let y = initY - hang * (150);

                children[i].x = x;
                children[i].y = y;
                children[i].active = true;
                // cc.tween(children[i])
                //     .to(0.15, { scale: 1, x: x, y: y })
                //     .call(() => {
                //         if (delayTime == this.list.length - 1) {
                //             this.tipsLab.active = true;

                //             this.spine.node.active = false;
                //             // this.isFinish = true;
                //             this.setBlockInput(false); //屏蔽点击事件
                //         }
                //     })
                //     .start();
            }
            this.tipsLab.active = true;

            this.spine.node.active = false;
            this.setBlockInput(false); //屏

            // if (delayTime == this.list.length - 1) {
            //     this.list.forEach((data) => {
            //         let itemData = ConfigMgr.getInstance().getById(data.itemID, ItemBaseData);


            //     })

            // }
            SoundMgr.getInstance().playSoundByID(23);
        }, 0 * 0.2);
    }

    playFlyAffect() {
        let idList = [1, 2, 3];
        let fpList = [];
        this.list.forEach((item, index) => {
            if (idList.indexOf(item.itemID) >= 0) {
                fpList.push(this.addPropEffect(this.itemRoot.children[index], item.itemID, item.num));
            }
            let itemData = ConfigMgr.getInstance().getById(item.itemID, ItemBaseData);
            if (itemData.type == 5) {
                fpList.push(this.addSuiPianEffect(this.itemRoot.children[index], item.itemID, item.num));
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
        if (!main.btn_lingshi || !cc.isValid(node1)) {
            return;
        }
        let sIcon = node1.getChildByName('icon');
        let startPos = node1.convertToWorldSpaceAR(sIcon.position);
        let eIcon: cc.Node
        switch (itemId) {
            case 1://元宝
                eIcon = main.btn_yuanbao.node.getChildByName('icon');
                break;
            case 2://灵石
                eIcon = main.btn_lingshi.node.getChildByName('icon');
                break;

            case 3://免广券
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
            scale: [sIcon.scale, 0.55],
            blockInput: false, // 阻挡输入
            callBack: null,  // 回调
            animType: eFlyAnimType.Line,
            nodeNum: Math.min(8, itemNum)
        }
        return fp;
    }

    // 飞碎片动画
    public addSuiPianEffect(node1: cc.Node, itemId, itemNum): FlyViewParams {
        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.btn_equip || !cc.isValid(node1)) {
            return;
        }
        let sIcon = node1.getChildByName('icon');
        let startPos = node1.convertToWorldSpaceAR(sIcon.position);
        let eIcon: cc.Node = main.btn_equip.node;
        let endPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);

        let node = cc.instantiate(sIcon);

        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: node,
            duration: 0.4,
            scale: [sIcon.scale, 0.6],
            blockInput: false, // 阻挡输入
            callBack: null,  // 回调
            animType: eFlyAnimType.Line,
            nodeNum: Math.min(8, itemNum)
        }
        return fp;
    }

    public onAfterHide(params: any): void {
        this.playFlyAffect();
        GlobalEventMgr.getInstance().emit(GlobalEventID.closeAwardPop);
    }

    public async closeSelf(params?: any): Promise<boolean> {
        // if (!this.isFinish) {
        //     return;
        // 
        return super.closeSelf(params);
    }


}

