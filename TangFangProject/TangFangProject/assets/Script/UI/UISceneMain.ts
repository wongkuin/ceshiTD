import { nameof } from "../../TRFrameWork/cocos-module/component/Watch";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import UIBase from "../../TRFrameWork/UIFrame/UIBase";
import { UIScreen } from "../../TRFrameWork/UIFrame/UIForm";
import UISceneMain_Auto from "../AutoScripts/UISceneMain_Auto";
import GameControl from "../Battle/GameControl";
import ConfigMgr from "../config/ConfigMgr";
import { ArtifactGiftPackData, ItemBaseData, KvData } from "../config/DataDef";
import { TurretInfo } from "../config/DataInfo";
import { ETurretDir, GameBundle } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameActivityData from "../Data/GameActivityData";
import GameBossInstanceData from "../Data/GameBossInstanceData";
import GameRelicData from "../Data/GameRelicData";
import GameStoreData from "../Data/GameStoreData";
import GameUserData from "../Data/GameUserData";
import GameWapenData from "../Data/GameWapenData";
import UserItemsData, { ItemVo } from "../Data/UserItemsData";
import BattleGuideLayer from "../Guide/BattleGuideLayer";
import GameHelp from "../Mgr/GameHelp";
import MainPageBossInstance from "../module/bossInstance/MainPageBossInstance";
//import MainPageRelic from "../module/relic/MainPageRelic";
import MainPageTalent from "../module/Talent/MainPageTalent";
import MainPageWapen from "../module/wapen/MainPageWapen";
import { FlyViewParams, eFlyAnimType } from "./FlyViewUI";

import MainPagePass from "./MainPagePass";
import MainPageStore from "./MainPageStore";
import ToastTip from "./ToastTip";



const { ccclass, property } = cc._decorator;


@ccclass
export default class UISceneMain extends UIScreen {
    screenName: string = "UISceneMain";

    @property(UISceneMain_Auto)
    auto: UISceneMain_Auto = null;

    @property(cc.Node)
    mainPageRoot: cc.Node = null;

    @property(cc.Node)
    move_bg: cc.Node = null;

    get topRoot(): cc.Node {
        return this.auto.top;
    }

    get btn_yuanbao(): ButtonPlus {
        return this.auto.jinbi;
    } // 元宝


    get btn_lingshi(): ButtonPlus {
        return this.auto.linshi;
    };  // 灵石

    get btn_adTiket(): ButtonPlus {
        return this.auto.adTicket;
    }   // 广告券

    get btn_breakthrough(): ButtonPlus {
        return this.auto.breakthrough;
    }   // 广告券


    // 装备
    get btn_equip(): ButtonPlus {
        return this.auto.btn_equip;
    }
    //商店
    get btn_store(): ButtonPlus {
        return this.auto.btn_Store;
    }

    // 战斗
    get btn_pass(): ButtonPlus {
        return this.auto.btn_pass;
    }

    // 天赋
    get btn_talent(): ButtonPlus {
        return this.auto.btn_talent;
    }

    get btn_relic(): ButtonPlus {
        return this.auto.btn_relic;
    }

    // get btn_kong(): ButtonPlus {
    //     return this.auto.btn_kong;
    // }

    protected txt_lingshi: cc.Label = null;
    protected txt_yuanbao: cc.Label = null;
    protected txt_breakthrough: cc.Label = null;
    protected txt_fertilizer: cc.Label = null;

    //protected txt_cdWood: cc.Label = null; //体力cd时间

    protected curTab: cc.Node = null;

    private offsetTime: number = 0;
    protected _mpTalent: MainPageTalent = null;
    protected _mpStore: MainPageStore = null;
    protected _mpPass: MainPagePass = null;
    // boss副本
    protected _mpBossInstance: MainPageBossInstance = null;
    protected _mpWapen: MainPageWapen = null;
    // protected _mpChallenge: MainPageChallenge = null;

    curPage: UIBase = null;

    curSortIndex = 3;
    olderView: UIBase = null;

    //完成切换动画
    finishAni = true;

    // protected _bWapent: BattleWapentUI = null; // 车辆

    onLoad() {
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
    }

    start() {
    }

    public async load(params: any): Promise<string> {
        if (params?.battleScene == "WBBattle") {
            FormMgr.open(UIConfig.ui_PopSnowBossInfo, {}, { quick: true });
        }

        await this.loadCorePages();
        // 延迟加载非核心页面
        this.loadNonCorePagesAsync();

        await this.initWapent();

        return super.load(params);
    }

    /**
     * 加载核心页面（立即显示的页面）
     */
    public async loadCorePages(): Promise<void> {
        console.log("开始加载核心页面...");
        await this.loadPage(UIConfig.Main_PagePass, (value: UIBase) => {
            this._mpPass = value as MainPagePass;
            this._mpPass && (this._mpPass.node.parent = this.mainPageRoot);
            this._mpPass["sortIndex"] = 3;
        });
        await this.loadPage(UIConfig.Main_PageWapen, (value: UIBase) => {
            this._mpWapen = value as MainPageWapen;
            this._mpWapen && (this._mpWapen.node.parent = this.mainPageRoot);
            this._mpWapen["sortIndex"] = 2;
        });
        await this.loadPage(UIConfig.Main_PageStore, (value: UIBase) => {
            this._mpStore = value as MainPageStore;
            this._mpStore && (this._mpStore.node.parent = this.mainPageRoot);
            this._mpStore["sortIndex"] = 1;
        });

        console.log("核心页面加载完成");
    }

    /**
     * 异步加载非核心页面（后台加载）
     */
    private async loadNonCorePagesAsync(): Promise<void> {
        console.log("开始后台加载非核心页面...");

        // 延迟一段时间，确保核心页面已经显示
        await new Promise(resolve => setTimeout(resolve, 30));

        let nonCorePages = [
            {
                config: UIConfig.Main_PageTalent, callback: (value: UIBase) => {
                    this._mpTalent = value as MainPageTalent;
                    this._mpTalent && (this._mpTalent.node.parent = this.mainPageRoot);
                    this._mpTalent["sortIndex"] = 4;
                }
            },
            {
                config: UIConfig.Main_PageBossInstance, callback: (value: UIBase) => {
                    this._mpBossInstance = value as MainPageBossInstance;
                    this._mpBossInstance && (this._mpBossInstance.node.parent = this.mainPageRoot);
                    this._mpBossInstance["sortIndex"] = 5;
                }
            }
        ];

        for (const page of nonCorePages) {
            try {
                this.loadPage(page.config, page.callback);
            } catch (error) {
                console.error(`加载页面失败: ${page.config}`, error);
            }
        }

        console.log("非核心页面加载完成");
    }

    /**
     * 加载单个页面的辅助方法
     */
    private async loadPage(config: any, callback: (value: UIBase) => void): Promise<void> {
        try {
            let value = await FormMgr.load(config);
            callback(value);
        } catch (error) {
            console.error(`加载页面失败: ${config}`, error);
        }
    }

    public onInit(params: any): void {
        super.onInit(params);



        this.txt_yuanbao = this.btn_yuanbao.node.getChildByName("txt").getComponent(cc.Label);
        this.txt_lingshi = this.btn_lingshi.node.getChildByName("txt").getComponent(cc.Label);
        this.txt_fertilizer = this.btn_adTiket.node.getChildByName("txt").getComponent(cc.Label);
        this.txt_breakthrough = this.btn_breakthrough.node.getChildByName("txt").getComponent(cc.Label);

        // 体力倒计时
        //this.refrushCDWood();
        this.rigiestEvent(); //注册事件
        this.playBgMusic();

        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("游戏进入前台");
            this.checkOfflineRevenue();
            //this.doSomeThing();
        }, this);

        this.checkOfflineRevenue();

        // GlobalEventMgr.getInstance().on(GlobalEventID.refrush_Wapent_turret, this.refrushWapentTurret, this);
        // GlobalEventMgr.getInstance().on(GlobalEventID.up_Wapent_view, this.upWapentView, this);

    }


    playBgMusic() {
        if (!cc.isValid(this)) { return; }
        let sId = CommonUtils.randomIntClosedRange(3, 4); // bgList.length
        let sName = "bgm" + sId;
        let self = this;
        SoundMgr.getInstance().playMusic(sName, false, () => {
            cc.isValid(self) && self.scheduleOnce(self.playBgMusic, 0.5);
        });
    }


    playFlyAffect(award: ItemVo[]) {
        let idList = [1, 2, 3, 4, 169];
        let fpList = [];

        award.forEach((item, index) => {
            let itemData = ConfigMgr.getInstance().getById(item.itemID, ItemBaseData);
            if (idList.indexOf(item.itemID) >= 0 || itemData.type == 5) {
                UserItemsData.getInstance().spliceItem(item.itemID, item.num);//提前加了，先减
                let fp = this.addPropEffect(item.itemID, item.num);
                fpList.push(fp);
                if (index == award.length - 1 && fpList.length > 0) {
                    console.warn("飞道具，fplist:", fpList);
                    this.scheduleOnce(() => {
                        FormMgr.open(UIConfig.ui_flyView, fpList, { quick: true });
                    });
                }
            }


        })
    }

    // 飞银币动画
    public addPropEffect(itemId, itemNum) {
        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.btn_equip) {
            return;
        }

        let startPos = cc.v3(cc.winSize.width / 2 + Random.range(-15, 15), cc.winSize.height / 2 + Random.range(-15, 15), 0);
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
            case 169://突破丹
                eIcon = main.btn_breakthrough.node.getChildByName('icon');
                break;
            default:
                eIcon = main.btn_equip.node.getChildByName('icon');
                break;
        }
        let endPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);
        //  let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
        let node = cc.instantiate(eIcon);
        // await this.loadSpirteFrame(`ItemIcon/${itemData.img}`, node.getComponent(cc.Sprite), GameBundle.Bundle_common).then(() => {
        // });
        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: node,
            duration: 0.5,
            scale: [0.8, 0.9],
            blockInput: false, // 阻挡输入
            itemId: itemId,
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

    async checkOfflineRevenue() {

    }



    public onShow(params: any): void {
        super.onShow(params);

        this.refrushUI();
        this.showTabPass();
        this.refreshAllRedDot();
    }



    protected rigiestEvent() {
        // this.btnStart.addClick(this.onBtnStart, this);

        this.btn_equip.addClick(this.onBtnClicked, this);
        this.btn_pass.addClick(this.onBtnClicked, this);
        this.btn_talent.addClick(this.onBtnClicked, this);
        this.btn_relic.addClick(this.onBtnClicked, this);
        this.btn_store.addClick(this.onBtnClicked, this);

        this.btn_yuanbao.addClick(this.onBtnClicked, this);
        this.btn_adTiket.addClick(this.onBtnClicked, this);
        this.btn_lingshi.addClick(this.onBtnClicked, this);
        this.btn_breakthrough.addClick(this.onBtnClicked, this);

        this.btn_yuanbao.node.getChildByName("jiahao").getComponent(ButtonPlus).addClick(this.onBtnClicked, this);
        this.btn_adTiket.node.getChildByName("jiahao").getComponent(ButtonPlus).addClick(this.onBtnClicked, this);
        this.btn_lingshi.node.getChildByName("jiahao").getComponent(ButtonPlus).addClick(this.onBtnClicked, this);
        this.btn_breakthrough.node.getChildByName("jiahao").getComponent(ButtonPlus).addClick(this.onBtnClicked, this);

        GameUserData.getInstance().on(this.refrushLingShi, this, nameof<GameUserData>().lingshi);
        GameUserData.getInstance().on(this.refrushYuanbao, this, nameof<GameUserData>().yuanbao);
        GameUserData.getInstance().on(this.refrushTicketAD, this, nameof<GameUserData>().ticketAD);
        GameUserData.getInstance().on(this.refrushBreakthrough, this, nameof<GameUserData>().breakthrough);
        GameWapenData.getInstance().on(this.setDirtyFlag, this);
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().yuanbao);
        // GameCannonData.getInstance().on(this.setDirtyFlag, this)
        // GameVehicleData.getInstance().on(this.setDirtyFlag, this, nameof<GameVehicleData>().dirtyFlag)
        GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().lingshi);

        GameStoreData.getInstance().on(this.setDirtyFlag, this);
        GameBossInstanceData.getInstance().on(this.setDirtyFlag, this);
        // GameUserData.getInstance().on(this.setDirtyFlag, this, nameof<GameUserData>().ticketAD);
        GameRelicData.getInstance().on(this.setDirtyFlag, this);



        this.node.on("change_mainbg", this.onChangeMainBg, this);
    }

    dirtyFlag = false;
    _dt = 0;
    setDirtyFlag() {
        this.dirtyFlag = true;
    }

    protected update(dt: number): void {
        this._dt += dt;
        if (this._dt >= 1 / 2 && this.dirtyFlag) {
            this._dt = 0;
            this.dirtyFlag = false;
            this.refreshAllRedDot();
        }
    }


    protected onBtnClicked(evt: cc.Event.EventTouch) {
        if (evt.target == this.curTab) return;
        if (!this.finishAni) {
            return;
        }
        if (evt.target == this.btn_equip.node) {
            this.topRoot.active = true;
            this.showTabWapen();
        }

        else if (evt.target == this.btn_pass.node) {
            this.topRoot.active = true;
            this.showTabPass();
        }
        else if (evt.target == this.btn_talent.node) {
            if (GameUserData.getInstance().lastPassLv <= 5) {
                GameHelp.getInstance().showToast(`通过第五关之后开启`);
                return;
            }
            this.topRoot.active = true;
            this.showTabTalent();
        } else if (evt.target == this.btn_relic.node) {
            this.topRoot.active = true;
            if (GameUserData.getInstance().lastPassLv <= 8) {
                GameHelp.getInstance().showToast(`通过第八关之后开启`);
                return;
            }
            this.showTabRelic();
        } else if (evt.target == this.btn_store.node) {
            this.topRoot.active = true;
            console.log("btn_store");
            this.showTabStore();
        }
        else if (evt.target == this.btn_yuanbao.node || evt.target == this.btn_yuanbao.node.getChildByName("jiahao")) {

            this.showTabStore();
        } else if (evt.target == this.btn_adTiket.node || evt.target == this.btn_adTiket.node.getChildByName("jiahao")) {

            this.showTabStore();
        }
        else if (evt.target == this.btn_lingshi.node || evt.target == this.btn_lingshi.node.getChildByName("jiahao")) {

            this.showTabStore();
            //FormMgr.open(UIConfig.ui_PopGetMoneyByAD, { type: 2 });
        } else if (evt.target == this.btn_breakthrough.node || evt.target == this.btn_breakthrough.node.getChildByName("jiahao")) {

            FormMgr.open(UIConfig.ui_PopLuckDraw, null, { quick: true });
            //this.showTabRelic();
        }
    }

    protected upWapentView() {
        this.node.getChildByName("cRoot").removeAllChildren();
        this.initWapent(false);
    }

    protected async initWapent(enterAnim: boolean = true) {
    }

    async refrushWapentTurret() {
    }


    protected createTurretInfo(tid: number, dir: ETurretDir, idx: number): TurretInfo {

        return null;
    }

    public async initTurret() {

    }



    protected hasEnterWapent() {
        console.log("hasEnterWapent");
    }

    public clickTab(root: cc.Node, isClick: boolean = false) {
        if (!root) return;
        let check = root.getChildByName("check");
        let icon = root.getChildByName('icon');
        check && (check.active = isClick);
        icon && (icon.active = !isClick);
    }

    // 显示载具
    public showTabWapen(pageType = 1) {
        if (this.curTab == this.btn_equip.node) return;
        this.clickTab(this.curTab);
        this.curTab = this.btn_equip.node;
        this.clickTab(this.curTab, true);
        this.moveBg(this.btn_equip.node.position);
        if (this.curPage) {
            this.olderView = this.curPage;
            this.finishAni = false;
            //this.curPage.closeSelf();
        }
        this.curPage = this._mpWapen;
        FormMgr.open(UIConfig.Main_PageWapen, { pageType: pageType });
        this.checkConViertAni();

    }

    // 果蔬
    public showTabTalent() {
        if (this.curTab == this.btn_talent.node) return;
        this.clickTab(this.curTab);
        this.curTab = this.btn_talent.node;
        this.clickTab(this.curTab, true);
        this.moveBg(this.btn_talent.node.position);
        if (this.curPage) {
            this.olderView = this.curPage;
            this.finishAni = false;
            // this.curPage.closeSelf();
        }
        this.curPage = this._mpTalent;
        FormMgr.open(UIConfig.Main_PageTalent);
        this.checkConViertAni();
    }


    // 果蔬
    public showTabStore() {
        if (this.curTab == this.btn_store.node) return;
        this.clickTab(this.curTab);
        this.curTab = this.btn_store.node;
        this.clickTab(this.curTab, true);
        this.moveBg(this.btn_store.node.position);
        if (this.curPage) {
            this.olderView = this.curPage;
            this.finishAni = false;
            // this.curPage.closeSelf();
        }
        this.curPage = this._mpStore;
        FormMgr.open(UIConfig.Main_PageStore);
        this.checkConViertAni();
    }

    showTabRelic() {
        if (this.curTab == this.btn_relic.node) return;
        this.clickTab(this.curTab);
        this.curTab = this.btn_relic.node;
        this.clickTab(this.curTab, true);
        this.moveBg(this.btn_relic.node.position);
        if (this.curPage) {
            this.olderView = this.curPage;
            this.finishAni = false;
            // this.curPage.closeSelf();
        }
        this.curPage = this._mpBossInstance;
        FormMgr.open(UIConfig.Main_PageBossInstance);
        this.checkConViertAni();
    }

    // 关卡
    showTabPass(direction?) {
        if (this.curTab == this.btn_pass.node) return;
        this.clickTab(this.curTab);
        this.curTab = this.btn_pass.node;
        this.clickTab(this.curTab, true);
        this.moveBg(this.btn_pass.node.position);

        if (this.curPage) {
            this.olderView = this.curPage;
            this.finishAni = false;
            //this.curPage.closeSelf();
        }
        this.curPage = this._mpPass;
        FormMgr.open(UIConfig.Main_PagePass);
        this.checkConViertAni();

        // this.auto.btn_talent.interactable = this.talentOpen();
        // this.auto.btn_relic.interactable = this.activtyOpen();

        const talentMask = this.auto.btn_talent.node.getChildByName('mask');
        const talentSuo = this.auto.btn_talent.node.getChildByName('suo');
        talentMask && (talentMask.active = !this.talentOpen());
        talentSuo && (talentSuo.active = !this.talentOpen());

        const actMask = this.auto.btn_relic.node.getChildByName('mask');
        const actSuo = this.auto.btn_relic.node.getChildByName('suo');
        actMask && (actMask.active = !this.activtyOpen());
        actSuo && (actSuo.active = !this.activtyOpen());
    }

    checkConViertAni() {
        let direction = null;
        if (this.olderView) {
            direction = this.curPage["sortIndex"] - this.olderView["sortIndex"] || 0;
            // this.scheduleOnce(() => {
            this.playConvertAnimation(direction, this.olderView.node, this.curPage.node)
            // })
        }

    }


    playConvertAnimation(direction, olderView, NewView) {
        if (direction == 0) {
            return;
        }
        this.getTween(direction, olderView, false).start();
        this.getTween(direction, NewView, true).start();

    }


    protected easingAni = "sineOut";


    protected getTween(direction: number, targetNode: cc.Node, isPopIn: boolean): cc.Tween<cc.Node> {

        let props: { x: number } = null;

        let targetX = 0;
        if (isPopIn) {

            let widget = targetNode.getComponent(cc.Widget);
            if (widget) {
                widget.updateAlignment();
                widget.enabled = false;
            }

            targetX = targetNode.x;


            if (direction < 0) {
                targetNode.x = -cc.winSize.width;
            } else if (direction > 0) {
                targetNode.x = cc.winSize.width;
            }
        } else {
            let widget = targetNode.getComponent(cc.Widget);
            if (widget) widget.enabled = false;

            targetX = targetNode.x;
            if (direction < 0) {
                targetX = cc.winSize.width;
            } else if (direction > 0) {
                targetX = -cc.winSize.width;
            }
        }
        props = { x: targetX };

        return cc.tween(targetNode).delay(0).to(0.35, props, { easing: this.easingAni }).call(() => {
            const widget = targetNode.getComponent(cc.Widget);
            if (widget && isPopIn) {
                widget.enabled = true;
                widget.updateAlignment();
            }

            if (!isPopIn) {
                targetNode.getComponent(UIBase).closeSelf();
            } else {
                this.finishAni = true;
            }

        });
    }


    protected refrushUI() {
        this.refrushYuanbao();
        this.refrushLingShi();
        this.refrushTicketAD();
        this.refrushBreakthrough();
    }

    protected refrushYuanbao() {
        let yuanbao = GameUserData.getInstance().yuanbao;
        this.txt_yuanbao.string = CommonUtils.formatNumber(yuanbao);
    }

    protected refrushTicketAD() {
        let fertilizer = GameUserData.getInstance().ticketAD;
        this.txt_fertilizer.string = CommonUtils.formatNumber(fertilizer);
    }

    protected refrushLingShi() {
        let lingshi = GameUserData.getInstance().lingshi;
        this.txt_lingshi.string = `${CommonUtils.formatNumber(lingshi)}`;  // CommonUtils.formatNumber(wood);
    }
    protected refrushBreakthrough() {
        // let breakthrough = GameUserData.getInstance().breakthrough;
        let enrgy = GameUserData.getInstance().energy;
        this.txt_breakthrough.string = `${enrgy}`;  // CommonUtils.formatNumber(wood);
    }


    //移动底部图片
    protected moveBg(endPos: cc.Vec3) {
        cc.Tween.stopAllByTarget(this.move_bg);
        cc.tween(this.move_bg).to(0.18, { position: cc.v3(endPos.x, endPos.y) }).start();
    }

    public onAfterHide(params: any): void {

        this._mpPass && (this._mpPass.closeSelf({ del: true }))
        this._mpTalent && (this._mpTalent.closeSelf({ del: true }))
        this._mpBossInstance && (this._mpBossInstance.closeSelf({ del: true }))
        this._mpWapen && (this._mpWapen.closeSelf({ del: true }))
        this._mpStore && (this._mpStore.closeSelf({ del: true }))
        super.onAfterHide(params);
        SoundMgr.getInstance().stopMusic();
    }

    public onAfterShow(params: any): void {
        if (params?.bouns) {
            this.scheduleOnce(() => {
                this.playFlyAffect(params?.bouns);
            }, 0.3)

        }

        // if (params?.isNewLv) {//通关新章节
        //     if (GameActivityData.getInstance().divineWeaponGiftGetNum < 3) {
        //         let id = GameActivityData.getInstance().divineWeaponGiftGetNum + 1;
        //         let unlockLv = ConfigMgr.getInstance().getById(id, ArtifactGiftPackData).unlock;
        //         if (GameUserData.getInstance().lastPassLv - 1 == unlockLv) {
        //             FormMgr.open(UIConfig.ui_PopDivineWeaponGift);
        //         }

        //     }


        // }
    }

    protected onChangeMainBg(evt: cc.Event.EventCustom) {
    }

    refreshAllRedDot() {
        this.refreshWapenRedDot();
        this.refreshBossInstanceRedDot();
        this.refreshTalentRedDot();
        this.refreshStoreRedDot();
    }

    refreshWapenRedDot() {
        let tips2 = this.btn_equip.node.getChildByName("tips2");
        let redDot = this.btn_equip.node.getChildByName("tishi");
        if (GameWapenData.getInstance().fightList.length < GameUserData.getInstance().curSlotNum) {

            redDot.active = false;

            tips2.active = true;
            return;
        }
        tips2.active = false;
        redDot.active = GameWapenData.getInstance().checkAllRedDot();
    }

    refreshTalentRedDot() {
        let redDot = this.btn_talent.node.getChildByName("tishi");
        redDot.active = this.talentOpen() && (GameUserData.getInstance().checkTalentRedDot() || GameRelicData.getInstance().checkAllRedDot());
    }

    refreshStoreRedDot() {


        let redDot = this.btn_store.node.getChildByName("tishi");
        redDot.active = GameStoreData.getInstance().checkRedDot();
    }

    refreshBossInstanceRedDot() {
        let redDot = this.btn_relic.node.getChildByName("tishi");
        redDot.active = this.activtyOpen() && GameBossInstanceData.getInstance().checkSnowRedDot();
    }

    talentOpen() {
        return GameUserData.getInstance().lastPassLv > 5;
    }

    activtyOpen() {
        return GameUserData.getInstance().lastPassLv > 8;
    }
}
