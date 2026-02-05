
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ECloseType, ModalType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import BattleMonsterUI from "../Battle/BattleMonsterUI";
import GameResLoad from "../Battle/GameResLoad";
import ConfigMgr from "../config/ConfigMgr";
import { MonsterData, WapenTableData } from "../config/DataDef";
import { GameBundle, MonsterType, MoveType, RaceType } from "../config/GameEnum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopMonsterInfo extends UIWindow {

    modalType = new ModalType(ModalOpacity.OpacityHalf, true);
    closeType = ECloseType.CloseAndDestory;

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;
    @property(cc.Node)
    mstNode: cc.Node = null;
    @property(cc.Label)
    mstName: cc.Label = null;
    @property(cc.Label)
    type1: cc.Label = null;
    @property(cc.Label)
    type2: cc.Label = null;
    @property(cc.Label)
    type3: cc.Label = null;
    @property(cc.Node)
    skill1: cc.Node = null;
    @property(cc.Node)
    skill2: cc.Node = null;
    mstSpine: cc.Node = null;

    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.closeSelf, this);
    }

    public async onShow(params: any): Promise<void> {
        super.onShow(params)
        let mInfo: MonsterData = ConfigMgr.getInstance().getById(params.id, MonsterData);
        this.mstSpine = await GameResLoad.loadMonsterPrefab(mInfo.img);
        this.mstSpine.getComponent(BattleMonsterUI).showInUI();
        // if (mInfo.id > 999)
        //     this.mstSpine.setScale(0.5);
        // else
        //     this.mstSpine.setScale(mInfo.scale);
        this.mstSpine.setPosition(cc.v3(0, 0));
        this.mstNode.addChild(this.mstSpine)
        this.mstName.string = mInfo.name;
        let raceStr = '', moveStr = '', typeStr = '';
        switch (mInfo.raceType) {
            case RaceType.JiangShi: raceStr = '僵尸'; break;
            case RaceType.GuiHun: raceStr = '鬼魂'; break;
            case RaceType.XieSui: raceStr = '邪祟'; break;
        }
        switch (mInfo.moveType) {
            case MoveType.DiMian: moveStr = "地面"; break;
            case MoveType.FeiXing: moveStr = "飞行"; break;
        }
        switch (mInfo.type) {
            case MonsterType.Normal: typeStr = '小怪'; break;
            case MonsterType.Elite: typeStr = '精英'; break;
            case MonsterType.Boss: typeStr = 'BOSS'; break;
        }
        this.type1.string = raceStr;
        this.type2.string = moveStr;
        this.type3.string = typeStr;

        if (mInfo.id > 999)
            this.mstSpine.setScale(mInfo.scale * 0.8);
        else
            this.mstSpine.setScale(mInfo.scale * 1.2);

        let focusWapen = mInfo.atTpye2.split(',');
        let wapenData1 = ConfigMgr.getInstance().getById(Number(focusWapen[0]), WapenTableData);
        let path1 = `wapen/${wapenData1.img}`;
        let img1 = this.skill1.getChildByName('icon');
        SceneMgr.getCurrScene().loadSpirteFrame(path1, img1.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);

        let wapenData2 = ConfigMgr.getInstance().getById(Number(focusWapen[1]), WapenTableData);
        let path2 = `wapen/${wapenData2.img}`;
        let img2 = this.skill2.getChildByName('icon');
        SceneMgr.getCurrScene().loadSpirteFrame(path2, img2.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
    }

    protected onDestroy(): void {
        // GameResLoad.putNode(this.mstSpine);
        // this.mstSpine = null;
    }
    // update (dt) {}
}

