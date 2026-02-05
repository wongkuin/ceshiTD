

import { FormType } from "../../TRFrameWork/UIFrame/config/SysDefine";
import { IFormConfig } from "../../TRFrameWork/UIFrame/Struct";
import { GameBundle } from "./GameEnum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIConfig {

    // 闪屏场景
    static scene_splash: IFormConfig = {
        prefabUrl: "prefabs/SceneSplash",
        type: FormType.Screen,
        // bundleName?: string;
    }

    // 登录场景
    static scene_login: IFormConfig = {
        prefabUrl: "prefabs/SceneLogin",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_loading,
    }

    // 主场景
    static scene_main: IFormConfig = {
        prefabUrl: "prefabs/SceneMain",
        type: FormType.Screen,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 战斗场景
    static scene_battle: IFormConfig = {
        prefabUrl: "prefabs/SceneBattle",
        type: FormType.Screen,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 战斗场景
    static scene_battle_worldBoss: IFormConfig = {
        prefabUrl: "prefabs/SceneBattleWorldBoss",
        type: FormType.Screen,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 团队副本战斗场景
    static scene_battle_Team: IFormConfig = {
        prefabUrl: "prefabs/SceneBattleTeam",
        type: FormType.Screen,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 加载过渡页面
    static ui_loading: IFormConfig = {
        prefabUrl: "prefabs/LoadingUI",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_commonRes,
    }

    //真引导界面
    static ui_GuideUI: IFormConfig = {
        prefabUrl: "prefabs/guideLayer",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_commonRes,
    }

    //引导 
    static ui_tutorial: IFormConfig = {
        prefabUrl: "prefabs/TutorialUI",
        type: FormType.Toast,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 飞铜钱
    static ui_flyView: IFormConfig = {
        prefabUrl: "prefabs/FlyViewUI",
        type: FormType.Toast,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 视频 广告 前置
    static ui_videoSplash: IFormConfig = {
        prefabUrl: "prefabs/ToastVideoSplash",
        type: FormType.Toast,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 提示文本
    static toast_tip: IFormConfig = {
        prefabUrl: "toast/ToastTip",
        type: FormType.Toast,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // b站 侧边栏
    static ui_popBiliExt: IFormConfig = {
        prefabUrl: "PopUI/PopBiliExt",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    //
    static ui_PopAllDrop: IFormConfig = {
        prefabUrl: "PopUI/PopAllDrop",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // // 设置
    // static ui_popSetting: IFormConfig = {
    //     prefabUrl: "PopUI/PopSetting",
    //     type: FormType.Window,
    //     bundleName: GameBundle.Bundle_common,
    // }

    // gm
    static ui_popGM: IFormConfig = {
        prefabUrl: "PopUI/GMUI",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // gm
    static ui_popSpeedADSure: IFormConfig = {
        prefabUrl: "PopUI/PopSpeedADSure",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 签到
    static ui_PopSign: IFormConfig = {
        prefabUrl: "prefab/PopSign",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Sign,
    }

    // 购买体力
    // 购买体力
    static ui_popBuyEnergy: IFormConfig = {
        prefabUrl: "PopUI/PopBuyEnergy",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 战斗ui
    static ui_gameBattle: IFormConfig = {
        prefabUrl: "prefabs/GameBattleUI",
        type: FormType.Fixed,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 战斗ui WB
    static ui_gameBattleWB: IFormConfig = {
        prefabUrl: "prefabs/GameBattleWBUI",
        type: FormType.Fixed,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 战斗ui team
    static ui_gameBattleTeam: IFormConfig = {
        prefabUrl: "prefabs/GameBattleTeamUI",
        type: FormType.Fixed,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 游戏暂停
    static ui_gamePause: IFormConfig = {
        prefabUrl: "PopUI/PopGamePause",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 游戏暂停
    static ui_PopMonsterInfo: IFormConfig = {
        prefabUrl: "PopUI/PopMonsterInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 游戏结束
    static ui_gameOver: IFormConfig = {
        prefabUrl: "PopUI/PopGameResult",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    static ui_PopGameWBResult: IFormConfig = {
        prefabUrl: "PopUI/PopGameWBResult",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    //游戏内3选1界面
    static ui_game3in1: IFormConfig = {
        prefabUrl: "PopUI/PopGame3in1",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    //确认弹框
    static ui_PopAlert: IFormConfig = {
        prefabUrl: "PopUI/PopAlert",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    /**武器详情 */
    static ui_PopWapenInfo: IFormConfig = {
        prefabUrl: "prefab/PopWapenInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }

    /**武器解锁 */
    static ui_PopWapenLock: IFormConfig = {
        prefabUrl: "prefab/PopWapenLock",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }

    /**武器详情新 */
    static ui_PopWapenInfoNew: IFormConfig = {
        prefabUrl: "prefab/PopWapenInfoNew",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }

    /**武器升级到神装 */
    static ui_PopWapenUpgradeSZ: IFormConfig = {
        prefabUrl: "prefab/PopWapenUpgradeSZ",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }


    /**武器激活神装弹窗*/
    static ui_PopGetArtifact: IFormConfig = {
        prefabUrl: "prefab/PopGetArtifact",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }

    /**武器激活神装预告，第一关下套子用*/
    static ui_PopGuideLv5: IFormConfig = {
        prefabUrl: "prefab/PopGuideLv5",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }


    /**武器详情新 */
    static ui_PopWapenJJ: IFormConfig = {
        prefabUrl: "prefab/PopWapenJJ",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Wapen,
    }


    /**英雄奖励 */
    static ui_PopHeroAwardInfo: IFormConfig = {
        prefabUrl: "prefab/PopHeroAwardInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Hero,
    }

    /**英雄详情 */
    static ui_PopHeroUpgradeRewardYuLan: IFormConfig = {
        prefabUrl: "prefab/PopHeroUpgradeRewardYuLan",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Hero,
    }


    // 恭喜获得
    static ui_PopGetReward: IFormConfig = {
        prefabUrl: "PopUI/PopGetReward",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 恭喜获得技能
    static ui_PopGetSkill: IFormConfig = {
        prefabUrl: "PopUI/PopGetSkill",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    /**道具信息说明 */
    static ui_PopItemInfo: IFormConfig = {
        prefabUrl: "PopUI/PopItemInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    /**天赋 */
    static Main_PageTalent: IFormConfig = {
        prefabUrl: "prefab/Main_PageTalent",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_Talent,
    }

    // 关卡界面
    static Main_PagePass: IFormConfig = {
        prefabUrl: "prefabs/Main_PagePass",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_commonRes,
    }

    // 商城
    static Main_PageStore: IFormConfig = {
        prefabUrl: "prefabs/Main_PageStore",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_commonRes,

    }

    // 召唤界面
    // static Main_PageSummon: IFormConfig = {
    //     prefabUrl: "prefabs/Main_PageSummon",
    //     type: FormType.Tips,
    //     bundleName: GameBundle.Bundle_common,
    // }

    // 武器界面
    static Main_PageWapen: IFormConfig = {
        prefabUrl: "prefab/Main_PageWapen",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_Wapen,
    }

    //遗物、宝物
    static Main_PageRelic: IFormConfig = {
        prefabUrl: "prefab/Main_PageRelic",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_Treasure,
    }

    //boss 副本
    static Main_PageBossInstance: IFormConfig = {
        prefabUrl: "prefabs/Main_PageBossInstance",
        type: FormType.Tips,
        bundleName: GameBundle.Bundle_WB,
    }

    static ui_PopRelicInfo: IFormConfig = {
        prefabUrl: "prefab/PopRelicInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Treasure,
    }


    static ui_PopRelicUnlock: IFormConfig = {
        prefabUrl: "prefab/PopRelicUnlock",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Treasure,
    }

    static ui_PopSnowBossInfo: IFormConfig = {
        prefabUrl: "prefabs/PopSnowBossInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_WB,
    }

    static ui_PopHurtRank: IFormConfig = {
        prefabUrl: "prefabs/PopHurtRank",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_WB,
    }
    /**组队玩法 */
    static ui_PopTeamRaidInfo: IFormConfig = {
        prefabUrl: "prefabs/PopTeamRaidInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_WB,
    }


    //礼包预览
    static ui_PopStoreFruitPreview: IFormConfig = {
        prefabUrl: "prefab/PopStoreFruitPreview",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Store,
    }

    //礼包升级预览
    static ui_PopStoreFruitUpgradePreview: IFormConfig = {
        prefabUrl: "prefab/PopStoreFruitUpgradePreview",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Store,
    }

    // 补给
    static ui_PopSupply: IFormConfig = {
        prefabUrl: "prefab/PopSupplyUI",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Supply,
    }

    //-----------------------------------------搬迁------------------------------------
    // 七日任务
    static ui_PopSevenTask: IFormConfig = {
        prefabUrl: "prefab/sevenTaskUI",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_SevenTask,
    }

    /**道具信息说明 */
    static ui_PopStore: IFormConfig = {
        prefabUrl: "PopUI/storeUI",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    /**在线十分钟礼包 */
    static ui_PopOnlineGift: IFormConfig = {
        prefabUrl: "PopUI/LoginGiftUI",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    /**战力变化 */
    static ui_PopUpgrade: IFormConfig = {
        prefabUrl: "moveRes/UpgradeUI",
        type: FormType.Toast,
        bundleName: GameBundle.Bundle_commonRes,
    }


    static ui_PopGetMoneyByAD: IFormConfig = {
        prefabUrl: "PopUI/PopGetMoneyByAD",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    static ui_PopLevelInfo: IFormConfig = {
        prefabUrl: "PopUI/PopLevelInfo",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_commonRes,
    }

    static ui_PopLuckDraw: IFormConfig = {
        prefabUrl: "prefab/PopLuckDraw",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }

    static ui_PopPassAward: IFormConfig = {
        prefabUrl: "prefab/PopPassAward",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }

    static ui_PopOnlineBouns: IFormConfig = {
        prefabUrl: "prefab/PopOnlineBouns",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }
    /**神器礼包 */
    static ui_PopDivineWeaponGift: IFormConfig = {
        prefabUrl: "prefab/PopDivineWeaponGift",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }

    static ui_PopSlot: IFormConfig = {
        prefabUrl: "prefab/PopSolt",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }

    static ui_PopGameTimeGift: IFormConfig = {
        prefabUrl: "prefab/PopGameTimeGift",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }

    static ui_PopDailyGiftPack: IFormConfig = {
        prefabUrl: "prefab/PopDailyGiftPack",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }

    static ui_PopRank: IFormConfig = {
        prefabUrl: "prefab/PopRank",
        type: FormType.Window,
        bundleName: GameBundle.Bundle_Act,
    }



}
