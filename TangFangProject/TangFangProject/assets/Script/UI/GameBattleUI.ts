

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import UIManager from "../../TRFrameWork/UIFrame/UIManager";
import GameBattleUI_Auto from "../AutoScripts/GameBattleUI_Auto";
import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameControl from "../Battle/GameControl";
import GameResLoad from "../Battle/GameResLoad";
import ConfigMgr from "../config/ConfigMgr";
import { GetMoneyData, MonsterData } from "../config/DataDef";
import { MonsterInfo, PassInfo, WaveInfo } from "../config/DataInfo";
import { GameBundle } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameDrawHelp from "../Data/GameDrawHelp";
import GameUserData from "../Data/GameUserData";
import LanguageMgr from "../lang/LanguageMgr";
import BattleWaveProgress from "./BattleWaveProgress";
import GameBattleBaseUI from "./GameBattleBaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameBattleUI extends GameBattleBaseUI {

    @property(GameBattleUI_Auto)
    autoView: GameBattleUI_Auto = null;

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
    btn_arrow(): ButtonPlus {
        return this.autoView.btn_arrow;
    }
    lab_show(): cc.Label {
        return this.autoView.showLab;
    }
    layout_mst(): cc.Layout {
        return this.autoView.layout_mstInfo;
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

    public onInit(params: any): void {
        UIManager.getInstance().closeForm(UIConfig.scene_login);

        super.onInit(params);
        this.autoView.txt_title.string = GameControl.getInstance().getPassInfo().data.name;
    }

    // 点击事情 监听
    onBtnClicked(evt: cc.Event.EventTouch) {
        super.onBtnClicked(evt);
    }

    onUseSKill() {
        super.onUseSKill();
    }

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
        this.refrushEnergy();
        // 定时每秒刷新体力显示（包含倒计时）
        this.schedule(this.refrushEnergy, 1);
    }

    public onAfterHide(params: any): void {
        // 隐藏时停止刷新
        try {
            this.unschedule(this.refrushEnergy);
        } catch (e) { }
        if (super.onAfterHide) {
            super.onAfterHide(params);
        }
    }

    async initMonsterInfo() {
        const passInfo: PassInfo = GameControl.getInstance().getPassInfo();
        if (passInfo.data.id <= 1) {
            
            return;
        }
        const curWave = GameControl.getInstance().getCurWave();
        const waveInfo: WaveInfo = passInfo.allWaveInfos[curWave];
        if (waveInfo) {
            let mstIds = Array.from(new Set(waveInfo.getMonsterID()));
            const layout = this.autoView.layout_monster.node;
            if (layout.childrenCount) layout.removeAllChildren();
            for (let i = 0; i < mstIds.length; i++) {
                const mst = cc.instantiate(this.autoView.mstInfo);
                layout.addChild(mst);
                let longClickTime = mst.getComponent(ButtonPlus).longPressTime;
                mst.getComponent(ButtonPlus).addLongClick(() => {
                    let data = { 'id': mstIds[i] };
                    FormMgr.open(UIConfig.ui_PopMonsterInfo, data);
                }, () => { }, mst, () => {
                    const bar = mst.getChildByName('progressBar').getComponent(cc.ProgressBar);
                    bar.node.active = true;
                    bar.progress = 0;
                    cc.tween(bar.node)
                        .delay(0.01)
                        .call(() => { if (bar.progress < 1) bar.progress += (longClickTime * 0.8 / 100); })
                        .union()
                        .repeat(100)
                        .call(() => { bar.node.active = false; })
                        .start()
                }, () => {
                    const bar = mst.getChildByName('progressBar').getComponent(cc.ProgressBar);
                    cc.Tween.stopAllByTarget(bar.node);
                    bar.node.active = false;
                })

                let img = mst.getChildByName('img').getComponent(cc.Sprite);
                let mstData = ConfigMgr.getInstance().getById(mstIds[i], MonsterData);
                mst.setScale(0.8);
                this.loadSpirteFrame(`texture/${mstData.icon}`, img, GameBundle.Bundle_monster);
            }
        }
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
        cc.tween(mNode).to(0.3, { position: cc.v3(0, 0) })
            .call(() => {
                this.autoView.txt_coin.node.parent.active = false;

            }).start();
        mNode.active = true;

        console.log('showBlockShop, 波次=', wInfo.waveTimes);
        let aMon = ConfigMgr.getInstance().getAll(GetMoneyData);
        if (wInfo.waveTimes >= aMon[aMon.length - 1].id) {
            this._addVideoCoin = aMon[aMon.length - 1].num;
        } else {
            this._addVideoCoin = aMon[wInfo.waveTimes].num;
        }
        this.autoView.txt_video_add.string = 'x' + this._addVideoCoin.toString();
        this.refrushDrasCost();
        this.initMonsterInfo();
    }

    public hideBlockShop() {
        super.hideBlockShop();
        this.autoView.txt_coin.node.parent.active = true;
    }

    protected onWaveProgress(wave: number, progress: number) {
        if (progress != 0) { return; }
        this.refrushMaxWaveTips();
    }

    protected refrushMaxWaveTips() {
        let maxPass = GameControl.getInstance().getPassInfo().maxPassWave;
        let waveCount = GameControl.getInstance().getPassInfo().getWaveCount();

        let str = LanguageMgr.getInstance().getLang('game_wave_max_tips');
        this.autoView.txt_wave_his.string = cc.js.formatStr(str, maxPass, waveCount);
    }

    protected refrushEnergy() {
        let energy = GameUserData.getInstance().energy;
        const maxEnergy = GameUserData.getInstance().energyMaxValue();
        let str = LanguageMgr.getInstance().getLang('physical_energy');
        const cd = GameUserData.getInstance().getEnergyCDSecond();
        //展示cd
        const cdLabel = cd > 0 ? Utils.getTimeFormatClock(Math.ceil(cd), false) : "";
        let recover = cc.js.formatStr(LanguageMgr.getInstance().getLang('energy_recover'), cdLabel);
        let result = `${str}:${energy}/${maxEnergy}`;
        this.autoView.txt_physical_recover.string = cd > 0 ? recover : "";
        this.autoView.txt_physical_energy.string = result;
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
}


