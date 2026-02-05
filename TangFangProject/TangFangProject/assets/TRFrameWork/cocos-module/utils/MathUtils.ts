/**
 * 常用数学函数的集合。
 *@link https://docs.unity3d.com/ScriptReference/Mathf.html
 */
export default class MathUtils {

    public static readonly EPSILON = 1e-4;
    /**
     * 限制value的值在min和max之间， 如果value小于min，返回min。 如果value大于max，返回max，否则返回value
     * @param value 当前值
     * @param min 最小值
     * @param max 最大值
     * @link https://docs.unity3d.com/ScriptReference/Mathf.Clamp.html
     */
    public static clamp(value: number, min: number, max: number): number {
        if (value < min)
            value = min;
        else if (value > max)
            value = max;
        return value;
    }

    /**
     * 限制value在0-1之间
     * @param value 
     * @link https://docs.unity3d.com/ScriptReference/Mathf.Clamp01.html
     */
    public static clamp01(value: number): number {
        if (value < 0)
            return 0;
        else if (value > 1)
            return 1;
        else
            return value;
    }


    /**
    * 循环值t，返回值不会大于等于length，也不会小于0。类似取模
    * @param t 
    * @param length 上限值
    * @link https://docs.unity3d.com/ScriptReference/Mathf.Repeat.html
    */
    public static repeat(t: number, length: number): number {
        return MathUtils.clamp(t - Math.floor(t / length) * length, 0, length);
    }

    /**
     * 乒乓、返回值将在0和length之间来回移动。
     * @param t 
     * @param length 上限值
     * @link https://docs.unity3d.com/ScriptReference/Mathf.PingPong.html
     */
    public static pingPong(t: number, length: number): number {
        t = MathUtils.repeat(t, length * 2);
        return length - Math.abs(t - length);
    }
}