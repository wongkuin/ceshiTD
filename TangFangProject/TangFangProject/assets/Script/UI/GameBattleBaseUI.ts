import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType } from "../../TRFrameWork/UIFrame/Struct";
import { UIFixed } from "../../TRFrameWork/UIFrame/UIForm";
import BattleCharUI from "../Battle/BattleCharUI";
import GameControl from "../Battle/GameControl";
import GameResLoad from "../Battle/GameResLoad";
import PassiveSkillMgr from "../Battle/PassiveSkillMgr";
import TurretBaseUI from "../Battle/TurretBaseUI";
import TurretMoveUI from "../Battle/TurretMoveUI";
import WapenItemUI from "../Battle/WapenItemUI";
import { PackageLineDraw } from "../BattlePackage/PackageLineDraw";
import ConfigMgr from "../config/ConfigMgr";
import { ActSkillData, ItemBaseData, MonsterData, PassData, WaveTimesData } from "../config/DataDef";
import CharHeroInfo, { MonsterInfo, TurretInfo, WaveInfo } from "../config/DataInfo";
import { GameBundle, GameItemType } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameDrawHelp from "../Data/GameDrawHelp";
import GameGlobalData from "../Data/GameGlobalData";
import GameUserData from "../Data/GameUserData";
import { ItemVo } from "../Data/UserItemsData";
import LanguageMgr from "../lang/LanguageMgr";
import GameHelp from "../Mgr/GameHelp";
import { eFlyAnimType, FlyViewParams } from "./FlyViewUI";
import UISceneMain from "./UISceneMain";


const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class GameBattleBaseUI extends UIFixed {

    closeType = ECloseType.CloseAndDestory;

    autoView

    abstract moveLine(): cc.Node;// 移动线

    abstract right(): cc.Node // 右侧

    abstract topLeft(): cc.Node;// 左上角

    abstract top(): cc.Node;

    abstract centerRoot(): cc.Node;

    abstract btn_pause(): ButtonPlus; // 暂停

    abstract btn_allDrop(): ButtonPlus; //累计奖励

    abstract btn_speedx2(): ButtonPlus;// 2倍速

    abstract wapen_list(): cc.Node; // 武器列表

    abstract DelUI(): cc.Node;// 删除按钮

    abstract btn_draw(): ButtonPlus;// 抽卡

    abstract btn_fight(): ButtonPlus;

    abstract btn_arrow(): ButtonPlus;
    abstract layout_mst(): cc.Layout;
    abstract lab_show(): cc.Label;
    abstract btn_full_hp(): ButtonPlus;

    abstract btn_videoCoin(): ButtonPlus;

    abstract btn_Skill(): ButtonPlus;

    abstract btn_getAllWapen(): ButtonPlus;

    abstract skillDjsNode(): cc.Node; // 技能倒计时

    abstract txt_draw_price(): cc.Label;

    abstract waveTips(): cc.Node;// 波次提示

    abstract shopMain(): cc.Node;// 商店

    abstract moveRoot(): cc.Node;// 移动根节点

    abstract txt_videoWapenTips(): cc.RichText;


    @property(cc.Prefab)
    icon_silver: cc.Prefab = null;

    @property(cc.Prefab)
    wapenItemPrefab: cc.Prefab = null;

    // private _iconReliftBuff: cc.Node = null; // 重生图标

    // protected tutorialUI: UIToast = null; // 教程UI
    // protected _tutoial2Map: boolean = false;
    // protected _curWaveInfo: WaveInfo = null; // 当前波次信息

    protected wapenList: WapenItemUI[] = []; // 武器列表
    protected _addVideoCoin: number = 0;

    protected _compositeGrideLine: PackageLineDraw = null; // 合成引导线

    protected _refrushWapenBuyed: number = 0; // 刷新武器购买状态
    /**完成异步武器加载 */
    finishLoadWapen: boolean = false;

    public onInit(params: any): void {

        this.regiestEvent();
        this.setWaveTxt();
        this.addWapenItem();

        this.showHPFullBtn(false);
        this.onSetSKillState();

        this._compositeGrideLine = new PackageLineDraw(this.moveLine());
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);

        //预加载怪物资源
        const passInfo = ConfigMgr.getInstance().getById(GameUserData.getInstance().lastPassLv, PassData);
        if (passInfo) {
            const uniqueIds = new Set<number>();
            let allMonster: MonsterData[] = [];
            for (let i = 0; i < passInfo.waves.length; i++) {
                const waveInfo = ConfigMgr.getInstance().getById(passInfo.waves[i], WaveTimesData);
                for (let j = 0; j < waveInfo.monsterID.length; j++) {
                    uniqueIds.add(waveInfo.monsterID[j]);
                }
            }
            uniqueIds.forEach(id => {
                let mstData = ConfigMgr.getInstance().getById(id, MonsterData);
                allMonster.push(mstData);
            })

            this.preloadMonstersAsync(allMonster);
        }

    }

    /**
          * 异步分批预加载怪物资源
          * @param monsterInfos 怪物信息列表
          */
    public async preloadMonstersAsync(monsterInfos: MonsterData[]) {
        if (!monsterInfos || monsterInfos.length === 0) {
            return;
        }

        const uniquePaths = new Set<string>();
        monsterInfos.forEach((mInfo) => {
            const path = mInfo.img;
            if (path) {
                uniquePaths.add(path);
            }
        });

        const paths = Array.from(uniquePaths);
        if (paths.length === 0) {
            return;
        }

        const batchSize = 10; // 每批加载的数量
        const delayMs = 50; // 批间延迟，避免主线程阻塞
        let isBoss = false
        //分批异步加载
        for (let i = 0; i < paths.length; i += batchSize) {
            const batch = paths.slice(i, i + batchSize);
            isBoss = paths[i].indexOf('boss') >= 0;
            let initCount = isBoss ? 1 : 50;
            const loadPromises = batch.map((path) => {
                return GameResLoad.preloadMonsterPrefab(path, initCount).catch((error) => {
                    console.error(`Failed to preload monster: ${path}`, error);
                    return null;
                });
            });

            try {
                await Promise.all(loadPromises);
            } catch (error) {
                console.error('Monster preload error:', error);
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    protected addWapenItem() {
        this.wapen_list().active = false;
        for (let i = 0; i < 3; i++) {
            let wapenItem = cc.instantiate(this.wapenItemPrefab).getComponent(WapenItemUI);
            this.wapenList.push(wapenItem);
            this.wapen_list().addChild(wapenItem.node);
            if (wapenItem.getTurretNode()) {
                wapenItem.getTurretNode().active = true;
            }
            wapenItem.node.active = true;
            wapenItem.node.setPosition(-225 + i * 225, 0);
        }
    }

    protected onShowWapenItems() {
        this.wapen_list().active = true;
    }

    // 点击事情 监听
    onBtnClicked(evt: cc.Event.EventTouch) {
        if (evt.target == this.btn_pause().node) {
            this.onPauseClicked();
        } else if (evt.target == this.btn_speedx2().node) {
            this.onSpeedClicked(2);
        } else if (evt.target == this.btn_draw().node) {
            this.onDrawClicked();
        } else if (evt.target == this.btn_fight().node) {
            this.onFightClicked();
        } else if (evt.target == this.btn_videoCoin().node) {
            this.onVideoCoinClicked();
        } else if (evt.target == this.btn_full_hp().node) {
            this.onFullHpClicked();
        } else if (evt.target == this.btn_Skill().node) {
            this.onUseSKill();
        } else if (evt.target == this.btn_getAllWapen().node) {
            this.onGetAllWapen();
        } else if (evt.target == this.btn_arrow().node) {
            this.updateArrowByMonster();
        }
    }

    onUseSKill() {
        let cdTime = GameControl.getInstance().getCharInfo().getSkillCdTime();
        if (cdTime <= 0) {
            GlobalEventMgr.getInstance().emit(GlobalEventID.hero_use_skill);
            GameControl.getInstance().getCharInfo().useSkill();
            console.log("cdTime:", GameControl.getInstance().getCharInfo());
        } else {
            GameHelp.getInstance().showToast("技能冷却中");
        }
    }

    onResfreshBtnSkillCD() {
        let skillData: ActSkillData = GameControl.getInstance().getCharInfo().getSKillData();
        let cdTime = GameControl.getInstance().getCharInfo().getSkillCdTime();
        if (cdTime > 0) {
            this.skillDjsNode().active = true;
            this.skillDjsNode().getComponent(cc.Sprite).fillRange = cdTime / skillData.cd;
        } else {
            this.skillDjsNode().active = false;
        }

    }

    onSetSKillState() {
        let skillData: ActSkillData = GameControl.getInstance().getCharInfo().getSKillData();
        if (!skillData) {
            this.btn_Skill().node.active = false;
            return;
        } else {
            this.btn_Skill().node.active = true;
            this.loadSpirteFrame(`ItemIcon/${skillData.icon}`, this.btn_Skill().node.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
            this.btn_Skill().node.getComponentInChildren(cc.Label).string = skillData.name;
            this.skillDjsNode().active = false;
            return;
        }
    }


    protected regiestEvent(): void {

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onDebugKeyPass, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.game_relife, this.onRelife, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.show_bossComing, this.showBossComing, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DEL, this.onTurretDel, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DEL_LIST, this.onTurretDelList, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.game_addMoney, this.onGameMoneyAdd, this);

        GlobalEventMgr.getInstance().on(GlobalEventID.game_addAward, this.onGameAwardAdd, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.game_addYuanBao, this.onGameYuanBaoDrop, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.GAME_COIN_CHANGE, this.refrushSilver, this);
        GlobalEventMgr.getInstance().on(GlobalEventID.checkBattleGuide, this.onShowWapenItems, this)

        this.btn_allDrop().addClick(this.onClickBtnAllDrop, this)
        this.btn_pause().addClick(this.onBtnClicked, this);
        this.btn_speedx2().addClick(this.onBtnClicked, this);
        this.btn_draw().addClick(this.onBtnClicked, this);
        this.btn_fight().addClick(this.onBtnClicked, this);
        this.btn_videoCoin().addClick(this.onBtnClicked, this);
        this.btn_full_hp().addClick(this.onBtnClicked, this);
        this.btn_Skill().addClick(this.onBtnClicked, this);
        this.btn_arrow()?.addClick(this.onBtnClicked, this);
        this.btn_getAllWapen() && this.btn_getAllWapen().addClick(this.onBtnClicked, this);
    }

    public onShow(params: any): void {
        this.hideWaveTips();
        this.refrushSilver();
        GameDrawHelp.getInstance().resetCompenSations();
    }

    public showBlockShop(first: boolean, wInfo: WaveInfo, relife: boolean = false) {
        // this.showHPFullBtn(false);
        // // console.error(first, wInfo)
        // if (wInfo.waveTimes == 0 && first) {
        //     this.addBlock2List(GameControl.getInstance().getPassInfo().data.shop3);
        // } else {
        //     this.addBlock2List();
        // }
        // let mNode = this.shopMain();
        // // let curScene = SceneMgr.getCurrScene() as UISceneBattle;
        // cc.Tween.stopAllByTarget(mNode);
        // cc.tween(mNode).to(0.3, { position: cc.v3(0, -500) })
        //     .call(() => {
        //         this.autoView.txt_coin.node.parent.active = false;

        //     }).start();
        // mNode.active = true;

        // console.log('showBlockShop, 波次=', wInfo.waveTimes);
        // let aMon = ConfigMgr.getInstance().getAll(GetMoneyData);
        // if (wInfo.waveTimes >= aMon[aMon.length - 1].id) {
        //     this._addVideoCoin = aMon[aMon.length - 1].num;
        // } else {
        //     this._addVideoCoin = aMon[wInfo.waveTimes].num;
        // }
        // this.autoView.txt_video_add.string = 'x' + this._addVideoCoin.toString();
        // this.refrushDrasCost();
        this.refrushVideoWapenTips();
    }




    public hideBlockShop() {
        this.showHPFullBtn(true);
        let mNode = this.shopMain();
        cc.Tween.stopAllByTarget(mNode);
        cc.tween(mNode).to(0.3, { position: cc.v3(0, -1000) }).call(() => {
            mNode.active = false;
        }).start();
    }

    public addMoveChar(charNode: cc.Node, gCamera: cc.Camera, cList: BattleCharUI[]) {
        if (!charNode) {
            console.error('turretNode is null')
            return;
        }
        let newPos = null
        let newRoot = this.moveRoot();
        let wPos = charNode.parent.convertToWorldSpaceAR(charNode.position);
        newPos = newRoot.convertToNodeSpaceAR(wPos);
        charNode.parent = newRoot;
        charNode.setPosition(newPos);
    }


    public addMoveTurret(turretNode: cc.Node, gCamera: cc.Camera, cList: TurretBaseUI[]) {
        if (!turretNode) {
            console.error('turretNode is null')
            return;
        }

        let newPos = null
        let newRoot = this.moveRoot();

        if (turretNode.parent.name == 'weapon') {
            let wPos = CocosHelper.convertBetweenCameras(turretNode, gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
            newPos = newRoot.convertToNodeSpaceAR(wPos);
        } else {
            let wPos = turretNode.parent.convertToWorldSpaceAR(turretNode.position);
            newPos = newRoot.convertToNodeSpaceAR(wPos);
        }
        turretNode.parent = newRoot;
        turretNode.setPosition(newPos);

        let lineCor: string = "#FFFFFF";

        let gNodes: cc.Vec3[] = [];
        for (const cNode of cList) {
            // gNodes.push(cNode.node);
            let wPos = CocosHelper.convertBetweenCameras(cNode.node, gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
            gNodes.push(wPos)
        }

        this._compositeGrideLine.resetConfig({
            targetWPosList: gNodes,     // 固定节点（必须）
            dragNode: turretNode,      // 拖拽节点（必须）
            lineColor: lineCor,
        });

    }
    /**固定节点，拖拽节点，相机 */
    async resetCompositeGrideLine(gNode: cc.Node, turretNode, gCamera) {
        return;
        let lineCor: string = "rgb(122, 171, 235)";
        let gNodes: cc.Vec3[] = [];
        // gNodes.push(cNode.node);
        let wPos = CocosHelper.convertBetweenCameras(gNode, gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
        gNodes.push(wPos)

        await this._compositeGrideLine.resetConfig2({
            targetWPosList: gNodes,     // 固定节点（必须）
            dragNode: turretNode,      // 拖拽节点（必须）
            lineColor: lineCor,
        });
        this._compositeGrideLine.updateConnection();
    }


    public delMoveTurret(turretNode?: cc.Node) {
        this._compositeGrideLine.destroy();
    }

    // 选中 武器
    // selectWapenItem: WapenItemUI = null;
    // public setMoveStartItem(tNode: cc.Node) {
    //     if (!tNode) {
    //         this.selectWapenItem = null;
    //     } else {
    //         this.selectWapenItem = tNode.parent.parent.getComponent(WapenItemUI);
    //     }
    // }

    // public removeMoveTurret() {
    //     if (!this.selectWapenItem) return;
    //     this.selectWapenItem.removeTurret();
    //     this.changeGameCoin(-this.selectWapenItem.getPrice());
    //     this.selectWapenItem.node.active = false;
    // }

    protected onPauseClicked() {
        // console.log('暂停');
        let bs = GameControl.getInstance().sceneBattle;
        let result = bs.getPassControl().getResultParm();
        let data = { 'result': result };
        FormMgr.open(UIConfig.ui_gamePause, data);
    }

    refreshSpeedBtnState() {
    }

    protected onSpeedClicked(val: number) {
        console.log('速度', val);
        if (GameUserData.getInstance().adTimes >= 10) {
            GameControl.getInstance().getPassInfo().speedAD = true;
        }

        if (GameUserData.getInstance().lastPassLv == 1) {
            GameControl.getInstance().getPassInfo().speedAD = true;
        }
        let scene = GameControl.getInstance().sceneBattle
        if (GameControl.getInstance().getPassInfo().speedAD) {
            if (GameControl.getInstance().getPassInfo().gameSpeed > GameControl.getInstance()._defaultSpeed) {
                scene.setGameSpeed(GameControl.getInstance()._defaultSpeed);
            } else {
                scene.setGameSpeed(GameControl.getInstance()._addSpeed);
            }
            this.refrushSpeedBtn();
            return;
        }
        this.onOpenPopSureAD();
    }

    watchSpeedAD() {
        let scene = GameControl.getInstance().sceneBattle
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            // this.btn_speedx2.interactable = false;
            if (!b) return;
            scene.setGameSpeed(GameControl.getInstance()._addSpeed);
            GameGlobalData.getInstance().speedX2ADNum++;
            GameControl.getInstance().getPassInfo().speedAD = true;
            this.refrushSpeedBtn();
        }, this, { scene: "buttom_battle7" })
    }


    onOpenPopSureAD() {
        FormMgr.open(UIConfig.ui_popSpeedADSure, { callFunc: this.watchSpeedAD.bind(this) })
    }

    protected refrushSpeedBtn() {
        if (GameControl.getInstance().getPassInfo().speedAD) {
            this.btn_speedx2().node.getChildByName('ui_sp').active = false;
            if (GameControl.getInstance().getPassInfo().gameSpeed > GameControl.getInstance()._defaultSpeed) {
                //     this.btn_speedx2.node.getChildByName('img').active = false;
                this.btn_speedx2().node.getChildByName('txt').getComponent(cc.Label).string = 'x2';
            } else {
                //     this.btn_speedx2.node.getChildByName('img').active = true;
                //     this.btn_speedx2.node.getChildByName('UI_auto').active = false;
                this.btn_speedx2().node.getChildByName('txt').getComponent(cc.Label).string = 'x1';
            }
        } else {
            this.btn_speedx2().node.getChildByName('ui_sp').active = false;
            this.btn_speedx2().node.getChildByName('txt').getComponent(cc.Label).string = 'x1';
        }
    }

    protected onFullHpClicked() {
        console.log('满血');
        let self = this;
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            if (!b) return;
            GlobalEventMgr.getInstance().emit(GlobalEventID.game_hp_add, 1, 100);
            self.showHPFullBtn(false);
        }, this, { key: "battle", scene: "buttom_battle5" })
    }

    protected onVideoCoinClicked() {
        console.log('视频银币');
        let self = this;
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            if (!b) return;

            let startWpos = this.btn_videoCoin().node.convertToWorldSpaceAR(cc.v3());
            self.addSilverEffect(startWpos, 5, () => {
                cc.isValid(self.node) && self.changeGameCoin(self._addVideoCoin);
            })
        }, this, { key: "battle", scene: "buttom_battle1" })
    }

    protected onGetAllWapen() {
        console.log('全买');

        let noT = true;
        let hasBuy = false;
        for (const element of this.wapenList) {
            let t = element.getTurretNode();
            if (t) {
                noT = false;
                hasBuy = t.getComponent(TurretBaseUI).turretInfo.buyed;
                if (hasBuy) break;
            }
        }

        if (noT) {
            GameHelp.getInstance().showToast('当前无装备可上阵');
            return;
        }

        if (hasBuy) {
            GameHelp.getInstance().showToast('当前装备已购买');
            return;
        }

        if (GameControl.getInstance().getPassInfo().videoAllWapenCur >= GameControl.getInstance().getPassInfo().videoAllWapenMax) {
            GameHelp.getInstance().showToast('购买次数已用完');
            return;
        }

        let self = this;
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            if (!b) return;
            self.buyAllWapen();
        }, this, { key: "battle", scene: "video_all_wapen" })
    }


    protected buyAllWapen() {
        //TODO 购买所有武器
        GameControl.getInstance().getPassInfo().videoAllWapenCur += 1;
        for (const element of this.wapenList) {
            element.buyItemNow();
        }
        this._refrushWapenBuyed = 1; // 1秒后刷新
        this.refrushVideoWapenTips();
    }

    updateArrowByMonster(fight: number = -1) {
        if (!this.btn_arrow()) return;
        let isOpen = this.layout_mst().node.scaleY == 1;
        if (fight == 1) isOpen = true;
        if (fight == 0) isOpen = false;
        this.btn_arrow().node.angle = isOpen ? 0 : 180;
        let s_scaleY = isOpen ? 1 : 0, e_scaleY = isOpen ? 0 : 1;
        cc.tween(this.layout_mst().node)
            .to(0.2, { scaleY: e_scaleY })
            .start()

        this.lab_show().node.active = !isOpen;
    }

    protected refrushVideoWapenTips() {
        if (!this.btn_getAllWapen()) {
            return;
        }

        let max = GameControl.getInstance().getPassInfo().videoAllWapenMax;
        let cur = GameControl.getInstance().getPassInfo().videoAllWapenCur;
        let nColor: string = '#12FF46';
        if (cur >= max) {
            nColor = '#Fd0000';
            Utils.setSpGray(this.btn_getAllWapen().getComponent(cc.Sprite), true);
            this.btn_getAllWapen().interactable = false;
        }
        let str = `剩余次数<color=${nColor}>${max - cur}</c>/${max}`;
        str = CommonUtils.addOutline(str, 2, '#000000')
        this.txt_videoWapenTips() && (this.txt_videoWapenTips().string = str);
    }


    protected onDrawClicked() {
        console.log('点击抽卡');
        if (this._refrushWapenBuyed > 0) {
            GameHelp.getInstance().showToast('还有免费武器未使用');
            this._refrushWapenBuyed = 0;
            return;
        }

        let pInfo = GameControl.getInstance().getPassInfo();
        if (pInfo.gameCoin >= pInfo.coin_refrush) {
            pInfo.doCoinRefush();
            this.changeGameCoin(0);
            this.addBlock2List(pInfo.data.shop2);
            this.refrushDrasCost();
        } else {
            // FormMgr.open(UIConfig.ui_silverNotEnough);
            // let str = LanguageMgr.getInstance().getLang('game_silver_not_enough')
            // GameHelp.getInstance().showToast(str);
            // this._curWaveInfo && GameTrackHelp.getInstance().track_trigger_battle_silver(this._curWaveInfo.waveTimes);
            let str = LanguageMgr.getInstance().getLang('game_silver_not_enough')
            GameHelp.getInstance().showToast(str);
        }
    }

    onGameYuanBaoDrop(wPos?: cc.Vec3) {

        let self = this;
        let dropCfg = PassiveSkillMgr.getInstance().getDropList();
        let ramdom = Random.range(0, 100);
        if (ramdom <= dropCfg[0]) {
            //  console.error("掉落元宝");
            let heroNode = GameControl.getInstance().getCharHero().node;
            let pos = cc.v3();
            if (cc.isValid(heroNode)) {
                pos = heroNode.position;
                pos.y += 50;
                pos = heroNode.parent.convertToWorldSpaceAR(pos);
            } else {
                pos = wPos || pos;
            }
            wPos = pos;
            let num = Random.range(dropCfg[1], dropCfg[2]);
            let yuanbao = GameControl.getInstance().getPassInfo().getYuanBaoDropNum();
            let cha = yuanbao[1] - yuanbao[0];
            num = Math.min(num, cha);
            GameControl.getInstance().getPassInfo().addYuanBaoNum(num)
            this.addYuanBaoEffect(wPos, new ItemVo(1, num))

        }

        //GameHelp.getInstance().showToast(`获得${ConfigMgr.getInstance().getById(itemVo.itemID,ItemBaseData).name}x${itemVo.num}`);

    }

    calculateFlytime(startPos: cc.Vec3, endPos: cc.Vec3) {
        let dis = startPos.sub(endPos).mag();
        return Math.min(1, dis / 1000);
    }

    // 飞元宝动画
    public async addYuanBaoEffect(startPos: cc.Vec3, itemVo: ItemVo) {
        let node = cc.instantiate(this.icon_silver);
        let sp = node.getChildByName("ui_zy_qb").getComponent(cc.Sprite);
        sp.spriteFrame = null;
        let itemData = ConfigMgr.getInstance().getById(itemVo.itemID, ItemBaseData);
        await this.loadSpirteFrame(`ItemIcon/${itemData.img}`, sp, GameBundle.Bundle_commonRes);
        let scene = GameControl.getInstance().sceneBattle
        let tripod = scene.getTripod();
        let endPos = tripod.node.parent.convertToWorldSpaceAR(tripod.node.position);// this.getSilverIconWPos();
        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: node,
            duration: Math.min(this.calculateFlytime(startPos, endPos), 0.5),
            num: itemVo.num,
            animType: eFlyAnimType.Line,
            scale: [0.6, 0.5],
            callBack: null,  // 回调
            nodeNum: Math.min(itemVo.num, 5),
        }
        FormMgr.open(UIConfig.ui_flyView, [fp], { quick: true });
    }

    onClickBtnAllDrop() {
        let dropList = GameControl.getInstance().getPassInfo().getDropAwardList();
        if (dropList.length == 0) {
            GameHelp.getInstance().showToast("暂无奖励累计");
            return;
        } else {
            FormMgr.open(UIConfig.ui_PopAllDrop, { awardList: dropList }, { quick: true });
        }

    }

    getMaxColorNum(awardList: ItemVo[]): number {
        let maxColor = 1;
        for (let i = 0; i < awardList.length; i++) {
            let data = ConfigMgr.getInstance().getById(awardList[i].itemID, ItemBaseData);
            if (data.colour > maxColor) {
                maxColor = data.colour;
            }
            if (maxColor >= 5) {
                break;
            }
        }
        return maxColor;
    }

    onGameAwardAdd(awardList: ItemVo[], wPos?: cc.Vec3) {
        if (wPos) {
            let self = this;
            let string = ""
            GameControl.getInstance().addDropNum();

            let color = this.getMaxColorNum(awardList);

            // this.loadRes("effect/prefabs/drop_0" + color, cc.Prefab, GameBundle.Bundle_common).then((res: cc.Prefab) => {
            //     let effectNode = cc.instantiate(res);
            //     effectNode.parent = GameControl.getInstance().sceneBattle.gRoot;
            //     effectNode.zIndex = 200000;
            //     let nPos = GameControl.getInstance().sceneBattle.gRoot.convertToNodeSpaceAR(wPos);
            //     effectNode.setPosition(nPos.x, nPos.y);
            //     let anims = effectNode.getComponent(cc.Animation);
            //     let rTime = 0;
            //     if (anims && anims.getClips().length > 0) {
            //         let clip = anims.getClips()[0];
            //         let name = clip.name;
            //         anims.play(name);
            //         rTime = Math.max(clip.duration + 0.05);
            //     }
            //     this.scheduleOnce(() => {
            //         effectNode.destroy();
            //     }, rTime);

            // })

            //GameHelp.getInstance().showToast(`获得${ConfigMgr.getInstance().getById(itemVo.itemID,ItemBaseData).name}x${itemVo.num}`);
            awardList.forEach((itemVo, index) => {
                GameControl.getInstance().getPassInfo().pushDropAwardList(itemVo);
                // this.scheduleOnce(() => {
                //     this.addAwardEffect(wPos, itemVo, index, () => {
                //         GameControl.getInstance().getPassInfo().pushDropAwardList(itemVo);
                //         console.warn("掉落更新", GameControl.getInstance().getPassInfo().getDropAwardList());
                //     })
                // }, 0.15)
            })

            // let awardNew = GameHelp.getInstance().arrangeAwardList(awardList);

            // awardNew.forEach((itemVo, index) => {

            //     let data = ConfigMgr.getInstance().getById(itemVo.itemID, ItemBaseData);
            //     string += `<color${data.colour}>${data.name}</color>x${itemVo.num}`;
            //     if (index != awardList.length - 1) {
            //         string += "，";
            //     }

            // })
            // string = "获得" + string;
            // console.warn("掉落提示", string);
            let speedTime = GameControl.getInstance().getPassInfo()?.gameSpeed || 1;
            this.scheduleOnce(() => {
                cc.Tween.stopAllByTarget(this.btn_allDrop().node);
                cc.tween(this.btn_allDrop().node)
                    .to(0.1, { scale: 1.25 })
                    .to(0.1, { scale: 1 }, { easing: 'backOut' })
                    .start();

                GameControl.getInstance().deleteDropNum();
                //  GameHelp.getInstance().showToast(string);
            }, 1.7 * speedTime)
        }
    }

    /**
   * 播放掉落动画
   */


    private static pointDistance: number = 30;

    /**
     * 根据序号计算坐标（静态方法）
     */
    calculatePoint(center: cc.Vec2, index: number): cc.Vec2 {
        let pointDistance = 35
        if (index === 0) return center;

        // 找出所在层
        let layer = 1;
        let accumulated = 1;

        while (true) {
            const pointsInLayer = 8 * layer;

            if (index < accumulated + pointsInLayer) {
                const positionInLayer = index - accumulated;
                const radius = layer * pointDistance;
                const angleStep = (2 * Math.PI) / pointsInLayer;
                const angle = positionInLayer * angleStep;

                return cc.v2(
                    center.x + radius * Math.cos(angle),
                    center.y + radius * Math.sin(angle)
                );
            }

            accumulated += pointsInLayer;
            layer++;
        }
    }


    // 飞道具掉落动画
    public addAwardEffect(startPos: cc.Vec3, itemVo: ItemVo, index: number, callback: Function) {
        // let node = cc.instantiate(this.icon_silver);

        // node.parent = GameControl.getInstance().sceneBattle.gRoot

        // node.zIndex = 200000;
        // node.scale = 0.1;

        // let itemData = ConfigMgr.getInstance().getById(itemVo.itemID, ItemBaseData);

        // let pos = this.calculatePoint(cc.v2(nPos.x, nPos.y), index);
        // let fuhaoX = index % 2 == 0 ? -1 : 1;
        // let fuhaoY = Random.range(0, 10) > 5 ? -1 : 1;
        // let endPos1 = cc.v3(pos.x, pos.y, 0);
        // //let endPos1 = cc.v3(nPos.x +25*Math.ceil(index/2) * fuhaoX, nPos.y+ Random.range(-15, 15), 0);


        // // Bezier.


        // let posArr = [new cc.Vec3(node.x, node.y, 0), new cc.Vec3((node.x + endPos1.x) / 2, (node.y + endPos1.y) / 2 + 200, 0), endPos1];
        // // 移动(返回一个Bezier对象, 通过该对象可以暂停、恢复、停止)
        // Bezier.Move(node, posArr, 0.5, EaseType.InQuint, null, () => {
        //     cc.tween(node)
        //         .by(0.12, { y: 15 })
        //         .by(0.12, { y: -15 })
        //         .by(0.06, { y: 8 })
        //         .by(0.06, { y: -8 })
        //         .start()

        // })
        // console.log("scale:", node.scale);
        // cc.tween(node)
        //     .to(0.2, { scale: 1 })
        //     .to(0.3, { scale: 0.4 })
        //     .call(() => {
        //         console.log("scale1:", node.scale);
        //     })
        //     .start();

        // let startPos1 = node.parent.convertToWorldSpaceAR(endPos1);

        // let sp = node.getChildByName("ui_zy_qb").getComponent(cc.Sprite);
        // sp.spriteFrame = null;

        // this.loadSpirteFrame(`ItemIcon/${itemData.img}`, sp, GameBundle.Bundle_common)
        // let scene = GameControl.getInstance().sceneBattle;
        // let tripod = scene.getTripod();
        let endPos = this.btn_allDrop().node.parent.convertToWorldSpaceAR(this.btn_allDrop().node.position);// this.getSilverIconWPos();
        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: null,
            duration: Math.min(this.calculateFlytime(startPos, endPos), 0.4),
            num: itemVo.num,
            animType: eFlyAnimType.Bezier,
            scale: [0.4, 0.4],
            callBack: callback,  // 回调
            nodeNum: Math.min(itemVo.num, 10),
            itemId: itemVo.itemID,
        }

        // let effectNode = node.getChildByName("effectNode")
        // if(cc.isValid(effectNode)){
        //     effectNode.destroy();
        // }
        FormMgr.open(UIConfig.ui_flyView, [fp], { quick: true });


    }


    // 强化获取铜钱
    protected onGameMoneyAdd(vale: number, wPos?: cc.Vec3, scale: number = 1) {
        if (wPos) {
            let self = this;
            self.changeGameCoin(vale);
            this.addSilverEffect(wPos, 3, () => {
                // cc.isValid(self.node) && self.changeGameCoin(vale);
            }, scale)
        } else {
            this.changeGameCoin(vale);
        }
    }

    // protected onWaveProgress(wave: number, progress: number) {
    //     if (progress != 0) { return; }
    //     this.refrushMaxWaveTips();
    // }

    // protected refrushMaxWaveTips() {

    // }

    protected changeGameCoin(val: number) {
        console.log("金币变化");
        let pInfo = GameControl.getInstance().getPassInfo();
        pInfo.gameCoin += val;
        this.refrushDrasCost();
        this.upWapenListCost();
        this.refrushSilver();
    }

    titleAction(num, endNum) {
        let obj = { num: null };
        obj.num = num;
        this.txt_draw_price().string = num.toString();
        cc.tween(obj).to(1, { num: endNum }, {
            progress: (start, end, current, t) => {
                if (this.txt_draw_price() == null) {
                    return;
                }
                this.txt_draw_price().string = (Math.ceil(start + (end - start) * t)).toString();
                return start + (end - start) * t;
            }
        }).call(() => {
            this.txt_draw_price().string = endNum + "";
        }).start();

    }

    // 更新刷新 金币状态
    protected refrushDrasCost() {
        let pInfo = GameControl.getInstance().getPassInfo();
        // this.txt_draw_price().string = pInfo.coin_refrush.toString();
        this.titleAction(Number(this.txt_draw_price().string), pInfo.coin_refrush);
        if (pInfo.coin_refrush > pInfo.gameCoin) {
            this.txt_draw_price().node.color = cc.Color.RED;
        } else {
            this.txt_draw_price().node.color = cc.Color.WHITE;
        }
        if (pInfo.coin_refrush <= 0) {
            this.txt_draw_price().node.active = false;
        } else {
            this.txt_draw_price().node.active = true;
        }
    }

    protected upWapenListCost() {
        for (const element of this.wapenList) {
            element.refrushPrice();
        }
    }

    protected onFightClicked() {
        console.log('战斗');
        GlobalEventMgr.getInstance().emit(GlobalEventID.Fight_start);
        this.updateArrowByMonster(1);
    }

    protected showHPFullBtn(show: boolean) {
        this.btn_full_hp().node.active = show;
        this.btn_Skill().node.active = (show && GameControl.getInstance().getCharInfo().getSKillData() != null)
    }


    // 整备到战斗
    // public zhengbei2Battle(): void {
    //     cc.Tween.stopAllByTag(100);
    //     let rRoot = this.right().getChildByName('root');
    //     cc.tween(rRoot).tag(100).to(0.5, { position: cc.v3(0, 0, 0) }).call(() => {
    //     }).start();
    // }

    protected refrushSilver(val?: number) {
        // let pInfo = GameControl.getInstance().getPassInfo();
        // val = val || pInfo.gameCoin;
        // this.autoView.txt_coin.string = val.toString();
        // this.autoView.txt_coinNew.string = val.toString();
    }

    tt = 0;

    // 显示BOSS来临
    public async showBossComing(haveboss: boolean, mInfo: MonsterInfo) {

    }

    public showWaveTips(str: string, delay: number = 5) {
        cc.Tween.stopAllByTarget(this.waveTips());
        this.waveTips().active = true;
        this.waveTips().getChildByName('bg').getChildByName('txt').getComponent(cc.Label).string = str;
        cc.tween(this.waveTips()).to(0.3, { x: 150 }).start();
        this.scheduleOnce(this.hideWaveTips, delay)
    }

    public hideWaveTips() {
        this.unschedule(this.hideWaveTips);
        cc.Tween.stopAllByTarget(this.waveTips());
        cc.tween(this.waveTips()).to(0.3, { x: 400 }).call(() => {
            this.waveTips().active = false;
        }).start();
    }

    // 飞银币动画
    public addSilverEffect(startPos: cc.Vec3, fCount: number, callback: Function, scale: number = 1) {
        let node = cc.instantiate(this.icon_silver);
        let endPos = this.getSilverIconWPos();
        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: node,
            duration: Math.min(this.calculateFlytime(startPos, endPos), 0.6),
            num: fCount,
            animType: eFlyAnimType.Line,
            scale: [scale, 1],
            callBack: callback,  // 回调
            nodeNum: fCount,
        }
        FormMgr.open(UIConfig.ui_flyView, [fp], { quick: true });
    }


    // 银币 世界坐标
    protected getSilverIconWPos(): cc.Vec3 {
        // if (this.autoView.icon_coin.parent.active) {
        //     let pNode = this.autoView.icon_coin.parent;
        //     return pNode.convertToWorldSpaceAR(this.autoView.icon_coin.position);
        // } else {
        //     let pNode = this.autoView.icon_coinNew.parent;
        //     return pNode.convertToWorldSpaceAR(this.autoView.icon_coinNew.position);
        // }
        return cc.v3();
    }

    // 波次
    public setWaveTxt() {
        // // if (v) return;
        // let pInfo = GameControl.getInstance().getPassInfo();
        // let str = (pInfo.passWaveCount) + '/' + pInfo.maxWaveCount;
        // str = cc.js.formatStr(LanguageMgr.getInstance().getLang("game_wave"), str);
        // // this.passLv.string = str;
    }


    protected onRelife() {
        // this.heroSkill.fullEnergyAuto(); // 自动填充能量
        // this._iconReliftBuff.active = true; // 显示复活buff
    }

    //// ------------------
    // protected async onGuideBtnTiaoZan() {
    //     // let target = this.btn_fight.node;
    //     // let parm: TutorialParams = {
    //     //     endTarget: target,
    //     //     target: target,   // 
    //     //     tType: eTutorialType.FocusNode,
    //     //     bgOpacity: 1,
    //     // }
    //     // target['tutoial'] = await FormMgr.open(UIConfig.ui_tutorial, parm, { quick: true });
    //     GameTrackHelp.getInstance().track_guider("teaching_stage1_2_2");
    // }

    // protected onGuideViewEnergy(data: any) {
    //     // let target = this.heroSkill.node;
    //     // let parm: TutorialParams = {
    //     //     endTarget: target,
    //     //     target: target,   // 
    //     //     tType: eTutorialType.FocusNode,
    //     //     blockTime: 1.2,
    //     //     text: LanguageMgr.getInstance().getLang("tutoial_hero_2"),
    //     //     callFunc: data.func,
    //     //     callFuncTarget: data.target,
    //     // }
    //     // this.heroSkill.fullEnergyAuto(); // 自动填充能量
    //     // FormMgr.open(UIConfig.ui_tutorial, parm, { quick: true });
    //     // GameTrackHelp.getInstance().track_guider("teaching_stage1_1_3");
    // }

    // protected onGuideHeroTips() {
    //     this.top.getChildByName("tips").active = true;
    //     this.top.getChildByName("tips").getChildByName('txt').getComponent(cc.Label).string = LanguageMgr.getInstance().getLang("tutoial_hero_3");
    // }

    // public onAfterHide(params: any): void {
    //     this.unRegiestEvent();
    // }

    public onAfterShow(params: any): void {
        this.refrushSpeedBtn();
    }



    doUpdate(dt) {
        GameControl.getInstance().getCharInfo().deleteSkillCdTime(dt * 1000);
        this.onResfreshBtnSkillCD();
        // let cdTime = GameControl.getInstance().getCharInfo().getSkillCdTime();
        // if(cdTime>0){
        //     this.autoView.skillDjsNode.active = true;
        //     this.autoView.skillDjsNode.getComponent(cc.Sprite).fillRange= cdTime/skillData.cd/1000;
        // }
        // update char
    }
    // update (dt) {}

    // 清空列表武器
    public clearBlockList() {
        this.wapenList.forEach((v) => {
            v.cleanItem();
            v.node.active = true;
        })
    }


    // 移动到块中
    onTurretDel(tNode) {
        if (!tNode) return; // 没有炮塔
        if (this.onTurretDelList(tNode)) {
            GameResLoad.putNode(tNode);
        }
    }

    // 删除炮塔
    protected onTurretDelList(tNode: cc.Node) {
        if (!tNode) return; // 没有炮塔
        for (const element of this.wapenList) {
            if (element.getTurretNode() == tNode) {
                element.removeTurret();
                this.changeGameCoin(-element.getPrice());
                element.node.active = false;
                console.log("删除炮塔列表");

                if (this.getAllTurretList().length == 0) {
                    this._refrushWapenBuyed = 0; // 没有炮塔
                }
                return true;
            }
        }
        return false;
    }

    select_del: boolean = false;
    // 删除炮塔
    public checkMoveInDel(tNode: cc.Node): boolean {

        let delUI = this.DelUI();
        if (!tNode) {
            delUI.scale = 1.0;
            return false;
        }

        let pos = tNode.parent.convertToWorldSpaceAR(tNode.position);
        pos = delUI.convertToNodeSpaceAR(pos);
        let size = delUI.getContentSize();
        let rect = new cc.Rect(- size.width / 2, - size.height / 2, size.width, size.height);
        if (rect.contains(cc.v2(pos.x, pos.y))) {
            if (!this.select_del) {
                this.select_del = true;
                cc.Tween.stopAllByTarget(delUI);
                cc.tween(delUI).to(0.2, { scale: 1.2 }).start();
            }
            return true;
        } else {
            if (this.select_del) {
                this.select_del = false;
                cc.Tween.stopAllByTarget(delUI);
                cc.tween(delUI).to(0.2, { scale: 1.0 }).start();
            }
            return false;
        }
    }

    // 删除炮塔
    public delTurret(tNode: cc.Node) {
        let delUI = this.DelUI();
        cc.Tween.stopAllByTarget(delUI);
        cc.tween(delUI).to(0.2, { scale: 1.0 }).start();
        this.select_del = false;

        let self = this;
        let coin = tNode.getComponent(TurretBaseUI).turretInfo.getDelPrice();
        let startWPos = delUI.parent.convertToWorldSpaceAR(delUI.position);
        this.addSilverEffect(startWPos, 3, () => {
            cc.isValid(self.node) && self.changeGameCoin(coin);
        })
    }

    // 获取炮塔列表
    public getAllTurretList() {
        let turretList: TurretBaseUI[] = [];
        for (const element of this.wapenList) {
            let tNode = element.getTurretNode()
            tNode && turretList.push(tNode.getComponent(TurretBaseUI))
        }
        return turretList;
    }


    // 创建新炮塔列表
    public async addBlock2List(mKey?: number[]) {
        let defaultId = GameControl.getInstance().getPassInfo().data.shop1
        mKey = mKey || defaultId;

        this.clearBlockList();
        let videoList: boolean[] = [];
        let charVideoList: boolean[] = [];
        let allVidioList: boolean[] = [];

        let getVage: TurretInfo[] = [];
        let getCharVage: CharHeroInfo[] = [];
        let getAllVage: ItemBaseData[] = [];


        let getData = GameDrawHelp.getInstance().drawItemDataByList<TurretInfo>(mKey) //GameDrawHelp.getInstance().drawItemData<TurretInfo>(mKey);
        getVage = getData.rData;
        videoList = getData.videoList;
        allVidioList = getData.videoList;
        for (let i = 0; i < getAllVage.length; i++) {
            let element = getAllVage[i];
            if (element.type == GameItemType.Stick) {
                getCharVage.push(new CharHeroInfo(element.typeArgs));
                charVideoList.push(allVidioList[i]);
            }
            else if (element.type == GameItemType.Wapen) {
                getVage.push(new TurretInfo(element.typeArgs));
                videoList.push(allVidioList[i]);
            }
        }
        //初次引导
        let curScene = GameControl.getInstance().sceneBattle;
        if (curScene.IsGuideIng()) {
            getCharVage = charVideoList = [];
            if (curScene.getWaveId() == 0) {
                getVage = [new TurretInfo(101), new TurretInfo(201), new TurretInfo(601)];
                videoList = [false, false, false]
            } else if (curScene.getWaveId() == 1) {
                if (curScene.getGuideIndex() == 4) {
                    getVage = [new TurretInfo(1501), new TurretInfo(201), new TurretInfo(101)];
                    videoList = [false, false, false]
                } else if (curScene.getGuideIndex() == 7) {
                    getVage = [new TurretInfo(3001), new TurretInfo(601), new TurretInfo(202)];
                    videoList = [false, false, false]
                }
                console.log("guideIndex", curScene.getGuideIndex())
            }
        }
        this.finishLoadWapen = false;
        console.log("addBlock2List", getVage, videoList, getCharVage, charVideoList)
        await this.wapen2List(getVage, videoList);
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP)
    }

    // 加载炮塔资源 并添加到列表
    protected async wapen2List(wapens: TurretInfo[], videoList: boolean[], charList: CharHeroInfo[] = [], charVideoList: boolean[] = []) {
        for (let i = 0; i < charList.length; i++) {
            let pInfo = charList[i];
            let node = await GameResLoad.LoadCharPrefab(pInfo.getPrefabName())
            if (node) {
                let pn = node.getComponent(BattleCharUI);
                pInfo.needVideo = charVideoList[i];
                pn.initChar(pInfo);
                pn.moveUI.enabled = true;
                if (this.wapenList[i]) {
                    this.wapenList[i].addChar(pn.node)
                }
            }
        }

        for (let i = 0; i < wapens.length; i++) {
            let pInfo = wapens[i];

            let node = await GameResLoad.loadTurretPrefab(pInfo.getTurretPath());
            if (node) {
                let pn = node.getComponent(TurretBaseUI);
                pInfo.needVideo = videoList[i];
                pn.init(pInfo);
                //棍子信息
                let tm = node.getComponent(TurretMoveUI);
                if (pInfo.data.wapenType == 4)
                    tm && (tm.setStickID(pInfo.data.typeId));
                else
                    tm && (tm.setStickID(0));

                if (this.wapenList[i]) {
                    this.wapenList[i].addTurre(pn.node)
                }
                node.active = true;
                if (i == wapens.length - 1) {
                    this.finishLoadWapen = true;
                    GlobalEventMgr.getInstance().emit(GlobalEventID.checkBattleGuide)
                }
            }
            else {
                console.log('load turret res failed :', pInfo.getTurretPath());
            }
        }
    }

    onDebugKeyPass(event: cc.Event.EventKeyboard) {
    }

    protected unRegiestEvent(): void {
    }

    public onDestroy(): void {
        this.unRegiestEvent();
    }
}


