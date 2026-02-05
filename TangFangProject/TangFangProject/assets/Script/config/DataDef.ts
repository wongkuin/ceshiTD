import { LocalizedEntity } from './LocalizedEntity';

/** Auto-generated from Excel files **/

/** BUFFbuff.xlsx **/
export class BuffData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 备注 **/
	name: string;
	/** 命中率 **/
	rate: number;
	/** 持续方式 **/
	durationType: number;
	/** 持续时间 **/
	duration: number;
	/** buff组ID **/
	buffGroup: number[];
	/** 覆盖规则 **/
	overlayType: number;
	/** 叠加上限 **/
	stacking: number;
	/** 间隔伤害1 **/
	dot: number;
	/** 间隔伤害2 **/
	dot2: number;
	/** 间隔伤害3 **/
	dot3: number[];
	/** 间隔伤害方式 **/
	dotType: number;
	/** 间隔时间 **/
	dotTime: number;
	/** 移动速度 **/
	moveMul: number;
	/** 禁止移动 **/
	cold: number;
	/** 防御系数 **/
	def: number;
	/** 击退距离 **/
	move: number;
	/** 吸引距离 **/
	reMove: number;
	/** 禁止攻击 **/
	silent: number;
	/** 画面表现 **/
	visual: string;
	/** 目标变色 **/
	colour: string;
	/** 表现方式 **/
	medium: number;
	/** 按百分比增加攻击 **/
	atkMul: number;
	/** 按百分比修改攻击间隔 **/
	intervalPer: number;
	/** 提高追加伤害 **/
	firePower2: number;
	/** 提高命中暴击概率 **/
	hitCritical1: number;
	/** 提高命中暴击伤害 **/
	hitCritical2: number;
	/** 提高AOE暴击概率 **/
	aoeCritical1: number;
	/** 提高AOE暴击伤害 **/
	aoeCritical2: number;
	/** 能否对英雄生效 **/
	hero: number;
	/** 亡语BUFF **/
	addBuff: number[];
	/** 恢复HP **/
	hpRes: number[];
	/** 恢复SP **/
	spRes: number[];
	/** 双击 **/
	double: number;
	/** TIPS **/
	tips: string;
	/** 是眩晕 **/
	dizz: number;
	/** 停止动画 **/
	stop: number;
	/** 格子状态 **/
	cell: number;
	/** 格子附加状态 **/
	cellGit: number[];
	/** 嘲讽 **/
	ridicule: number;
	/** 击杀回血 **/
	killResHp: number;
	/** 召唤配置 **/
	deadSummon: number[];
	/** 碰撞召唤配置 **/
	hitSummon: number[];
}

/** B宝物升级relicsUp.xlsx **/
export class RelicsUpData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 等级 **/
	id: number;
	/** 法宝养成ID1 **/
	relics1: number;
	/** 被动技能1 **/
	attribute1: number[];
	/** 升级所需1 **/
	item1: number;
	/** 升级消耗1 **/
	cost1: number;
	/** 法宝养成ID2 **/
	relics2: number;
	/** 被动技能2 **/
	attribute2: number[];
	/** 升级所需2 **/
	item2: number;
	/** 升级消耗2 **/
	cost2: number;
	/** 法宝养成ID3 **/
	relics3: number;
	/** 被动技能3 **/
	attribute3: number[];
	/** 升级所需3 **/
	item3: number;
	/** 升级消耗3 **/
	cost3: number;
	/** 法宝养成ID4 **/
	relics4: number;
	/** 被动技能4 **/
	attribute4: number[];
	/** 升级所需4 **/
	item4: number;
	/** 升级消耗4 **/
	cost4: number;
	/** 法宝养成ID5 **/
	relics5: number;
	/** 被动技能5 **/
	attribute5: number[];
	/** 升级所需5 **/
	item5: number;
	/** 升级消耗5 **/
	cost5: number;
	/** 法宝养成ID6 **/
	relics6: number;
	/** 被动技能6 **/
	attribute6: number[];
	/** 升级所需6 **/
	item6: number;
	/** 升级消耗6 **/
	cost6: number;
	/** 法宝养成ID7 **/
	relics7: number;
	/** 被动技能7 **/
	attribute7: number[];
	/** 升级所需7 **/
	item7: number;
	/** 升级消耗7 **/
	cost7: number;
	/** 法宝养成ID8 **/
	relics8: number;
	/** 被动技能8 **/
	attribute8: number[];
	/** 升级所需8 **/
	item8: number;
	/** 升级消耗8 **/
	cost8: number;
	/** 法宝养成ID9 **/
	relics9: number;
	/** 被动技能9 **/
	attribute9: number[];
	/** 升级所需9 **/
	item9: number;
	/** 升级消耗9 **/
	cost9: number;
	/** 法宝养成ID10 **/
	relics10: number;
	/** 被动技能0 **/
	attribute10: number[];
	/** 升级所需10 **/
	item10: number;
	/** 升级消耗10 **/
	cost10: number;
	/** 法宝养成ID11 **/
	relics11: number;
	/** 被动技能1 **/
	attribute11: number[];
	/** 升级所需11 **/
	item11: number;
	/** 升级消耗11 **/
	cost11: number;
	/** 法宝养成ID12 **/
	relics12: number;
	/** 被动技能2 **/
	attribute12: number[];
	/** 升级所需12 **/
	item12: number;
	/** 升级消耗12 **/
	cost12: number;
}

/** B宝物大类relicsCategory.xlsx **/
export class RelicsCategoryData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** 隐藏 **/
	off: number;
	/** 装备品质 **/
	relicscCharacter: number;
	/** 排序编号 **/
	sort: number;
	/** ICON **/
	img: string;
	/** 升级养成ID **/
	relicscUp: number;
	/** 最大等级 **/
	maxLv: number;
	/** 说明文本 **/
	note: string;
}

/** B波次表waveTimes.xlsx **/
export class WaveTimesData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 波次ID **/
	id: number;
	/** 怪物ID **/
	monsterID: number[];
	/** 怪物数量 **/
	monsterCount: number[];
	/** 刷新位置 **/
	loc1: number[];
	/** 刷新间隔 **/
	intervalTime: number[];
	/** 对齐方式 **/
	loc2: number[];
	/** 出怪时间 **/
	loc3: number[];
	/** HP乘数 **/
	hp: number;
	/** 数量上限 **/
	limit1: number;
	/** 恢复刷怪 **/
	limit2: number;
}

/** B被动技能passiveSkill.xlsx **/
export class PassiveSkillData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 描述 **/
	note: string;
	/** 怪物移速修正 **/
	monSpeed: number;
	/** 玩家攻击修正 **/
	heroAtkMul: number;
	/** 暴率修正 **/
	CriticalProbabilityAdd: number;
	/** 爆伤修正 **/
	CriticalDamAdd: number;
	/** 百分比修改最大HP **/
	maxHPMul: number;
	/** 按数值修改HP **/
	maxHPAdd: number;
	/** 百分比提高SP **/
	SPMul: number;
	/** 按数值修改SP **/
	SPAdd: number;
	/** 武器射速修正 **/
	cdChange: number;
	/** 精英增伤 **/
	bossKill: number;
	/** 英雄移速修正 **/
	heroSpeed: number;
	/** 格挡修正 **/
	block: number;
	/** 随机掉元宝 **/
	drop: number[];
}

/** C常数kv.xlsx **/
export class KvData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** id **/
	id: number;
	/** 值 **/
	val: string;
}

/** C抽奖-主库drawMain.xlsx **/
export class DrawMainData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 主库ID **/
	mainDrawID: number;
	/** 子库ID **/
	subDrawID: number;
	/** 权重 **/
	weight: number;
}

/** C抽奖-子库drawSub.xlsx **/
export class DrawSubData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 子库ID **/
	subDrawID: number;
	/** 道具ID **/
	itemId: number;
	/** 数量 **/
	itemValue: number;
	/** 权重 **/
	weight: number;
	/** 修正条件 **/
	condition: number[];
	/** 权重修正 **/
	weight2: number;
	/** 广告概率 **/
	adv: number;
	/** 道具类型 **/
	type: number;
	/** 权重补偿 **/
	weight3: number;
	/** 世界boss补偿 **/
	weight4: number;
	/** 组队补偿 **/
	weight5: number;
}

/** D地图路径mapConfig.xlsx **/
export class MapConfigData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 块配置 **/
	block: number[];
	/** 路径配置 **/
	path: number[];
	/** 移动方向 **/
	dir: number;
	/** 循环方式 **/
	circulate: number;
	/** 最大棍子数 **/
	stickMaxNum: number;
}

/** D道具表itemBase.xlsx **/
export class ItemBaseData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** 道具类型 **/
	type: number;
	/** 参数 **/
	typeArgs: number;
	/** 参数2 **/
	typeArgs2: number[];
	/** 投放类型 **/
	putType: number;
	/** ICON **/
	img: string;
	/** 背景颜色 **/
	colour: number;
	/** 道具描述 **/
	describe: string;
	/** 元宝价格 **/
	cost1: number;
	/** 灵石价格 **/
	cost2: number;
}

/** F发射包shootBag.xlsx **/
export class ShootBagData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 子弹ID **/
	bulletIds: number[];
	/** 波次间隔 **/
	interval: number[];
	/** 每波索敌方式 **/
	enemySearch: number[];
	/** 每波子弹数量 **/
	num: number[];
	/** 每波子弹夹角 **/
	angle: number[];
	/** 伤害许可 **/
	tgt: number[];
	/** 技能ID **/
	skill: number[];
	/** 索敌失败处理 **/
	enemySearchFail: number;
}

/** G关卡表pass.xlsx **/
export class PassData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 关卡ID **/
	id: number;
	/** 关卡类型 **/
	type: number;
	/** 关卡名字 **/
	name: string;
	/** 关卡章节 **/
	chapter: number;
	/** 下一关的关卡ID **/
	next: number;
	/** 封面背景 **/
	menu: string;
	/** 封面天气 **/
	weather3: number;
	/** 封面雾气 **/
	weather4: number;
	/** 白天夜晚 **/
	weather5: number;
	/** 关卡格子 **/
	battleField: number;
	/** 关卡地面 **/
	secne1: string;
	/** HP系数 **/
	hpMul: number;
	/** 攻击系数 **/
	atkMul: number;
	/** 移动系数 **/
	moveMul: number;
	/** 复活次数 **/
	revive: number;
	/** 波次计划 **/
	waves: number[];
	/** 天气计划 **/
	weather1: number[];
	/** 雾气计划 **/
	weather2: number[];
	/** 波次HP修正 **/
	wavesHP: number[];
	/** 元宝系数 **/
	item1: number;
	/** 灵石系数 **/
	item2: number;
	/** 元宝奖励 **/
	bouns1: number;
	/** 灵石奖励 **/
	bouns2: number;
	/** 初始铜钱 **/
	startMoney: number;
	/** BOSS血条 **/
	BOSS: number;
	/** 默认抽道具配置 **/
	shop1: number[];
	/** 手动抽道具配置 **/
	shop2: number[];
	/** 第一波首次抽取配置 **/
	shop3: number[];
	/** 回合铜币上限 **/
	dropMoney: number;
	/** 广告3级武器 **/
	advLv3: number;
	/** 关卡内掉落 **/
	drop: number[];
	/** 关卡内掉落2 **/
	drop2: number[];
	/** 挂机碎片奖励 **/
	drop3: number[];
	/** 挂机碎片展示 **/
	drop3Vi: number[];
	/** 首通奖励 **/
	fristBouns: number[];
	/** 关卡提示 **/
	noteTitle: string;
	/** 全都要次数 **/
	needAll: number;
	/** 初始棍子列表 **/
	stickList: number[];
	/** 关卡体力消耗 **/
	physicCost: number;
}

/** G广告铜钱getMoney.xlsx **/
export class GetMoneyData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 波次 **/
	id: number;
	/** 道具ID **/
	item: number;
	/** 数量 **/
	num: number;
}

/** G怪物monster.xlsx **/
export class MonsterData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** 类型 **/
	type: number;
	/** 类型 **/
	icon: number;
	/** 标签 **/
	tag: number[];
	/** 美术资源 **/
	img: string;
	/** 显示层级 **/
	level: number;
	/** 索敌方式 **/
	enemySearch: number;
	/** 发射包 **/
	shootBagId: number;
	/** 攻击距离 **/
	atkDist: number;
	/** 攻击间隔 **/
	atkInterval: number;
	/** 首次攻击时间 **/
	firstAtkInterval: number;
	/** 基础移动 **/
	moveSpeed: number;
	/** 基础HP **/
	hp: number;
	/** HP权重 **/
	hpWeight: number;
	/** 基础攻击 **/
	atk: number;
	/** 攻击时是否停止移动 **/
	atkMove: number;
	/** 死亡SE **/
	deathSe: string;
	/** 尺寸缩放 **/
	scale: number;
	/** 刷新最小距离 **/
	distanceM: number;
	/** 刷新最大距离 **/
	distanceH: number;
	/** 走位距离 **/
	fristRang: number;
	/** 游走半径 **/
	roamRang: number;
	/** 走位策略 **/
	strategy: number;
	/** 铜币 **/
	money: number;
	/** BUFF效果缩放 **/
	buffEff: number;
	/** 死亡发射 **/
	dead: number[];
	/** 死亡事件 **/
	deadEvent: number[];
	/** 出生BUFF **/
	bornBuff: number[];
	/** 出生发射 **/
	born: number[];
	/** 光环显示 **/
	haloScale: number;
	/** 怪物类型 **/
	raceType: number;
	/** 移动方式 **/
	moveType: number;
	/** 针对武器 **/
	atTpye2: string;
	/** 被攻击触发buff **/
	attckedBuff: number[];
}

/** G怪物路径monsterPath.xlsx **/
export class MonsterPathData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 路径配置 **/
	monsterPath: number[];
	/** 移动方向 **/
	direction: number;
	/** 循环方式 **/
	circulate: number;
}

/** H活动入口表activeEntrance.xlsx **/
export class ActiveEntranceData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** id（排序用） **/
	id: number;
	/** 活动名称 **/
	name: string;
	/** 活动id **/
	active: number;
	/** 解锁条件类型 1-关卡 **/
	unlock_type: number;
	/** 解锁条件值 **/
	unlock_value: number;
	/** 宣传图 **/
	img: string;
	/** 说明文本（富文本） **/
	rich_text: string;
	/** 奖励展示列表 [物品id，数量，物品id，数量……] **/
	item_list: number[];
}

/** H活动排行榜表activeRank.xlsx **/
export class ActiveRankData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** id **/
	id: number;
	/** 活动类型 1-世界BOSS **/
	active: number;
	/** 排名min **/
	rankMin: number;
	/** 排名max **/
	rankMax: number;
	/** 奖励列表[物品id，数量] **/
	itemList: number[];
}

/** M每日礼包DailyGiftPack.xlsx **/
export class DailyGiftPackData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 广告需求 **/
	cost: number;
	/** 奖励 **/
	bouns: number[];
}

/** Q七日签到Sign.xlsx **/
export class SignData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 批次 **/
	group: number;
	/** 天数 **/
	day: number;
	/** 奖励配置 **/
	bouns: number[];
	/** 奖励配置 **/
	bouns2: number[];
}

/** Q强化效果powUp.xlsx **/
export class PowUpData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** 描述 **/
	note: string;
	/** ICON **/
	icon: string;
	/** 颜色 **/
	colour: number;
	/** 星级 **/
	star: number;
	/** 依赖强化ID **/
	require4: number[];
	/** 唯一 **/
	only: number;
	/** 怪物移速修正 **/
	monSpeed: number;
	/** 英雄移速修正 **/
	heroSpeed: number;
	/** 怪物攻击修正 **/
	monAtk: number;
	/** 玩家攻击修正 **/
	heroAtkMul: number;
	/** 暴率修正 **/
	CriticalProbabilityAdd: number;
	/** 爆伤修正 **/
	CriticalDamAdd: number;
	/** 格挡修正 **/
	block: number;
	/** 百分比修改最大HP **/
	maxHPMul: number;
	/** 按数值修改HP **/
	HPAdd: number;
	/** 每10秒恢复HP **/
	HPRes: number;
	/** 百分比获得SP **/
	SPMul: number;
	/** 获得铜钱 **/
	money: number;
	/** 玩家防御 **/
	heroDef: number;
}

/** Q气候表weather.xlsx **/
export class WeatherData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 类型 **/
	type: number;
	/** 雾的资源 **/
	res1: string;
	/** 闪电的资源 **/
	res2: string;
	/** 下雨的资源 **/
	res3: string;
}

/** S刷新消耗refreshCost.xlsx **/
export class RefreshCostData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 次数 **/
	id: number;
	/** 道具ID **/
	item: number;
	/** 数量 **/
	num: number;
}

/** S商店宝箱表shopBox.xlsx **/
export class ShopBoxData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 等级 **/
	id: number;
	/** 经验值 **/
	exp: number;
	/** 1号礼包固定奖励 **/
	bounsA1: number[];
	/** 1号礼包随机奖励 **/
	bounsB1: number[];
	/** 1号礼包预览 **/
	preview1: number[];
	/** 2号礼包固定奖励 **/
	bounsA2: number[];
	/** 2号礼包随机奖励 **/
	bounsB2: number[];
	/** 2号礼包预览 **/
	preview2: number[];
}

/** S商店表shop.xlsx **/
export class ShopData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** id **/
	id: number;
	/** 值 **/
	val: string;
}

/** S神器礼包artifactGiftPack.xlsx **/
export class ArtifactGiftPackData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 广告需求 **/
	cost: number;
	/** 天数 **/
	day: number;
	/** 奖励预览 **/
	preview: number[];
	/** 固定奖励 **/
	bouns1: number[];
	/** 随机奖励 **/
	bouns2: number[];
	/** 解锁条件 **/
	unlock: number;
}

/** T天赋talent.xlsx **/
export class TalentData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 等级 **/
	lv: number;
	/** 生命加成 **/
	hp: number;
	/** 升级消耗 **/
	costHp: number[];
	/** 攻击加成 **/
	atk: number[];
	/** 升级消耗 **/
	costAtk: number[];
	/** 护盾提高 **/
	sp: number;
	/** 升级消耗 **/
	costSp: number[];
	/** 突破消耗 **/
	costBreak: number[];
	/** 突破层级的名字 **/
	breakName: string;
	/** 突破层级等级 **/
	breakLv: number;
}

/** T通关奖励clearanceRewards.xlsx **/
export class ClearanceRewardsData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 解锁条件 **/
	unlock: number;
	/** 奖励配置 **/
	bouns: number[];
	/** 对应装备 **/
	preview: number;
	/** 地图配置 **/
	animation: string;
	/** 播放特效 **/
	special: string;
}

/** X雪的新娘伤害奖励snowBossDamBouns.xlsx **/
export class SnowBossDamBounsData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 伤害值 **/
	dam: number;
	/** 奖励预览 **/
	preview: number[];
	/** 固定奖励 **/
	bouns1: number[];
	/** 随机奖励 **/
	bouns2: number[];
}

/** X雪的新娘表snowBoss.xlsx **/
export class SnowBossData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 参数id **/
	id: number;
	/** 参数 **/
	val: string;
}

/** Y引导表.xlsx **/
export class GuideData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 备注 **/
	desc: string;
	/** 分组提示 **/
	typeTips: string;
	/** 本组结束点 **/
	end: number;
	/** 分组 **/
	type: number;
	/** 事件参数 **/
	cname: string;
	/** 提示 **/
	tips: string;
	/** 是否可重复触发 **/
	repeat: number;
}

/** Y英雄hero.xlsx **/
export class HeroData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** ICON美术资源 **/
	res: string;
	/** 颜色 **/
	colour: number;
	/** 基础HP **/
	maxHP: number;
	/** 基础速度 **/
	move: number;
	/** 脚步声 **/
	foot: string[];
	/** 主动技能 **/
	skill1: number;
	/** 被动技能 **/
	skill2: number[];
	/** 广告解锁 **/
	adv: number;
	/** 描述1 **/
	note1: string;
	/** 描述2 **/
	note2: string;
	/** 解锁描述 **/
	note3: string;
	/** 最大等级 **/
	maxLevel: number;
	/** 增加层数 **/
	addAmm: number;
	/** 价格 **/
	cost: number;
	/** 绑定装备id **/
	equipID: number;
}

/** Z主动技能actSkill.xlsx **/
export class ActSkillData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 技能ID **/
	id: number;
	/** ICON **/
	icon: string;
	/** 名字 **/
	name: string;
	/** 技能CD时间 **/
	cd: number;
	/** 发射包ID **/
	shoot: number;
	/** 发射次数 **/
	shootFrequency: number;
	/** 发射间隔 **/
	shootCD: number;
	/** 攻击系数 **/
	att: number;
	/** 描述 **/
	note: string;
	/** 施法动作 **/
	act: string;
}

/** Z召唤兽summon.xlsx **/
export class SummonData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 阵营 **/
	camp: number;
	/** 怪物ID **/
	monID: number;
	/** 受击方式 **/
	hitType: number;
	/** HP计算方式 **/
	hpType: number;
	/** 持续时间 **/
	time: number;
	/** 跨波次 **/
	overWave: number;
	/** 索敌范围 **/
	range: number;
	/** 移动方式 **/
	moveType: number;
	/** 攻击力 **/
	attType: number;
	/** 攻击倍率 **/
	attMul: number;
}

/** Z在线奖励onlineBouns.xlsx **/
export class OnlineBounsData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 此项所需时间 **/
	time: number;
	/** 奖励 **/
	bouns: number[];
}

/** Z子弹技能bulletSkill.xlsx **/
export class BulletSkillData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 备注 **/
	name: string;
	/** 发射包 **/
	shootBagId: number;
	/** BUFF **/
	buffId: number;
	/** 怪物波次 **/
	waveId: number;
}

/** Z子弹表bullet.xlsx **/
export class BulletData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 备注 **/
	name: string;
	/** 子弹类型 **/
	type: number;
	/** 子弹外观 **/
	img: string;
	/** 子弹外观缩放比 **/
	scale: number;
	/** 子弹朝向 **/
	dir: number;
	/** 子弹自身旋转速度 **/
	round: number;
	/** 宽度 **/
	width: number;
	/** 子弹环绕半径 **/
	surroundingRadius: number;
	/** 子弹伤害修正 **/
	damageCorrection: number;
	/** 角度离散 **/
	discrete: number;
	/** 反弹类型 **/
	bouncesType: number;
	/** 命中次数 **/
	hitTimes: number;
	/** 子弹速度 **/
	speed: number;
	/** 子弹寿命 **/
	lifeTime: number;
	/** 命中伤害百分比 **/
	hitHurtPer: number;
	/** 命中暴击率 **/
	hitCritical1: number;
	/** 命中暴击伤害倍率 **/
	hitCritical2: number;
	/** 命中激活技能 **/
	skillId1: number;
	/** AOE类型 **/
	aoeType: number;
	/** AOE范围 **/
	aoeRadius: number;
	/** AOE伤害百分比 **/
	aoeHurtPer: number;
	/** AOE暴击伤害倍率 **/
	aoeCritical2: number;
	/** AOE暴击率 **/
	aoeCritical1: number;
	/** AOE激活技能 **/
	skillId2: number;
	/** AOE持续时间 **/
	aoeTime: number;
	/** AOE命中间隔 **/
	aoeInterval: number;
	/** 可抵消 **/
	offset: number;
	/** 震动规则 **/
	vibrate: number[];
	/** 标签修正 **/
	tag: number[];
}

/** Z子弹资源bulltetSpEff.xlsx **/
export class BulltetSpEffData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 发射 **/
	spLaunch: string;
	/** 发射层级 **/
	spLaunchLv: number;
	/** 飞行 **/
	spMain: string;
	/** 命中和爆炸 **/
	spHit: string;
	/** 区域效果 **/
	spZone: string;
	/** 发射闪屏 **/
	flashL: number[];
	/** 命中闪屏 **/
	flashH: number;
	/** 发射屏震 **/
	vibrateL: number[];
	/** 命中屏震 **/
	vibrateH: number;
	/** 发射SE **/
	seLaunch: string;
	/** 命中SE **/
	seHit: string;
	/** 命中效果缩放 **/
	spHitVal: number;
	/** 命中效果播放方式 **/
	hitType: number;
	/** 区域效果缩放 **/
	spZoneVal: number;
}

/** Z组队副本参数teamCopyKv.xlsx **/
export class TeamCopyKvData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 参数id **/
	id: number;
	/** 参数 **/
	val: string;
}

/** Z组队副本每日轮换teamCopyDaily.xlsx **/
export class TeamCopyDailyData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 日期 **/
	id: number;
	/** 波次和对应路径id （起始波，路径id） **/
	wavePath: string;
	/** 武器加成组 （武器id，伤害加成百分比，品质框） **/
	weaponAdd: string;
}

/** Z装备升级wapenUp.xlsx **/
export class WapenUpData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 装备大类ID **/
	wapenTable: number;
	/** 基础攻击 **/
	baseAtk: number;
	/** 升级成长 **/
	growthAtk: number;
	/** 对应碎片ID **/
	item: number;
	/** 装备消耗ID **/
	wapenCostId: number;
	/** 碎片倍率 **/
	cost1: number;
	/** 元宝倍率 **/
	cost2: number;
	/** 技能配置 **/
	equipSkillEx: number[];
}

/** Z装备合成等级wapenFusion.xlsx **/
export class WapenFusionData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** 装备大类ID **/
	typeId: number;
	/** 装备类型 **/
	wapenType: number;
	/** ICON资源 **/
	animation: string;
	/** 索敌距离 **/
	fireDistance: number;
	/** 索敌方式 **/
	enemySearch: number;
	/** 射击间隔 **/
	interval: number;
	/** 触发需求 **/
	amm: number;
	/** 冷却时间 **/
	cd: number;
	/** 发射包ID **/
	shootBagId: number[];
	/** 索敌半径 **/
	shootRang: number;
	/** 攻击倍率 **/
	firePower: number;
	/** 发射包ID2 **/
	shootBagId2: number[];
	/** 攻击倍率2 **/
	firePower2: number;
	/** 合成所需 **/
	fusionInput: number;
	/** 合成结果 **/
	fusionOutput: number;
	/** 广告合成 **/
	adv: number;
	/** 合成门槛 **/
	fusionStage: number;
	/** 合成等级 **/
	level: number;
	/** 价格 **/
	cost: number;
	/** 出售价格 **/
	sell: number;
	/** 显示角标 **/
	lvIcon: number;
	/** 格子文字 **/
	note2: string;
	/** 描述 **/
	note: string;
	/** AI合成分 **/
	aiP1: number;
	/** AI叠加分 **/
	aiP2: number;
	/** AI基础分 **/
	aiP3: number;
	/** AI首发分 **/
	aiP4: number;
	/** 神装名字 **/
	lv5Name: string;
}

/** Z装备大类wapenTable.xlsx **/
export class WapenTableData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 名字 **/
	name: string;
	/** 是否开放 **/
	open: number;
	/** 装备类型 **/
	wapenType: number;
	/** 排序编号 **/
	sort: number;
	/** ICON **/
	img: string;
	/** 对应碎片 **/
	item: number;
	/** 颜色 **/
	colour: number;
	/** 冷却时间 **/
	coldDown: number;
	/** 触发圈数 **/
	amm: number;
	/** 速度 **/
	speed: string;
	/** 升级养成ID **/
	wapenUp: number;
	/** 关卡解锁 **/
	stageUnlock: number;
	/** 解锁消耗 **/
	unlock: number[];
	/** 最高等级 **/
	maxLv: number;
	/** 攻击类型 **/
	atType: number;
	/** 伤害加成 **/
	enDam: string;
	/** 描述文本 **/
	note: string;
}

/** Z装备技能equipSkill.xlsx **/
export class EquipSkillData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** 备注 **/
	name: string;
	/** 强化3选1 **/
	powUp: number[];
	/** BUFF目标 **/
	tgt: number;
	/** BUFF **/
	buffId: number;
	/** 技能动画 **/
	animation: string;
	/** 动画起点 **/
	animationStart: number;
	/** 获得铜钱 **/
	money: number;
	/** 反向 **/
	return: number;
	/** 双击 **/
	click: number;
	/** 傀儡人 **/
	fakeHero: number;
	/** 召唤配置 **/
	summon: number[];
}

/** Z装备技能扩展equipSkillEx.xlsx **/
export class EquipSkillExData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** ID **/
	id: number;
	/** ICON **/
	icon: string;
	/** ICON文本 **/
	note: string;
	/** ICON颜色 **/
	colour: string;
	/** 描述文本 **/
	note2: string;
	/** 对应等级 **/
	lv: number;
	/** 可解锁5级合成 **/
	unlock: number;
	/** BUFF生效对象 **/
	buffTgt: number[];
	/** BUFF ID **/
	buff: number[];
	/** 发射包ID **/
	shootBag: number[];
	/** 修改方式 **/
	shootBagType1: number;
	/** 子弹ID **/
	shootBagValue1: number[];
	/** 修改方式 **/
	shootBagType2: number;
	/** 波次间隔 **/
	shootBagValue2: number[];
	/** 修改方式 **/
	shootBagType3: number;
	/** 每波索敌方式 **/
	shootBagValue3: number[];
	/** 修改方式 **/
	shootBagType4: number;
	/** 每波子弹数量 **/
	shootBagValue4: number[];
	/** 修改方式 **/
	shootBagType5: number;
	/** 每波子弹夹角 **/
	shootBagValue5: number[];
	/** 修改方式 **/
	shootBagType6: number;
	/** 伤害许可 **/
	shootBagValue6: number[];
	/** 修改方式 **/
	shootBagType7: number;
	/** 技能ID **/
	shootBagValue7: number[];
	/** 子弹ID **/
	bullet: number[];
	/** 修改方式 **/
	bulletType1: number;
	/** 子弹外观缩放比 **/
	bulletValue1: number[];
	/** 修改方式 **/
	bulletType2: number;
	/** 子弹伤害修正 **/
	bulletValue2: number[];
	/** 修改方式 **/
	bulletType3: number;
	/** 反弹类型 **/
	bulletValue3: number[];
	/** 修改方式 **/
	bulletType4: number;
	/** 命中次数 **/
	bulletValue4: number[];
	/** 修改方式 **/
	bulletType5: number;
	/** 命中伤害百分比 **/
	bulletValue5: number[];
	/** 修改方式 **/
	bulletType6: number;
	/** 命中暴击率 **/
	bulletValue6: number[];
	/** 修改方式 **/
	bulletType7: number;
	/** 命中暴击伤害倍率 **/
	bulletValue7: number[];
	/** 修改方式 **/
	bulletType8: number;
	/** 命中激活技能 **/
	bulletValue8: number[];
	/** 修改方式 **/
	bulletType9: number;
	/** AOE类型 **/
	bulletValue9: number[];
	/** 修改方式 **/
	bulletType10: number;
	/** AOE范围 **/
	bulletValue10: number[];
	/** 修改方式 **/
	bulletType11: number;
	/** AOE伤害百分比 **/
	bulletValue11: number[];
	/** 修改方式 **/
	bulletType12: number;
	/** AOE暴击率 **/
	bulletValue12: number[];
	/** 修改方式 **/
	bulletType13: number;
	/** AOE暴击伤害倍率 **/
	bulletValue13: number[];
	/** 修改方式 **/
	bulletType14: number;
	/** AOE激活技能 **/
	bulletValue14: number[];
	/** 修改方式 **/
	bulletType15: number;
	/** 可抵消 **/
	bulletValue15: number[];
	/** BUFF ID **/
	buffId: number[];
	/** 修改方式 **/
	buffType1: number;
	/** 命中率 **/
	buffValue1: number[];
	/** 修改方式 **/
	buffType2: number;
	/** 持续方式 **/
	buffValue2: number[];
	/** 修改方式 **/
	buffType3: number;
	/** 持续时间 **/
	buffValue3: number[];
	/** 召唤兽ID **/
	sommonId: number[];
	/** 修改方式 **/
	sommonType1: number;
	/** 怪物ID **/
	sommonValue1: number[];
	/** 修改方式 **/
	sommonType2: number;
	/** 受击方式 **/
	sommonValue2: number[];
	/** 修改方式 **/
	sommonType3: number;
	/** HP计算方式 **/
	sommonValue3: number[];
	/** 修改方式 **/
	sommonType4: number;
	/** 持续时间 **/
	sommonValue4: number[];
	/** 修改方式 **/
	sommonType5: number;
	/** 索敌范围 **/
	sommonValue5: number[];
	/** 修改方式 **/
	sommonType6: number;
	/** 攻击力 **/
	sommonValue6: number[];
	/** 修改方式 **/
	sommonType7: number;
	/** 攻击倍率 **/
	sommonValue7: number[];
}

/** Z装备消耗wapenCost.xlsx **/
export class WapenCostData extends LocalizedEntity {
	constructor() {
		super({});
	}

	/** 序号 **/
	id: number;
	/** 装备消耗ID **/
	wapenCostId: number;
	/** 等级 **/
	lv: number;
	/** 碎片需求 **/
	cost1: number;
	/** 元宝需求 **/
	cost2: number;
}

