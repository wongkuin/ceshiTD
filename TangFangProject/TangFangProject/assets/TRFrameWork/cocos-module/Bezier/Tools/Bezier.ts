import { Curve, CurveList, CurveState } from "../Curve";
import BezierManager from "../BezierManager";
import { EaseType, Evaluate } from "./EaseType";

export class BVector2 {
    public pos: cc.Vec3;
    public length: number; //上一点到当前点的距离
    public lenScale: number;// 


    constructor(pos: cc.Vec3, length: number, lenScale: number) {
        this.pos = pos;
        this.length = length;
        this.lenScale = lenScale;
    }
}


export class Bezier {
    private curve: Curve
    private curveList: CurveList;
    private next: Bezier;

    public constructor(curve: Curve);
    public constructor(curveList: CurveList);
    public constructor(controlPoints: cc.Vec3[], duration: number, ease: EaseType)
    public constructor(param: any, duration: number = 1, ease: EaseType = EaseType.Linear) {
        if (param == null)
            return

        if (typeof param == "object" && param.constructor.name == Curve.name) {
            this.curve = param
        } else if (typeof param == "object" && param.constructor.name == "Array") {
            this.curve = new Curve();
            this.curve.points = param
            this.curve.duration = duration
            this.curve.ease = ease
            // this.curve.smoothness = smoothness
        } else if (typeof param == "object" && param.constructor.name == CurveList.name) {
            this.curveList = param
        }
    }
    /**
     * 停止
     */
    public Stop() {
        this.ForeachBezier((b) => {
            if (b.curve) {
                b.curve.Stop()
            }
            if (b.curveList) {
                b.curveList.Stop()
            }
        })
    }
    /**
     * 暂停
     */
    public Pause() {
        this.ForeachBezier((b) => {
            if (b.curve) {
                b.curve.Pause()
            }
            if (b.curveList) {
                b.curveList.Pause()
            }
        })
    }

    // 恢复
    public Resume() {
        this.ForeachBezier((b) => {
            if (b.curve) {
                b.curve.Resume()
            }
            if (b.curveList) {
                b.curveList.Resume()
            }
        })
    }

    // 设置偏移角度
    public SetAngleOffset(angle) {
        this.ForeachBezier((b) => {
            if (b.curve) {
                b.curve.Resume()
            }
            if (b.curveList) {
                b.curveList.Resume()
            }
        })
    }

    private ForeachBezier(func: (bezier: Bezier) => void) {
        let next: Bezier = this
        while (next != null) {
            func(next)
            next = next.next;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------------------------
    public static GetCurTimePos(points: cc.Vec3[], t: number): cc.Vec3 {
        if (!points || points.length == 0) {
            return
        }
        var x = 0, y = 0;
        //控制点数组
        var n = points.length - 1;
        points.forEach((item, index) => {
            if (!index) {
                x += item.x * Math.pow((1 - t), n - index) * Math.pow(t, index)
                y += item.y * Math.pow((1 - t), n - index) * Math.pow(t, index)
            } else {
                //factorial为阶乘函数
                x += Bezier.Factorial(n) / Bezier.Factorial(index) / Bezier.Factorial(n - index) * item.x * Math.pow((1 - t), n - index) * Math.pow(t, index)
                y += Bezier.Factorial(n) / Bezier.Factorial(index) / Bezier.Factorial(n - index) * item.y * Math.pow((1 - t), n - index) * Math.pow(t, index)
            }
        })
        return new cc.Vec3(x, y);
    }

    private static Factorial(i: number) {
        let n = 1;
        for (let j = 1; j <= i; j++)
            n *= j;
        return n;
    }
    /**
     * 获取曲线点列表
     * @param pointArr 控制点
     * @param duration 持续时间
     * @param ease 缓动
     * @param smoothness 平滑度
     * @returns 
     */
    public static GetCurvePointList(pointArr: cc.Vec3[], duration: number, ease: EaseType = EaseType.Linear, smoothness: number = 100): cc.Vec3[] {
        if (!pointArr || pointArr.length == 0) {
            return []
        }

        let points = [];
        let step = duration / smoothness;
        if (step <= 0)
            return points
        // 开始分割曲线
        for (let i = 0; i <= duration; i += step) {
            if (i + step > duration) {
                i = duration
            }
            let pos = this.CalculateCurvePos(pointArr, i, duration, ease)
            points.push(pos)
        }
        return points
    }

    // 计算曲线点
    public static CalculateCurvePos(pointArr: cc.Vec3[], curTime: number, duration: number, ease: EaseType): cc.Vec3 {
        let t = Evaluate.Calculate(ease, curTime, duration);
        let v3 = Bezier.GetCurTimePos(pointArr, t)
        return v3;
    }

    /**
     * Bezier曲线移动
     * @param target 目标节点
     * @param points 控制点
     * @param duration 持续时长
     * @param ease 缓动
     * @param callBack 完成回调
     * @returns Bezier
     */
    public static Move(target: cc.Node, points: cc.Vec3[], duration: number, ease?: EaseType, angleOffset?: number, callBack?: () => void): Bezier;
    /**
     * Bezier曲线移动
     * @param target 目标节点
     * @param curve 曲线对象
     * @param callBack 完成回调
     */
    public static Move(target: cc.Node, curve: Curve, callBack?: () => void): Bezier;
    public static Move(target: cc.Node, param2: any, param3: any, ease: EaseType = EaseType.Linear, angleOffset?: number, callBack = () => { }): Bezier {
      
        

        if (!target || !param2) {
            return new Bezier(null);
        }

        let curve: Curve;
        let completeCallBack: () => void;

        if (typeof param2 == "object" && param2.constructor.name == "Array") {
            curve = new Curve()
            curve.points = param2
            curve.duration = param3
            curve.ease = ease
            curve.angleOffset = angleOffset
            completeCallBack = callBack
        } else if (typeof param2 == "object" && param2.constructor.name == Curve.name) {
            curve = param2
            completeCallBack = param3
        } else {
            return new Bezier(null);
        }
        // 匀速
        if (curve.ease == EaseType.Constant) {
            return this.ConstantMove(target, curve.points, curve.duration, completeCallBack)
        }

        curve.target = target
        curve.curTime = 0
        curve.state = CurveState.Running
        curve.completeCallBack = completeCallBack
        BezierManager.Instant.AddCurve(target, curve);

        let bezier = new Bezier(curve);
        return bezier
    }

    // 匀速运动
    private static ConstantMove(target: cc.Node, pointArr: cc.Vec3[], duration: number, callBack = () => { }): Bezier {
        if (!target || !pointArr || pointArr.length == 0) {
            return
        }
        let curve = new Curve()
        curve.points = pointArr
        curve.duration = duration
        // curve.smoothness = frame
        curve.target = target

        let points = curve.GetPointList()

        if (!points || points.length == 0)
            return
        let totalLen = curve.length
        let scale = duration / totalLen
        let actionLists = []
        points.forEach(point => {
            //计算当前路段需要的时间
            let time = point.length * scale;
            // 创建动作
            let action = cc.moveTo(time, cc.v2(point.pos.x, point.pos.y));
            actionLists.push(action);
        });
        actionLists.push(cc.callFunc(callBack))

        curve.action = target.runAction(cc.sequence(actionLists));
        let bezier = new Bezier(curve);
        return bezier;
    }

    // 移动迭代
    private static MoveIter(index: number, target: cc.Node, curveList: Curve[], callBack = () => { }, bezier: Bezier): Bezier {
        let curve = curveList[index]
        if (curve == null) {
            if (callBack) {
                callBack()
            }
            return
        }
        // bezier.next = Bezier.Move(target, curve.points, curve.duration, curve.ease, () => {
        //     this.MoveIter(++index, target, curveList, callBack, bezier.next)
        // });

        bezier.next = Bezier.Move(target, curve, () => {
            this.MoveIter(++index, target, curveList, callBack, bezier.next)
        });
    }

    /**
     * 移动队列, 需要传入一个曲线列表, 顺序执行每个曲线。每个曲线的duration（生命周期）和ease（缓动）都是独立的
     * @param target 目标节点
     * @param curveList 曲线列表
     * @param callBack 回调
     * @returns Bezier
     */
    public static MoveQuenue(target: cc.Node, curveList: Curve[], callBack = () => { }): Bezier {
        let bezier = new Bezier(null);
        if (!curveList || curveList.length == 0) {
            return bezier
        }
        this.MoveIter(0, target, curveList, callBack, bezier)
        return bezier
    }

    public static GetLastCurvePos(curveList: Curve[]) {
        let lastCurve = curveList[curveList.length - 1]
        return lastCurve.points[lastCurve.points.length - 1]
    }
    private static GetCurTimeAndIndex(time: number, timeList: number[], duration: number) {
        let timeStep = 0
        let preTime = 0
        for (let index = 0; index < timeList.length; index++) {
            timeStep += timeList[index] / duration
            if (time <= timeStep) {
                return {
                    time: (time - preTime) / (timeStep - preTime),
                    index: index
                }
            }
            preTime = timeStep
        }
    }
    // 计算曲线点(曲线列表)
    public static CalculateCurveListPos(curveList: Curve[], timeList: number[], curTime: number, duration: number, ease: EaseType): cc.Vec3 {
        let newTime = Evaluate.Calculate(ease, curTime, duration);
        let nowData = this.GetCurTimeAndIndex(newTime, timeList, duration)
        let nowCurve = curveList[nowData.index]
        let v3 = Bezier.GetCurTimePos(nowCurve.points, nowData.time)
        return v3;
    }

    /**
     * 曲线列表整体以ease缓动移动，共享duration(生命周期)，ease(缓动)。
     * @param target 目标节点
     * @param curveList 曲线列表
     * @param duration 生命周期
     * @param ease 缓动
     * @param callBack 回调
     * @returns Bezier
     */
    public static MoveList(target: cc.Node, curveList: Curve[], duration: number, ease: EaseType = EaseType.Linear, callBack = () => { }): Bezier {
        if (!curveList || curveList.length == 0) {
            return
        }
        // 一个曲线就按正常的执行
        if (curveList.length == 1) {
            return Bezier.Move(target, curveList[0], callBack);
        }
        // 匀速就走匀速 移动队列
        if (ease == EaseType.Constant) {
            return this.MoveQuenue(target, curveList, callBack)
        }
        let timeList = curveList.map(v => {
            return v.duration
        })
        let curveListObj = new CurveList(curveList, timeList, duration, ease, callBack, target)
        BezierManager.Instant.AddCurveList(target, curveListObj)

        let bezier = new Bezier(curveListObj);
        return bezier
    }



}

