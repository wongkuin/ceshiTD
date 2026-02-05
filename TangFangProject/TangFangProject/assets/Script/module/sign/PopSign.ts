import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../../config/ConfigMgr";
import { SignData, ItemBaseData, KvData, WapenFusionData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameSignData from "../../Data/GameSignData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import { FlyViewParams, eFlyAnimType } from "../../UI/FlyViewUI";
import UISceneMain from "../../UI/UISceneMain";
import signItem from "./SignItem";



const { ccclass, property } = cc._decorator;





@ccclass
export default class PopSign extends UIWindow {

    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    @property(ButtonPlus)
    btn_get: ButtonPlus = null;

    @property(ButtonPlus)
    btn_yiGet: ButtonPlus = null;

    @property(ButtonPlus)
    btn_getAD: ButtonPlus = null;

    @property(ButtonPlus)
    btn_close: ButtonPlus = null;





    @property({ type: cc.Node, tooltip: "root" })
    protected itemRoot: cc.Node = null;



    @property({ type: cc.Node, tooltip: "signSevenItem" })
    protected signSevenItem: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "signItemPfb" })
    protected signItemPfb: cc.Prefab = null;

    @property(sp.Skeleton)
    spine1: sp.Skeleton = null;

    @property(sp.Skeleton)
    spine2: sp.Skeleton = null;





    curSignData: SignData[] = []
    time = 1;

    xzDay = 1;
    public onInit(params: any): void {
        super.onInit(params);

        this.btn_get.addClick(this.onGetSignReward, this);
        this.btn_getAD.addClick(this.onGetSignRewardByAD, this);
        this.btn_close.addClick(this.closeSelf, this);
        this.signSevenItem.getComponent(ButtonPlus).addClick(this.onXZ, this);
        GameSignData.getInstance().on(this.setDirtyFlag, this);
    }

    /**脏标记 */
    dirtyFlag: boolean = false;

    _dt: number = 0;


    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 20 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;
            this.initView();
        }
    }

    hideBoneByName(spine: sp.Skeleton, boneName: string) {
        const skeleton = spine.skeletonData;
        // 找到该骨骼对应的所有bones
        const bones = skeleton["_skeletonJson"].bones;
        // console.log("skeleton",sk,skeleton,bones);
        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            if (bone.name === boneName) {
                bone.scaleX = 0;
                bone.scaleY = 0; // 设置透明度为0
            }
        }
    }



    public onShow(fruitId: number): void {
        super.onShow(fruitId);

        GameSignData.getInstance().resetCanSignDay();
        let type = 1;
        let allCfg = ConfigMgr.getInstance().getAll(SignData);
        console.log(allCfg);
        this.curSignData = allCfg.filter((vo) => {
            return vo.group == type;
        })
        this.curSignData.sort((a, b) => {
            return a.day - b.day;
        })
        this.xzDay = GameSignData.getInstance().getMinCanCreceiveDay();

        this.initView();

        // this.hideBoneByName(this.spine1, "yingzi");
    }

    initView() {
        this.initLayout();
        this.initSevenItem();

        this.xzItem(this.xzDay)

        let show = GameSignData.getInstance().receiveDayList.indexOf(7) >= 0;;
        this.signSevenItem.getChildByName("yiqiandao").active = show;
    }

    initLayout() {
        this.itemRoot.children.forEach((node) => {
            node.active = false;
        })

        for (let i = 0; i <= 5; i++) {
            let data = this.curSignData[i];
            if (!data) {
                continue;
            }
            let node = this.itemRoot.children[i]
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.signItemPfb);
                this.itemRoot.addChild(node);
            } else {
                node.active = true;
            }

            node.getComponent(signItem).initItem(data, this);
        }
    }

    initSevenItem() {
        let redDotNode = this.signSevenItem.getChildByName("redDot");
        redDotNode.active = GameSignData.getInstance().checkCanReceiveNormal(7);

        let hasSignNode = this.signSevenItem.getChildByName("hasSignNode");
        hasSignNode.active = GameSignData.getInstance().checkFinishByDay(7);
        let awardRoot = this.signSevenItem.getChildByName("itemRoot");
        awardRoot.removeAllChildren();
        let awardList = this.curSignData[6].bouns;
        for (let i = 0; i < awardList.length; i = i + 2) {
            let item = cc.instantiate(this.signSevenItem.getChildByName("iconBg"));
            awardRoot.addChild(item);
            let guang = item.getChildByName("ui_guangxiao");
            guang.active = false;
            this.playGuangAni(guang);
            item.y = 0;
            item.active = true;
            let itemId = awardList[i];
            let itemNum = awardList[i + 1];
            let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
            if (itemData) {
                let numLab = item.getChildByName("numLab").getComponent(cc.Label);
                numLab.string = "x" + itemNum;
                // let suipian = item.getChildByName("suipian");
                // suipian.active = itemData.type == 1;
                let icon = item.getChildByName("icon").getComponent(cc.Sprite);
                SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/${itemData.img}`, icon, GameBundle.Bundle_commonRes);
                //  this.clickItem(icon.node, itemId);
                let wpFusionData = ConfigMgr.getInstance().getById(itemData.typeArgs, WapenFusionData);
                if (wpFusionData) SceneMgr.getCurrScene().loadSpirteFrame(`ItemIcon/itemBg${wpFusionData.level}`, item.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
            }
        }

        // if (GameSignData.getInstance().checkFinishByDay(7)) {
        //     awardRoot.active = false;
        // } else {
        //     awardRoot.active = true;
        // }

    }

    xzItem(day: number) {
        this.xzDay = day;
        this.itemRoot.children.forEach((node, index) => {
            node.getComponent(signItem).setXzkuang(index + 1 == day);
        })
        this.refreshBtnState();
        let isGuangActive = GameSignData.getInstance().checkCanReceive(7) && (day == 7);
        let awardRoot = this.signSevenItem.getChildByName("itemRoot");
        awardRoot.children.forEach((node) => {
            let guang = node.getChildByName("ui_guangxiao");
            guang.active = isGuangActive;
        })


    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    clickItem(item: cc.Node, itemId) {

        let btn = item.getComponent(ButtonPlus);
        if (!btn) {
            item.addComponent(ButtonPlus);
        }
        item.off('click');
        item.on("click", async () => {
            let wpos = item.parent.convertToWorldSpaceAR(item.getPosition())
            FormMgr.open(UIConfig.ui_PopItemInfo, { itemId: itemId, wpos: wpos });
        })
    }

    refreshBtnState() {

        let isClick = GameSignData.getInstance().checkCanReceiveNormal(this.xzDay);
        this.btn_get.node.active = isClick;

        let isClickAD = GameSignData.getInstance().checkCanReceiveAD(this.xzDay);
        this.btn_getAD.node.active = isClickAD;

        this.btn_yiGet.node.active = this.xzDay <= GameSignData.getInstance().canSignDay && this.btn_get.node.active == false && this.btn_getAD.node.active == false;


    }


    onGetSignReward() {
        this.getReward();
        GameSignData.getInstance().receiveDayList.push(this.xzDay);
        this.refreshBtnState();
        // GameTrackHelp.getInstance().track_button_sign_free(GameSignData.getInstance().getToday());
    }

    getReward(beilv = 1) {


        let today = this.xzDay;
        let bouns = this.curSignData[today - 1].bouns;

        if (beilv > 1) {
            bouns = this.curSignData[today - 1].bouns2;
        }
        let award: ItemVo[] = []
        for (let i = 0; i < bouns.length; i = i + 2) {
            let item: ItemVo = { itemID: bouns[i], num: bouns[i + 1] };
            award.push(item);
        }
        this.playFlyAffect(award);

    }


    playFlyAffect(award: ItemVo[]) {
        let idList = [1, 2, 3];
        let fpList = [];
        award.forEach((item, index) => {
            if (idList.indexOf(item.itemID) >= 0) {
                let itemNode = (this.xzDay == 7) ? this.signSevenItem.getChildByName("itemRoot").children[index] : this.itemRoot.children[this.xzDay - 1]
                fpList.push(this.addPropEffect(itemNode, item.itemID, item.num));
            } else {
                UserItemsData.getInstance().pushItem(item.itemID, item.num);
            }
            // UserItemsData.getInstance().pushItem(item.itemID, item.num);

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
            scale: [sIcon.scale, 0.55],
            blockInput: false, // 阻挡输入
            callBack: () => {
                UserItemsData.getInstance().pushItem(itemId, itemNum);
                let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
                if (itemData.type == 0) {
                    let kvId = (itemData.typeArgs == 1) ? 18 : 19;
                    let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
                    SoundMgr.getInstance().playSound(soundName);
                }
            },  // 回调,  // 回调
            animType: eFlyAnimType.Line,
            nodeNum: Math.min(8, itemNum)
        }
        return fp;
    }


    onGetSignRewardByAD() {
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onSuccessFunc(b);
        }, this, { scene: "buttom_title1" })
    }

    onSuccessFunc(b) {
        if (!b) {
            return;
        }
        this.getReward(2);
        GameSignData.getInstance().receiveDayListAD.push(this.xzDay);
        this.refreshBtnState();

    }

    public closeSelf(params?: any): Promise<boolean> {

        return super.closeSelf(params);
    }

    onXZ() {
        if (7 == GameSignData.getInstance().canSignDay) {
            this.xzItem(7);
        }
        //this.
    }

    // update (dt) {}
}
