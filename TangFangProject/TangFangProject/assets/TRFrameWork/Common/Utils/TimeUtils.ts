
/**
 * Timer工具
 */
export class TimerUtils {

    private static _instance: TimerUtils;

    _isRunning: boolean = false;


    public static get instance(): TimerUtils {
        if (null == this._instance) {
            this._instance = new TimerUtils();
        }
        return this._instance;
    }

    constructor() {
        let s: cc.Scheduler = cc.director.getScheduler();
        s.enableForTarget(this);
        this._isRunning = true;
    }


    /**
     * 循环执行 有限次数
     * @param handler 回调
     * @param interval 间隔时间 秒
     * @param repeat 重复次数（实际运行repeat + 1次）
     * @param delay 延迟多少时间后开始执行 秒
     */
    public loopNum(handler: Function, interval: number, repeat: number, delay: number) {
        return this.schedule(handler, interval, repeat, delay);
    }


    /**
     * 延迟执行一次。
     * @param handler 回调
     * @param delayTime 延迟时间 秒
     */
    public once(handler: Function, delayTime: number = 0) {
        return this.scheduleOnce(handler, delayTime);
    }


    /**
     * 循环执行 一直循环
     * @param handler 回调
     * @param intervlTime 间隔时间 秒 值为 0，那么回调函数每一帧都会被调用
     * @param delay 延迟时间执行  秒
     */
    public loop(handler: Function, intervlTime: number = 0, delay: number = 0) {
        return this.schedule(handler, intervlTime ? intervlTime : 0.02, cc.macro.REPEAT_FOREVER, delay);
    }


    /**
     * 移除计时器Timer
     * @param handler 回调
     */
    public removeTimer(handler: Function) {
        this.unschedule(handler);
    }


    /**
     * 移除所有Timer
     */
    public removeAllTimers() {
        cc.director.getScheduler().unscheduleAllForTarget(this)
    }


    public pauseAll() {
        cc.director.getScheduler().pauseTarget(this);
    }

    public resumeAll() {
        cc.director.getScheduler().resumeTarget(this);
    }


    /**
     * 单次调度
     * @param handler 
     * @param delay 
     */
    private scheduleOnce(handler: Function, delay: number) {
        this.schedule(handler, 0, 0, delay);
        return handler;
    }


    /**
     * Timer开始调度
     * @param handler 回调
     * @param interval 间隔时间
     * @param repeat 重复次数（实际运行repeat + 1次）
     * @param delay 延迟多少时间后开始执行
     */
    private schedule(handler: Function, interval: number, repeat: number, delay: number) {
        cc.director.getScheduler().schedule(handler, this, interval, repeat, delay, !this._isRunning);
        return handler;
    }


    /**
     * 移除调度
     * @param handler 
     */
    private unschedule(handler: Function) {
        if (!handler) return;
        cc.director.getScheduler().unschedule(handler, this);
    }

}