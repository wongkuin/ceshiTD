
type CurrencyUnits = {
    /**最小值 */
    unit: number,
    /**显示单位 */
    name: string,
    /**小数位 */
    decimals?: number
}[];

const defaultCurrencyUnits: CurrencyUnits = [
    { unit: 1e4, name: '万', decimals: 2 }
    , { unit: 1e8, name: '亿', decimals: 2 }
    , { unit: 1e12, name: '兆', decimals: 2 }
    , { unit: 1e16, name: '京', decimals: 2 }
    , { unit: 1e20, name: '垓', decimals: 2 }
    , { unit: 1e24, name: '秭', decimals: 2 }
    , { unit: 1e28, name: '壤', decimals: 2 }
    , { unit: 1e32, name: '沟', decimals: 2 }
    , { unit: 1e36, name: '涧', decimals: 2 }
    , { unit: 1e40, name: '正', decimals: 2 }
    , { unit: 1e44, name: '载', decimals: 2 }
    , { unit: 1e48, name: '极', decimals: 2 }
    , { unit: 1e52, name: '恒河沙', decimals: 2 }
    , { unit: 1e56, name: '阿僧祇', decimals: 2 }
    , { unit: 1e60, name: '那由他', decimals: 2 }
    , { unit: 1e64, name: '无量数', decimals: 2 }
    , { unit: 1e68, name: '不可数', decimals: 2 }
    , { unit: 1e72, name: '大数', decimals: 2 }
    , { unit: 1e76, name: '全仕详', decimals: 2 }
    , { unit: 1e80, name: '古戈尔', decimals: 2 }
];

export default class NumberUtils {

    /**
     * 
     * @param money 
     * @param units 
     * @returns 
     */
    public static formatCurrency(money: number | string | bigint, units: CurrencyUnits = defaultCurrencyUnits): string {
        if (typeof money == "undefined") return "";
        let bigMoney = (typeof money == "number" || typeof money == "string") ? BigInt(Math.floor(Number(money))) : money;

        const sign = bigMoney < 0 ? "-" : "";
        bigMoney = bigMoney < 0 ? -bigMoney : bigMoney;

        let mod = "";

        let info: { unit: number, name: string, decimals?: number } = null;
        let max = 0;
        units.forEach(v => {
            if (bigMoney >= v.unit && v.unit >= max) {
                info = v;
                max = v.unit;
            }
        });

        if (!info || bigMoney < info?.unit) return sign + bigMoney;

        const unit = BigInt(Math.max(info.unit, 1));
        const value = bigMoney / unit;
        bigMoney -= value * unit;

        let  decimals = info.decimals ?? 0;
        if(value.toString().length>=4){
            decimals = 0;
        }if(value.toString().length==3){
            decimals = 1;
        }if(value.toString().length==2){
            decimals = 2;
        }
        if (decimals > 0) {
            const modValue = Math.floor(Number(bigMoney) / Number(unit) * Math.pow(10, decimals));
            if (modValue > 0) mod = "." + modValue;
        }


        return sign + value + mod + info.name;
    }

    /**
     * 给一个天数，返回 年月日
     * @param day 
     * @returns 
     */
    public static dayToDate(day: number) {

        const monthDays = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];

        const year = Math.floor(day / 360);


        day -= year * 360;

        if (day == 0) {
            const result = { year: year - 1, month: 12, day: 30 };
            return result;
        }

        let sumDay = 0;
        let monthIndex = 0;

        for (let i = 0; i < monthDays.length; i++) {
            sumDay += monthDays[i];
            if (sumDay > day) {
                monthIndex = i;
                sumDay -= monthDays[i];
                break;
            }
        }
        const result = { year: year, month: monthIndex + 1, day: day - sumDay };

        if (result.day <= 0) {
            result.month = monthIndex;
            result.day = monthDays[monthIndex - 1];
        }

        return result;
    }

    /**
     * 是否为每月的最后一天
     * @param day 天数
     * @returns 
     */
    public static isMonthLastDay(day: number) {
        const monthDays = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
        const date = NumberUtils.dayToDate(day);
        return date.day >= monthDays[date.month - 1];
    }

    /**
     * 格式化
     * @param value 秒
     * @param format 支持的格式-时分秒 hh:mm:ss
     * @returns 
     */
    public static formatSeconds(value: number, format = "mm:ss"): string {
        const h = Math.floor(value / 3600).toString();
        const m = Math.floor(value / 60 % 60).toString();
        const s = Math.floor(value % 60).toString();

        const formatMap: { [key: string]: any } = {
            h: h,
            hh: h.padStart(2, "0"),

            m: m,
            mm: m.padStart(2, "0"),

            s: s,
            ss: s.padStart(2, "0")
        };

        return format.replace(/hh|h|mm|m|ss|s/g, (match) => formatMap[match]);
    }

    /**
     * 获取小数位个数
     */
    public static getFloatBit(num: number): number {
        let bit = 0;
        let floatNums = num.toString().split('.')[1];
        if (floatNums) bit = floatNums.length;
        return bit;
    }

    /**
     * /根据传入的bit保留多少位小数且不用0填充
     * @param num 
     * @param bit 
     * @returns 
     */
    public static fixNum(num: number, bit: number): string {
        let floatNums = NumberUtils.getFloatBit(num);
        if (bit < floatNums) {
            let t = Math.pow(10, bit);
            num = Math.floor(num * t) / t;
            return num.toString();
        }
        return num.toString();
    }

    private static ChinesWords = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    private static ChinesUnit = ["", '十', '百', '千', '万', '亿', '十', '百', '千'];
    /**
     * 中文数字
     * @param num 
     * @returns 
     */
    public static formatChinesNum(num: number): string {
        if (NumberUtils.ChinesWords[num])
            return NumberUtils.ChinesWords[num];

        else if (num > 10 && num < 20) {
            let numStr = num.toString();
            let n = numStr.substring(1, 2);
            let result = NumberUtils.ChinesUnit[1] + NumberUtils.ChinesWords[n];
            return result;
        }
        else if (num > 10) {
            let result = "";
            let numStr = num.toString();
            for (var i = 0; i < numStr.length; ++i) {
                let n = numStr.substring(i, i + 1);
                let m = numStr.length - i - 1;
                result += NumberUtils.ChinesWords[n] + NumberUtils.ChinesUnit[m];
            }
            return result;
        }
        else return "零";
    }


}