/**
 * 用于生成随机数据的类。
 * @doc https://docs.unity.cn/cn/2019.4/ScriptReference/Random.html
 */
export default class Random {

    protected static _defaultRandom: Random;
    protected static get defaultRandom(): Random {
        if (!Random._defaultRandom) Random._defaultRandom = new Random();
        return Random._defaultRandom;
    }

    /**返回半径为 1 的圆形内的随机点（只读）。 */
    public static get insideUnitCircle(): cc.Vec2 {
        return Random.defaultRandom.insideUnitCircle;
    }

    /**
     * 返回半径为1，圆边随机点
     */
    public static get onUnitCircle(): cc.Vec2 {
        return Random.defaultRandom.onUnitCircle;
    }

    /**
     * 返回介于 0.0 [含] 与 1.0 [含] 之间的随机浮点数。
     */
    public static get value(): number {
        return Random.defaultRandom.value;
    }

    /**
     * 返回介于 min [含] 与 max [含] 之间的随机整型,浮点数使用floatRange
     * @link https://docs.unity.cn/cn/2019.4/ScriptReference/Random.Range.html
     */
    public static range(min: number, max: number): number {
        return Random.defaultRandom.range(min, max);
    }

    /**
    * 返回介于 min [含] 与 max [含] 之间的随机浮点数,整型使用range
    * @link https://docs.unity.cn/cn/2019.4/ScriptReference/Random.Range.html
    */
    public static floatRange(min: number, max: number): number {
        return Random.defaultRandom.floatRange(min, max);
    }


    protected seed: number;
    constructor(seed?: number) {
        this.seed = seed || Date.now();
    }

    /**
     * 返回介于 min [含] 与 max [含] 之间的随机浮点数,整型使用range
     * @link https://docs.unity.cn/cn/2019.4/ScriptReference/Random.Range.html
     */
    public floatRange(min: number, max: number): number {
        const max1 = Math.max(max, min);
        const min1 = Math.min(max, min);

        this.seed = (this.seed * 9301 + 49297) % 233280;
        const rnd = this.seed / 233280;
        return min1 + rnd * (max1 - min1);
    }

    /**
     * 返回介于 min [含] 与 max [含] 之间的随机整型,浮点数使用floatRange
     * @link https://docs.unity.cn/cn/2019.4/ScriptReference/Random.Range.html
     */
    public range(min: number, max: number): number {
        return Math.round(this.floatRange(min, max));
    }

    /**
     * 返回半径为 1 的圆形内的随机点
     * @link https://docs.unity.cn/cn/2019.4/ScriptReference/Random-insideUnitCircle.html
     */
    public get insideUnitCircle(): cc.Vec2 {
        const angle = this.floatRange(0, 360);
        const r = this.floatRange(0, 1);
        return cc.v2(r * Math.sin(angle * Math.PI / 180), r * Math.cos(angle * Math.PI / 180));
    }

    /**
     * 返回半径为1，圆边随机点
     */
    public get onUnitCircle(): cc.Vec2 {
        const angle = this.floatRange(0, 360);
        return cc.v2(Math.sin(angle * Math.PI / 180), Math.cos(angle * Math.PI / 180));
    }

    /**
    * 返回介于 0.0 [含] 与 1.0 [含] 之间的随机浮点数
    * @link https://docs.unity.cn/cn/2019.4/ScriptReference/Random-value.html
    */
    public get value(): number {
        return this.floatRange(0, 1);
    }

}