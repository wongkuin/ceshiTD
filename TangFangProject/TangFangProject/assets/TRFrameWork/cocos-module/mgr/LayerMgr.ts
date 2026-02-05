// import Singleton from "../component/Singleton";

// type LayerName = number | string;

// export default class LayerMgr extends Singleton<LayerMgr> {

//     protected layerMap: Map<LayerName, cc.Node> = new Map();
//     protected names: Array<LayerName> = [];
//     protected defaultLayer: LayerName = null;

//     public init(names: Array<LayerName>, defaultLayer = null): void {
//         if (!names || names.length <= 0) return;
//         this.names = names;
//         this.defaultLayer = defaultLayer;
//         names.forEach(name => {
//             const node = new cc.Node("layer_" + name);
//             node.parent = cc.Canvas.instance.node;
//             node.zIndex = 10;
//             node.width = cc.winSize.width;
//             node.height = cc.winSize.height;
//             this.layerMap.set(name, node);
//         });
//     }

//     /**获取默认层级 */
//     public getDefaultLayer(): cc.Node {
//         let defaultLayer = this.defaultLayer;
//         if (!defaultLayer && this.names) defaultLayer = this.names[0];

//         if (!defaultLayer) console.error("请先初始化LayerMgr");
//         return this.getLayer(defaultLayer);
//     }

//     /**获取指定层级 */
//     public getLayer(name: LayerName): cc.Node {
//         if (name == undefined || name == null) return null;

//         const node = this.layerMap.get(name);
//         if (!node || !node.isValid) {

//             if (this.names.length <= 0) {
//                 console.error("请先初始化LayerMgr");
//                 return null;
//             }
//             this.init(this.names, this.defaultLayer);
//         }

//         return this.layerMap.get(name);
//     }

// }