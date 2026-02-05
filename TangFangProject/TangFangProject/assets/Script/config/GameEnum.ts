// 道具类型
export enum GameItemType {
    GameRes = 0, // 游戏资源  :1=银币 2=铜钱 3=体力 4=钻石 5=免广券
    Wapen = 1, // 武器
    Strengthen = 2, // 强化效果 参数1=强化效果ID
    Flag = 3, // 战旗
    FlagExp = 4, // 战旗经验
    Role = 5, // 乘员
    Box = 6, // 战斗宝箱
    Max,
    Stick = 8, // 棍子
}

// 游戏资源类型
export enum GameResType {
    Coin = 1, // 银币
    Gold = 2, // 铜钱
    Power = 3, // 体力
    Diamond = 4, // 钻石
    Coupon = 5, // 免广券
    Max = 6,
}

export enum GamePassType {
    Normal = 0, // 普通关卡
    WorldBoss = 101, // BOSS关卡
    teamRaid = 102, // 组队副本
    Max,
}


export enum GameBundle {
    Bundle_loading = "LoadingRes",
    Bundle_commonRes = "CommonRes",
    Bundle_monster = "MonsterRes",    // 怪物
    Bundle_bullet = "BulletRes",    //  子弹       
    Bundle_effect = "EsRes",    // 特效      
    Bundle_fruitMap = "FruitMap",
    Bundle_Hero = "Hero",    // 英雄详情 
    Bundle_Sign = "Sign",    // 签到    
    Bundle_Supply = "Supply",    // 补给    
    Bundle_AfkEvent = "afkEvent",    // 随机事件 
    Bundle_Support = "Support",    // 后勤 
    Bundle_Store = "Store",    // 商店
    Bundle_LimitGift = "gift",    // 商店
    Bundle_FreeBack = "feedback",    // 广告回馈
    Bundle_Fund = "fund",    // 关卡礼金
    Bundle_SevenTask = "sevenTask",    // 七日任务
    Bundle_Stick = "Stick", // 棍子资源
    Bundle_Wapen = "Wapen", // 武器相关
    Bundle_Act = "Act",// 活动相关
    Bundle_Talent = "Talent", // 天赋
    Bundle_Summon = "Summon", // 召唤相关
    Bundle_Flag = "flag", // 战旗相关,更名冰淇淋
    Bundle_GameMap = "GameMap", // 游戏地图 背景
    Bundle_Treasure = "Treasure",//宝物相关
    Bundle_Config = "Config",// 活动相关
    Bundle_WB = "WB",// 世界副本
}


// 怪物动画名称
export enum MonsterAnimName {
    Enter = 'enter', // 
    Attack = 'attack',
    Die = 'dead',
    Idle = 'idle',
    Run = 'walk',
}

// 怪物类型
export enum MonsterType {
    Normal = 0,  // 普通怪
    Elite = 1,    // 精英怪
    Boss = 2,     // BOSS
    Max,
}

export enum PathMode {
    Once = 0,       // 单次
    PingPong = 1,    // 往返
    Loop = 2,       // 循环

}

// 伤害数字动画类型
export enum HurtFontAnimType {
    Default = 0,  // 默认
    Slowup,  // 缓慢上升
    Max,
}

// 怪物死亡类型
export enum MonsterDeathType {
    // Normal = 0,
    HpSkill = 1,
    // ColliderSkill = 2, //
    Dead = 3,
    Max,
}

// 出生位置
export enum MonsterBrithType {
    Loc0 = 0,
    Loc1 = 1,
    Loc2 = 2,
    Loc3 = 3,
    RealyPos = 4, // 真实位置
    CriticPos = 5, // 临界位置
    CriticRound = 6, // 圆上

    Loc9 = 9,//纯随机
}

// 出生对齐方式
export enum MonsterBrithAlignment {
    //填在刷新线的对齐方式
    // 0=靠近中间
    // 1=靠近左侧（从车到线做垂直线，逆时针方向为左）
    // 2=靠近右侧
    Center = 0,
    Left = 1,
    Right = 2,
    Random = 3, // 随机
    Max,
    Loc9 = 9,//纯随机
}

// 战斗中对象状态
export enum BtAckObjState {
    Init = 0,
    Start,
    // Attack,
    Run,
    Die, // 死亡
    End, // 结束
}

// 怪物行为状态
export enum MonsterActionStatue {
    Move = 0,
    Attack,
    Stand,
    RandomMove,
    Repel, // 击退
    Assault, // 冲锋
    Jump, // 跳跃
    Max,

}

// 怪物攻击类型
export enum MonsterAttackType {
    // 0=寻找最近的敌人，进入射程后停止移动
    // 1=寻找最近的敌人，进入射程后，在射程范围内随机移动
    // 3=随机左或右侧出生，直线向右或左移动直到走出场外并销毁（不算被击杀）。只会攻击玩家载具。
    // 4=BOSS专用出生位置（末日战车的BOSS位置）
    Normal = 0, // 普通攻击
    RandomMove = 1, // 随机移动
    StraightMove = 3, // 直线移动
    Boss = 4, // BOSS
}

// 游戏对象类型
export enum GameObjectType {
    None = 0,
    Monster = 1 << 0,
    Monster_Bullet = 1 << 1,
    Turret = 1 << 2,
    Hero = 1 << 3,
    Cart = 1 << 4,
    FireBox = 1 << 5, // 车厢
    Tree = 1 << 6, // 树
}

// 游戏子弹类型
export enum GameBulletType {
    Line = 0,        // 弹射：直线前进，路径上有碰撞
    Curve = 1,       // 曲射：直线前进，抵达目的地后消亡。路径上无碰撞
    Laser = 2,       // 激光：射出一条有宽度的直线
    Whirl = 3,       // 回旋
    Bomb = 4,        // 炸弹
    Follow = 5,      // 追踪
    Curve_line = 6,  // 曲线+弹射
    Throw = 7,       // 抛掷
    Orbiting = 8,    // 环绕
    Follow_loop = 9,    // 环绕 循环
    Curve_block = 10,    // 曲线 打格子
    Landmine = 11,    // 地雷
    Max,
}

// 游戏子弹状态
export enum GameBulletState {
    None = 0,
    Start,
    Running,
    End,
    Del, // 删除
    Max,
}

// 游戏AOE状态
export enum GameAOEState {
    Running,
    End,
    Del, // 删除
}

// 游戏子弹AOE类型
export enum BulletAoeType {
    // 0=无AOE
    // 1=消亡时触发（注意，命中可能导致消亡，但也可能不会）
    // 2=命中时触发
    // 3=命中和消亡时触发
    None = 0,
    End = 1,
    Hit = 2,
    EndorHit = 3,
}


// 强化效果类型
export enum GamePowupEffect {
    None = 0,
    Player_attackMul = 1,       // 玩家攻击修正
    player_AtkSpeed,            // 玩家射速修正
    player_MoveSpeed,           // 玩家移动速度提升
    player_Critical,            // 玩家暴击修正
    player_CriticalDam,         // 玩家暴击伤害修正
    player_Block,               // 玩家格挡修正
    player_HpMaxPer,            // 玩家生命上限修正
    player_HpChange,            // 玩家生命值修改
    player_HpRegenPer,          // 玩家每秒hp 恢复百分比
    player_SpRegenPer,          // 玩家每秒护盾 恢复百分比
    player_def,                 // 玩家防御


    MonsterMoveSpeed,   // 怪物移动速度提升
    Monster_attackMul,             // 怪物攻击修正
    MonsterShoot,            // 怪物射速修正
    Max,
}


/**技能 */
export enum GamePassiveSkillEffect {
    None = 0,

    player_heroSpeed,            // 英雄移速修正
    player_heroAtkMul,           // 玩家攻击修正
    player_CriticalProbabilityAdd,            // 玩家暴击修正
    player_CriticalDamAdd,         // 玩家暴击伤害修正
    player_block,               // 玩家格挡修正
    player_maxHPMul,            // 玩家生命上限修正
    player_maxHPAdd,            // 玩家生命值修改
    player_SPMul,          // 玩家百分比获得SP
    player_SPAdd,          // 玩家按数值修改SP
    player_cdChange,                 // 武器百分百射速修正
    player_bossKill,                 // 精英增伤


    MonsterMoveSpeed, // 怪物移速修正
    Max,
}

// 子弹震动类型
export enum BulletVibrateType {
    None = 0,   //0=无震动
    Vibrate_Hit = 1, //子弹命中时震动（AOE不会触发）
    Vibrate_HitAndCrit = 2, //子弹命中and导致暴击时才震动
    Vibrate_End = 3, // 子弹消亡时震动
}


// 炮塔方向
export enum ETurretDir {
    None = 0,
    UP = 1,
    DOWN = 2,
}


/**
 * 框架,装甲,弹药箱,机械臂,厨房,切割台,工具台,雷达
 */
export enum WidgetPartID {
    Frame = 1, // 框架
    Armor = 2, // 装甲
    AmmunitionBox = 3,  // 弹药箱
    Arm = 4,     // 机械臂
    Kitchen = 5,  // 厨房
    CuttingTable = 6,  // 切割台
    ToolsTable = 7,    // 工具台
    Radar = 8,    // 雷达
}


// 船员状态
export enum eCharState {
    /**待机，空置没事件 */
    idle = 0,
    move,
    /**启程 ,走到物资旁*/
    start,
    /**获取，拿物资 */
    receive,
    /**返回途中 */
    return,
    /**释放物资等，完成事件 */
    release,
    // 射击
    shoot,
    // 跳跃
    jump,
    jumpEnd,

}

//加成类型
export enum BounsType {
    //怪物
    JiangShi = 1,
    Guihun,
    Xiesui,
    //对地空
    DiMian,
    Feixing,
    //天气
    Yewan,
    Baitian,
    Yutian,
    Jingying,
    Wutian,
    Xuetian
}

//怪物类型
export enum RaceType {
    JiangShi = 1,
    GuiHun,
    XieSui
}

export enum MoveType {
    DiMian = 1,
    FeiXing
}

//白天夜晚
export enum WeatherType {
    BaiTian = 1,
    YeWan
}

//天气类型2
export enum WeatherType2 {
    Smoke = 1,
    rain,
    lightRain,
    snow
}

//方位类型
export enum WidgetType {
    Top = 1,
    Right,
    Bottom,
    Left,
    Center
}

