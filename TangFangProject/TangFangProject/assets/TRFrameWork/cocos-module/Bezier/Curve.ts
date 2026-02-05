import { BezierCurve, State } from './BezierCurve';
import BezierManager from './BezierManager';
import CurvePoint from './CurvePoint';
import Point from './CurvePoint';
import { Bezier, BVector2 } from './Tools/Bezier';
import { EaseType, Evaluate } from './Tools/EaseType';
import TransformUtils from './Tools/TransformUtils';
const { ccclass, property, executeInEditMode, inspector, menu } = cc._decorator;
let Vec3 = cc.Vec3;

export enum CurveState {
    Running,
    Stop,
    Pause
}

@ccclass('Curve')
export class Curve implements CurveAction {

    public prevRunPos: cc.Vec3 = Vec3.ZERO;
    // 当前运行时间
    public curTime: number = 0;
    // 目标节点
    private _target: cc.Node;
    public get target(): cc.Node {
        return this._target
    }
    public set target(v: cc.Node) {
        this._target = v;
    }

    // 完成回调
    public completeCallBack: () => void = () => { }

    // 状态
    private _state: CurveState;
    public get state(): CurveState {
        return this._state
    }
    public set state(v: CurveState) {
        this._state = v;
    }
    // 匀速才用到
    public action: cc.Action;


    // 所属者索引
    private _index: number = 0;
    public get index(): number {
        return this._index;
    }
    public set index(v: number) {
        this._index = v;
    }

    private _owner: BezierCurve = null
    public get owner(): BezierCurve {
        return this._owner
    }
    public set owner(v: BezierCurve) {
        this._owner = v;
    }

    // 控制节点
    @property({ visible: false })
    public controlPoints: cc.Node[] = [];

    // 控制点
    @property({ visible: false })
    private _points: cc.Vec3[] = [];
    @property({ type: cc.Vec3, tooltip: "控制点列表", visible: true })
    public get points(): cc.Vec3[] {
        return this._points;
    }
    public set points(v: cc.Vec3[]) {
        this._points = v;
    }

    // 曲线运行时间
    @property({ visible: false })
    private _duration: number = null;
    @property({ type: cc.Float, displayName: "运行时长", visible: true })
    public get duration(): number {
        return this._duration;
    }
    public set duration(v: number) {
        this._duration = v;
        // console.error("set duration:"+v)
        if (this.owner) {
            this.owner.isReLoad = false
            this.owner.CalculateCurveRunTimeInversion()
            this.owner.isReLoad = true
        }
    }
    public SetDuration(v: number) {
        this._duration = v;
    }

    // 缓动动画
    @property({ visible: false })
    private _ease: EaseType = EaseType.Linear;
    @property({ type: cc.Enum(EaseType), displayName: "缓动动画", visible: true })
    public get ease(): EaseType {
        return this._ease
    }
    public set ease(v: EaseType) {
        this._ease = v;
        if (this.owner)
            this.owner.isReLoad = false
    }

    public line: cc.Node;
    public nextCurve: Curve;
    public prevCurve: Curve;

    @property({ type: cc.Float, visible: false })
    public smoothness: number = 300;

    @property({ type: cc.Graphics, visible: false })
    public lineRenderer: cc.Graphics = null;

    private lineColor: cc.Color = cc.Color.GREEN;
    private subLineColor: cc.Color = cc.Color.RED;
    // private lineMat: cc.Material;

    @property({ visible: false })
    public angleOffset: number = null;

    public Init(points: cc.Vec3[], duration: number, color?: cc.Color, width?: number, owner?: BezierCurve) {
        this.controlPoints = []
        this.points = []
        this.line = new cc.Node("line");
        this.lineRenderer = this.line.addComponent(cc.Graphics);
        this.lineRenderer.lineJoin = cc.Graphics.LineJoin.ROUND;
        // 添加控制点
        if (points) {
            for (let i = 0; i < points.length; i++) {
                this.AddPoint(points[i]);
            }
        }
        this._duration = duration
        // this.smoothness = smoothness
        this.lineRenderer.strokeColor = color
        this.lineRenderer.lineWidth = width
        this.owner = owner
        // 添加辅助线
        this.UpdatePoints();
        this.UpdateSubLine();
        return this
    }

    private prePoint: Point
    public AddPoint(pos: cc.Vec3) {
        let go = new cc.Node()
        let point = go.addComponent(CurvePoint).Init(15)
        let i = this.points.length;
        point.SetIndex(i)
        point.SetPosition(pos)
        point.SetParent(this.line)
        point.SetName("point_" + i)
        point.SetOwner(this);
        point.SetLabelColor(cc.Color.BLACK)
        // 起点和终点
        if (i == 0) {
            point.SetColor(this.lineColor)
            this.prePoint = point
        } else {
            point.SetColor(this.subLineColor)
            if (this.prePoint) {
                point.SetColor(this.lineColor)
                this.prePoint = point
            }
        }

        this.controlPoints[i] = go;
        this.points[i] = pos;
    }

    public SetLineColor(color: cc.Color) {
        this.lineColor = color;
        this.UpdatePoints();
        this.UpdateSubLine();
    }

    public SetSubLineColor(color: cc.Color) {
        this.subLineColor = color;
        this.UpdatePoints();
        this.UpdateSubLine();
    }

    // public SetLineMat(mat: cc.Material) {
    //     this.lineMat = mat;
    //     this.lineRenderer.setMaterial(0, mat);
    //     this.UpdatePoints();
    //     this.UpdateSubLine();
    // }

    public SetWidth(width: number) {
        this.lineRenderer.lineWidth = width;
        this.UpdatePoints();
        this.UpdateSubLine();
    }

    // 设置平滑度
    public SetSmoothness(value: number) {
        this.smoothness = value;
        // this.UpdatePoints();
        // this.UpdateSubLine();
    }

    public SetEase(value: EaseType) {
        this._ease = value;
        // this.UpdatePoints();
        // this.UpdateSubLine();
    }

    public SetAngleOffset(value: number) {
        this.angleOffset = value;
    }


    public Update() {
        this.UpdatePoints();
        this.UpdateSubLine();
    }

    public UpdatePoints() {
        if (this.lineRenderer) {
            let posList = this.controlPoints.map(node => {
                if (node) {
                    return node.position as any;
                }
            })
            let posArr = Bezier.GetCurvePointList(posList, 1, EaseType.Linear, this.smoothness);
            this.DrawLine(posArr, this.lineColor);
        }
    }

    private DrawLine(posArr: cc.Vec3[], color: cc.Color, isClear: boolean = true) {
        if (this.lineRenderer == null)
            return
        if (isClear)
            this.lineRenderer.clear();
        if (posArr.length <= 0) {
            return
        }
        this.lineRenderer.strokeColor = color;

        this.lineRenderer.moveTo(posArr[0].x, posArr[0].y);

        posArr.forEach(pos => {
            this.lineRenderer.lineTo(pos.x, pos.y);
        });

        this.lineRenderer.stroke();
    }

    private UpdateSubLine() {
        if (!this.controlPoints) {
            return
        }
        let posList = this.controlPoints.map(node => {
            return node.position as any;
        })
        if (posList && posList.length > 0) {
            posList.forEach((pos, i) => {
                if (posList[i + 1]) {
                    this.DrawLine([pos, posList[i + 1]], this.subLineColor, false);
                }
            });
        }
    }

    UpdatePointColor() {
        this.controlPoints.forEach((node, i) => {
            let point = node.getComponent(CurvePoint);
            if (point) {
                // 起点和终点
                if (i == 0 || i == this.points.length - 1) {
                    point.SetColor(this.lineColor)
                } else {
                    point.SetColor(this.subLineColor)
                }
            }

        })
    }

    // 检测坐标是否变化
    public CheckPositionChanged(): boolean {
        let isChange = false;

        this.controlPoints.forEach((node, i) => {
            var prePos = this.points[i];
            var curPos = TransformUtils.TransformPosition(node.position, cc.Vec3.name)
            if (!curPos.equals(prePos)) {
                isChange = true;
                this.points[i] = curPos
            }
        })
        return isChange;

        // return true;
    }

    public RemoveLineRender() {
        if (this.line) {
            this.line.destroy();
            this.lineRenderer = null
            this.line = null
        }
    }

    /**
     * 重置line node属性
     */
    public ResetLineNodeProperty() {
        if (this.line) {
            this.line.position = TransformUtils.TransformPosition(new Vec3(0), this.line.position.constructor.name);
            // this.line.angle = 0;
            this.line.scale = 1;
            this.line.skewX = 0;
            this.line.skewY = 0;
        }
    }

    /**
     * 删除点
     * @param index 索引
     */
    public DeletePoint(index: number) {
        let corPoint = this.controlPoints[index]
        if (corPoint) {
            this.controlPoints[index].destroy()
            this.controlPoints.splice(index, 1)
            this.points.splice(index, 1);
        }
    }

    /** */
    public Delete() {
        this.line.destroy()
        this.points = null
        this.controlPoints = null
        if (this.owner) {
            this.owner.DeleteCurve(this)
        }
    }



    private pointList: BVector2[] = [];
    private prevPos: BVector2;
    public _length: number;
    public set length(v: number) {
        this._length = v;
    }
    public get length() {
        if (this._length == null) {
            this.GetPointList()
        }
        return this._length
    }
    // 重置数据
    private ResetData() {
        // 点集合
        this.pointList = [];
        // 线段总长度
        this.length = 0;
        // 初始位置
        this.prevPos = new BVector2(this.points[0], 0, 0);
    }

    public GetPointList(): BVector2[] {
        this.ResetData();
        let duration = this.duration;
        let smoothness = this.smoothness ? this.smoothness : 300;

        let step = duration / smoothness;
        if (step <= 0)
            return this.pointList;
        // 开始分割曲线
        for (let i = 0; i <= duration; i += step) {
            if (i + step > duration) {
                i = duration
            }
            this.CalculateBezier(i)
        }
        return this.pointList;
    }
    /**
     * 计算贝塞尔点
     */
    private CalculateBezier(curTime: number) {
        let t = Evaluate.Calculate(this.ease, curTime, this.duration);
        let pos = Bezier.GetCurTimePos(this.points, t)

        // 计算两点距离
        let length = Math.sqrt(Math.pow(this.prevPos.pos.x - pos.x, 2) + Math.pow(this.prevPos.pos.y - pos.y, 2));
        let v3 = new BVector2(pos, length, 0);

        // 存储当前节点z
        this.pointList.push(v3);
        this.prevPos = v3;
        // 累计长度
        this._length += length;
    }


    /**
     * 停止
     */
    public Stop() {
        this.state = CurveState.Stop
        BezierManager.Instant.RemoveCurve(this.target)
        if (this.action && this.target) {
            this.target.stopAction(this.action);
        }
    }
    /**
     * 暂停
     */
    public Pause() {
        this.state = CurveState.Pause
        if (this.action && this.target) {
            this.target.pauseAllActions()
        }
    }
    /**
     * 恢复
     */
    public Resume() {
        this.state = CurveState.Running
        if (this.action && this.target) {
            this.target.resumeAllActions()
        }
    }

    // 是否跟随旋转
    public IsFollowRotate(): boolean {
        return this.angleOffset != null
    }

    // 获取当前位置的旋转角度
    public GetAngle(pos: cc.Vec3) {
        let fmPos = this.prevRunPos;
        let toPos = pos;
        let dir: cc.Vec3 = cc.Vec3.ZERO;
        toPos.sub(fmPos, dir);

        // let radians = cc.Vec3.RIGHT.signAngle(dir)
        let radians = cc.Vec2.RIGHT.signAngle(cc.v2(dir.x,dir.y))
        let angle = cc.misc.radiansToDegrees(radians) - this.angleOffset
        return angle;
    }
}


export class CurveList implements CurveAction {
    public prevRunPos: cc.Vec3 = cc.Vec3.ZERO;
    private angleOffset: number;

    public list: Curve[]
    public timeList: number[]
    public duration: number
    public ease: EaseType
    public completeCallBack: () => void
    public curTime: number = 0
    public state: CurveState;
    public target: cc.Node;

    constructor(list: Curve[], timeList: number[], duration: number, ease: EaseType = EaseType.Linear, callBack = () => { }, target?: cc.Node) {
        this.list = list
        this.timeList = timeList
        this.duration = duration
        this.ease = ease
        this.curTime = 0
        this.completeCallBack = callBack
        this.state = CurveState.Running
        this.target = target
        this.angleOffset = list[0]?.angleOffset
    }

    /**
        * 停止运动
        */
    public Stop() {
        this.state = CurveState.Stop
        BezierManager.Instant.RemoveCurveList(this.target)
        // if (this.action && this.target) {
        //     this.target.stopAction(this.action);
        // }
    }

    public Pause() {
        this.state = CurveState.Pause
        // if (this.action && this.target) {
        //     this.target.stopAction(this.action);
        // }
    }

    public Resume() {
        this.state = CurveState.Running
        // if (this.action && this.target) {
        //     this.target.stopAction(this.action);
        // }
    }

    // 

    // 是否跟随旋转
    public IsFollowRotate(): boolean {
        return this.angleOffset != null
    }

    // 获取当前位置的旋转角度
    public GetAngle(pos: cc.Vec3) {
        let fmPos = this.prevRunPos;
        let toPos = pos;
        let dir: cc.Vec3 = cc.Vec3.ZERO;
        toPos.sub(fmPos, dir);

        let radians = cc.Vec2.RIGHT.signAngle(cc.v2(dir.x,dir.y))
        let angle = cc.misc.radiansToDegrees(radians) - this.angleOffset
        return angle;
    }
}



export interface CurveAction {
    prevRunPos: cc.Vec3;
    Stop(): void
    Pause(): void
    Resume(): void
    // 是否跟随旋转
    IsFollowRotate(): boolean
    GetAngle(pos: cc.Vec3): number
}
