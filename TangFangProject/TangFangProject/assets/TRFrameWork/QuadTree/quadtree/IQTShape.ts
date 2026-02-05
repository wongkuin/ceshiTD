export enum eShapeType {
    CIRCLE = 1,  // 圆形
    BOX = 2,     // 矩形
    POLYGON = 3,  // 多边形
};


export interface IQTShape {
    node: cc.Node;
    uid:string;
    /** 形状类型 */
    get_shapeType(): eShapeType;
    /** 形状掩码 @internal */
    get_mask(): number;
    /** 是否有效 @internal */
    get_isValid(): boolean;
    get_position(): cc.Vec2;
    get_scale(): number;
    get_rotation(): number;
    getBoundingBox(): cc.Rect;   /** 获取包围盒 */
    setPosition(x: number, y: number);
    setScale(value: number);
    setRotation(angle: number);
    destroy();
}