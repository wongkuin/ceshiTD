
// import { BezierCurve } from "../Bezier/BezierCurve";
// import { Curve } from "../Bezier/Curve";


// const { ccclass, property, executeInEditMode } = cc._decorator;


// @ccclass()
// // @executeInEditMode
// export default class MouseClick extends cc.Component {

//     camera: cc.Camera
//     physicManager: cc.PhysicsManager;
//     touchStartLocal: any;
//     touchMoveLocal: any;
//     onLoad() {
//         // var manager = cc.director.getCollisionManager();
//         // manager.enabled = true;
//         // manager.enabledDebugDraw = true;
//         // manager.enabledDrawBoundingBox = true;
//         cc.director.getPhysicsManager().enabled = true;
//     }
//     start() {
//         this.initEvent();
//     }
//     initEvent(): void {
//         this.node.on(cc.Node.EventType.TOUCH_START, this.uiNodeStartEvent, this);
//         this.node.on(cc.Node.EventType.TOUCH_MOVE, this.uiNodeMoveEvent, this);
//         this.node.on(cc.Node.EventType.TOUCH_END, this.uiNodeEndEvent, this);
//         this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.uiNodeEndEvent, this);
//     }

//     uiNodeStartEvent(e: cc.Event.EventTouch): void {
//         this.touchStartLocal = null;
//         this.touchMoveLocal = null;
//         this.touchStartLocal = this.node.convertToNodeSpaceAR(e.getLocation());
//     }
//     //
//     uiNodeMoveEvent(e: cc.Event.EventTouch): void {
//         if (!this.touchStartLocal) return;
//         console.log("移动");
//         this.touchMoveLocal = this.node.convertToNodeSpaceAR(e.getLocation());
//     }

//     //
//     uiNodeEndEvent(e: cc.Event.EventTouch): void {
//         if (!this.touchStartLocal) return;
//         let touchEndLocal: cc.Vec2 = this.node.convertToNodeSpaceAR(e.getLocation());
//         let touchStartLocal: cc.Vec2 = this.node.convertToNodeSpaceAR(e.getStartLocation());
//         // this.recalcResults(null,touchStartLocal,touchEndLocal)
//         // console.log(e.getStartLocation(), e.getLocation())
//         this.recalcResults(0, e.getStartLocation(), e.getLocation());
//     }
//     recalcResults(type: number, touchStartLocal: cc.Vec2, touchEndLocal: cc.Vec2): void {
//         let colliderArr = [];
//         cc.director.getPhysicsManager().enabled = true;
//         //获取所有刚体
//         let result = cc.director.getPhysicsManager().rayCast(touchStartLocal, touchEndLocal, cc.RayCastType.All);
//         console.log(result)
//     }

//     onEnable() {
//         // this.physicManager = cc.director.getPhysicsManager();
//         // var Bits = cc.PhysicsManager.DrawBits;

//         // this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
//         //     console.log(event.touch._point)
//         //     let startPos = event.getLocation();
//         //     let endPos = new cc.Vec2(startPos.x+1,startPos.y)
//         //     let results = this.physicManager.rayCast(startPos, endPos, cc.RayCastType.Any);
//         //     console.log(results)
//         //     results.forEach(element => {
//         //         console.log(element.collider.name)
//         //     });
//         // })
//     }

// }
