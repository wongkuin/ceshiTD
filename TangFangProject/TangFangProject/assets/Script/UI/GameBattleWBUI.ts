


import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import GameBattleWBUI_Auto from "../AutoScripts/GameBattleWBUI_Auto";
import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameControl from "../Battle/GameControl";
import WapenItemUI from "../Battle/WapenItemUI";
import { PackageLineDraw } from "../BattlePackage/PackageLineDraw";
import ConfigMgr from "../config/ConfigMgr";
import { ActSkillData, GetMoneyData, ItemBaseData, SnowBossData } from "../config/DataDef";
import { MonsterInfo, TurretInfo, WaveInfo } from "../config/DataInfo";
import UIConfig from "../config/UIConfig";
import GameDrawHelp from "../Data/GameDrawHelp";
import GameHelp from "../Mgr/GameHelp";
import { AlertData } from "../module/common/PopAlert";

import GameBattleBaseUI from "./GameBattleBaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameBattleWBUI extends GameBattleBaseUI {

    @property(GameBattleWBUI_Auto)
    autoView: GameBattleWBUI_Auto = null;

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

    btn_getAllWapen(): ButtonPlus {
        return null;
    }

    txt_videoWapenTips(): cc.RichText {
        //   return this.autoView.txt_getAllTips;
        //TODO
        return null;
    }
    skillDjsNode(): cc.Node {
        return this.autoView.skillDjsNode;
    }
    txt_draw_price(): cc.Label {
        return this.autoView.txt_draw_price;
    }

    waveTips(): cc.Node {
        return this.autoView.waveTips;
    } // 波次提示

    shopMain(): cc.Node {
        return this.autoView.shopMain;
    }
    btn_arrow(): ButtonPlus { return null; };
    layout_mst(): cc.Layout { return null; };
    lab_show(): cc.Label { return null; };

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

    protected _maxVideoCoin: number = 3; // 视频最大次数


    public onInit(params: any): void {
        super.onInit(params);

        //     UIManager.getInstance().closeForm(UIConfig.scene_login);
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

    protected onPauseClicked() {
        // console.log('暂停');
        let bs = GameControl.getInstance().sceneBattle;
        let result = bs.getPassControl().getResultParm();
        let data = { 'result': result, battleScene: "WBBattle" };
        FormMgr.open(UIConfig.ui_gamePause, data, { onClose: this.onPauseClose.bind(this) });
    }


    protected onPauseClose(data: any) {
        console.log('暂停关闭', data);
        if (data && data.r) {
            GlobalEventMgr.getInstance().emit(GlobalEventID.exit_by_failed);
        }
    }


    protected override addWapenItem() {
        for (let i = 0; i < 3; i++) {
            let wapenItem = cc.instantiate(this.wapenItemPrefab).getComponent(WapenItemUI);
            this.wapenList.push(wapenItem);
            this.wapen_list().addChild(wapenItem.node);
            wapenItem.node.active = true;
        }
    }


    // 更新铜币
    protected refrushSilver(val?: number) {
        super.refrushSilver(val);
        let pInfo = GameControl.getInstance().getPassInfo();
        val = val || pInfo.gameCoin;
        this.autoView.txt_coin.string = val.toString();
    }

    public refrushCDTime(totalTime: number, runtiem: number) {
        let cdStr = CommonUtils.formatTimeInterval(Math.max(Math.ceil(totalTime - runtiem), 0))
        this.autoView.cdTime.string = `剩余时间:${cdStr}`;
    }

    public refrushBossHurt(val: number) {
        this.autoView.txt_wave_his.string = `造成伤害:${val}`
    }

    public refrushChestView(curV: number, maxV: number) {
        this.autoView.chest_progress.fillRange = curV / maxV;
        let letV = maxV - curV;
        this.autoView.chest_txt_tips.string = `剩${letV}步`
    }


    // // 点击事情 监听
    // onBtnClicked(evt: cc.Event.EventTouch) {
    //     if (evt.target == this.bnt_pause.node) {
    //         this.onPauseClicked();
    //     } else if (evt.target == this.btn_speedx2.node) {
    //         this.onSpeedClicked(2);
    //     } else if (evt.target == this.autoView.btn_draw.node) {
    //         this.onDrawClicked();
    //     } else if (evt.target == this.autoView.btn_fight.node) {
    //         this.onFightClicked();
    //     } else if (evt.target == this.autoView.btn_videoCoin.node) {
    //         this.onVideoCoinClicked();
    //     } else if (evt.target == this.autoView.btn_full_hp.node) {
    //         this.onFullHpClicked();
    //     } else if (evt.target == this.autoView.btn_Skill.node) {
    //         this.onUseSKill();
    //     }
    // }

    // onUseSKill() {
    //     let cdTime = GameControl.getInstance().getCharInfo().getSkillCdTime();
    //     if (cdTime <= 0) {
    //         GlobalEventMgr.getInstance().emit(GlobalEventID.hero_use_skill);
    //         GameControl.getInstance().getCharInfo().useSkill();
    //         console.log("cdTime:", GameControl.getInstance().getCharInfo());
    //     } else {
    //         GameHelp.getInstance().showToast("技能冷却中");
    //     }
    // }

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
    }

    public onShow(params: any): void {
        super.onShow(params);
        this.refrushBossHurt(0);
        // this.hideWaveTips();
        // this.refrushSilver();
        // this.refrushMaxWaveTips();
        // //init wave
        // let waves = GameControl.getInstance().getPassInfo().data.waves.length;
        // this.autoView.waveProgress.getComponent(BattleWaveProgress).doInit(waves);
        // this.autoView.btn_full_hp.node.active = false;
    }


    public showBlockShop(first: boolean, wInfo: WaveInfo, relife: boolean = false) {
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
        cc.tween(mNode).to(0.3, { position: cc.v3(0, -500) })
            .call(() => {

            }).start();
        mNode.active = true;

        console.log('showBlockShop, 波次=', wInfo.waveTimes);
        // let aMon = ConfigMgr.getInstance().getAll(GetMoneyData);
        // if (wInfo.waveTimes >= aMon[aMon.length - 1].id) {
        //     this._addVideoCoin = aMon[aMon.length - 1].num;
        // } else {
        //     this._addVideoCoin = aMon[wInfo.waveTimes].num;
        // }

        let s6 = ConfigMgr.getInstance().getById(6, SnowBossData).val.split(',');
        this._addVideoCoin = parseInt(s6[0]);

        GameControl.getInstance().getPassInfo().videoFreeCoinMax = parseInt(s6[1]);

        this.autoView.txt_video_add.string = 'x' + this._addVideoCoin.toString();
        this.refrushDrasCost();
        this.refrushVideoFreeView();
    }


    protected refrushVideoFreeView() {
        let cur = GameControl.getInstance().getPassInfo().videoFreeCoinCur;
        let max = GameControl.getInstance().getPassInfo().videoFreeCoinMax;
        this.autoView.videoTimes.string = `${max - cur}/${max}`;

        if (cur >= max) {
            this.autoView.btn_videoCoin.interactable = false;
            this.autoView.videoTimes.node.color = new cc.Color().fromHEX('#F62E12');
        } else {
            this.autoView.btn_videoCoin.interactable = true;
            this.autoView.videoTimes.node.color = new cc.Color().fromHEX('#4DFF00');
        }
    }


    protected override onVideoCoinClicked() {
        console.log('视频银币');

        if (GameControl.getInstance().getPassInfo().videoFreeCoinCur >= GameControl.getInstance().getPassInfo().videoFreeCoinMax) {
            GameHelp.getInstance().showToast('今日视频银币次数已用完');
            return;
        }

        let self = this;
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            if (!b) return;

            let startWpos = this.btn_videoCoin().node.convertToWorldSpaceAR(cc.v3());
            self.addSilverEffect(startWpos, 5, () => {
                cc.isValid(self.node) && self.changeGameCoin(self._addVideoCoin);
            });

            GameControl.getInstance().getPassInfo().videoFreeCoinCur++;
            self.refrushVideoFreeView();

        }, this, { key: "battle", scene: "buttom_battle1" })
    }

    public hideBlockShop() {
        this.showHPFullBtn(true);
        let mNode = this.autoView.shopMain;
        cc.Tween.stopAllByTarget(mNode);
        cc.tween(mNode).to(0.3, { position: cc.v3(0, -1000) }).call(() => {
            mNode.active = false;
        }).start();

        this.showFightStart();
    }

    protected override refrushDrasCost() {
        super.refrushDrasCost();
        if (this.txt_draw_price().node.active) {
            this.txt_draw_price().node.parent.getComponent(cc.Layout).paddingLeft = 25;
        } else {
            this.txt_draw_price().node.parent.getComponent(cc.Layout).paddingLeft = 0;
        }

    }

    protected onFightClicked() {
        console.log('战斗');
        if (GameControl.getInstance().getPassInfo().gameCoin < 100) {
            GlobalEventMgr.getInstance().emit(GlobalEventID.Fight_start);
            return;
        }
        let data: AlertData = {
            titleText: "提示",
            alertText: "当前剩余铜钱较多，是否直接进入战斗？",
            sureText: "进入战斗",
            cancelText: "返回商店",
            sureCallFunc: () => {
                GlobalEventMgr.getInstance().emit(GlobalEventID.Fight_start);
            },
            cancelCallFunc: () => {

            }
            // cancelCallFunc:this.log.bind(this),
        }
        FormMgr.open(UIConfig.ui_PopAlert, data);
        //

    }

    // 显示战斗开始
    showFightStart() {
        let startImg = this.centerRoot().getChildByName('fight_run');
        startImg.active = true;
        startImg.x = -1000;

        let curWave = GameControl.getInstance().sceneBattle.getPassControl().getCurWave();

        let wt = curWave.waveTimes;

        startImg.getChildByName('ui_di_jd1').active = wt == 0;
        startImg.getChildByName('ui_di_jd2').active = wt == 1;
        startImg.getChildByName('ui_di_jd3').active = wt == 2;
        startImg.getChildByName('ui_di_jd4').active = wt == 3;

        let sTxt = ConfigMgr.getInstance().getById(31 + wt, SnowBossData).val;
        startImg.getChildByName('txtRoot').getComponent(cc.Label).string = sTxt;
        cc.tween(startImg)
            .to(0.1, { x: 0 })
            .delay(1.5)
            .to(0.1, { x: -1000 })
            .call(() => {
                startImg.active = false;
            })
            .start();
    }

    // 银币 世界坐标
    protected override getSilverIconWPos(): cc.Vec3 {
        let pNode = this.autoView.icon_coin.parent;
        return pNode.convertToWorldSpaceAR(this.autoView.icon_coin.position);
    }
}


