/**
 * @Author: Gongxh
 * @Date: 2024-12-21
 * @Description: 矩形
 */
import { eShapeType } from "./IQTShape";
import { QTPolygon } from "./QTPolygon";

// 3|2
// --
// 0|1
// 矩形的四个点

export class QTBox extends QTPolygon {

    x: number;
    y: number;
    width: number;
    height: number;

    public get_shapeType(): eShapeType {
        return eShapeType.BOX;
    }

    constructor(x: number, y: number, width: number, height: number, tag: number = -1) {
        let points: cc.Vec2[] = new Array(4);
        points[0] = cc.v2(x, y);
        points[1] = cc.v2(x + width, y);
        points[2] = cc.v2(x + width, y + height);
        points[3] = cc.v2(x, y + height);
        super(points, tag);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public resetPoints(x: number, y: number, width: number, height: number): void {
        let points: cc.Vec2[] = new Array(4);
        points[0] = cc.v2(x, y);
        points[1] = cc.v2(x + width, y);
        points[2] = cc.v2(x + width, y + height);
        points[3] = cc.v2(x, y + height);
        this.points = points;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}