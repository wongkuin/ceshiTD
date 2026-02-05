

export enum GlobalEventID {

	//------------------------------------------------------------------------------
	//其他事件

	pauseGame = "pauseGame",  //暂停游戏
	resumeGame = "resumeGame", //恢复游戏
	func_event = "func_event",  //功能事件

	// LOCK_BLOCK_NUMB = "lock_block_number",  //锁定方块数量

	//------------------------------------------------------------------------------

	// 天气
	TQ_SHOW_RAIN = "TQ_SHOW_RAIN",  //显示雨
	TQ_SHOW_SMOKE = "TQ_SHOW_SMOKE",  //显示烟
	TQ_SHOW_SNOW = "TQ_SHOW_SNOW",  //显示雪
	TQ_HIDE_ALL = "TQ_HIDE_ALL",  //显示阳光

	//------------------------------------------------------------------------------
	//游戏事件

	createCombatBomb = "createCombatBomb",  // 受击效果
	createCombatBombLoop = "createCombatBombLoop",  // 受击效果
	endCombatBombLoop = "endCombatBombLoop",  // 受击效果

	signItemClick = "signItemClick",

	game_bg_touch_start = "game_bg_touch_start",  //游戏背景触摸开始
	game_bg_touch_end = "game_bg_touch_end",  //游戏背景触摸结束
	game_bg_touch_move = "game_bg_touch_move",  //游戏背景触摸移动

	up_powect = "up_powupEffect",  // 强化效果更新

	show_bossComing = "show_bossComing",  // 显示boss即将出现
	// show_fightStart = "show_fightStart",  // 显示战斗开始

	add_mapTurret = "add_mapTureet",  //增加地图炮塔 引导线用
	del_mapTurret = "del_mapTureet",  //删除地图炮塔
	composite_mapTurret = "composite_mapTureet",  //合成地图炮塔
	unlock_cb_turret = "unlock_cb_turret",  //解锁侧边栏炮塔

	// refrush_cart_turret = "refrush_cart_turret",  //刷新小车炮塔
	// up_cart_view = "up_cart_view",  //刷新小车炮塔
	revice_block = "revice_block",  //抵达块
	exit_by_failed = "exit_by_failed",  //游戏失败退出

	monster_begin = "monster_begin",  //波次 怪物开始
	next_wave_by_clear = "monster_clear",  //波次 怪物清除
	monster_die = "monster_die",  //怪物死亡
	// game_exp_add = "game_exp_add",  //游戏经验增加

	Fight_start = "Fight_start",  //战斗开始

	GameMap_Move = "GameMap_Move",  //地图移动
	game_relife = "game_relife",  //游戏复活
	game_mp_monDeath = "game_mp_add",  //能量增加
	game_mp_addpre = "game_mp_addpre",  //能量增加百分比

	game_sp_add = "game_hp_addPre",  //护盾增加
	game_hp_add = "game_hp_add",  //血量增加
	game_createFakeHero = "game_createFakeHero",  //创建假人
	game_wave_parogress = "game_wave_parogress",  //波次进度

	game_enter_newwave = "game_enter_newwave",  //新波茨

	// game_lvUpWapeon = "game_lvUpWapeon",  //升级武器
	// game_extWapeon = "game_extWapeon",  // 添加武器
	show_block_tips = "show_block_tips",  //显示武器提示
	hide_block_tips = "hide_block_tips",  //隐藏武器提示

	// game_limtAmmoBuff = "game_limtAmmoBuff",  //无限弹药buff
	game_revive_skillCD = "game_revive_skillCD",  //复活技能CD
	GAME_COIN_CHANGE = "GAME_COIN_CHANGE",  //铜钱变化


	block_InputEvents = "block_InputEvents",  //输入事件
	unblock_InputEvents = "unblock_InputEvents",  //取消输入事件

	create_hurt = "create_hurt",  //创建伤害

	show_change_hp = "cart_change_hp",  //小车恢复血量
	show_change_shield = "cart_change_shield",  //小车恢复护盾

	game_addMoney = "game_addMoney",  //增加银币
	game_addAward = "game_addAward",//随机波次奖励
	game_addYuanBao = "game_addYuanBao",//元宝掉落
	hero_use_skill = "hero_use_skill",  //英雄使用技能 1
	hero_run_skill = "hero_run_skill",  //英雄技能运行 3
	hero_anim_skill = "hero_anim_skill",  //英雄技能动画 2
	hero_arrow = "hero_arrow_use_skill",  //英雄箭头使用技能

	// laser_shoot_time = "laser_shoot_time",  //激光发射时间

	TURRET_DRAG_START = "TURRET_DRAG_START",  //炮塔拖拽开始
	TURRET_DRAG_END = "TURRET_DRAG_END",  //炮塔拖拽结束
	TURRET_DRAG_MOVE = "TURRET_DRAG_MOVE",  //炮塔拖拽移动

	TURRET_CHECK_UP = "TURRET_CHECK_UP",  //炮塔检查升级
	TURRET_DEL = "TURRET_DEL",  //炮塔删除
	TURRET_DEL_LIST = "TURRET_DEL_LIST",  //炮塔删除列表
	turret_move_back = "turret_move_back",  //炮塔移动回原位
	turret_swape = "turret_swape",  //炮塔交换

	HERO_LEVEL_UP = "HERO_LEVEL_UP", //英雄升级

	CHAR_DRAG_START = "CHAR_DRAG_START",//棍子拖拽开始
	CHAR_DRAG_END = "CHAR_DRAG_END",//棍子拖拽结束
	CHAR_DRAG_MOVE = "CHAR_DRAG_MOVE",//棍子拖拽移动
	CHAR_RESET = "CHAR_RESET",//棍子重置

	GameUI_Hide = "GameUI_Hide",  //游戏UI隐藏
	GameUI_Show = "GameUI_Show",  //游戏UI显示

	Refresh_Physical_Energy = "Refresh_Physical_Energy",  //刷新体力
	Refresh_LevelInfo = "Refresh_LevelInfo",  //刷新关卡信息

	closeAwardPop = "closeAwardPop",//关闭奖励弹窗


	///-----------guide-----------
	guide_btn_tiaozan = "guide_btn_tiaozhan",  //引导挑战
	guide_view_energy = "guide_view_energy",  //引导挑战
	guide_hero_tips = "guide_hero_tips",  //引导英雄


	// 世界boss
	WorldBoss_hurt = "WorldBoss_hurt",  //世界boss伤害
	Post_Boss_Skill = "Post_Boss_Skill",  //世界boss技能
	wave_summon = "wave_summon",  //波次召唤
	Summon_Monster = "Summon_Monster",  //召唤怪物
	// //显示英雄信息
	// showHeroInfo = "showHeroInfo",
	// //隐藏英雄信息
	// hideHeroInfo = "hideHeroInfo",


	shakeCamera = "shakeCamera",  //震动相机
	vibrateShort = "vibrateShort",  //震动短暂

	//显示最新宝箱
	showBattleChestBoxNew = "showBattleChestBoxNew",
	//刷新回馈信息
	refreshFeedBackItem = "refreshFeedBackItem",

	//刷新回馈信息
	refreshFundItem = "refreshFundItem",

	add_crew_2_cart = "add_crew_2_cart",  //添加船员到小车

	full_energy = "full_energy",  //能量满
	show_game_flyBox = "show_game_flyBox",  //显示游戏飞箱子



	// 世界boss
	teamer_hurt = "teamer_hurt",  //队友伤害
	myself_hurt = "myself_hurt",  //自己伤害


	//------------------------------------------------------- 战车移植过来-0-------------------------------------
	/** 发送得到的buff列表*/
	sendGetBuffList = "sendGetBuffList",
	/**播放完成得buff*/
	sendPlayedBuff = "sendPlayedBuff",

	//刷新主线任务 = ""
	//refreshTask = "refreshTask",
	// 更新炮塔
	update_cannon = "update_cannon",

	//选择掉落物品
	select_drop = "select_drop",
	// 搬起掉落物品
	moveup_drop = "moveup_drop",

	createOneBomb = "CreateOneBomb",

	/**初始化战力属性完成 */
	finishAttrInit = "finishAttrInit",

	/**加载进度 */
	loadProgress = "loadProgress",

	/**弹完恭喜获得刷新界面 */
	refreshFlagView = "refreshFlagView",

	upPower = "powerUpgrade",  //升级战力
	// 内存优化相关事件
	memory_monitoring_stopped = "memory_monitoring_stopped", // 停止内存监控
	memory_alert = "memory_alert", // 内存警告
	memory_alerts_cleared = "memory_alerts_cleared", // 清理内存警告
	memory_optimization_performed = "memory_optimization_performed", // 内存优化完成
	memory_emergency_cleanup_performed = "memory_emergency_cleanup_performed", // 紧急内存清理完成
	game_start = "game_start", // 游戏开始
	game_end = "game_end", // 游戏结束


	CloseRepeatGuide = "CloseRepeatGuide",
	GuideEnd = "GuideEnd",

	/**检查引导 */
	checkSummonGuide = "checkSummonGuide",

	checkWapenGuide = "checkWapenGuide",
	checkTalentGuide = "checkTalentGuide",

	Post_Slot_Result = "Post_Slot_Result",  //投注结果
	Up_Slot_Wapen = "Up_Slot_Wapen",  //更新炮台


	xzPassReward = "xzPassReward",//选择通关奖励

	closeDropPop = "closeDropPop",//关闭掉落界面



	//-------------------------------slot--------------------------------
	stopLaba = "stopLaba",

	fightGuideSuccess = "fightGuideSuccess",//战斗引导完成

	fightGuideFail = "fightGuideFail",//战斗引导失败

	refreshEditState = "refreshEditState",//刷新编辑状态

	checkBattleGuide = "checkBattleGuide",//检查战斗引导


	getSownRankData = "getSownRankData",//获取雪域排行数据



}
