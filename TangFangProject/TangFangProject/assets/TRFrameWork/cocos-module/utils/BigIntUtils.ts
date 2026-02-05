import NumberUtils from "./NumberUtils";

type bigintType = number | string | bigint;

export default class BigIntUtils {

    /**
     * 比例计算,支持小数
     * @param value 原始值,只支持整数
     * @param percent  值
     * @param option ration:比例值-默认100,add:是否添加总值
     * @returns 
     */
    public static ratio(value: bigintType, percent: bigintType, option: { ratio?: number, add?: boolean } = { ratio: 100, add: true }): bigint {
        if (typeof value == "undefined") return BigInt(0);
        if (typeof percent == "undefined") percent = BigInt(0);

        const ratio = option?.ratio ?? 100;
        const add = option?.add ?? true;

        const bigValue = (typeof value == "number" || typeof value == "string") ? BigInt(value) : value;
        let bigPercent: bigint = null;

        if (typeof percent == "string") {
            bigPercent = BigInt(percent);
        } else if (typeof percent == "bigint") {
            bigPercent = percent;
        } else if (Number.isInteger(percent)) {
            bigPercent = BigInt(percent);
        } else {
            bigPercent = BigInt(Math.floor(percent * ratio));
        }

        const v = (bigValue * bigPercent) / BigInt(ratio);
        return add ? bigValue + v : v;
    }

    /**
     * 加法
     * @param values 
     * @returns 
     */
    public static add(value: bigintType, ...values: bigintType[]): bigint {
        if (values.length <= 0) return BigInt(value);

        let result = typeof value == "bigint" ? value : BigInt(value);
        values.forEach(v => result += (typeof v == "bigint" ? v : BigInt(v)));
        return result;
    }

    /**
     * 减法
     * @param values 
     * @returns 
     */
    public static sub(value: bigintType, ...values: bigintType[]): bigint {
        if (values.length <= 0) return BigInt(value);

        let result = typeof value == "bigint" ? value : BigInt(value);
        values.forEach(v => result -= (typeof v == "bigint" ? v : BigInt(v)));
        return result;
    }

    /**
     * 乘法
     * @returns 
     */
    public static mul(value: bigintType, ...values: bigintType[]): bigint {
        if (values.length <= 0) return BigInt(value);

        let result = typeof value == "bigint" ? value : BigInt(value);
        values.forEach(v => result *= (typeof v == "bigint" ? v : BigInt(v)));
        return result;
    }

    /**
     * 除法
     * @param values 
     * @returns 
     */
    public static div(value: bigintType, ...values: bigintType[]): bigint {
        if (values.length <= 0) return BigInt(value);

        let result = typeof value == "bigint" ? value : BigInt(value);
        values.forEach(v => result /= (typeof v == "bigint" ? v : BigInt(v)));
        return result;
    }

    /**
     * 
     * @param money 
     * @link NumberUtils.formatCurrency
     * @returns 
     */
    public static format(money: bigintType): string {
        return NumberUtils.formatCurrency(money);
    }
}
