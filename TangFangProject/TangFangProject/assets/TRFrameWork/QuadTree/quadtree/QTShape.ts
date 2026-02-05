/**
 * @Author: Gongxh
 * @Date: 2024-12-21
 * @Description: 四叉树的 形状基类
 */

import { IQTShape, eShapeType } from "./IQTShape";

export abstract class QTShape implements IQTShape {
    /**
     * 形状的掩码 用来过滤不需要检测的形状 通过&来匹配形状是否需要被检测 -1表示和所有物体碰撞
     */
    private _mask: number = -1;
    protected _scale: number;

    /** 脏标记 用来重置包围盒 @internal */
    protected _isDirty: boolean;

    /** 包围盒 @internal */
    protected _boundingBox: cc.Rect;

    /** 位置 @internal */
    protected _position: cc.Vec2;

    /** 旋转角度 @internal */
    protected _rotation: number;

    /** 是否有效 下次更新时删除 @internal */
    private _valid: boolean = true;

    public abstract get_shapeType(): eShapeType;

    node: cc.Node;
    uid: string;

    public get_mask(): number { return this._mask; }
    public get_position(): cc.Vec2 { return this._position; }
    public get_scale(): number { return this._scale; }
    public get_rotation(): number { return this._rotation; }
    public get_isValid(): boolean { return this._valid; }

    constructor(mask: number) {
        this._mask = mask;
        this._scale = 1.0;
        this._rotation = 0;
        this._isDirty = true;
        this._boundingBox = new cc.Rect();
        this._position = new cc.Vec2();
    }


    public setPosition(x: number, y: number) {
        this._position.x = x;
        this._position.y = y;
        this._isDirty = true;
    }

    public setRotation(angle: number) {
        if (this._rotation !== angle) {
            this._rotation = angle;
            this._isDirty = true;
        }
    }

    public setScale(value: number) {
        if (this._scale !== value) {
            this._scale = value;
            this._isDirty = true;
        }
    }

    /** 包围盒 子类重写 */
    public abstract getBoundingBox(): cc.Rect;


    public destroy(): void {
        this._valid = false;
    }
}