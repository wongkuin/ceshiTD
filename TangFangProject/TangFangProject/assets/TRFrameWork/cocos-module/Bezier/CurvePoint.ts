import BezierManager from "./BezierManager";
import { Curve } from "./Curve";
import PointLabel from "../component/PointLabel";
import TransformUtils from "./Tools/TransformUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CurvePoint extends cc.Component {
    private graphics: cc.Graphics
    private indexLabel: cc.Label
    private index: number
    private owner: Curve
    private size: number

    public Init(size: number, color: cc.Color = cc.Color.RED) {
        this.size = size;
        this.node.name = "demo"
        this.node.width = size * 2
        this.node.height = size * 2
        this.graphics = this.node.addComponent(cc.Graphics)
        this.graphics.circle(0, 0, size);
        this.graphics.fillColor = color
        this.graphics.fill();

        let labelNode = new cc.Node();
        this.indexLabel = labelNode.addComponent(cc.Label)
        labelNode.width = size * 2
        labelNode.height = size * 2
        labelNode.parent = this.node
        this.indexLabel.overflow = cc.Label.Overflow.SHRINK;
        this.indexLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        // 锁定该节点
        labelNode.addComponent(PointLabel)
        // this.indexLabel["_objFlags"] |= cc.Object['Flags'].LockedInEditor
        return this;
    }

    public SetColor(color: cc.Color) {
        this.graphics.clear();
        this.graphics.circle(0, 0, this.size);
        this.graphics.fillColor = color
        this.graphics.fill();
    }

    public SetLabelColor(color: cc.Color) {
        this.indexLabel.node.color = color
    }

    public SetPosition(pos: cc.Vec3) {
        this.node.position = TransformUtils.TransformPosition(pos)
    }

    public SetParent(node: cc.Node) {
        this.node.parent = node;
    }

    public SetName(name: string) {
        this.node.name = name;
    }

    public SetIndex(i: number) {
        this.indexLabel.string = i.toString();
        this.index = i;
    }

    public SetOwner(owner: Curve) {
        this.owner = owner;
    }


    // _onPreDestroy(){
    //     this.Delete()
    // }
    // ------------------------------------------------

    private GetRandomPos() {
        let canvasSize = cc.view.getCanvasSize()
        let randX = Math.random() * canvasSize.width - canvasSize.width * 0.5;
        let randY = Math.random() * canvasSize.height - canvasSize.height * 0.5;
        return new cc.Vec3(randX, randY)
    }

    public Delete() {
        if (this.owner) {
            this.owner.DeletePoint(this.index)
            this.owner.owner.ReLoadCurveList()
        }
    }

    public Add() {
        if (this.owner) {
            this.owner.AddPoint(this.GetRandomPos())
            this.owner.owner.ReLoadCurveList()
        }
    }

    public DeleteCurve() {
        if (this.owner) {
            this.owner.Delete()
            this.owner.owner.ReLoadCurveList()
        }
    }
}
