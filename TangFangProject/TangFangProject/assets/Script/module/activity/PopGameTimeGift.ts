import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import GameControl from "../../Battle/GameControl";
import ConfigMgr from "../../config/ConfigMgr";
import { ItemBaseData, KvData, OnlineBounsData, PassData } from "../../config/DataDef";
import UIConfig from "../../config/UIConfig";
import GameActivityData from "../../Data/GameActivityData";
import GameGlobalData from "../../Data/GameGlobalData";
import GameSignData from "../../Data/GameSignData";
import GameUserData from "../../Data/GameUserData";
import UserItemsData, { ItemVo } from "../../Data/UserItemsData";
import LanguageMgr from "../../lang/LanguageMgr";
import GameHelp from "../../Mgr/GameHelp";
import { FlyViewParams, eFlyAnimType } from "../../UI/FlyViewUI";
import UISceneMain from "../../UI/UISceneMain";
import AwardItemNew from "./AwardItemNew";
import OnlineBounsItem from "./OnlineBounsItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PopGameTimeGift extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnGet: ButtonPlus = null;

    @property(ButtonPlus)
    btnGetAD: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "当前关卡" })
    protected lvLab: cc.Label = null;

    @property({ type: cc.ProgressBar, tooltip: "进度" })
    protected progressBar: cc.ProgressBar = null;

    @property({ type: cc.Label, tooltip: "巡逻时间" })
    protected descLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "计时时间" })
    protected timeLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "元宝效率" })
    protected yibaoLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "灵石效率" })
    protected lingshiLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "碎片效率" })
    protected suiPianLab: cc.Label = null;


    @property({ type: cc.Label, tooltip: "视频巡逻次数" })
    protected admobXL: cc.Label = null;
    @property({ type: cc.Label, tooltip: "体力巡逻次数" })
    protected physicXL: cc.Label = null;

    @property({ type: cc.Node, tooltip: "奖励root" })
    protected awardRoot1: cc.Node = null;
    @property({ type: cc.Node, tooltip: "广告奖励root2" })
    protected awardRoot2: cc.Node = null;

    @property({ type: cc.Node, tooltip: "没有奖励" })
    protected noAwardNode: cc.Node = null;

    @property(cc.Node)
    admobNode: cc.Node = null;
    @property(cc.Node)
    physicNode: cc.Node = null;
    @property(cc.Node)
    physicCostNode: cc.Node = null;
    @property(cc.Node)
    admobIconNode: cc.Node = null;
    @property(cc.Label)
    phyisCostXL: cc.Label = null;

    @property(cc.Prefab)
    awardItem: cc.Prefab = null;


    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onBtnClicked, this);

        this.btnGet.addClick(this.onBtnGet, this);

        this.btnGetAD.addClick(this.onBtnGetAD, this);
    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }

    maxTime

    awardBaseList: ItemVo[] = [];
    attrNormal: number = 1;
    attrYBAd: number = 1;
    attrLSAd: number = 1;
    //视频扫荡次数
    maxAdmobNum: number = 0;
    //免费体力扫荡次数
    maxPhysicNum: number = 0;


    public onShow(params: any): void {
        super.onShow(params);

        GameActivityData.getInstance().checkGiftGetNum();
        this.maxTime = parseInt(ConfigMgr.getInstance().getById(7, KvData).val);
        this.attrNormal = parseInt(ConfigMgr.getInstance().getById(6, KvData).val);
        this.maxAdmobNum = parseInt(ConfigMgr.getInstance().getById(5, KvData).val);
        this.maxPhysicNum = parseInt(ConfigMgr.getInstance().getById(78, KvData).val);
        this.attrYBAd = parseInt(ConfigMgr.getInstance().getById(4, KvData).val);
        this.attrLSAd = parseInt(ConfigMgr.getInstance().getById(4, KvData).val);
        this.initView();
        this.schedule(this.djs, 1);
        // FormMgr.open(UIConfig.ui_game3in1);
    }

    checkPhysicEngouh(): boolean {
        //体力扫荡次数还有剩余-判定体力是否够
        const curEnergy = GameUserData.getInstance().energy;
        //单倍使用体力
        let lv = GameUserData.getInstance().lastPassLv;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        const costEnergy = passVo.physicCost;
        if (curEnergy < costEnergy * this.attrLSAd) return false;
        return true;
    }

    initView() {
        let lv = GameUserData.getInstance().lastPassLv;
        this.lvLab.string = `第${lv}关`;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        this.descLab.string = `最长巡逻时间为${this.maxTime}小时，通过关卡越大，`
        this.yibaoLab.string = passVo.item1 + "/小时";
        this.lingshiLab.string = passVo.item2 + "/小时";
        this.suiPianLab.string = passVo.drop3Vi[1] + "/小时";
        this.admobXL.string = `${this.maxAdmobNum - GameActivityData.getInstance().gameGiftGetAdmobNum}/${this.maxAdmobNum}`;
        this.physicXL.string = `${this.maxPhysicNum - GameActivityData.getInstance().gameGiftGetPhysicNum}/${this.maxPhysicNum}`;
        this.djs();

        const usePhysicNum = GameActivityData.getInstance().gameGiftGetPhysicNum || 0;
        this.physicNode.active = usePhysicNum < this.maxPhysicNum;
        this.physicCostNode.active = usePhysicNum < this.maxPhysicNum;
        const useAdmobNum = GameActivityData.getInstance().gameGiftGetAdmobNum || 0;
        this.admobIconNode.active = (usePhysicNum >= this.maxPhysicNum) && (useAdmobNum < this.maxAdmobNum);
        this.admobNode.active = (usePhysicNum >= this.maxPhysicNum) && (useAdmobNum < this.maxAdmobNum);
        this.btnGetAD.interactable = !((usePhysicNum >= this.maxPhysicNum) && (useAdmobNum >= this.maxAdmobNum));
        const needEnergy = passVo.physicCost * this.attrLSAd;
        this.phyisCostXL.string = needEnergy + '';
    }


    djs() {
        let timeCha = (new Date().getTime() - GameActivityData.getInstance().gameGiftGetTime);//小时

        timeCha = Math.min(timeCha, this.maxTime * 60 * 60 * 1000);
        this.timeLab.string = Utils.getTimeFormatClock(Math.floor(timeCha / 1000));
        this.progressBar.progress = timeCha / (this.maxTime * 60 * 60 * 1000);

        this.btnGet.node.getChildByName("redDot").active = this.progressBar.progress >= 1;

        this.initAward();
    }

    initAward() {
        this.calaAward();
        let normalAward = this.getNormalAward();
        this.awardRoot1.active = normalAward.length > 0;
        this.noAwardNode.active = normalAward.length == 0;
        if (normalAward.length > 0) {
            this.awardRoot1.children.forEach((item) => {
                item.active = false;
            })
            normalAward.forEach((vo, index) => {
                let item = this.awardRoot1.children[index];
                if (!cc.isValid(item)) {
                    item = cc.instantiate(this.awardItem);
                    this.awardRoot1.addChild(item);
                }
                item.active = true;
                item.scale = 1;
                item.getComponent(AwardItemNew).initItem(vo);

            })
        }
        let adAward = this.getADAward();
        this.awardRoot2.children.forEach((item) => {
            item.active = false;
        })
        adAward.forEach((vo, index) => {
            let item = this.awardRoot2.children[index];
            if (!cc.isValid(item)) {
                item = cc.instantiate(this.awardItem);
                this.awardRoot2.addChild(item);
            }
            item.active = true;
            item.scale = 1;
            item.getComponent(AwardItemNew).initItem(vo);

        })

    }

    calaAward() {
        this.awardBaseList = GameActivityData.getInstance().getGameTimeAward();//基础奖励
    }

    getNormalAward() {
        let awardList = [];
        for (let i = 0; i < this.awardBaseList.length; i++) {
            let vo = this.awardBaseList[i];
            let num = Math.floor(vo.num * this.attrNormal)
            if (num > 0) {
                let item = new ItemVo(vo.itemID, num);
                awardList.push(item);
            }


        }
        return awardList;
    }

    getADAward() {

        let awardList = [];
        let item1 = new ItemVo(1, 0);
        let item2 = new ItemVo(2, 0);

        let timeCha = this.maxTime;//小时
        let lv = GameUserData.getInstance().lastPassLv;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        let ybNum = Math.floor(timeCha * this.attrYBAd * passVo.item1);
        let lsNum = Math.floor(timeCha * this.attrLSAd * passVo.item2);
        let item3 = new ItemVo(passVo.drop3Vi[0], 0);
        let spNum = Math.floor(timeCha * this.attrLSAd * passVo.drop3Vi[1]);
        item1.num = ybNum;
        item2.num = lsNum;
        item3.num = spNum;
        awardList.push(item1);
        awardList.push(item2);
        awardList.push(item3);
        return awardList;

    }

    getRealNormalAward(): ItemVo[] {
        let awardList = [];

        let lv = GameUserData.getInstance().lastPassLv;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        let item1 = new ItemVo(1, 0);
        let item2 = new ItemVo(2, 0);

        let timeCha = (new Date().getTime() - GameActivityData.getInstance().gameGiftGetTime) / 1000 / 3600;//小时
        let maxTime = parseInt(ConfigMgr.getInstance().getById(7, KvData).val);
        timeCha = Math.min(timeCha, maxTime);

        let ybNum = Math.floor(timeCha * passVo.item1 * this.attrNormal);
        let lsNum = Math.floor(timeCha * passVo.item2 * this.attrNormal);
        item1.num = ybNum;
        item2.num = lsNum;
        if (ybNum > 0)
            awardList.push(item1);
        if (lsNum > 0)
            awardList.push(item2);


        let drawNum = Math.floor(timeCha * passVo.drop3[1] * this.attrNormal);
        let award = GameHelp.getInstance().getDataList(passVo.drop3[0], drawNum)
        awardList = awardList.concat(award);
        return GameHelp.getInstance().arrangeAwardList(awardList);
    }

    onBtnGet() {
        let normalAward = this.getRealNormalAward();
        if (normalAward.length > 0) {
            FormMgr.open(UIConfig.ui_PopGetReward, { rewards: normalAward })
            GameActivityData.getInstance().gameGiftGetTime = new Date().getTime();
            this.initView();

        } else {
            GameHelp.getInstance().showToast("现在还没有累积离线奖励");
        }
    }

    onBtnGetAD() {
        if (GameActivityData.getInstance().gameGiftGetPhysicNum < this.maxPhysicNum) {
            if (!this.checkPhysicEngouh()) {
                GameHelp.getInstance().showToast(LanguageMgr.getInstance().getLang("energy_notEnough"));
                FormMgr.open(UIConfig.ui_popBuyEnergy);
                return;
            } else {
                let passVo = ConfigMgr.getInstance().getById(GameUserData.getInstance().lastPassLv, PassData);
                const needEnergy = passVo.physicCost * this.attrLSAd;
                GameUserData.getInstance().changeEnergy(-needEnergy);
                this.onSuccessFunc(true, false);
                GameUserData.getInstance().emitItem(nameof<GameUserData>().breakthrough);
            }
            return;
        }

        if (GameActivityData.getInstance().gameGiftGetAdmobNum >= this.maxAdmobNum) {
            GameHelp.getInstance().showToast("今日视频快速扫荡次数已用完");
            return;
        }
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onSuccessFunc(b, true);
        }, this, { scene: "buttom_title3" })
    }

    onSuccessFunc(isSuc: boolean = false, playAdmob: boolean = false) {
        if (!isSuc) {
            return;
        }

        let adAward = this.getRealADAward();

        FormMgr.open(UIConfig.ui_PopGetReward, { rewards: adAward })
        //  this.playFlyAffect(adAward, this.awardRoot2);

        if (playAdmob) {
            GameActivityData.getInstance().gameGiftGetAdmobTimeLast = new Date().getTime();
            GameActivityData.getInstance().gameGiftGetAdmobNum++;
        } else {
            GameActivityData.getInstance().gameGiftGetPhysicTimeLast = new Date().getTime();
            GameActivityData.getInstance().gameGiftGetPhysicNum++;
        }

        this.initView();


    }

    getRealADAward() {
        let awardList = [];
        let item1 = new ItemVo(1, 0);
        let item2 = new ItemVo(2, 0);
        let timeCha = this.maxTime;//小时
        let lv = GameUserData.getInstance().lastPassLv;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        let ybNum = Math.floor(timeCha * this.attrYBAd * passVo.item1);
        let lsNum = Math.floor(timeCha * this.attrLSAd * passVo.item2);
        item1.num = ybNum;
        item2.num = lsNum;
        awardList.push(item1);
        awardList.push(item2);


        let drawNum = Math.floor(timeCha * this.attrLSAd * passVo.drop3[1]);
        let award = GameHelp.getInstance().getDataList(passVo.drop3[0], drawNum)
        awardList = awardList.concat(award);
        return GameHelp.getInstance().arrangeAwardList(awardList);
    }


    // playFlyAffect(award: ItemVo[], itemRoot: cc.Node) {
    //     let idList = [1, 2, 3];
    //     let fpList = [];
    //     award.forEach((item, index) => {
    //         if (idList.indexOf(item.itemID) >= 0) {
    //             let itemNode = itemRoot.children[index];
    //             fpList.push(this.addPropEffect(itemNode, item.itemID, item.num));
    //         } else {
    //             UserItemsData.getInstance().pushItem(item.itemID, item.num);
    //         }


    //     })
    //     if (fpList.length > 0) {
    //         //  console.log(fpList);
    //         FormMgr.open(UIConfig.ui_flyView, fpList, { quick: true });
    //     }
    // }

    // // 飞银币动画
    // public addPropEffect(node1: cc.Node, itemId, itemNum) {
    //     let main = SceneMgr.getCurrScene() as UISceneMain;
    //     if (!main.btn_equip || !cc.isValid(node1)) {
    //         return;
    //     }
    //     let sIcon = Utils.getWidget("icon", node1);
    //     let startPos = sIcon.parent.convertToWorldSpaceAR(sIcon.position);
    //     let eIcon: cc.Node
    //     switch (itemId) {
    //         case 1://元宝
    //             eIcon = main.btn_yuanbao.node.getChildByName('icon');
    //             break;
    //         case 2://灵石
    //             eIcon = main.btn_lingshi.node.getChildByName('icon');
    //             break;

    //         case 3://免广
    //             eIcon = main.btn_adTiket.node.getChildByName('icon');
    //             break;


    //     }
    //     let endPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);

    //     let node = cc.instantiate(sIcon);

    //     let fp: FlyViewParams = {
    //         startWPos: startPos,
    //         endWPos: endPos,
    //         target: node,
    //         duration: 0.4,
    //         scale: [sIcon.scale, 0.6],
    //         blockInput: false, // 阻挡输入
    //         callBack: () => {
    //             UserItemsData.getInstance().pushItem(itemId, itemNum);

    //             let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
    //             if (itemData.type == 0) {
    //                 let kvId = (itemData.typeArgs == 1) ? 18 : 19;
    //                 let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
    //                 SoundMgr.getInstance().playSound(soundName);
    //             }
    //         },  // 回调
    //         animType: eFlyAnimType.Line,
    //         nodeNum: Math.min(8, itemNum)
    //     }
    //     return fp;
    // }







    // update (dt) {}
}

