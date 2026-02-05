import UserVariable from "../../TRFrameWork/cocos-module/component/UserVariable";
import { TimerUtils } from "../../TRFrameWork/Common/Utils/TimeUtils";
import { RewardVideoEvent } from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/AdConstant";
import { DailyGiftPackData } from "../config/DataDef";
import { UserKeyType } from "./UserKeyType";



/**签到*/
export default class GameSignData extends UserVariable<GameSignData> {


    constructor() {
        super(UserKeyType.GameSignData, true);
    }
    /**可领取的最大天数 */
    canSignDay: number = 0;
    /**第一次登录时间戳 */
    fristLoginTime: number = 0;
    /**正常领取天次 */
    receiveDayList: number[] = [];
    /**广告领取天次 */
    receiveDayListAD: number[] = [];

    protected init(first: boolean): void {

        if (this.fristLoginTime == 0) {
            this.fristLoginTime = new Date().getTime();
        }
        // this.fristLoginTime = 1057749358617;
        this.resetCanSignDay();
        TimerUtils.instance.loop(this.onDJS.bind(this), 5);
    }
    /**默认可领取的最早的日期 */
    getMinCanCreceiveDay() {
        let day = this.canSignDay;
        for (let i = 1; i <= day; i++) {
            if (this.receiveDayList.indexOf(i) == -1) {
                day = i;
                return day;
            }
        }

        for (let i = 1; i <= day; i++) {
            if (this.receiveDayListAD.indexOf(i) == -1) {
                day = i;
                return day;
            }
        }
        return day;


    }

    onDJS() {
        if (this.canSignDay >= 7) {
            TimerUtils.instance.removeTimer(this.onDJS.bind(this))
        } else {
            this.resetCanSignDay();
        }
    }

    resetCanSignDay() {
        // this.canSignDay = 7;
        this.canSignDay = this.calculateDaysBetweenTimestamps();
    }

    /**
     * 计算两个时间戳之间相隔的天数（过0点就算新的一天）
     * @param targetTimestamp 目标时间戳（毫秒）
     * @param currentTimestamp 当前时间戳（毫秒），默认为 Date.now()
     * @returns 相隔的天数（整数，可以为负）
     */
    calculateDaysBetweenTimestamps(targetTimestamp: number = this.fristLoginTime, currentTimestamp: number = Date.now()): number {
        // 验证输入
        if (typeof targetTimestamp !== 'number' || typeof currentTimestamp !== 'number') {
            throw new Error('Timestamp must be a number');
        }

        // 获取两个日期对应的本地日期（去掉时分秒毫秒）
        const targetDate = new Date(targetTimestamp);
        const currentDate = new Date(currentTimestamp);

        // 设置为当天的0点0分0秒（本地时间）
        const targetDayStart = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
        );

        const currentDayStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );

        // 计算两个0点之间的毫秒差
        const timeDiff = currentDayStart.getTime() - targetDayStart.getTime();

        // 将毫秒转换为天数（1天 = 86400000毫秒）
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        // 返回整数天数（向下取整）
        let day = Math.floor(daysDiff) + 1;

        return Math.min(day, 7);
    }

    checkCanReceive(day): boolean {

        return this.checkCanReceiveNormal(day) || this.checkCanReceiveAD(day);
    }

    checkCanReceiveNormal(day: number): boolean {
        let result = false;
        if (day <= this.canSignDay && this.receiveDayList.indexOf(day) == -1) {
            result = true;
        }
        return result;
    }

    checkCanReceiveAD(day: number): boolean {
        let result = false;
        if (day <= this.canSignDay && this.receiveDayListAD.indexOf(day) == -1) {
            result = true;
        }
        return result;
    }

    checkFinishByDay(day) {
        return this.receiveDayList.indexOf(day) != -1 && this.receiveDayListAD.indexOf(day) != -1;
    }

    checkAllRedDot() {
        let result = false;
        for (let i = 1; i <= this.canSignDay; i++) {
            if (this.checkCanReceiveNormal(i)) {
                result = true;
                break;
            }
        }
        return result;
    }

    checkActive() {
        return !(this.receiveDayListAD.length == 7 && this.receiveDayList.length == 7);
    }





}

