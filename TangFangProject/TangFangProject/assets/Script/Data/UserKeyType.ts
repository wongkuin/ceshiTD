import GameWapenData from "./GameWapenData";
import GameGlobalData from "./GameGlobalData";
import GameSignData from "./GameSignData";
import GameStoreData from "./GameStoreData";
import GameTutoialData from "./GameTutoislData";
import GameUserData from "./GameUserData";
import GameBossInstanceData from "./GameBossInstanceData";



/**
 * key 模块名，对应上面的key
 * value 模块中的类
 * 见下方saveClass方法
 */
export const classType = {}
export function loadClass() {
    classType[UserKeyType.GameUserData] = GameUserData;
    classType[UserKeyType.GameStoreData] = GameStoreData;
    classType[UserKeyType.GameSignData] = GameSignData;
    classType[UserKeyType.GameGlobalData] = GameGlobalData;
    classType[UserKeyType.GameTutoialData] = GameTutoialData;
    classType[UserKeyType.GameWapenData] = GameWapenData;
    classType[UserKeyType.GameBossInstanceData] = GameBossInstanceData;
}


export const UserKeyType = {
    GameUserData: "GameUserData",
    GameRelicData: "GameRelicData",
    UserItemsData: "UserItemsData",
    GameStoreData: "GameStoreData",
    GameSignData: "GameSignData",
    GameGlobalData: "GameGlobalData",
    GameTutoialData: "GameTutoialData",
    GameCannonData: "GameCannonData",
    GameVehicleData: "GameVehicleData",
    GameLoginTimeGiftData: "GameLoginTimeGiftData",
    GameTodayData: "GameTodayData",
    GameWapenData: "GameWapenData",
    GameActivityData: "GameActivityData",
    GameBossInstanceData: "GameBossInstanceData",
}

export function clearAll() {
    loadClass();
    for (const moduleName in classType) {
        if (UserKeyType.hasOwnProperty(moduleName)) {
            let value = classType[moduleName];
            if (value) {
                value.getInstance().clear();
            } else {
                console.log("clear module error", moduleName);
            }
        }
    }
}

export function saveAll() {
    loadClass();
    for (const moduleName in classType) {
        if (UserKeyType.hasOwnProperty(moduleName)) {
            let value = classType[moduleName];
            if (value) {
                value.getInstance().save();
            } else {
                console.log("all save module error", moduleName);
            }
        }
    }
}

export function saveCloudDB() {

}

export async function loadCloudDB() {

}