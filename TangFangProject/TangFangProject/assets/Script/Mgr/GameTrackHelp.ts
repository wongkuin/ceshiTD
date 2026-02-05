

import { trackEventParam } from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/AdInterface";
import TrackerMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/TrackerMgr";
import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import GameControl from "../Battle/GameControl";
import GameUserData from "../Data/GameUserData";
import GameUserVariable from "../Data/GameUserVariable";

const { ccclass, property } = cc._decorator;

export default class GameTrackHelp extends Singleton<GameTrackHelp> {

    // 商店的钻石购买按钮，这里特指免费购买（无需看广告的）-
    public track_button_shop_other(itemID: number, num: number): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("stageMax", GameUserData.getInstance().lastPassLv.toString());
        let e: trackEventParam = {
            event_id: "button_shop_other",
            type_id: 'shop',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    /***
     * 商店-果蔬礼包的钻石购买 -
     * type: 1=普通礼盒；2=高级礼盒
     */
    public track_trigger_shop_box_diamond(type: number): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("stageMax", GameUserData.getInstance().lastPassLv.toString());
        other.set("type", type.toString());
        let e: trackEventParam = {
            event_id: "trigger_shop_box_diamond",
            type_id: 'shop',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    /**
     * 商店-1500和5000铜钱购买 -
     * @param type  1=1500铜钱，2=5000铜钱
     */
    public track_trigger_shop_gold(type: number): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("stageMax", GameUserData.getInstance().lastPassLv.toString());
        other.set("type", type.toString());
        let e: trackEventParam = {
            event_id: "trigger_shop_gold",
            type_id: 'shop',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    /**
     * 签到-普通领取按钮 -
     * @param day 这是第几天签到
     */
    public track_button_sign_free(day: number): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("day", day.toString());
        let e: trackEventParam = {
            event_id: "button_sign_free",
            type_id: 'sign',
            msg: other
        }
    }

    //挂机奖励领取按钮，未触发广告的领取 -
    public track_button_hook_free(): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("stageMax", GameUserData.getInstance().lastPassLv.toString());
        let e: trackEventParam = {
            event_id: "button_hook_free",
            type_id: 'hook',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    // 通过点击挑战按钮触发体力购买界面 -
    public track_trigger_physical(): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("stageMax", GameUserData.getInstance().lastPassLv.toString());
        let e: trackEventParam = {
            event_id: "button_hook_free",
            type_id: 'hook',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    // 体力购买-钻石按钮 -
    public track_button_physical_diamond(): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("stageMax", GameUserData.getInstance().lastPassLv.toString());
        let e: trackEventParam = {
            event_id: "button_physical_diamond",
            type_id: 'physical',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    /**
     * 点击刷新按钮触发银币获取界面 -
     * @param fid 战斗识别号。每一场战斗都有一个识别号，以便分析同一场战斗中的行为
     * @param wave 当前波次
     * @param stage 当前关卡
     */
    public track_trigger_battle_silver(wave: number): void {
        let fid = GameControl.getInstance().getFid();
        let stage = GameControl.getInstance().getPassId();
        let other: Map<string, string> = new Map<string, string>();
        other.set("fid", fid);
        other.set("wave", wave.toString());
        other.set("stageNow", stage.toString());
        let e: trackEventParam = {
            event_id: "trigger_battle_silver",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    /**
     * 战斗-刷新果蔬时产生了广告气泡 -
     * @param num 产生了几个广告气泡。填写数字即可。没有产生广告气泡时，无需记录此事件
     * @param wave 当前波次
     */
    public track_trigger_battle_refresh_advItem(num: number): void {
        let fid = GameControl.getInstance().getFid();
        let stage = GameControl.getInstance().getPassId();
        let wave = GameControl.getInstance().getCurWave();
        let other: Map<string, string> = new Map<string, string>();
        other.set("fid", fid);
        other.set("num", num.toString());
        other.set("wave", wave.toString());
        other.set("stageNow", stage.toString());
        let e: trackEventParam = {
            event_id: "trigger_battle_refresh_advItem",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    /**
     * 战斗-强化选项更换，未触发广告的 -
     * @param fid 战斗识别号。每一场战斗都有一个识别号，以便分析同一场战斗中的行为
     * @param wave 当前波次
     * @param stage 当前关卡
     */
    public track_button_battle_strengthen_replace_free(): void {
        let fid = GameControl.getInstance().getFid();
        let stage = GameControl.getInstance().getPassId();
        let wave = GameControl.getInstance().getCurWave();
        let other: Map<string, string> = new Map<string, string>();
        other.set("fid", fid);
        other.set("wave", wave.toString());
        other.set("stageNow", stage.toString());
        let e: trackEventParam = {
            event_id: "button_battle_strengthen_replace_free",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    /**
     * 战斗-强化选项全都要，未触发广告的
     * @param fid 
     * @param wave 
     * @param stage 
     */
    public track_button_battle_strengthen_all_free(): void {

        let fid = GameControl.getInstance().getFid();
        let stage = GameControl.getInstance().getPassId();
        let wave = GameControl.getInstance().getCurWave();

        let other: Map<string, string> = new Map<string, string>();
        other.set("fid", fid);
        other.set("wave", wave.toString());
        other.set("stageNow", stage.toString());
        let e: trackEventParam = {
            event_id: "button_battle_strengthen_all_free",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

    //
    /**
     * 战斗-结果记录 - 
     * @param fid 战斗识别号。每一场战斗都有一个识别号，以便分析同一场战斗中的行为
     * @param time1 战斗开始的时间
     * @param time2 战斗结束的时间
     * @param stage 当前关卡
     * @param waveMax 最终通过的波次。一波都没完成=0
     * @param revive 复活次数
     * @param timePhaseA1 背包整备界面总耗时。每个背包整备界面的耗时之和。战斗保存后，中断的时间不会计入，下同
     * @param timePhaseA2 背包整备界面净耗时。去掉了广告占用的时间，下同
     * @param timePhaseB1 战斗界面总耗时。每个战斗界面的耗时之和
     * @param timePhaseB2 战斗界面净耗时
     * @param result 
     */
    public track_trigger_battle_result(time1: number, time2: number, revive: number, timePhaseA1: number, timePhaseA2: number, timePhaseB1: number, timePhaseB2: number, result: number): void {

        let other: Map<string, string> = new Map<string, string>();
        let fid = GameControl.getInstance().getFid();
        let stage = GameControl.getInstance().getPassId();
        let waveMax = GameControl.getInstance().getCurWave();

        other.set("fid", fid);
        other.set("time1", time1.toString());
        other.set("time2", time2.toString());
        other.set("stageNow", stage.toString());
        other.set("waveMax", waveMax.toString());
        other.set("revive", revive.toString());
        other.set("timePhaseA1", timePhaseA1.toString());
        other.set("timePhaseA2", timePhaseA2.toString());
        other.set("timePhaseB1", timePhaseB1.toString());
        other.set("timePhaseB2", timePhaseB2.toString());
        other.set("result", result.toString());
        let e: trackEventParam = {
            event_id: "trigger_battle_result",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    /**
     * 关卡界面摆放的宝箱开启时触发事件，无广告的 -
     * @param id 宝箱的ID（战斗宝箱表的ID）
     * @param type 0=免费开启，1=花费资源开启
     */
    public track_trigger_battleBox_nomal(id: number, type: number): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("id", id.toString());
        other.set("type", type.toString());
        let e: trackEventParam = {
            event_id: "trigger_battleBox_nomal",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    /**
     * 战斗宝箱-战斗结算界面抛弃宝箱 -
     * @param id 宝箱的ID（战斗宝箱表的ID）
    //  */
    // public track_button_battleBox_battle_drop(id: number): void {
    //     let other: Map<string, string> = new Map<string, string>();
    //     other.set("id", id.toString());
    //     let e: trackEventParam = {
    //         event_id: "button_battleBox_battle_drop",
    //         type_id: 'battle',
    //         msg: other
    //     }
    //     TrackerMgr.getInstance().trackGMEvent(e)
    // }

    /**
     * 后勤-刷新角色属性的按钮 -
     * @param logistics 后勤角色ID
     * @param lock 刷新时锁定了几个属性。取值范围0~2
     */
    public track_button_logistics_refresh(logistics: number, lock: number): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("logistics", logistics.toString());
        other.set("lock", lock.toString());
        let e: trackEventParam = {
            event_id: "button_logistics_refresh",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    /**
     * 新手引导关跟踪。注意：第一关通关后重打，不会触发引导，所以不会触发事件
     * @param trackId 
     * @param fid 战斗识别号。每一场战斗都有一个识别号，以便分析同一场战斗中的行为
     */
    public track_guider(trackId: string): void {
        let fid = GameControl.getInstance().getFid();
        //事件名	
        // teaching_stage1_1_1			第一关第一波的背包界面，提示点击开战按钮		
        // teaching_stage1_1_2			第一关第一波的战斗界面，聚焦英雄		
        // teaching_stage1_1_3			第一关第一波的战斗界面，聚焦能量条		
        // teaching_stage1_1_4			第一关第一波的战斗界面，允许自由操作		
        // teaching_stage1_1_5			第一关第一波的战斗完成		
        // teaching_stage1_2_1			第一关第二波的背包界面，提示拖放果蔬		
        // teaching_stage1_2_2			第一关第二波的背包界面，提示点击开战按钮		
        // teaching_stage1_2_3			第一关第二波的战斗完成		
        // -teaching_stage1_3_1			第一关第三波的进入背包整备界面		
        // -teaching_stage1_3_2			第一关第三波的战斗完成		
        // -teaching_stage1_4_1			第一关第四波的进入背包整备界面		
        // -teaching_stage1_4_2			第一关第四波的战斗完成		
        // teaching_stage1_win			第一关获胜		
        // teaching_stage1_lose			第一关失败（引导关卡没有复活选项）		

        let other: Map<string, string> = new Map<string, string>();
        other.set("fid", fid);
        let e: trackEventParam = {
            event_id: trackId,
            type_id: 'guider',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    /**
     * 广告反馈事件 -
     * @param scene 
     * @param result 事件结果。1=广告成功播放完毕。2=广告中途取消了。3=没能拉取到广告
     * @param fid 战斗识别号。每一场战斗都有一个识别号，以便分析同一场战斗中的行为。只有在战斗中触发的，才会有这个识别号，否则为0
     */
    public track_feedback_adv(scene: string, result: string): void {
        // scene	触发此事件的原因					
        // 	button_shop_adv			商店的钻石购买按钮	-	
        // 	button_shop_refresh			商店的刷新按钮		-
        // 	button_shop_box1_adv			商店-普通果蔬礼包-广告按钮	-	
        // 	button_shop_box2_adv			商店-高级果蔬礼包-广告按钮	-	
        // 	button_shop_gold1			商店-500铜钱按钮 -		
        // 	button_sign_adv			签到-三倍领取按钮 -		
        // 	button_hook_adv			挂机奖励领取按钮，有广告的领取-		
        // 	button_physical_adv			体力购买-广告按钮-		
        // 	button_hero_unlock			英雄-广告解锁按钮 -		
        // 	button_battle_silver			战斗-获得银币按钮 -		
        // 	button_battle_unlock			战斗-广告解锁果蔬按钮 -		
        // 	button_battle_grid			战斗-广告获取空格的按钮	-	
        // 	button_battle_refresh			战斗-高级刷新	-	
        // 	button_battle_energy			战斗-充能 -
        // 	button_battle_strengthen_replace_adv			战斗-强化选项更换，广告的 -		
        // 	button_battle_strengthen_all_adv			战斗-强化选项全都要，广告的	 -	
        // 	button_battle_revive			战斗-复活		-
        // 	button_battleBox_adv			关卡界面摆放的宝箱开启时触发事件，广告的 -		
        // 	button_battleBox_battle_adv			关卡界面摆放的宝箱-战斗结算界面通过广告开启 -
        let fid = GameControl.getInstance().getFid();
        let other: Map<string, string> = new Map<string, string>();
        other.set("fid", fid);
        other.set("result", result);
        other.set("scene", scene);
        let e: trackEventParam = {
            event_id: "feedback_adv",
            type_id: 'adv',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }



    /**
     * 
     * @param result //   1=直接获胜。2=复活后获胜。 3=直接失败（即不使用复活的机会）。 4=复活后失败。 5=放弃。
     * @param passId //关卡ID
     * @param waves     //此次挑战通过的最高波次
     * @param isPass //是否最新关卡。0=否（重复打），1=是(最新未通关关卡)
     */
    public track_PassResult(result: number, passId: number, waves: number, isPass: 0 | 1): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("result", result.toString());
        other.set("value1", passId.toString());
        other.set("value2", waves.toString());
        other.set("value3", isPass.toString());

        let e: trackEventParam = {
            event_id: "battleMain",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }


    public track_PassWave(pkey: string, passId: number, passwave: number, videoWave: number[]): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("A", passId.toString());
        other.set("B", passwave + '');
        other.set("C", videoWave.toString());
        let e: trackEventParam = {
            event_id: pkey,
            type_id: 'battle',
            msg: other
        }
        console.log("track_PassWave", pkey, passId, passwave, videoWave);
        TrackerMgr.getInstance().trackGMEvent(e)
    }



    public track_WapenUse(wapenId: number, isAd: boolean): void {
        let other: Map<string, string> = new Map<string, string>();
        other.set("wapenId", wapenId.toString());
        other.set("isAD", isAd.toString());
        let e: trackEventParam = {
            event_id: "battleWapen",
            type_id: 'battle',
            msg: other
        }
        TrackerMgr.getInstance().trackGMEvent(e)
    }

}