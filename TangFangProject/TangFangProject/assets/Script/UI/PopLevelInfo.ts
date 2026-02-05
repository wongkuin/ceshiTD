import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../TRFrameWork/Common/Utils/CommonUtils";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameControl from "../Battle/GameControl";
import GameResLoad from "../Battle/GameResLoad";
import ConfigMgr from "../config/ConfigMgr";
import { KvData, MonsterData, PassData, WapenTableData, WaveTimesData } from "../config/DataDef";
import { MonsterInfo, PassInfo, WaveInfo } from "../config/DataInfo";
import { BounsType, WeatherType, WeatherType2, WidgetType } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameUserData from "../Data/GameUserData";
import { ItemVo } from "../Data/UserItemsData";
import LanguageMgr from "../lang/LanguageMgr";
import GameHelp from "../Mgr/GameHelp";
import AwardItemNew from "../module/activity/AwardItemNew";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopLevelInfo extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;
    @property(ButtonPlus)
    btnFight: ButtonPlus = null;
    @property(cc.Layout)
    mstLayout: cc.Layout = null;
    @property(cc.Layout)
    normalRewardLayout: cc.Layout = null;
    @property(cc.RichText)
    desc: cc.RichText = null;
    @property(cc.Label)
    tiliLab: cc.Label = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    iconNight: cc.Node = null; //夜晚图标
    @property(cc.Node)
    iconLight: cc.Node = null; //白天图标
    @property(cc.Node)
    iconRain: cc.Node = null; //雨天图标
    @property(cc.Node)
    iconSnow: cc.Node = null; //雪天图标
    @property(cc.Node)
    iconSmoke: cc.Node = null;  //雾天图标

    modalType = new ModalType(ModalOpacity.OpacityHalf, false);
    closeType = ECloseType.CloseAndDestory;
    private _needEnergy: number = 5;
    private _passInfo: PassData = null;
    private _mstPrefab: cc.Node[] = [];
    private _enterGame: boolean = false;

    private _weatherArr: WapenTableData[] = [];

    protected start(): void {
        this.btnClose.addClick(this.closeSelf, this);
        this.btnFight.addClick(this.startGame, this);
    }

    public async onInit(params: any): Promise<void> {
        super.onInit(params);

        this._passInfo = ConfigMgr.getInstance().getById(params.passId, PassData);
        if (!this._passInfo) return;

        this._weatherArr = ConfigMgr.getInstance().getAll(WapenTableData).filter(wpTable => {
            let type: number = wpTable?.enDam ? Number(wpTable.enDam.split(",")[0]) : null;
            return type >= BounsType.Yewan;
        })

        this._mstPrefab = [];
        this.mstLayout.node.removeAllChildren();
        //关卡特性
        let rsResult = "", index = 0;
        const raceTypeString = [`僵尸`, `鬼魂`, `邪祟`];
        const moveTypeString = [`地面`, `飞行`];
        let allMonster: MonsterData[] = [];
        let waveID = this._passInfo.waves[this._passInfo.waves.length - 1];
        const waveInfo: WaveTimesData = ConfigMgr.getInstance().getById(waveID, WaveTimesData);
        let mstIds = Array.from(new Set(waveInfo.monsterID));
        for (let i = 0; i < mstIds.length; i++) {
            let mstData = ConfigMgr.getInstance().getById(mstIds[i], MonsterData)
            let data = await GameResLoad.loadMonsterPrefab(mstData.img);
            data.active = true;
            this._mstPrefab.push(data);
            allMonster.push(mstData);

            rsResult += `${mstData.name}:${raceTypeString[mstData.raceType - 1]}-<color=#05FF00>${moveTypeString[mstData.moveType - 1]}</c>`;
            rsResult += "        "
            if (++index % 2 == 0) rsResult += "<br/><br/>";
        }

        for (let i = 0; i < this._mstPrefab.length; i++) {
            let res = this._mstPrefab[i], mst = allMonster[i];
            res.getComponent(BattleMonsterUI).showInUI();
            if (res) this.mstLayout.node.addChild(res);
            if (mst.id > 999)
                res.setScale(mst.scale * 0.8);
            else
                res.setScale(mst.scale * 1.2);
        };

        this.desc.string = CommonUtils.addOutline(rsResult, 2, '#000000');;

        this.iconLight.active = this._passInfo.weather5 == WeatherType.BaiTian;
        this.iconNight.active = this._passInfo.weather5 == WeatherType.YeWan;
        this.iconRain.active = (this._passInfo.weather3 == WeatherType2.rain || this._passInfo.weather3 == WeatherType2.lightRain);
        this.iconSnow.active = this._passInfo.weather3 == WeatherType2.snow;
        this.iconSmoke.active = this._passInfo.weather3 == WeatherType2.Smoke;


        let weatherBtns: cc.Node[] = [this.iconLight, this.iconNight, this.iconRain, this.iconSnow, this.iconSmoke];
        for (let i = 0; i < weatherBtns.length; i++) {
            let btn = weatherBtns[i];
            btn['showTip'] = i;
            btn.getComponent(ButtonPlus).addLongClick(() => {
                this.openWeatherTips(btn['showTip']);
            }, () => { }, btn, () => { }, () => { });
        }

        // this.iconLight.getComponent(ButtonPlus).addClick(this.openTips, this);
        // this.iconNight.getComponent(ButtonPlus).addClick(this.openTips, this);
        // this.iconRain.getComponent(ButtonPlus).addClick(this.openTips, this);
        // this.iconSnow.getComponent(ButtonPlus).addClick(this.openTips, this);
        // this.iconSmoke.getComponent(ButtonPlus).addClick(this.openTips, this);

        this.normalRewardLayout.node.removeAllChildren();
        if (this.normalRewardLayout.node.childrenCount <= 0) {
            let items = this.getAdReward();
            items.forEach(vo => {
                let item = cc.instantiate(this.itemPrefab);
                this.normalRewardLayout.node.addChild(item);
                item.getComponent(AwardItemNew).initItem(vo);
            })
        }

        const curEnergy = GameUserData.getInstance().energy;
        this._needEnergy = parseInt(ConfigMgr.getInstance().getById(73, KvData).val); // 当前关卡需要能量
        this.tiliLab.node.color = curEnergy >= this._passInfo.physicCost ? cc.Color.WHITE : cc.Color.RED;
        this.tiliLab.string = `-${this._needEnergy}`;
        this._enterGame = true;
    }

    public findWapenByWeather(typeTarget: BounsType): WapenTableData[] {
        let wpRes: WapenTableData[] = [];
        wpRes = this._weatherArr.filter(wp => {
            let type: number = wp?.enDam ? Number(wp.enDam.split(",")[0]) : null;
            return type == typeTarget;
        })
        return wpRes;
    }

    public openWeatherTips(index: number = 0) {
        let showStr = '';
        let result: WapenTableData[];
        if (index == 0) {
            showStr = '在晴天,'
            result = this.findWapenByWeather(BounsType.Baitian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>`
            })
        }
        else if (index == 1) {
            showStr = '在夜晚,'
            result = this.findWapenByWeather(BounsType.Yewan)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        else if (index == 2) {
            showStr = '在雨天,'
            result = this.findWapenByWeather(BounsType.Yutian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        else if (index == 4) {
            showStr = '在雾天,'
            result = this.findWapenByWeather(BounsType.Wutian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        else if (index == 3) {
            showStr = '在雪天,'
            result = this.findWapenByWeather(BounsType.Xuetian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        if (!result.length) return;
        GameHelp.getInstance().showToast(showStr, 5, WidgetType.Top);
    }

    public openTips(evt: cc.Event.EventTouch): void {
        let showStr = '';
        let result: WapenTableData[];
        if (evt.target == this.iconLight) {
            showStr = '在晴天,'
            result = this.findWapenByWeather(BounsType.Baitian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>`
            })
        }
        else if (evt.target == this.iconNight) {
            showStr = '在夜晚,'
            result = this.findWapenByWeather(BounsType.Yewan)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        else if (evt.target == this.iconRain) {
            showStr = '在雨天,'
            result = this.findWapenByWeather(BounsType.Yutian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        else if (evt.target == this.iconSmoke) {
            showStr = '在雾天,'
            result = this.findWapenByWeather(BounsType.Wutian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        else if (evt.target == this.iconSnow) {
            showStr = '在雪天,'
            result = this.findWapenByWeather(BounsType.Xuetian)
            result.forEach(wp => {
                const dam = Number(wp.enDam.split(",")[1]) || 0.25;
                showStr += `<color=#70F641>${wp.name}</ccolor>武器伤害提高<color=#70F641>${dam * 100}%</ccolor>。`
            })
        }
        if (!result.length) return;
        GameHelp.getInstance().showToast(showStr, 2, WidgetType.Top);
    }

    public getAdReward(): ItemVo[] {
        let awardList = [];
        let item1 = new ItemVo(1, 0);
        let item2 = new ItemVo(2, 0);

        let beilv = parseInt(ConfigMgr.getInstance().getById(4, KvData).val);
        let lv = GameUserData.getInstance().lastPassLv;
        let passVo = ConfigMgr.getInstance().getById(lv, PassData);
        let ybNum = Math.floor(beilv * passVo.item1);
        let lsNum = Math.floor(beilv * passVo.item2);
        let item3 = new ItemVo(passVo.drop3Vi[0], 0);
        let spNum = Math.floor(beilv * passVo.drop3Vi[1]);
        item1.num = ybNum;
        item2.num = lsNum;
        item3.num = spNum;
        awardList.push(item1);
        awardList.push(item2);
        awardList.push(item3);
        return awardList;
    }

    public closeSelf(params?: any): Promise<boolean> {
        if (!this._enterGame) return;
        super.closeSelf(params);
        return Promise.resolve(true);
    }

    public startGame() {
        if (!this._enterGame) return;
        if (GameUserData.getInstance().energy >= this._needEnergy) {
            // 减体力
            GameUserData.getInstance().changeEnergy(-this._needEnergy);
        } else {
            let gStr = LanguageMgr.getInstance().getLang("energy_notEnough");
            GameHelp.getInstance().showToast(gStr);
            FormMgr.open(UIConfig.ui_popBuyEnergy);
            return;
        }

        GameHelp.getInstance().goToBattle(this._passInfo.id);
    }
}

