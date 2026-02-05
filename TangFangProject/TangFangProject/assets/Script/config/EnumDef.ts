/**
 * Auto-generated Enum Definitions
 * This file contains all enums generated from Excel sheets
 */
/**
 * Auto-generated from Excel - Enum: eGameAttr
 * 属性枚举
 */
export enum eGameAttr {
    /** 生命为0就会被消灭 */
    HP = 1,
    /** 抵抗生命伤害 */
    SP = 2,
    /** 提高造成的伤害 */
    attack = 3,
    /** 降低受到的伤害 */
    def = 4,
    /** 有概率让攻击导致的伤害为0 */
    block = 5,
    aoeHurtCorrect = 6,
    /** AOE暴击概率 */
    aoeCriticalProbability = 7,
    /** AOE暴击伤害 */
    aoeCriticalDam = 8,
    hitHurtCorrect = 9,
    /** 命中暴击概率 */
    hitCriticalProbability = 10,
    /** 命中暴击伤害 */
    hitCriticalDam = 11,
    damageCorrect = 12,
    /** 每秒经过多少坐标距离 */
    monMove = 13,
    /** 每秒经过多少个格子 */
    heroMove = 14,
    maxHP = 15,
    maxSP = 16,
    /** 需要多少抵达点数，才能激活效果 */
    ammoCost = 17,
    /** 每次抵达，提供多少抵达点数 */
    load = 18,
    /** 激活后，需要多少毫秒才能再次使用 */
    cd = 19,
    atkMul = 101,
    maxHPMul = 102,
    moveMul = 103,
    maxSPMul = 104,
}
