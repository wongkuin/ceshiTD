

import ConfigMgr from "../../../Script/config/ConfigMgr";
import { ItemBaseData, KvData } from "../../../Script/config/DataDef";
import { GameBundle } from "../../../Script/config/GameEnum";
import UIConfig from "../../../Script/config/UIConfig";
import GameUserData from "../../../Script/Data/GameUserData";
import UserItemsData, { ItemVo } from "../../../Script/Data/UserItemsData";
import GameHelp from "../../../Script/Mgr/GameHelp";
import AwardItemNew from "../../../Script/module/activity/AwardItemNew";
import { FlyViewParams, eFlyAnimType } from "../../../Script/UI/FlyViewUI";
import UISceneMain from "../../../Script/UI/UISceneMain";
import SoundMgr from "../../cocos-module/mgr/SoundMgr";
import Utils from "../../cocos-module/utils/Utils";
import ButtonPlus from "../../Common/Components/ButtonPlus";
import { ModalOpacity } from "../../UIFrame/config/SysDefine";
import FormMgr from "../../UIFrame/FormMgr";
import SceneMgr from "../../UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../UIFrame/Struct";
import { UIWindow } from "../../UIFrame/UIForm";
import PlatformMgr from "../cocos-multi-platform/PlatformManager";

const { ccclass, property, menu } = cc._decorator;

@ccclass
// @menu("SidleBar/SidleBarBtn")
export default class SidleBarView extends UIWindow {

    @property(cc.Node)
    GotoSideBar: cc.Node = null;

    @property(cc.Node)
    ClaimGift: cc.Node = null;

    @property(cc.Sprite)
    imgBg: cc.Sprite = null;

    @property(ButtonPlus)
    btn_close: ButtonPlus = null;      // 关闭按钮

    @property(ButtonPlus)
    btn_rukou: ButtonPlus = null;      // 关闭按钮

    @property(ButtonPlus)
    btn_reward: ButtonPlus = null;      // 关闭按钮

    @property(cc.Node) //奖励
    awardRoot: cc.Node = null;

    @property(cc.Prefab) //奖励
    awardItem: cc.Prefab = null;



    // @property([cc.SpriteFrame])
    // gameicon: cc.SpriteFrame[] = [];

    // @property([cc.SpriteFrame])
    // gameUi: cc.SpriteFrame[] = [];

    // @property(cc.Sprite)
    // icon: cc.Sprite = null;

    // @property(cc.Sprite)
    // ui: cc.Sprite = null;

    // @property({ type: cc.Node, displayName: "流浪战车" })
    // node_llzc: cc.Node = null;

    // checkSceneSuccess: boolean = false;

    modalType = new ModalType(ModalOpacity.OpacityHalf, false);
    closeType: ECloseType = ECloseType.CloseAndDestory; // 关闭类型

    // LIFE-CYCLE CALLBACKS:

    protected onLoad(): void {
        // this.GotoSideBar.active = false;
        // this.ClaimGift.active = false;
    }

    public _preInit(params: any): Promise<void> {
        let imgPath = "texture/sidebar/img_dy"
        if (PlatformMgr.instance.isDouyin) {
            imgPath = "texture/sidebar/img_dy";
        } else if (PlatformMgr.instance.isBili) {
            imgPath = "texture/sidebar/img_bili";
        }
        this.loadRes(imgPath, cc.SpriteFrame, GameBundle.Bundle_commonRes).then((res: cc.SpriteFrame) => {
            if (this.imgBg)
                this.imgBg.spriteFrame = res;
        });
        return super._preInit(params);
    }


    public onInit(params: any): void {
        this.GotoSideBar.active = false;
        this.ClaimGift.active = false;

        this.btn_close.addClick(this.onBtnClicked, this);
        this.btn_rukou.addClick(this.onBtnClicked, this);
        this.btn_reward.addClick(this.onBtnClicked, this);
    }


    public onBtnClicked(evt: cc.Event.EventTouch): void {

        if (evt.target == this.btn_close.node) {
            this.closeSelf();
        }
        else if (evt.target == this.btn_rukou.node) {
            this.onRukouClicked();
        }
        else if (evt.target == this.btn_reward.node) {
            this.onRewardClicked();
        }

    }

    public onRukouClicked(): void {
        this.OnGotoSideBar();
    }

    public onRewardClicked(): void {
        // GameUserData.getInstance().addTicketAD(1);
        // this.closeSelf();
        this.OnClaimGift();
    }

    refursh() {
        if (PlatformMgr.instance.isDouyin) {
            // // 流浪战车
            // this.ui.spriteFrame = this.gameUi[0];
            //this.node_llzc.active = true;
            if (PlatformMgr.instance.enterScene() == "homepage_sidebar_card") {
                this.GotoSideBar.active = false;
                this.ClaimGift.active = true;
            }
            else {
                this.GotoSideBar.active = true;
                this.ClaimGift.active = false;
            }

            if (GameUserData.getInstance().sideBarReward > 0) {
                this.close();
            }

            this.initAward();
            // } else if (PlatformMgr.instance.isKS) {
            //     this.ui.spriteFrame = this.gameUi[0];
            //     PlatformMgr.instance.platform?.ks.checkCommonUse().then((result: boolean) => {
            //         if (result) {
            //             this.GotoSideBar.active = false;
            //             this.ClaimGift.active = true;
            //         } else {
            //             this.GotoSideBar.active = true;
            //             this.ClaimGift.active = false;
            //         }
            //         if (GameUserData.getInstance().haveSideBarGiftKuaiShou) {
            //             this.close();
            //         }
            //     })
        } else if (PlatformMgr.instance.isBili) {
            // this.ui.spriteFrame = this.gameUi[1];
            if (PlatformMgr.instance.enterScene() == "021036") {
                this.GotoSideBar.active = false;
                this.ClaimGift.active = true;
            }
            else {
                this.GotoSideBar.active = true;
                this.ClaimGift.active = false;
            }

            if (GameUserData.getInstance().sideBarReward > 0) {
                this.close();
            }
        } else {
            this.GotoSideBar.active = false;
            this.ClaimGift.active = true;
            if (GameUserData.getInstance().sideBarReward > 0) {
                this.close();
            }
        }
    }

    onDisable() {

    }

    OnGotoSideBar() {
        if (PlatformMgr.instance.isDouyin == true) {
            PlatformMgr.instance.navigateToScene();
            this.close();
        }
        // if (PlatformMgr.instance.isKS) {
        //     PlatformMgr.instance.addCommonUse(() => {
        //         this.GotoSideBar.active = false;
        //         this.ClaimGift.active = true;
        //     }, () => {
        //         GameHelp.getInstance().showToast("设置失败，请重试")
        //     }, this);
        // }

        if (PlatformMgr.instance.isBili) {
            PlatformMgr.instance.navigateToScene();
            this.close();
        }

    }

    // refreshBtn() {
    //     if (PlatformMgr.instance.isDouyin) {
    //         if (GameUserData.getInstance().sideBarReward > 0) {
    //             this.GotoSideBar.active = false;
    //             this.ClaimGift.active = false;
    //         }
    //     }
    // }

    OnClaimGift() {
        // let node = await UIMgr.getInstance().show(GameUIDef.getRewardUI);
        // let list = [{ itemID: 4, itemNum: 200 }];
        // node.getComponent(GetRewardUI).init(list);

        // if (PlatformMgr.instance.isDouyin == true) {
        //     GameUserData.getInstance().sideBarReward += 1;
        // }

        // if (PlatformMgr.instance.isKS == true) {
        //     GameUserData.getInstance().sideBarReward += 1;
        // }

        // if (PlatformMgr.instance.isBili == true) {
        //     GameUserData.getInstance().sideBarReward += 1;
        // }
        console.log("OnClaimGift");

        // GameUserData.getInstance().addTicketAD(1)
        GameUserData.getInstance().sideBarReward += 1;
        GameUserData.getInstance().sideBarReceiveNow = Date.now();
        let award = this.getNormalAward();
        this.playFlyAffect(award);

        // GlobalEventMgr.getInstance().emit(GlobalEvent.onSideBarGift);
        this.close();
    }


    getNormalAward(): ItemVo[] {
        let awardList = [];
        let cfg = ConfigMgr.getInstance().getById(32, KvData).val.split(",");
        for (let i = 0; i < cfg.length; i = i + 2) {
            let item = new ItemVo(parseInt(cfg[i]), parseInt(cfg[i + 1]));
            awardList.push(item);
        }
        return awardList;
    }
    initAward() {

        let normalAward = this.getNormalAward();
        this.awardRoot.children.forEach((item) => {
            item.active = false;
        })
        normalAward.forEach((vo, index) => {
            let item = this.awardRoot.children[index];
            if (!cc.isValid(item)) {
                item = cc.instantiate(this.awardItem);
                this.awardRoot.addChild(item);
            }
            item.active = true;
            item.scale = 1;
            item.getComponent(AwardItemNew).initItem(vo);

        })
    }



    playFlyAffect(award: ItemVo[]) {
        let idList = [1, 2, 3];
        let fpList = [];
        award.forEach((item, index) => {
            if (idList.indexOf(item.itemID) >= 0) {
                let itemNode = this.awardRoot.children[index];
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

    close() {
        // UIMgr.getInstance().hide(this.node);
        this.closeSelf();
    }
}
