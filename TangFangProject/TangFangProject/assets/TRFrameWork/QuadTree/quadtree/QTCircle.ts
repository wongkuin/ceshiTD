/**
 * @Author: Gongxh
 * @Date: 2024-12-21
 * @Description: 原型
 */

import { eShapeType } from "./IQTShape";
import { QTShape } from "./QTShape";

export class QTCircle extends QTShape {
    private _radius: number; // 半径

    public get_shapeType(): eShapeType {
        return eShapeType.CIRCLE;
    }

    constructor(radius: number, tag: number = -1) {
        super(tag);
        this._radius = radius;
        this._boundingBox.x = -this._radius;
        this._boundingBox.y = -this._radius;
        this._boundingBox.width = this._radius * 2;
        this._boundingBox.height = this._radius * 2;
    }

    public getBoundingBox(): cc.Rect {
        return this._boundingBox;
    }

    public get radius(): number {
        return this._radius;
    }

    public set radius(value: number) {
        this._radius = value;
        this._boundingBox.x = -this._radius;
        this._boundingBox.y = -this._radius;
        this._boundingBox.width = this._radius * 2;
        this._boundingBox.height = this._radius * 2;
    }
}