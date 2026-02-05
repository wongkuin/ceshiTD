

/**游戏参数定义 */
export default class GameDefine {

    /**--------------------广告相关开始---------------------------- */
    public static iswuguang: boolean = true;
    public static guanggaotime: number = 0;
    public static max_guanggao_time = 800;
    /**--------------------广告相关结束---------------------------- */

    /**可用于初始化部分由系统表提供的数据 */
    public static initData() {

    }

}

export type AttrInfo = {
    attrType: number; //属性类型
    attrValue: number; //属性值
}

export enum CarrierProperty {
    HP = 1,	//HP
    Damage = 2,	//伤害减免
    BulletFill = 3,	//弹药填充
    Lucky = 4,	//物资出现概率
    MetalEffect = 5,	//金属获取效率
    FootEffect = 6,	//食物获取效率
    PartEffect = 7,	//零件获取效率
    ExportEffect = 8,	//探险出现效率
    DamageAdd = 9,	//伤害追加
    FullAdd = 10,	//填充追加
    Defense = 11, // 防御
    DamageMore = 12, // 伤害提升


}