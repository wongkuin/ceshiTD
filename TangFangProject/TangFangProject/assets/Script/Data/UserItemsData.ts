import ConfigMgr from "../config/ConfigMgr";
import { ItemBaseData, PassData } from "../config/DataDef";
import GameRelicData from "./GameRelicData";
import GameUserData from "./GameUserData";
import GameUserVariable from "./GameUserVariable";
import GameWapenData from "./GameWapenData";
import { UserKeyType } from "./UserKeyType";




/**用户物品数据 */
export default class UserItemsData extends GameUserVariable<UserItemsData> {
    constructor() {
        super(UserKeyType.UserItemsData, true);
    }

    allItems: ItemVo[] = [];

    protected init(first: boolean): void {
        if (first) {
            this.allItems = [];
        }
    }
    /**根据id 取章节表的key 名 */


    private getItemByID(id: number): ItemVo {
        for (let index = 0; index < this.allItems.length; index++) {
            const element = this.allItems[index];
            if (element.itemID == id) return element

        }
        return null
    }

    // 当前拥有的物品数量
    getItemNum(id1: number) {
        let itemData = ConfigMgr.getInstance().getById(id1, ItemBaseData);
        if (itemData.type == 0) {//资源
            let id = itemData.typeArgs;

            return GameUserData.getInstance().getItemNumById(id);

        }

        for (let index = 0; index < this.allItems.length; index++) {
            const element = this.allItems[index];
            if (element.itemID == id1) {
                return element.num
            }
        }
        return 0
    }

    getAllItem() {
        return this.allItems;
    }

    getItmeListByType(type: number) {
        let itemList: ItemVo[] = [];
        for (let index = 0; index < this.allItems.length; index++) {
            const element = ConfigMgr.getInstance().getById(this.allItems[index].itemID, ItemBaseData);
            if (element.type == type && this.allItems[index].num > 0) itemList.push(this.allItems[index])
        }
        return itemList
    }
    /**根据items表Id，和配置数量，得到具体的奖励数量 */
    getRealAwardNum(id: number, num: number, chapterId: number = GameUserData.getInstance().lastPassLv): number {

        let itemData = ConfigMgr.getInstance().getById(id, ItemBaseData);
        let award;
        if (itemData.putType == 0) {
            award = num;
        } else if (itemData.putType == 1) {
            let realId = itemData.typeArgs;

            let chapterData = ConfigMgr.getInstance().getById(chapterId, PassData);
            let attr = chapterData["item" + realId];
            award = num * attr;
        }

        if (itemData.type == 0) {
            return Math.ceil(award);
        }
        return Math.floor(award);
    }



    getRealItemVo(id: number, num: number, chapterId: number = GameUserData.getInstance().lastPassLv): ItemVo {
        let itemData = ConfigMgr.getInstance().getById(id, ItemBaseData);
        let realNum = this.getRealAwardNum(id, num, chapterId);
        let realId = id;
        if (itemData.putType == 1) {
            realId = itemData.typeArgs;
        }
        return new ItemVo(realId, realNum);
    }
    /**获得奖励啥的，都走这个接口,不同奖励分开处理,奖励数量也内部处理
     * num 是配置，不是具体数量
     */
    pushItem(id: number, num: number = 1) {
        let itemData = ConfigMgr.getInstance().getById(id, ItemBaseData);
        let award = this.getRealAwardNum(id, num);
        let realId = itemData.typeArgs;
        if (itemData.type == 5) {
            realId = id;
        }
        if (itemData.type == 0) {
            GameUserData.getInstance().addItemNumById(realId, award);
            return;
        }

        //宝物，遗物
        if (itemData.type == 3) {
            GameRelicData.getInstance().addRelicSuiPianById(realId, award);
            return;
        }

        let item = this.getItemByID(realId);
        if (item) {
            for (let index = 0; index < this.allItems.length; index++) {
                const element = this.allItems[index];
                if (element.itemID == realId) {
                    element.num += num;
                    return
                }
            }
        }else {
            this.allItems.push(new ItemVo(realId, num));
        }
    }

    /**消耗物品 */
    spliceItem(id1: number, num: number) {

        let itemData = ConfigMgr.getInstance().getById(id1, ItemBaseData);
        let award = this.getRealAwardNum(id1, num);
        let realId = itemData.typeArgs;

        if (itemData.type == 5) {
            realId = id1;
        }


        if (itemData.type == 0) {
            if (GameUserData.getInstance().getItemNumById(realId) < num) {
                console.error(" 该物品数量不够，", realId, num)
                return;
            }
            GameUserData.getInstance().addItemNumById(realId, -num);
            return;
        }

        // if (itemData.type == 5) {
        //     GameWapenData.getInstance().getSuiPianNumById(realId);
        //     return;
        // }


        for (let index = 0; index < this.allItems.length; index++) {
            const element = this.allItems[index];
            if (element.itemID == realId) {
                if (element.num < num) {
                    if (element.num <= 0) {
                        this.allItems.splice(index, 1)
                    }
                    return false;
                }
                element.num -= num;
                if (element.num <= 0) {
                    this.allItems.splice(index, 1)
                }
                return true
            }

        }
        return false
    }
}

export class ItemVo {
    itemID: number = null;
    num: number = 0;
    st?: boolean = false; // 首通
    constructor(itemID: number, num: number = 1, st?: boolean) {
        this.itemID = itemID;
        this.num = num;
        this.st = st;
    }
}