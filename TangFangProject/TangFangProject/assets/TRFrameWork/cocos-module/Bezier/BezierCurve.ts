import { Curve } from './Curve';
import { Bezier } from './Tools/Bezier';
import { EaseType } from './Tools/EaseType';
import TransformUtils from './Tools/TransformUtils';
const { ccclass, property, executeInEditMode, inspector, menu } = cc._decorator;

let Component = cc.Component;
let Prefab = cc.Prefab;
let loader = cc.assetManager;
let Vec3 = cc.Vec3;
const PathNodeName = "_BezierPathNode";

export enum State {
    None,
    DurationSetting,
}

// @ccclass('BezierCurve')
@ccclass
@executeInEditMode
@menu('Bezier')
// @inspector("packages://bezier/inspector.js")
export class BezierCurve extends Component {

    private defaultPoints: cc.Vec3[] = [
        new Vec3(-150, 0),
        new Vec3(-150, 200),
        new Vec3(150, 200),
        new Vec3(150, 0),
    ];

    @property({ type: Curve, visible: false })
    public curve: Curve = null;
    // 是否编辑
    @property({ visible: false })
    private _isEdit: boolean = true;
    @property({ type: cc.Boolean, displayName: "编辑", })
    public get isEdit(): boolean {
        if (!CC_EDITOR) {
            return false;
        }
        return this._isEdit;
    }
    public set isEdit(v: boolean) {
        this._isEdit = v;
        this.Edit();
    }

    // 是否绘制路径
    @property({  visible: false })
    private _isDrawPath: boolean = true;
    @property({ type: cc.Boolean, displayName: "运行时绘制路径", })
    public get isDrawPath(): boolean {
        return this._isDrawPath;
    }
    public set isDrawPath(v: boolean) {
        this._isDrawPath = v;
        if (!this.isEdit) {
            this.DrawPath()
        }
    }

    // 根节点
    @property({ type: cc.Node, displayName: "路径根节点", visible: true, readonly: true })
    private pathNode: cc.Node = null;


    //曲线宽度
    @property({ type: cc.Float, visible: false })
    private _curveWidth: number = 5;

    @property({ type: cc.Float, slide: true, range: [0, 10], displayName: "曲线宽度", })
    public get curveWidth(): number {
        return this._curveWidth;
    }
    public set curveWidth(v: number) {
        this._curveWidth = v;
        this.SetCurveWidth(v);
    }

    //曲线颜色
    @property({  visible: false })
    private _curveColor: cc.Color = cc.Color.GREEN;

    @property({ type: cc.Color, displayName: "曲线颜色", })
    public get curveColor(): cc.Color {
        return this._curveColor;
    }
    public set curveColor(v: cc.Color) {
        this._curveColor = v;
        this.SetCurveColor(v);
        console.warn("curveColor")
    }

    //辅助线颜色
    @property({  visible: false })
    private _subLineColor: cc.Color = cc.Color.RED;

    @property({ type: cc.Color, displayName: "辅助线颜色", })
    public get subLineColor(): cc.Color {
        return this._subLineColor;
    }
    public set subLineColor(v: cc.Color) {
        this._subLineColor = v;
        this.SetCurveSubLineColor(v);
    }

    // //曲线material
    // @property({ visible: false })
    // private _curveMat: any;

    // @property({ displayName: "曲线材质", })
    // public get curveMat(): any {
    //     return this._curveMat;
    // }
    // public set curveMat(v: any) {
    //     this._curveMat = v;
    //     this.SetCurveMat(v);
    //     console.warn("curveMat")
    // }

    //曲线平滑度
    // @property({ type: cc.Float, visible: false })
    // private _curveSmoothness: number = 80;

    // @property({ type: cc.Float, displayName: "曲线平滑度", tooltip: "", slide: true, range: [10, 500] })
    // public get curveSmoothness(): number {
    //     return this._curveSmoothness;
    // }
    // public set curveSmoothness(v: number) {
    //     this._curveSmoothness = v;
    //     this.SetCurveSmoothness(v);
    // }

    private _isReLoad: boolean = true
    public get isReLoad(): boolean {
        return this._isReLoad
    }
    public set isReLoad(v: boolean) {
        console.warn("set isReLoad", v)
        this._isReLoad = v;
    }

    // 曲线列表
    @property({ visible: false })
    private _curveList: Curve[] = [];
    @property({ type: Curve, displayName: "曲线列表", visible: true })
    public get curveList(): Curve[] {
        return this._curveList;
    }
    public set curveList(v: Curve[]) {
        this._curveList = v;
        if (this.isReLoad) {
            this.ReLoadCurveList()
            this.CalculateCurveRunTimeInversion()
        } else {
            console.error("不能重载", this.isReLoad)
        }
        this.isReLoad = true
    }
    // public SetCurveList(v: Curve[]) {
    //     this._curveList = v;
    // }

    // 缓动动画
    @property({ type: cc.Float, visible: false })
    private _ease: EaseType = EaseType.Linear;
    @property({ type: cc.Enum(EaseType), displayName: "缓动动画", visible: true })
    public get ease(): number {
        return this._ease;
    }
    public set ease(v: number) {
        this._ease = v;
        this.SetEase(v);
        this.isReLoad = true
    }

    // 持续时间
    @property({ type: cc.Float, visible: false })
    private _duration = 1;
    @property({ type: cc.Float, displayName: "运行时间", visible: true })
    public get duration(): number {
        return this._duration;
    }
    public set duration(v: number) {
        this._duration = v;
        this.CalculateCurveRunTime();
    }
    public SetDuration(v: number) {
        this._duration = v;
    }

    //是否跟随路径旋转
    @property({ visible: false })
    private _isRotate: boolean = false;
    @property({ type: cc.Boolean, displayName: "跟随旋转", tooltip: "是否跟随轨迹旋转", })
    public get isRotate(): boolean {
        return this._isRotate;
    }
    public set isRotate(v: boolean) {
        this._isRotate = v;
        if (!v) {
            this.SetAngleOffset(null);
        }
    }
    // 角度偏移
    @property({ visible: false })
    private _angleOffset: number = 0;
    @property({
        displayName: "偏移角度",
        visible() {
            return this.isRotate
        }
    })
    public get angleOffset(): number {
        if (!this.isRotate) {
            return null
        }
        return this._angleOffset;
    }
    public set angleOffset(v: number) {
        // if (!this.isRotate) {
        //     return null
        // }
        this._angleOffset = v;
        this.SetAngleOffset(v);
    }

    //是否整体采用一个Ease缓动动画
    @property({ visible: false })
    private _isWholeRun: boolean = false;
    @property({ type: cc.Boolean, displayName: "整体运行", tooltip: "是否整体采用一个Ease缓动动画(尽量不勾选)", })
    public get isWholeRun(): boolean {
        return this._isWholeRun;
    }
    public set isWholeRun(v: boolean) {
        this._isWholeRun = v;
    }



    onLoad() {

    }

    onEnable() {
        let list = this.node.getComponents(BezierCurve)
        if (list.length > 1) {
            if (CC_EDITOR) {
                console.warn("该节点已有Bezier组件，不能重复添加！")
            } else {
                console.warn("该节点已有Bezier组件，不能重复添加！")
            }
            this.destroy()
            return
        }

        this._isEdit = true
        this.init()
    }

    onDisable() {
        this.DestroyPathNode()
    }

    onDestroy() {
    }

    init() {
        if (!CC_EDITOR) {
            this.isEdit = false
            return
        }
        if (this.curveList.length > 0) {
            this.ReLoadCurveList()
        } else {
            this.Clear()
            this.AddCurve_M(this.CreateRandomCurve());
        }
        this.CalculateCurveRunTime();
    }

    private preCurve: Curve;
    private AddCurve_M(curve: Curve) {
        if (this.curve == null) {
            this.curve = curve;
            this.pathNode = new cc.Node(this.node.name + PathNodeName);
            this.pathNode.parent = this.node.parent;
            this.preCurve = curve

            // this.pathNode.on(cc.Node.EventType.POSITION_CHANGED, () => {
            //     console.warn("Can't change pathNode position")
            //     // this.ResetLineNodeProperty()
            // }, this);
            // this.pathNode.on(cc.Node.EventType.child, () => {
            //     console.warn("Can't change pathNode position")
            //     // this.ResetLineNodeProperty()
            // }, this);
        }
        else {
            curve.prevCurve = this.preCurve
            this.preCurve.nextCurve = curve;
            this.preCurve = curve
        }
        if (curve.line) {
            curve.line.parent = this.pathNode;
            this.pathNode.setSiblingIndex(0)
        }
        this.SetCurveColor(this.curveColor);
        this.SetCurveSubLineColor(this.subLineColor);
        this.SetCurveWidth(this.curveWidth);
        // 添加控制点列表
        this._curveList.push(curve)
        curve.index = this._curveList.length - 1;
        return curve
    }

    update(deltaTime: number) {
        this.ResetLineNodeProperty()
        if (CC_EDITOR) {
            this.ForeachCurve(this.curve, (curve, i) => {
                if (curve.CheckPositionChanged()) {
                    curve.Update();
                    this.UpdateControlPointList(curve, i);
                }
            })
            // this.CheckPathNodeState()
        }
    }

    private ResetLineNodeProperty() {
        if (!this.pathNode)
            return

        // this.pathNode.position = TransformUtils.TransformPosition(new cc.Vec2(0));
        this.pathNode.position = cc.Vec3.ZERO;
        this.pathNode.scale = 1;
        this.pathNode.skewX = 0;
        this.pathNode.skewY = 0;

        this.curveList.forEach(c => {
            c.ResetLineNodeProperty()
        })
    }

    private CheckPathNodeState() {
        if (this.pathNode == null) {
            this.ReLoadCurveList()
        }
    }

    private UpdateControlPointList(curve: Curve, i: number) {
        // console.warn("UpdateControlPointList")
    }

    private SetCurveColor(color: cc.Color = cc.Color.WHITE) {
        this.ForeachCurve(this.curve, (curve, i) => {
            curve.SetLineColor(color);
            curve.UpdatePointColor()
        })
    }
    private SetCurveSubLineColor(color: cc.Color = cc.Color.WHITE) {
        this.ForeachCurve(this.curve, (curve, i) => {
            curve.SetSubLineColor(color);
            curve.UpdatePointColor()
        })
    }
    // private SetCurveMat(mat: any) {
    //     this.ForeachCurve(this.curve, (curve, i) => {
    //         curve.SetLineMat(mat);
    //         curve.UpdatePointColor()
    //     })
    // }
    private SetCurveWidth(width: number = 2) {
        this.ForeachCurve(this.curve, (curve, i) => {
            curve.SetWidth(width);
        })
    }
    // 平滑度
    private SetCurveSmoothness(value: number = 100) {
        this.ForeachCurve(this.curve, (curve, i) => {
            curve.SetSmoothness(value);
        })
    }

    // ease
    private SetEase(value: EaseType = EaseType.Linear) {
        this.ForeachCurve(this.curve, (curve, i) => {
            curve.SetEase(value);
        })
    }

    // 偏移角度
    private SetAngleOffset(angle: number) {
        this.ForeachCurve(this.curve, (curve, i) => {
            curve.SetAngleOffset(angle);
        })
    }

    private Clear() {
        this._curveList = []
        this.curve = null;
        this.DestroyPathNode()
    }

    private DestroyPathNode() {
        if (this.pathNode) {
            this.pathNode.destroy()
            this.pathNode = null
        }
        if (this.curveList) {
            this.curveList.forEach(v => {
                v.RemoveLineRender()
            })
        }
    }

    private DestroyPointNode() {
        if (this.pathNode) {
            this.pathNode.children.forEach(line => {
                line.destroyAllChildren()
            })
        }
    }
    private HideNodeInHierarchy(node: cc.Node) {
        if (node) {
            node["_objFlags"] |= (cc.Object["Flags"].LockedInEditor | cc.Object["Flags"].HideInHierarchy);
        }
    }

    /**
     * 重新加载曲线
     */
    public ReLoadCurveList() {
        // if (!CC_EDITOR) {
        //     return
        // }

        this.DestroyPathNode()
        let posTemp = this._curveList
        this._curveList = []
        this.curve = null;
        posTemp.forEach(curve => {
            this.ReLoadCurve(curve);
        })
    }

    private ForeachCurve(node: Curve, func: (curve: Curve, index: number) => void): void {
        var curNode = node;
        let index = 0
        while (curNode != null) {
            func(curNode, index);
            curNode = curNode.nextCurve;
            index++
        }
    }
    // 编辑
    private Edit() {
        if (!this.enabled) {
            return
        }

        if (this.isEdit) {
            this.ReLoadCurveList()
        } else {
            this.DestroyPathNode()
            this.DrawPath()
        }
    }

    // 绘制路径
    private DrawPath() {
        if (!this.enabled) {
            return
        }

        if (this.isDrawPath) {
            this.ReLoadCurveList()
            this.ForeachCurve(this.curve, (curve, i) => {
                curve.UpdatePoints();
            })
            this.DestroyPointNode()
            this.HideNodeInHierarchy(this.pathNode)
        } else {
            this.DestroyPathNode()
        }


    }
    private GetRandomPos() {
        let canvasSize = cc.view.getCanvasSize()
        let randX = Math.random() * canvasSize.width - canvasSize.width * 0.5;
        let randY = Math.random() * canvasSize.height - canvasSize.height * 0.5;
        return new cc.Vec3(randX, randY)
    }

    private CreateRandomCurve() {
        let curve = new Curve().Init(
            [this.GetRandomPos(), this.GetRandomPos(), this.GetRandomPos(), this.GetRandomPos()],
            // [...this.defaultPoints],
            this.duration,
            this.curveColor,
            this.curveWidth,
            this
        )
        curve.SetEase(this.ease)
        return curve;
    }

    private ReLoadCurve(curve: Curve) {
        if (curve == null) {
            curve = this.CreateRandomCurve()
        }
        let points = curve.points
        let duration = curve.duration || this.duration
        let ease = curve.ease || this.ease
        let angleOffset = curve.angleOffset || this.angleOffset

        curve = this.AddCurve_M(
            new Curve().Init(
                [...points],
                duration,
                this.curveColor,
                this.curveWidth,
                this
            )
        );
        curve.SetEase(ease)
        curve.SetAngleOffset(angleOffset)

        // this.AddCurve_M(curve)
    }

    private CalculateCurveRunTime() {
        if (this.curveList.length == 0) {
            return
        }
        if (this.curveList.length == 1) {
            this.curveList[0].duration = this.duration
            return
        }
        let totalLength = 0
        let lengthList = this.curveList.map(curve => {
            let len = curve.length
            totalLength += len
            return len
        });
        let timeScale = this.duration / totalLength
        this.isReLoad = false
        this.curveList.forEach((curve, i) => {
            let time = lengthList[i] * timeScale
            curve.SetDuration(Math.round(time * 100) / 100)
        })
        this.isReLoad = true
    }
    public CalculateCurveRunTimeInversion() {
        console.warn("CalculateCurveRunTimeInversion: ", this.curveList)
        if (this.curveList.length == 1) {
            this._duration = this.curveList[0].duration
            return
        }
        let totalDuration = 0
        this.curveList.forEach((curve, i) => {
            console.warn("curve.duration:" + curve.duration)
            totalDuration += curve.duration
        })
        this.isReLoad = false
        this.SetDuration(totalDuration)
    }


    //-------------------------------------------------外部API----------------------------------------------
    private _completeCallBack: () => void;
    /**
     * 设置回调
     * @param callBack 完成回调
     */
    public SetCompleteCallBack(callBack?: () => void) {
        this._completeCallBack = callBack
    }

    private bezier: Bezier;
    /**
     * 播放
     */
    public Play(): void {
        if (this.isWholeRun) {
            this.bezier = Bezier.MoveList(this.node, this.curveList, this.duration, this.ease, this._completeCallBack);

        } else {
            this.bezier = Bezier.MoveQuenue(this.node, this.curveList, this._completeCallBack)
        }
    }
    /**
     * 停止
     */
    public Stop(): void {
        if (this.bezier) {
            this.bezier.Stop()
        }
    }
    /**
     * 暂停
     */
    public Pause(): void {
        if (this.bezier) {
            this.bezier.Pause()
        }
    }
    /**
     * 恢复
     */
    public Resume(): void {
        if (this.bezier) {
            this.bezier.Resume()
        }
    }

    /**
     * 添加曲线
     * @param curve 曲线
     */
    public AddCurve(curve: Curve): void {
        this._curveList.push(curve);
    }

    /**
     * 删除曲线
     * @param curve 曲线
     */
    public DeleteCurve(curve: Curve): void;
    /**
     * 删除曲线
     * @param index 索引
     */
    public DeleteCurve(index: number): void;
    public DeleteCurve(param: any) {
        let curve: Curve;
        let i: number;
        if (typeof param == "number") {
            i = param
            curve = this._curveList[param]
        } else if (typeof param == "object" && param.constructor.name == Curve.name) {
            curve = param
            i = curve.index
        }
        // 删除
        if (curve.prevCurve == null) {
            this.curve = curve.nextCurve
        } else {
            curve.prevCurve.nextCurve = curve.nextCurve
        }
        this._curveList.splice(i, 1);
        // 更新索引
        this._curveList.forEach((c, index) => {
            c.index = index
        })
    }


    /**
     * 删除点
     * @param curveIndex 曲线索引
     * @param pointIndex 点索引
     */
    public DeleteCurvePoint(curveIndex: number, pointIndex: number) {
        let curve = this._curveList[curveIndex]
        if (curve) {
            curve.DeletePoint(pointIndex)
            this.ReLoadCurveList()
        }
    }


    // 编辑器
    /**
     * 添加一个随机曲线
     */
    public AddRandomCurve() {
        this.AddCurve_M(this.CreateRandomCurve())
        this.ReLoadCurveList()
    }

}
