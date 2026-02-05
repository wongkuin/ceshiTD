import UserVariable from "../../TRFrameWork/cocos-module/component/UserVariable";
import ConfigMgr from "../config/ConfigMgr";
import { SnowBossData } from "../config/DataDef";
import { UserKeyType } from "./UserKeyType";


/**副本 */
export default class GameBossInstanceData extends UserVariable<GameBossInstanceData> {


    constructor() {
        super(UserKeyType.GameBossInstanceData, true);
    }
    /**今日雪女战斗次数 */
    snowPlayNum = 0;
    /**雪女最后刷新时间 */
    snowLastTime = "";
    /**雪女最高伤害 */
    snowMaxHurt = 0;
    /**雪女领取奖励的最高伤害值 */
    snowRewardHurt = 0;

    //#region treamRaid 组队副本数据
    /**今日组队战斗次数 */
    teamRaidPlayNum = 0;
    /**组队最后刷新时间 */
    teamRaidLastTime = "";



    /**首次初始化用 */
    protected init(first: boolean): void {
        this.initData();
    }
    initData() {
        this.resetSnowData();
        this.resetTeamRaidData();
    }

    resetSnowData() {
        let nowTime = this.getTime();
        if (nowTime == this.snowLastTime) {
            return;
        }
        this.snowPlayNum = 0;
        this.snowMaxHurt = 0;
        this.snowRewardHurt = 0;
        this.snowLastTime = nowTime;
    }

     resetTeamRaidData() {
        let nowTime = this.getTime();
        if (nowTime == this.teamRaidLastTime) {
            return;
        }
        this.teamRaidPlayNum = 0;
        this.teamRaidLastTime = nowTime;
    }

    setSnowMaxHurt(hurt: number) {
        this.snowMaxHurt = Math.max(this.snowMaxHurt, hurt);
    }


    getTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 注意，getMonth()返回的是0-11
        const day = date.getDate();
        return `${year}:${month}:${day}`
    }

    checkSnowRedDot(): boolean {

        let progressCfg = ConfigMgr.getInstance().getById(3, SnowBossData).val.split(",").map((item) => {
            return parseInt(item);
        });
        let snowRewardHurt = GameBossInstanceData.getInstance().snowRewardHurt;
        let snowMaxHurt = GameBossInstanceData.getInstance().snowMaxHurt;
        for (let i = 0; i < progressCfg.length; i = i + 3) {

            if (snowMaxHurt >= progressCfg[i] && snowRewardHurt < progressCfg[i]) {

                return true;
            }
        }
        return false;
    }







}



