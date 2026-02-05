

import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import ConfigMgr from "../config/ConfigMgr";
import { PowUpData } from "../config/DataDef";


export default class GamePowUpData extends Singleton<GamePowUpData> {



    /**
     * 获取强化数据
     * @param id 道具id
     * @returns 
     */
    public getPowUpDataByID(id: number | string): PowUpData {
        return ConfigMgr.getInstance().getById(id, PowUpData)
    }


}
