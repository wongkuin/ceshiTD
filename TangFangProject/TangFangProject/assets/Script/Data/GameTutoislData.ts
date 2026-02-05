

import UserVariable, { nonSerialized } from "../../TRFrameWork/cocos-module/component/UserVariable";
import { UserKeyType } from "./UserKeyType";

/**引导数据 */
export default class GameTutoialData extends UserVariable<GameTutoialData> {

    hasFightHero: boolean = false;


    /**引导完成的记录 */
    finishTutoial: TutoialEnum[] = [];

    /**完成的引导子步骤，大退清空重新引导 */
    @nonSerialized()
    finishTemporaryGuideList: TemporaryGuideVo[] = [];

    constructor() {
        super(UserKeyType.GameTutoialData, true);
    }

    protected init(firist: boolean) {

    }

    /**新增一个完成主引导 */
    addFinishedTutoial(guide: TutoialEnum) {
        if (this.finishTutoial.indexOf(guide) == -1) {
            this.finishTutoial.push(guide);
        }
    }
    /**检查一个大引导是否完成 */
    checkFinishedTutoial(guide: TutoialEnum): boolean {
        return this.finishTutoial.indexOf(guide) >= 0;
    }

    /**检查一个小/子引导是否完成 */
    checksubFinishedTutoial(guide: TutoialEnum, index: number): boolean {
        let result = false;
        if (!this.checkFinishedTutoial(guide)) {
            let vo = this.getOneTutoialVo(guide);
            if (vo && vo.subTutoialIdList.indexOf(index) >= 0) {
                return true;
            }
            return false;
        }
        return true;
    }
    /**得到一个临时引导数据 */
    getOneTutoialVo(guide: TutoialEnum): TemporaryGuideVo {
        let vo;
        for (let i = 0; i < this.finishTemporaryGuideList.length; i++) {
            if (this.finishTemporaryGuideList[i].mainTutoialId == guide) {
                return this.finishTemporaryGuideList[i];
            }
        }
        return null;
    }
    /**删除一条临时引导记录 */
    removeOneTutoialVo(guide: TutoialEnum) {
        let index = -1;
        for (let i = 0; i < this.finishTemporaryGuideList.length; i++) {
            if (this.finishTemporaryGuideList[i].mainTutoialId == guide) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            this.finishTemporaryGuideList.splice(index, 1);
        }
    }
    /**增加一个完成的引导子步骤 */
    addSubTemporaryGuideId(guide: TutoialEnum, index: number) {
        let vo = this.getOneTutoialVo(guide);
        if (vo) {
            vo.subTutoialIdList.push(index);
        } else {
            let guideVo: TemporaryGuideVo = { mainTutoialId: guide, subTutoialIdList: [index] };
            this.finishTemporaryGuideList.push(guideVo);
        }

        console.log("111111111111:finishTemporaryGuideList", this.finishTemporaryGuideList);
    }
    /**删除一条引导记录 */
    spliceTutoialByGuideId(guideId: TutoialEnum) {
        let index = this.finishTutoial.indexOf(guideId);
        if (index >= 0) {
            this.finishTutoial.splice(index, 1);
        }
        this.removeOneTutoialVo(guideId);
    }
}



/**临时引导变量 */
export interface TemporaryGuideVo {
    mainTutoialId: TutoialEnum,
    /**完成的子步骤index 合集 */
    subTutoialIdList: number[],
}
/**主引导类型 */
export enum TutoialEnum {
    /** 引导英雄上阵,  - 若没有上阵任何英雄，此引导完成，不再触发。*/
    heroGuide = 1,

    /**引导果蔬上阵,“玩家点击【挑战】按钮，但有果蔬未上阵” and“关卡5已经通关” */
    fruitGuide,
    /**果蔬升级引导 */
    fruitUpgrade,
    /**英雄升级引导 */
    heroUpgrade,
    /**商店免费资源引导 */
    storeFree,
}
