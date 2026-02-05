// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Curve, CurveState, CurveList } from "./Curve";
import { Bezier } from "./Tools/Bezier";
import { EaseType, Evaluate } from "./Tools/EaseType";
import TransformUtils from "./Tools/TransformUtils";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BezierManager extends cc.Component {

    private static instance: BezierManager;
    public static get Instant(): BezierManager {
        if (this.instance == null) {
            let node = new cc.Node("BezierManager")
            cc.game.addPersistRootNode(node)
            this.instance = node.addComponent(BezierManager);
            return this.instance
        } else {
            return this.instance
        }
    }

    // 曲线列表
    private curveList: Map<cc.Node, Curve> = new Map();
    public AddCurve(target: cc.Node, curve: Curve) {
        if (this.curveList.has(target)) {
            this.curveList.delete(target)
        }
        this.curveList.set(target, curve)
    }
    public RemoveCurve(target: cc.Node) {
        this.curveList.delete(target)
    }


    // 多曲线列表
    private curveList2: Map<cc.Node, CurveList> = new Map();
    public AddCurveList(target: cc.Node, curveList: CurveList) {
        if (this.curveList2.has(target)) {
            this.curveList2.delete(target)
        }
        this.curveList2.set(target, curveList)
    }
    public RemoveCurveList(target: cc.Node) {
        this.curveList2.delete(target)
    }


    update(dt) {
        this.curveList.forEach((curve, target) => {
            if (target.isValid && curve) {
                if (curve.state == CurveState.Running) {
                    curve.curTime += dt;
                    // 最后一帧
                    if (curve.curTime >= curve.duration) {
                        target.position = TransformUtils.TransformPosition(curve.points[curve.points.length - 1])
                        this.RemoveCurve(target);
                        curve.completeCallBack()
                    } else {
                        let pos = Bezier.CalculateCurvePos(curve.points, curve.curTime, curve.duration, curve.ease);
                        target.position = TransformUtils.TransformPosition(pos)
                    }
                    // 跟随旋转
                    if (curve.IsFollowRotate()) {
                        let angle = curve.GetAngle(target.position);
                        target.angle = angle
                    }
                    curve.prevRunPos = target.position
                }
            } else {
                this.RemoveCurve(target);
            }
        });

        this.curveList2.forEach((curveList, target) => {
            if (target.isValid && curveList) {
                if (curveList.state == CurveState.Running) {
                    curveList.curTime += dt;
                    // 最后一帧
                    if (curveList.curTime >= curveList.duration) {
                        target.position = TransformUtils.TransformPosition(Bezier.GetLastCurvePos(curveList.list))
                        this.RemoveCurveList(target);
                        curveList.completeCallBack()
                    } else {
                        let pos = Bezier.CalculateCurveListPos(curveList.list, curveList.timeList, curveList.curTime, curveList.duration, curveList.ease);
                        target.position = TransformUtils.TransformPosition(pos)
                    }
                    // 跟随旋转
                    if (curveList.IsFollowRotate()) {
                        let angle = curveList.GetAngle(target.position);
                        target.angle = angle
                    }
                    curveList.prevRunPos = target.position
                }
            } else {
                this.RemoveCurveList(target);
            }
        })
    }
}
