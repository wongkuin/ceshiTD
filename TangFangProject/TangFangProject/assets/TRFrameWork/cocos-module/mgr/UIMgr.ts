// import { EventTarget } from "../component/Watch";
// import LayerMgr from "./LayerMgr";
// import ResMgr from "./ResMgr";
// import Singleton from "../component/Singleton";
// import UIAnimation from "../ui/UIAnimation";
// import { UIParams } from "../component/UIParams";
// import { TimerUtils } from "../utils/TimeUtils";


// interface UIOption {
//     /**路径 */
//     url: string,
//     /** bundle*/
//     bundle?: string;
//     /**层级 */
//     layer?: number | string;
//     /**显示加载动画 */
//     loading?: boolean;
// }

// export interface LoadingUI extends cc.Component {
//     show(): void;
//     hide(): void;
//     progress(cur: number, total: number): void;
// }

// export class UIConfig implements UIOption {
//     public url: string;
//     public bundle: string;
//     public layer: number | string;
//     public loading: boolean;
//     constructor(url: string, bundle?: string, layer?: number | string, loading = true) {
//         this.url = url;
//         this.bundle = bundle;
//         this.layer = layer;
//         this.loading = loading;
//     }
// }

// export default class UIMgr extends Singleton<UIMgr> {

//     public static readonly EventType = { Show: "UIMgr_Event_Open", Hide: "UIMgr_Event_Close" };

//     private map: Map<UIOption, cc.Node> = new Map();

//     private loadingMap: Map<UIOption, any> = new Map();

//     private eventTarget: EventTarget = new EventTarget();

//     private loadingUI: LoadingUI = null;

//     private preloadViewList: UIConfig[] = [];
//     private LoadingProloadView: boolean = false;

//     public setloadingUI(loadingUI: LoadingUI): void {
//         this.loadingUI = loadingUI;
//     }

//     protected showClip: cc.AudioClip = null;
//     protected hideClip: cc.AudioClip = null;

//     public setClip(showClip: cc.AudioClip, hideClip: cc.AudioClip = null): void {
//         this.showClip = showClip;
//         this.hideClip = hideClip;
//     }

//     /**
//      * 显示
//      * @param option 
//      * @param uiParams 
//      * @returns 
//      */
//     public async show(option: UIOption, ...uiParams: any): Promise<cc.Node> {
//         // console.log("show", option, uiParams);

//         if (this.loadingMap.has(option)) {
//             this.loadingMap.set(option, uiParams);
//             return null;
//         }

//         this.loadingMap.set(option, uiParams);

//         let promise: Promise<cc.Node> = null;
//         const tmpNode = this.map.get(option);

//         if (option.loading && this.loadingUI && this.loadingUI.isValid)
//             this.loadingUI?.show();

//         if (tmpNode?.isValid) {
//             promise = Promise.resolve(tmpNode);
//         } else {
//             promise = new Promise(resolve => {

//                 ResMgr.getInstance().getBundle(option.bundle).then(b => {

//                     return b.bundle.load(option.url, cc.Prefab, (finish: number, total: number) => {
//                         if (option.loading) this.loadingUI?.progress(finish, total);
//                     }, (err, res) => {

//                         if (err) {
//                             resolve(null);
//                         } else {
//                             resolve(cc.instantiate(res));
//                         }
//                     });
//                 });
//             })
//         }

//         const node = await promise;
//         try {
//             if (!node) return null;

//             const p = node.getComponent(UIParams) ?? node.addComponent(UIParams);
//             p.params = this.loadingMap.get(option);

//             const root = LayerMgr.getInstance().getLayer(option.layer) ?? LayerMgr.getInstance().getDefaultLayer() ?? cc.Canvas.instance.node;

//             node.parent = root;
//             this.map.set(option, node);
//             this.loadingMap.delete(option);
//             cc.isValid(this.loadingUI) && this.loadingUI?.hide();
//             this.eventTarget.emit(UIMgr.EventType.Show, option, node);
//         } catch (e) {
//             console.error(option?.url, option?.bundle);
//             console.error(e);
//         }
//         return node;
//     }


//     public isShow(option: UIOption): boolean {
//         const node = this.map.get(option);
//         return node && node.isValid && node.active;
//     }

//     /// 获取当前显示的节点
//     public getLayerMap(): Map<UIOption, cc.Node> {
//         return this.map;
//     }

//     protected deleteMap: Map<UIOption, boolean> = new Map();

//     /**
//      * 隐藏
//      * @param option 
//      * @returns 
//      */
//     public hide(option: UIOption | cc.Node): Promise<void> {

//         return new Promise<void>(resolve => {

//             let op: UIOption;
//             if (option instanceof cc.Node) {

//                 this.map.forEach((v, k) => {
//                     if (v == option) op = k;
//                 });

//             } else {
//                 op = option as UIOption;
//             }

//             if (!this.map.has(op)) {
//                 resolve();
//                 return;
//             }

//             if (this.deleteMap.get(op)) {
//                 resolve();
//                 return;
//             }

//             this.deleteMap.set(op, true);
//             const node = this.map.get(op);
//             if (!node) {
//                 this.map.delete(op);
//                 resolve();
//                 return;
//             }

//             let animPromise: Promise<void> | Promise<void[]> = Promise.resolve();
//             const anims = node.getComponents(UIAnimation);
//             if (anims?.length > 0) animPromise = Promise.all(anims.map(p => p.popOut()))

//             animPromise.then(() => {
//                 //TODO:cache或者销毁
//                 node?.destroy();
//                 this.map.delete(op);
//                 this.deleteMap.delete(op);
//                 resolve();
//                 let self = this;
//                 TimerUtils.instance.once(() => {
//                     self.eventTarget.emit(UIMgr.EventType.Hide, op, node);
//                 });

//             });

//         });

//     }

//     //===========事件监听

//     public on(key: string, callback: (op?: UIOption, node?: cc.Node) => void, target?: any): void {
//         this.eventTarget.on(key, callback, target);
//     }

//     public once(key: string, callback: (op?: UIOption) => void, target?: any): void {
//         this.eventTarget.once(key, callback, target);
//     }

//     public off(key: string, callback: (op?: UIOption) => void, target: any): void {
//         this.eventTarget.off(key, callback, target);
//     }

//     public targetOff(target: any): void {
//         this.eventTarget.targetOff(target);
//     }

//     //-----------------------------------------------预加载-----------------------------------
//     /**预加载UIView*/
//     public preloadView(data: UIConfig) {
//         //return;
//         /**预加载代码有问题，还不知道怎么处理，先返回不执行 */
//         //if(UserData.getInstance().isFristPreload){
//         this.preloadViewList.push(data);
//         this.checkPreLoadViewList();
//         //}



//     }
//     /**检查预加载队列 */
//     checkPreLoadViewList() {
//         if (!this.LoadingProloadView && this.preloadViewList.length > 0) {
//             this.LoadingProloadView = true;
//             ResMgr.getInstance().preloadByBundle(this.preloadViewList[0].url, this.preloadViewList[0].bundle, cc.Prefab, () => {
//                 this.LoadingProloadView = false;
//                 this.preloadViewList.shift()
//                 this.checkPreLoadViewList();
//             });
//         }
//     }

// }