import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import UIManager from "../../TRFrameWork/UIFrame/UIManager";
import GameBattleTeamUI_Auto from "../AutoScripts/GameBattleTeamUI_Auto";
import GameBattleUI_Auto from "../AutoScripts/GameBattleUI_Auto";
import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameControl from "../Battle/GameControl";
import GameResLoad from "../Battle/GameResLoad";
import TeamerAIMgr from "../Battle/TeamerAIMgr";
import TurretBaseUI from "../Battle/TurretBaseUI";
import WapenItemUI from "../Battle/WapenItemUI";
import ConfigMgr from "../config/ConfigMgr";
import { GetMoneyData, TeamCopyKvData } from "../config/DataDef";
import { WaveInfo, MonsterInfo, TurretInfo } from "../config/DataInfo";
import UIConfig from "../config/UIConfig";
import GameDrawHelp from "../Data/GameDrawHelp";
import LanguageMgr from "../lang/LanguageMgr";
import BattleWaveProgress from "./BattleWaveProgress";
import GameBattleBaseUI from "./GameBattleBaseUI";
import UISceneBattle from "./UISceneBattle";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameBattleTeamUI extends GameBattleBaseUI {

    @property(GameBattleTeamUI_Auto)
    autoView: GameBattleTeamUI_Auto = null;

    centerRoot(): cc.Node {
        return this.autoView.centerRoot;
    }

    right(): cc.Node {
        return this.autoView.right;
    }

    topLeft(): cc.Node {
        return this.autoView.topLeft;
    }

    top(): cc.Node {
        return this.autoView.top;
    }

    btn_pause(): ButtonPlus {
        return this.autoView.btn_pause;
    } // 暂停

    btn_allDrop(): ButtonPlus {
        return this.autoView.btn_allDrop;
    } // 全部掉落

    btn_speedx2(): ButtonPlus {
        return this.autoView.btn_speedx2;
    } // 2倍速

    moveLine(): cc.Node {
        return this.autoView.moveLine; // 合成引导线
    };

    wapen_list(): cc.Node {
        return this.autoView.wapen_list;
    }
    DelUI(): cc.Node {
        return this.autoView.DelUI;
    }
    btn_draw(): ButtonPlus {
        return this.autoView.btn_draw;
    }
    btn_fight(): ButtonPlus {
        return this.autoView.btn_fight;
    }
    btn_full_hp(): ButtonPlus {
        return this.autoView.btn_full_hp;
    }
    btn_videoCoin(): ButtonPlus {
        return this.autoView.btn_videoCoin;
    }
    btn_Skill(): ButtonPlus {
        return this.autoView.btn_Skill;
    }
    btn_arrow(): ButtonPlus {
        return null
    }
    lab_show(): cc.Label {
        return null;
    }
    layout_mst(): cc.Layout {
        return null;
    }

    btn_getAllWapen(): ButtonPlus {
        return this.autoView.btn_getAll;
    }

    skillDjsNode(): cc.Node {
        return this.autoView.skillDjsNode;
    }
    txt_draw_price(): cc.Label {
        return this.autoView.txt_draw_price;
    }

    txt_videoWapenTips(): cc.RichText {
        return this.autoView.txt_getAllTips;
    }

    waveTips(): cc.Node {
        return this.autoView.waveTips;
    } // 波次提示

    shopMain(): cc.Node {
        return this.autoView.shopMain;
    }

    moveRoot(): cc.Node {
        return this.autoView.moveRoot;
    }// 移动根节点



    // // private _iconReliftBuff: cc.Node = null; // 重生图标

    // protected tutorialUI: UIToast = null; // 教程UI
    // protected _tutoial2Map: boolean = false;

    // protected _curWaveInfo: WaveInfo = null; // 当前波次信息
    // protected wapenList: WapenItemUI[] = []; // 武器列表

    // protected _addVideoCoin: number = 0;

    // protected _compositeGrideLine: PackageLineDraw = null; // 合成引导线

    public onInit(params: any): void {
        UIManager.getInstance().closeForm(UIConfig.scene_login);

        super.onInit(params);
        this.autoView.txt_title.string = GameControl.getInstance().getPassInfo().data.name;
        //     this.regiestEvent();

        //     this.setWaveTxt();
        //     this.autoView.txt_title.string = GameControl.getInstance().getPassInfo().data.name;

        //     for (let i = 0; i < 3; i++) {
        //         let wapenItem = cc.instantiate(this.wapenItemPrefab).getComponent(WapenItemUI);
        //         this.wapenList.push(wapenItem);
        //         this.autoView.wapen_list.addChild(wapenItem.node);
        //         wapenItem.node.active = true;
        //         wapenItem.node.setPosition(-225 + i * 225, 0);
        //     }
        //     this.onSetSKillState();

        //     this._compositeGrideLine = new PackageLineDraw(this.autoView.moveLine);
        //     AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
    }

    // 点击事情 监听
    onBtnClicked(evt: cc.Event.EventTouch) {
        super.onBtnClicked(evt);
    }

    onUseSKill() {
        super.onUseSKill();
    }

    // onResfreshBtnSkillCD() {
    //     let skillData: ActSkillData = GameControl.getInstance().getCharInfo().getSKillData();
    //     let cdTime = GameControl.getInstance().getCharInfo().getSkillCdTime();
    //     if (cdTime > 0) {
    //         this.autoView.skillDjsNode.active = true;
    //         this.autoView.skillDjsNode.getComponent(cc.Sprite).fillRange = cdTime / skillData.cd;
    //     } else {
    //         this.autoView.skillDjsNode.active = false;
    //     }

    // }

    // onSetSKillState() {
    //     let skillData: ActSkillData = GameControl.getInstance().getCharInfo().getSKillData();
    //     if (!skillData) {
    //         this.autoView.btn_Skill.node.active = false;
    //         return;
    //     } else {
    //         this.autoView.btn_Skill.node.active = true;
    //         this.loadSpirteFrame(`ItemIcon/${skillData.icon}`, this.autoView.btn_Skill.node.getComponent(cc.Sprite), GameBundle.Bundle_common);
    //         this.autoView.btn_Skill.node.getComponentInChildren(cc.Label).string = skillData.name;
    //         this.autoView.skillDjsNode.active = false;
    //         return;
    //     }
    // }


    protected regiestEvent(): void {
        super.regiestEvent();
        GlobalEventMgr.getInstance().on(GlobalEventID.game_wave_parogress, this.onWaveProgress, this);


    }

    public onShow(params: any): void {
        super.onShow(params);
        let waves = GameControl.getInstance().getPassInfo().data.waves.length;
        this.autoView.waveProgress.getComponent(BattleWaveProgress).doInit(waves);
        this.autoView.btn_full_hp.node.active = false;
        this.refrushMaxWaveTips();
    }

    public getTurretNode() {
        return cc.instantiate(this.wapenItemPrefab).getComponent(WapenItemUI);
    }

    showReadyDJS(djs: number) {
        this.autoView.txt_readyTime.string = `(${djs}s)`;
    }

    setReadyBtnState(myState: boolean) {
        if (myState) {
            Utils.setAllChildrenSpGray(this.autoView.btn_fight.node, true)
            this.autoView.txt_ready.string = "已准备"

            this.setShopMainMaskState(true);
        } else {
            Utils.setAllChildrenSpGray(this.autoView.btn_fight.node, false)
            this.autoView.txt_ready.string = "准备"
            this.setShopMainMaskState(false);
        }
    }

    /**商店遮罩 */
    public setShopMainMaskState(isShow: boolean) {
        this.autoView.shopMainMask.parent.active = isShow;
    }


    public showBlockShop(first: boolean, wInfo: WaveInfo, relife: boolean = false) {

        this.setShopMainMaskState(false);
        super.showBlockShop(first, wInfo, relife);
        this.showHPFullBtn(false);
        // console.error(first, wInfo)
        if (wInfo.waveTimes == 0 && first) {
            this.addBlock2List(GameControl.getInstance().getPassInfo().data.shop3);
        } else {
            this.addBlock2List();
        }
        let mNode = this.autoView.shopMain;
        // let curScene = SceneMgr.getCurrScene() as UISceneBattle;
        cc.Tween.stopAllByTarget(mNode);
        cc.tween(mNode).to(0.3, { position: cc.v3(0, 0) })
            .call(() => {
                this.autoView.txt_coin.node.parent.active = false;

            }).start();
        mNode.active = true;
        console.warn("111111111111商店状态:", mNode.active);
        console.log('showBlockShop, 波次=', wInfo.waveTimes);
        let aMon = ConfigMgr.getInstance().getAll(GetMoneyData);
        if (wInfo.waveTimes >= aMon[aMon.length - 1].id) {
            this._addVideoCoin = aMon[aMon.length - 1].num;
        } else {
            this._addVideoCoin = aMon[wInfo.waveTimes].num;
        }
        this.autoView.txt_video_add.string = 'x' + this._addVideoCoin.toString();
        this.refrushDrasCost();
    }

    public hideBlockShop() {
        super.hideBlockShop();
        this.showHPFullBtn(false);
        this.autoView.txt_coin.node.parent.active = true;
        // this.showHPFullBtn(true);
        // let mNode = this.autoView.shopMain;
        // this.autoView.txt_coin.node.parent.active = true;
        // cc.Tween.stopAllByTarget(mNode);
        // cc.tween(mNode).to(0.3, { position: cc.v3(0, -1000) }).call(() => {
        //     mNode.active = false;
        // }).start();
    }

    refreshHurtUI(myHurt, teamerHurt) {
        // this.autoView.
        let totalHurt = myHurt + teamerHurt;
        this.autoView.hurt1.string = Math.floor(myHurt).toString();
        this.autoView.hurt2.string = Math.floor(teamerHurt).toString();
        let hurtpg = this.autoView.hurtProgress.getComponent(cc.ProgressBar);
        let progress = (totalHurt > 0) ? myHurt / totalHurt : 0.5;
        hurtpg.progress = progress;

    }

    showTeamerReady() {
        this.autoView.wait2.active = true;
    }

    hideTeamerReady() {
        this.autoView.wait2.active = false;
    }

    showMyselfReady() {
        this.autoView.wait1.active = true;
    }

    hideMyselfReady() {
        this.autoView.wait1.active = false;
    }

    //

    // public addMoveTurret(turretNode: cc.Node, gCamera: cc.Camera, cList: TurretBaseUI[]) {
    //     if (!turretNode) {
    //         console.error('turretNode is null')
    //         return;
    //     }

    //     let newPos = null
    //     let newRoot = this.autoView.moveRoot;

    //     if (turretNode.parent.name == 'weapon') {
    //         let wPos = CocosHelper.convertBetweenCameras(turretNode, gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
    //         newPos = newRoot.convertToNodeSpaceAR(wPos);
    //     } else {
    //         let wPos = turretNode.parent.convertToWorldSpaceAR(turretNode.position);
    //         newPos = newRoot.convertToNodeSpaceAR(wPos);
    //     }
    //     turretNode.parent = newRoot;
    //     turretNode.setPosition(newPos);

    //     let lineCor: string = "#FFFFFF";

    //     let gNodes: cc.Vec3[] = [];
    //     for (const cNode of cList) {
    //         // gNodes.push(cNode.node);
    //         let wPos = CocosHelper.convertBetweenCameras(cNode.node, gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
    //         gNodes.push(wPos)
    //     }

    //     this._compositeGrideLine.resetConfig({
    //         targetWPosList: gNodes,     // 固定节点（必须）
    //         dragNode: turretNode,      // 拖拽节点（必须）
    //         lineColor: lineCor,
    //     });

    // }
    // /**固定节点，拖拽节点，相机 */
    // async resetCompositeGrideLine(gNode: cc.Node, turretNode, gCamera) {
    //     let lineCor: string = "#c93333ff";
    //     let gNodes: cc.Vec3[] = [];
    //     // gNodes.push(cNode.node);
    //     let wPos = CocosHelper.convertBetweenCameras(gNode, gCamera, cc.Canvas.instance.getComponentInChildren(cc.Camera));
    //     gNodes.push(wPos)

    //     await this._compositeGrideLine.resetConfig2({
    //         targetWPosList: gNodes,     // 固定节点（必须）
    //         dragNode: turretNode,      // 拖拽节点（必须）
    //         lineColor: lineCor,
    //     });
    //     this._compositeGrideLine.updateConnection();
    // }


    // public delMoveTurret(turretNode?: cc.Node) {
    //     this._compositeGrideLine.destroy();
    // }

    // // 选中 武器
    // // selectWapenItem: WapenItemUI = null;
    // // public setMoveStartItem(tNode: cc.Node) {
    // //     if (!tNode) {
    // //         this.selectWapenItem = null;
    // //     } else {
    // //         this.selectWapenItem = tNode.parent.parent.getComponent(WapenItemUI);
    // //     }
    // // }

    // // public removeMoveTurret() {
    // //     if (!this.selectWapenItem) return;
    // //     this.selectWapenItem.removeTurret();
    // //     this.changeGameCoin(-this.selectWapenItem.getPrice());
    // //     this.selectWapenItem.node.active = false;
    // // }

    protected onPauseClicked() {
        console.log('团本不暂停');

        let data = { battleScene: "TeamBattle" };
        FormMgr.open(UIConfig.ui_gamePause, data);
    }

    // refreshSpeedBtnState() {

    // }

    // protected onSpeedClicked(val: number) {
    //     console.log('速度', val);
    //     if (GameUserData.getInstance().adTimes >= 10) {
    //         GameControl.getInstance().getPassInfo().speedAD = true;
    //     }

    //     if (GameUserData.getInstance().lastPassLv == 1) {
    //         GameControl.getInstance().getPassInfo().speedAD = true;
    //     }
    //     let scene = GameControl.getInstance().sceneBattle
    //     if (GameControl.getInstance().getPassInfo().speedAD) {
    //         if (GameControl.getInstance().getPassInfo().gameSpeed > 1) {
    //             scene.getPassControl().setGameSpeed(1);
    //         } else {
    //             scene.getPassControl().setGameSpeed(2);
    //         }
    //         this.refrushSpeedBtn();
    //         return;
    //     }
    //     this.onOpenPopSureAD();
    // }

    // watchSpeedAD() {
    //     let scene = GameControl.getInstance().sceneBattle
    //     PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
    //         if (!cc.isValid(this)) return;
    //         // this.btn_speedx2.interactable = false;
    //         if (!b) return;
    //         scene.getPassControl().setGameSpeed(2);
    //         GameGlobalData.getInstance().speedX2ADNum++;
    //         GameControl.getInstance().getPassInfo().speedAD = true;
    //         this.refrushSpeedBtn();
    //     }, this, { scene: "buttom_battle7" })
    // }


    // onOpenPopSureAD() {
    //     FormMgr.open(UIConfig.ui_popSpeedADSure, { callFunc: this.watchSpeedAD.bind(this) })
    // }

    // protected refrushSpeedBtn() {
    //     if (GameControl.getInstance().getPassInfo().speedAD) {
    //         this.btn_speedx2.node.getChildByName('ui_sp').active = false;
    //         if (GameControl.getInstance().getPassInfo().gameSpeed > 1) {
    //             //     this.btn_speedx2.node.getChildByName('img').active = false;
    //             this.btn_speedx2.node.getChildByName('txt').getComponent(cc.Label).string = 'x2';
    //         } else {
    //             //     this.btn_speedx2.node.getChildByName('img').active = true;
    //             //     this.btn_speedx2.node.getChildByName('UI_auto').active = false;
    //             this.btn_speedx2.node.getChildByName('txt').getComponent(cc.Label).string = 'x1';
    //         }
    //     } else {
    //         this.btn_speedx2.node.getChildByName('ui_sp').active = false;
    //         this.btn_speedx2.node.getChildByName('txt').getComponent(cc.Label).string = 'x1';
    //     }
    // }

    // protected onFullHpClicked() {
    //     console.log('满血');
    //     let self = this;
    //     PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
    //         if (!cc.isValid(this)) return;
    //         if (!b) return;
    //         GlobalEventMgr.getInstance().emit(GlobalEventID.game_hp_add, 1, 100);
    //         self.showHPFullBtn(false);
    //     }, this, { scene: "battle", key: "buttom_battle5" })
    // }

    // protected onVideoCoinClicked() {
    //     console.log('视频银币');
    //     let self = this;
    //     PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
    //         if (!cc.isValid(this)) return;
    //         if (!b) return;

    //         let startWpos = this.autoView.btn_videoCoin.node.convertToWorldSpaceAR(cc.v3());
    //         self.addSilverEffect(startWpos, 5, () => {
    //             cc.isValid(self.node) && self.changeGameCoin(self._addVideoCoin);
    //         })
    //     }, this, { scene: "battle", key: "buttom_battle1" })
    // }


    // protected onDrawClicked() {
    //     console.log('点击抽卡');
    //     let pInfo = GameControl.getInstance().getPassInfo();
    //     if (pInfo.gameCoin >= pInfo.coin_refrush) {
    //         pInfo.doCoinRefush();
    //         this.changeGameCoin(0);
    //         this.addBlock2List(GameControl.getInstance().getPassInfo().data.shop2);
    //         this.refrushDrasCost();
    //     } else {
    //         // FormMgr.open(UIConfig.ui_silverNotEnough);
    //         // let str = LanguageMgr.getInstance().getLang('game_silver_not_enough')
    //         // GameHelp.getInstance().showToast(str);
    //         // this._curWaveInfo && GameTrackHelp.getInstance().track_trigger_battle_silver(this._curWaveInfo.waveTimes);
    //         let str = LanguageMgr.getInstance().getLang('game_silver_not_enough')
    //         GameHelp.getInstance().showToast(str);
    //     }
    // }

    // onGameYuanBaoDrop(wPos?: cc.Vec3) {

    //     let self = this;
    //     let dropCfg = PassiveSkillMgr.getInstance().getDropList();
    //     let ramdom = Random.range(0, 100);
    //     if (ramdom <= dropCfg[0]) {
    //         //  console.error("掉落元宝");
    //         let heroNode = GameControl.getInstance().getCharHero().node;
    //         let pos = cc.v3();
    //         if (cc.isValid(heroNode)) {
    //             pos = heroNode.position;
    //             pos.y += 50;
    //             pos = heroNode.parent.convertToWorldSpaceAR(pos);
    //         } else {
    //             pos = wPos || pos;
    //         }
    //         wPos = pos;
    //         let num = Random.range(dropCfg[1], dropCfg[2]);
    //         let yuanbao = GameControl.getInstance().getPassInfo().getYuanBaoDropNum();
    //         let cha = yuanbao[1] - yuanbao[0];
    //         num = Math.min(num, cha);
    //         GameControl.getInstance().getPassInfo().addYuanBaoNum(num)
    //         this.addYuanBaoEffect(wPos, new ItemVo(1, num))

    //     }

    //     //GameHelp.getInstance().showToast(`获得${ConfigMgr.getInstance().getById(itemVo.itemID,ItemBaseData).name}x${itemVo.num}`);

    // }

    // calculateFlytime(startPos: cc.Vec3, endPos: cc.Vec3) {
    //     let dis = startPos.sub(endPos).mag();
    //     return dis / 800;
    // }

    // // 飞元宝动画
    // public async addYuanBaoEffect(startPos: cc.Vec3, itemVo: ItemVo) {
    //     let node = cc.instantiate(this.icon_silver);
    //     let sp = node.getChildByName("ui_zy_qb").getComponent(cc.Sprite);
    //     sp.spriteFrame = null;
    //     let itemData = ConfigMgr.getInstance().getById(itemVo.itemID, ItemBaseData);
    //     await this.loadSpirteFrame(`ItemIcon/${itemData.img}`, sp, GameBundle.Bundle_common)
    //     let scene = GameControl.getInstance().sceneBattle
    //     let tripod = scene.getTripod();
    //     let endPos = tripod.node.parent.convertToWorldSpaceAR(tripod.node.position);// this.getSilverIconWPos();
    //     let fp: FlyViewParams = {
    //         startWPos: startPos,
    //         endWPos: endPos,
    //         target: node,
    //         duration: Math.min(this.calculateFlytime(startPos, endPos), 0.5),
    //         num: itemVo.num,
    //         animType: eFlyAnimType.Line,
    //         scale: [0.6, 0.5],
    //         callBack: null,  // 回调
    //         nodeNum: Math.min(itemVo.num, 5),
    //     }
    //     FormMgr.open(UIConfig.ui_flyView, [fp], { quick: true });
    // }

    // onGameAwardAdd(awardList: ItemVo[], wPos?: cc.Vec3) {
    //     if (wPos) {
    //         let self = this;
    //         let string = ""
    //         //GameHelp.getInstance().showToast(`获得${ConfigMgr.getInstance().getById(itemVo.itemID,ItemBaseData).name}x${itemVo.num}`);
    //         awardList.forEach((itemVo, index) => {
    //             this.addAwardEffect(wPos, itemVo, () => {

    //                 GameControl.getInstance().getPassInfo().pushDropAwardList(itemVo);
    //                 console.warn("掉落更新", GameControl.getInstance().getPassInfo().getDropAwardList());
    //             })
    //             let data = ConfigMgr.getInstance().getById(itemVo.itemID, ItemBaseData);
    //             string += `<color${data.colour}>${data.name}</color>x${itemVo.num}`;
    //             if (index != awardList.length - 1) {
    //                 string += "，";
    //             }

    //         })
    //         string = "获得" + string;
    //         GameHelp.getInstance().showToast(string);

    //     }
    // }

    // // 飞道具掉落动画
    // public addAwardEffect(startPos: cc.Vec3, itemVo: ItemVo, callback: Function) {
    //     let node = cc.instantiate(this.icon_silver);
    //     let sp = node.getChildByName("ui_zy_qb").getComponent(cc.Sprite);
    //     sp.spriteFrame = null;
    //     let itemData = ConfigMgr.getInstance().getById(itemVo.itemID, ItemBaseData);
    //     this.loadSpirteFrame(`ItemIcon/${itemData.img}`, sp, GameBundle.Bundle_common)
    //     let scene = GameControl.getInstance().sceneBattle
    //     let tripod = scene.getTripod();
    //     let endPos = tripod.node.parent.convertToWorldSpaceAR(tripod.node.position);// this.getSilverIconWPos();
    //     let fp: FlyViewParams = {
    //         startWPos: startPos,
    //         endWPos: endPos,
    //         target: node,
    //         duration: Math.min(this.calculateFlytime(startPos, endPos), 0.5),
    //         num: itemVo.num,
    //         animType: eFlyAnimType.Line,
    //         scale: [0.8, 0.6],
    //         callBack: callback,  // 回调
    //         nodeNum: Math.min(itemVo.num, 5),
    //     }
    //     FormMgr.open(UIConfig.ui_flyView, [fp], { quick: true });
    // }


    // // 强化获取铜钱
    // protected onGameMoneyAdd(vale: number, wPos?: cc.Vec3) {
    //     if (wPos) {
    //         let self = this;
    //         this.addSilverEffect(wPos, 3, () => {
    //             cc.isValid(self.node) && self.changeGameCoin(vale);
    //         })
    //     } else {
    //         this.changeGameCoin(vale);
    //     }
    // }

    protected onWaveProgress(wave: number, progress: number) {
        if (progress != 0) { return; }
        this.refrushMaxWaveTips();
    }

    protected refrushMaxWaveTips() {
        let curWaveInfos = GameControl.getInstance().getPassInfo().curWaveInfos;
        let waveTimes = curWaveInfos.length;
        let maxPass = GameControl.getInstance().getPassInfo().maxPassWave;
        let waveCount = GameControl.getInstance().getPassInfo().getWaveCount();

        let str = LanguageMgr.getInstance().getLang('game_wave_tips');
        this.autoView.txt_wave_his.string = cc.js.formatStr(str, waveTimes, waveCount);
    }

    // protected changeGameCoin(val: number) {
    //     let pInfo = GameControl.getInstance().getPassInfo();
    //     pInfo.gameCoin += val;
    //     this.refrushDrasCost();
    //     this.upWapenListCost();
    //     this.refrushSilver();
    // }

    // // 更新刷新 铜钱状态
    // protected refrushDrasCost() {
    //     let pInfo = GameControl.getInstance().getPassInfo();
    //     this.autoView.txt_draw_price.string = pInfo.coin_refrush.toString();
    //     if (pInfo.coin_refrush > pInfo.gameCoin) {
    //         this.autoView.txt_draw_price.node.color = cc.Color.RED;
    //     } else {
    //         this.autoView.txt_draw_price.node.color = cc.Color.WHITE;
    //     }
    //     if (pInfo.coin_refrush <= 0) {
    //         this.autoView.txt_draw_price.node.active = false;
    //     } else {
    //         this.autoView.txt_draw_price.node.active = true;
    //     }
    // }

    // protected upWapenListCost() {
    //     for (const element of this.wapenList) {
    //         element.refrushPrice();
    //     }

    // }

    // protected onFightClicked() {


    //     console.log('战斗');
    //     GlobalEventMgr.getInstance().emit(GlobalEventID.Fight_start);

    // }

    // protected showHPFullBtn(show: boolean) {
    //     this.autoView.btn_full_hp.node.active = show;
    // }


    // // 整备到战斗
    // public zhengbei2Battle(): void {
    //     cc.Tween.stopAllByTag(100);
    //     let rRoot = this.right.getChildByName('root');
    //     cc.tween(rRoot).tag(100).to(0.5, { position: cc.v3(0, 0, 0) }).call(() => {
    //     }).start();

    // }

    // protected changeGameCoin(val: number) {
    //     super.changeGameCoin(val);
    //     TeamerAIMgr.getInstance().addGameCoin(val);

    // }

    protected onGameMoneyAdd(vale: number, wPos?: cc.Vec3) {
        if (wPos) {
            let self = this;
            this.addSilverEffect(wPos, 3, () => {
                cc.isValid(self.node) && self.changeGameCoin(vale);
            })
        } else {
            this.changeGameCoin(vale);
        }
        TeamerAIMgr.getInstance().addGameCoin(vale);
    }

    protected refrushSilver(val?: number) {
        super.refrushSilver(val);

        let pInfo = GameControl.getInstance().getPassInfo();
        val = val || pInfo.gameCoin;
        this.autoView.txt_coin.string = val.toString();
        this.autoView.txt_coinNew.string = val.toString();
    }

    // tt = 0;

    // 显示BOSS来临
    public async showBossComing(haveboss: boolean, mInfo: MonsterInfo) {
        super.showBossComing(haveboss, mInfo);
        if (this.tt > 0) {
            return
        }
        this.tt = 1;

        let startImg = this.autoView.bossImg;
        startImg.active = true;
        startImg.x = -1000;

        let data = await GameResLoad.loadMonsterPrefab(mInfo.getImgPath());
        if (data) {
            let monster = data.getComponent(BattleMonsterUI);
            monster.node.parent = startImg.getChildByName('bossRoot')
            monster.node.setPosition(cc.v2());
            monster.showInUI();
        }

        cc.tween(startImg)
            .to(0.12, { x: 0 })
            .delay(1.88)
            .to(0.12, { x: -1000 })
            .call(() => {
                startImg.active = false;
            })
            .start();
        // SoundMgr.getInstance().playSoundByID(24);
        // if (!haveboss) {
        //     this.hideBossWillComing();
        // }
    }

    // // 显示战斗开始
    // showFightStart() {
    //     let startImg = this.centerRoot.getChildByName('fight_run');
    //     startImg.active = true;
    //     startImg.x = -1000;
    //     cc.tween(startImg)
    //         .to(0.1, { x: 0 })
    //         .delay(0.8)
    //         .to(0.1, { x: -1000 })
    //         .call(() => {
    //             startImg.active = false;
    //         })
    //         .start();
    // }


    // public showWaveTips(str: string, delay: number = 5) {
    //     cc.Tween.stopAllByTarget(this.waveTips);
    //     this.waveTips.active = true;
    //     this.waveTips.getChildByName('bg').getChildByName('txt').getComponent(cc.Label).string = str;
    //     cc.tween(this.waveTips).to(0.3, { x: 150 }).start();
    //     this.scheduleOnce(this.hideWaveTips, delay)
    // }

    // public hideWaveTips() {
    //     this.unschedule(this.hideWaveTips);
    //     cc.Tween.stopAllByTarget(this.waveTips);
    //     cc.tween(this.waveTips).to(0.3, { x: 400 }).call(() => {
    //         this.waveTips.active = false;
    //     }).start();
    // }

    // // 飞银币动画
    // public addSilverEffect(startPos: cc.Vec3, fCount: number, callback: Function) {
    //     let node = cc.instantiate(this.icon_silver);
    //     let endPos = this.getSilverIconWPos();
    //     let fp: FlyViewParams = {
    //         startWPos: startPos,
    //         endWPos: endPos,
    //         target: node,
    //         duration: Math.min(this.calculateFlytime(startPos, endPos), 0.6),
    //         num: fCount,
    //         animType: eFlyAnimType.Line,
    //         scale: [1, 1],
    //         callBack: callback,  // 回调
    //         nodeNum: fCount,
    //     }
    //     FormMgr.open(UIConfig.ui_flyView, [fp], { quick: true });
    // }


    // 银币 世界坐标
    protected getSilverIconWPos(): cc.Vec3 {

        if (this.autoView.icon_coin.parent.active) {
            let pNode = this.autoView.icon_coin.parent;
            return pNode.convertToWorldSpaceAR(this.autoView.icon_coin.position);
        } else {
            let pNode = this.autoView.icon_coinNew.parent;
            return pNode.convertToWorldSpaceAR(this.autoView.icon_coinNew.position);
        }

    }

    // // 波次
    // public setWaveTxt() {
    //     // // if (v) return;
    //     // let pInfo = GameControl.getInstance().getPassInfo();
    //     // let str = (pInfo.passWaveCount) + '/' + pInfo.maxWaveCount;
    //     // str = cc.js.formatStr(LanguageMgr.getInstance().getLang("game_wave"), str);
    //     // // this.passLv.string = str;
    // }


    // protected onRelife() {
    //     // this.heroSkill.fullEnergyAuto(); // 自动填充能量
    //     // this._iconReliftBuff.active = true; // 显示复活buff
    // }

    // //// ------------------
    // // protected async onGuideBtnTiaoZan() {
    // //     // let target = this.btn_fight.node;
    // //     // let parm: TutorialParams = {
    // //     //     endTarget: target,
    // //     //     target: target,   // 
    // //     //     tType: eTutorialType.FocusNode,
    // //     //     bgOpacity: 1,
    // //     // }
    // //     // target['tutoial'] = await FormMgr.open(UIConfig.ui_tutorial, parm, { quick: true });
    // //     GameTrackHelp.getInstance().track_guider("teaching_stage1_2_2");
    // // }

    // // protected onGuideViewEnergy(data: any) {
    // //     // let target = this.heroSkill.node;
    // //     // let parm: TutorialParams = {
    // //     //     endTarget: target,
    // //     //     target: target,   // 
    // //     //     tType: eTutorialType.FocusNode,
    // //     //     blockTime: 1.2,
    // //     //     text: LanguageMgr.getInstance().getLang("tutoial_hero_2"),
    // //     //     callFunc: data.func,
    // //     //     callFuncTarget: data.target,
    // //     // }
    // //     // this.heroSkill.fullEnergyAuto(); // 自动填充能量
    // //     // FormMgr.open(UIConfig.ui_tutorial, parm, { quick: true });
    // //     // GameTrackHelp.getInstance().track_guider("teaching_stage1_1_3");
    // // }

    // // protected onGuideHeroTips() {
    // //     this.top.getChildByName("tips").active = true;
    // //     this.top.getChildByName("tips").getChildByName('txt').getComponent(cc.Label).string = LanguageMgr.getInstance().getLang("tutoial_hero_3");
    // // }

    // // public onAfterHide(params: any): void {
    // //     this.unRegiestEvent();
    // // }

    // public onAfterShow(params: any): void {
    //     this.refrushSpeedBtn();
    // }



    // doUpdate(dt) {
    //     GameControl.getInstance().getCharInfo().deleteSkillCdTime(dt * 1000);
    //     this.onResfreshBtnSkillCD();
    //     // let cdTime = GameControl.getInstance().getCharInfo().getSkillCdTime();
    //     // if(cdTime>0){
    //     //     this.autoView.skillDjsNode.active = true;
    //     //     this.autoView.skillDjsNode.getComponent(cc.Sprite).fillRange= cdTime/skillData.cd/1000;
    //     // }
    //     // update char
    // }
    // // update (dt) {}

    // // 清空列表武器
    // public clearBlockList() {
    //     this.wapenList.forEach((v) => {
    //         v.cleanItem();
    //         v.node.active = true;
    //     })
    // }


    // // 移动到块中
    // onTurretDel(tNode) {
    //     if (!tNode) return; // 没有炮塔
    //     for (const element of this.wapenList) {
    //         if (element.getTurretNode() == tNode) {
    //             element.removeTurret();
    //             this.changeGameCoin(-element.getPrice());
    //             element.node.active = false;
    //         }
    //     }
    // }

    // select_del: boolean = false;
    // // 删除炮塔
    // public checkMoveInDel(tNode: cc.Node): boolean {

    //     if (!tNode) {
    //         this.autoView.DelUI.scale = 1.0;
    //         return false;
    //     }

    //     let pos = tNode.parent.convertToWorldSpaceAR(tNode.position);
    //     pos = this.autoView.DelUI.convertToNodeSpaceAR(pos);
    //     let size = this.autoView.DelUI.getContentSize();
    //     let rect = new cc.Rect(- size.width / 2, - size.height / 2, size.width, size.height);
    //     if (rect.contains(cc.v2(pos.x, pos.y))) {
    //         if (!this.select_del) {
    //             this.select_del = true;
    //             cc.Tween.stopAllByTarget(this.autoView.DelUI);
    //             cc.tween(this.autoView.DelUI).to(0.2, { scale: 1.2 }).start();
    //         }
    //         return true;
    //     } else {
    //         if (this.select_del) {
    //             this.select_del = false;
    //             cc.Tween.stopAllByTarget(this.autoView.DelUI);
    //             cc.tween(this.autoView.DelUI).to(0.2, { scale: 1.0 }).start();
    //         }
    //         return false;
    //     }
    // }

    // // 删除炮塔
    // public delTurret(tNode: cc.Node) {
    //     cc.Tween.stopAllByTarget(this.autoView.DelUI);
    //     cc.tween(this.autoView.DelUI).to(0.2, { scale: 1.0 }).start();
    //     this.select_del = false;

    //     let self = this;
    //     let coin = tNode.getComponent(TurretBaseUI).turretInfo.getDelPrice();
    //     let startWPos = this.autoView.DelUI.parent.convertToWorldSpaceAR(this.autoView.DelUI.position);
    //     this.addSilverEffect(startWPos, 3, () => {
    //         cc.isValid(self.node) && self.changeGameCoin(coin);
    //     })
    // }

    // // 获取炮塔列表
    // public getAllTurretList() {
    //     let turretList: TurretBaseUI[] = [];
    //     for (const element of this.wapenList) {
    //         let tNode = element.getTurretNode()
    //         tNode && turretList.push(tNode.getComponent(TurretBaseUI))
    //     }
    //     return turretList;
    // }



    // // 创建新炮塔列表
    // public async addBlock2List(mKey?: number[]) {
    //     let defaultId = GameControl.getInstance().getPassInfo().data.shop1
    //     mKey = mKey || defaultId;

    //     this.clearBlockList();
    //     let getVage: TurretInfo[] = [];
    //     let videoList: boolean[] = [];

    //     let getData = GameDrawHelp.getInstance().drawItemDataByList<TurretInfo>(mKey) //GameDrawHelp.getInstance().drawItemData<TurretInfo>(mKey);
    //     getVage = getData.rData;
    //     videoList = getData.videoList;

    //     let curScene = GameControl.getInstance().sceneBattle as UISceneBattle;
    //     if (curScene.IsGuideIng()) {
    //         if (curScene.getWaveId() == 0) {
    //             getVage = [new TurretInfo(101), new TurretInfo(201), new TurretInfo(301)];
    //             videoList = [false, false, false]
    //         } else if (curScene.getWaveId() == 1) {
    //             if (curScene.getGuideIndex() == 4) {
    //                 getVage = [new TurretInfo(101), new TurretInfo(1801), new TurretInfo(1401)];
    //                 videoList = [false, false, false]
    //             } else if (curScene.getGuideIndex() == 6) {
    //                 getVage = [new TurretInfo(1301), new TurretInfo(401), new TurretInfo(301)];
    //                 videoList = [false, false, false]
    //             }
    //             console.log("guideIndex", curScene.getGuideIndex())
    //         }

    //     }
    //     console.log("addBlock2List", getVage, videoList)
    //     await this.wapen2List(getVage, videoList);
    //     GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP)
    // }

    // // 加载炮塔资源 并添加到列表
    // protected async wapen2List(wapens: TurretInfo[], videoList: boolean[]) {
    //     for (let i = 0; i < wapens.length; i++) {
    //         let pInfo = wapens[i];
    //         let node = await GameResLoad.loadTurretPrefab(pInfo.getTurretPath());
    //         if (node) {
    //             let pn = node.getComponent(TurretBaseUI);
    //             pInfo.needVideo = videoList[i];
    //             pn.init(pInfo);

    //             if (this.wapenList[i]) {
    //                 this.wapenList[i].addTurre(pn.node)
    //             }
    //         }
    //         else {
    //             console.log('load turret res failed :', pInfo.getTurretPath());
    //         }
    //     }
    // }

    // onDebugKeyPass(event: cc.Event.EventKeyboard) {
    // }

    // protected unRegiestEvent(): void {
    // }

    // public onDestroy(): void {
    //     this.unRegiestEvent();
    // }
}


