import ConfigMgr from "./ConfigMgr";
import { BulletData, BulltetSpEffData } from "./DataDef";
import { hurtParm, shootBagParm } from "./DataInfo";
import { GameObjectType, GameAOEState } from "./GameEnum";

export class AOESustainedInfo {
    liveTime: number = 0;//当前总存活时间
    maxLiveTime: number = 0;//最大存活时间
    hurtInterval: number = 0;//伤害间隔
    hurtRadius: number = 0;//伤害半径
    sourceTag: GameObjectType;//来源标签
    startWPos: cc.Vec3;//起始世界坐标

    fixHurt: hurtParm;//伤害修正，创建后不在改变
    parm: shootBagParm = null; // 子弹包参数
    data: BulletData = null;   // 子弹数据
    bulletSP: BulltetSpEffData = null;   // 子弹特效数据

    moveDir: cc.Vec2  = cc.Vec2.ZERO;//移动方向
    state: GameAOEState = GameAOEState.Running;

    constructor(startWpos: cc.Vec3, sourceTag:GameObjectType,parm: shootBagParm, data: BulletData, fixHurt: hurtParm,moveDir:cc.Vec2 ) {
        this.startWPos = startWpos;
        this.sourceTag = sourceTag;
        this.fixHurt =fixHurt;
        this.parm = parm;
        this.data = data;
        this.liveTime =0;
        this.maxLiveTime = data.aoeTime;
        this.hurtInterval = data.aoeInterval;
        this.hurtRadius = data.aoeRadius;
        this.bulletSP = ConfigMgr.getInstance().getById(this.data.img, BulltetSpEffData);
        this.moveDir = moveDir;
        
    }


}