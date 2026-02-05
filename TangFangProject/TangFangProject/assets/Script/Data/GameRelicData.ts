import UserVariable from "../../TRFrameWork/cocos-module/component/UserVariable";
import ConfigMgr from "../config/ConfigMgr";
import { RelicsCategoryData, RelicsUpData } from "../config/DataDef";
import { UserKeyType } from "./UserKeyType";

export enum RelicType {
    /**一般 */
    normal = 1,
    /**稀有 */
    rare = 2,
    /**史诗 */
    epic = 3,

}

/**遗物数据 */
export default class GameRelicData extends UserVariable<GameRelicData> {


    constructor() {
        super(UserKeyType.GameRelicData, true);
    }
    /**拥有的遗物列表 */
    hasRelicList: RelicVo[] = [];

    /**首次初始化用 */
    protected init(first: boolean): void {
        this.initData();
    }
    /**得到相应类型的武器数据 */
    getItmeListByType(type: RelicType): number[] {
        let list = [];
        ConfigMgr.getInstance().getAll(RelicsCategoryData).forEach((vo) => {
            if (vo.relicscCharacter == type && vo.off == 1) {
                list.push(vo.id)
            }
        })
        list.sort((a, b) => {
            // 武器
            // 列表排序调整：已上场的在最前面，已获取的在前面，等级=1的在后面，状态相同时ID小的在前面 
            let aId = a;
            let bId = b;

            let sortA = ConfigMgr.getInstance().getById(aId, RelicsCategoryData).sort;
            let sortB = ConfigMgr.getInstance().getById(bId, RelicsCategoryData).sort;
            if (sortA > sortB) {
                return 1
            } else if (sortA < sortB) {
                return -1
            }

        })
        return list;
    }

    /**宝物被动技能列表 */
    getPassiveSkillIdList() {
        let attrList: number[] = [];
        this.hasRelicList.forEach((vo) => {
            if (vo.level > 0) {
                let nextRelicUp = ConfigMgr.getInstance().getById(vo.level, RelicsUpData);
                let cfg = ConfigMgr.getInstance().getById(vo.id, RelicsCategoryData);
                if (nextRelicUp) {
                    let list = nextRelicUp["attribute" + cfg.relicscUp] || [];
                    attrList = attrList.concat(list)
                }
            }
        })
        console.log("宝物被动技能", attrList);
        return attrList;
    }



    /**增加一个拥有遗物的等级 */
    addRelicLevelById(RelicId) {
        let RelicVo = this.getRelicById(RelicId);
        if (RelicVo) {
            RelicVo.level++;
        } else {
            console.error("未找到该遗物数据")
        }
    }


    initData() {
        ConfigMgr.getInstance().getAll(RelicsCategoryData).forEach((vo) => {
            if (!this.getRelicById(vo.id)) {//如果没有则添加,1级才算解锁，0级不解锁
                this.addRelicById(vo.id);
            }
        })
    }

    /**
    * 增加一名拥有的遗物
    * @param id 
    */
    addRelicById(id) {

        let data = ConfigMgr.getInstance().getById(id, RelicsCategoryData);
        if (!data) {
            return;
        }
        let Relic = this.getRelicById(id);
        if (Relic) {
        } else {
            let Relic = new RelicVo(id)
            Relic.isNew = false;
            this.hasRelicList.push(Relic);
        }
    }

    addRelicSuiPianById(id, num) {
        let Relic = this.getRelicById(id);
        if (Relic) {
            Relic.suiPianNum += num;
        } else {
            console.error("未找到该遗物数据")
        }
    }

    /**
   * 遗物数据
   * @param id 遗物id
   * @returns 
   */
    getRelicById(id): RelicVo {
        for (let Relic of this.hasRelicList) {
            if (Relic.id == id) {
                return Relic;
            }
        }
        return null;
    }


    getHasAllRelicsId(): number[] {
        let list = [];
        this.hasRelicList.forEach((vo) => {
            if (vo.level > 0) {
                list.push(vo.id);
            }
        })
        return list;
    }









    /**-----------------------检查一个遗物能不能升级 */
    checkRedDotByRelicId(RelicId): boolean {

        let vo = this.getRelicById(RelicId);
        if (!vo) {
            return false;
        }
        let relicCfg = ConfigMgr.getInstance().getById(RelicId, RelicsCategoryData);

        if (relicCfg.maxLv <= vo.level) {
            return false;
        }
        let nextRelicUp = ConfigMgr.getInstance().getById(vo.level + 1, RelicsUpData);
        if (!nextRelicUp) {
            return false;
        }
        let costNum = nextRelicUp["cost" + relicCfg.relicscUp] || 0;

        return (costNum <= vo.suiPianNum);

    }

    /**检查任意红点，最顶层 */
    checkAllRedDot(): boolean {
        let result = false;
        for (let i = 0; i < this.hasRelicList.length; i++) {
            result = this.checkRedDotByRelicId(this.hasRelicList[i].id);
            if (result) {
                break;
            }
        }
        return result;
    }

}

/**遗物数据 */
export class RelicVo {
    /**id */
    id: number = null;
    /**等级 */
    level: number = 0;
    /**是否是新获得 */
    isNew: boolean = false;
    /**碎片数量 */
    suiPianNum: number = 0;

    constructor(Relicid: number) {
        this.id = Relicid;
        let data = ConfigMgr.getInstance().getById(Relicid, RelicsCategoryData);
        if (!data) {
            console.error('Relicid error:', Relicid);
            return;
        }
    }

}


