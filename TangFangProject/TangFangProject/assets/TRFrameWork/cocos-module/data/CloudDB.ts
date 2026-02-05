// import PlatformMgr from "../../ThirdSDK/cocos-multi-platform/PlatformManager";
// import UserKey from "../../ThirdSDK/UserKey";

// export default class CloudDB {
//     private static _instance: CloudDB;
//     private cloud;
//     private db;

//     public static get instance(): CloudDB {
//         if (!this._instance) {
//             this._instance = new CloudDB();
//             this._instance.init();
//         }
//         return this._instance;
//     }

//     private openId = UserKey.getInstance().userOpenID;

//     private name = "BossUser_" + PlatformMgr?.instance?.adConfig?.AppId;

//     private async init() {
//         this.cloud = window["tt"].createCloud({
//             envID: UserKey.getInstance().getCloudDBEnvID(),
//             serviceID: UserKey.getInstance().getCloudDBServiceID(),
//         });

//         this.db = await this.cloud.database();
//     }

//     public async get() {
//         const res = await this.db.collection(this.name).doc(this.openId).get();
//         console.log("CloudDB-----get", res);
//         return res
//     }

//     public async add(value: string) {
//         await this.db.collection(this.name).add(
//             {
//                 _id: this.openId,
//                 BossUserAllData: value,
//                 createTime: this.db.serverDate()
//             });
//         console.log("CloudDB-----add");
//     }

//     public async update(value: string) {
//         const res = await this.db.collection(this.name).doc(this.openId).set({ "BossUserAllData": value });
//         console.log("CloudDB-----update", res);
//     }

//     public async remove() {
//         const res = await this.db.collection(this.name).doc(this.openId).remove();
//         console.log("CloudDB-----remove", res);
//     }

// }