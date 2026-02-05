/**
 * @Author: Gongxh
 * @Date: 2024-12-21
 * @Description: 多边形
 */

import { eShapeType } from "./IQTShape";
import { QTShape } from "./QTShape";


const vec2 = new cc.Vec2();
/** 点绕原点旋转 radians 弧度后的新点 */
function rotate(radians: number, x: number, y: number): cc.Vec2 {
    let sin = Math.sin(radians);
    let cos = Math.cos(radians);
    vec2.x = x * cos - y * sin;
    vec2.y = y * cos + x * sin;
    return vec2;
}

// /** 点绕点旋转 radians 弧度后的新点 */
// export function rotateByPoint(radians: number, x: number, y: number, cx: number, cy: number): Vec2 {
//     let sin = Math.sin(radians);
//     let cos = Math.cos(radians);
//     vec2.x = (x - cx) * cos - (y - cy) * sin + cx;
//     vec2.y = (y - cy) * cos + (x - cx) * sin + cy;
//     return vec2;
// }

export class QTPolygon extends QTShape {
    
    protected _points: cc.Vec2[] = []; // 多边形
    protected _realPoints: cc.Vec2[];

    // public get shapeType(): eShapeType {
    //     return eShapeType.POLYGON;
    // }

    public get_shapeType(): eShapeType {
       return eShapeType.POLYGON;
    }

    constructor(points: cc.Vec2[], tag: number = -1) {
        super(tag);
        this._points = points;
        this._realPoints = new Array(points.length);
        for (let i = 0, len = points.length; i < len; i++) {
            this._realPoints[i] = cc.v2(points[i].x, points[i].y);
        }
        this.getBoundingBox();
    }

    public getBoundingBox(): cc.Rect {
        if (this._isDirty) {
            let minX = Number.MAX_VALUE;
            let maxX = -Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;
            let maxY = -Number.MAX_VALUE;
            for (const point of this._points) {
                let a = rotate(Math.PI / 180 * this._rotation, point.x, point.y);
                minX = Math.min(minX, a.x);
                minY = Math.min(minY, a.y);
                maxX = Math.max(maxX, a.x);
                maxY = Math.max(maxY, a.y);
            }
            this._boundingBox.x = minX;
            this._boundingBox.y = minY;
            this._boundingBox.width = maxX - minX;
            this._boundingBox.height = maxY - minY;
            this._isDirty = false;
        }

        return this._boundingBox;
    }


    public get points(): cc.Vec2[] {
        let points = this._points;
        let len = points.length;
        for (let i = 0; i < len; i++) {
            let m = points[i];
            this._realPoints[i] = m.rotate(Math.PI / 180 * this.get_rotation());
            let a = this._realPoints[i];
            a.x = a.x * this.get_scale() + this.get_position().x;
            a.y = a.y * this.get_scale() + this.get_position().y;
        }
        return this._realPoints;
    }

    public set points(pts: cc.Vec2[]) {
        this._points = pts;
        this._realPoints = new Array(pts.length);
        for (let i = 0, len = pts.length; i < len; i++) {
            this._realPoints[i] = cc.v2(pts[i].x, pts[i].y);
        }
        this._isDirty = true;
    }
}