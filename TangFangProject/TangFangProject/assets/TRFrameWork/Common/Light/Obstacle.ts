import { QTBox, QuadTree } from "../../QuadTree/TinyQuadtree";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Obstacle extends cc.Component {

    private _quadtree: QuadTree = null;
    private _polygons: { [key: string]: cc.Vec2[] } = cc.js.createMap();


    onLoad() {
        let size = cc.view.getVisibleSize();
        this._quadtree = new QuadTree(cc.rect(0, 0, size.width, size.height));
    }

    public addPolygon(uid: string, points: cc.Vec2[]) {
        this._polygons[uid] = points;
        let bound = this._getBound(points);
        bound.uid = uid;
        this._quadtree.insert(bound);
    }

    public removePolygon(uid: string) {
        // todo...
    }

    public getPolygons(bound: QTBox) {
        let bounds = this._quadtree.collide(bound);
        let polygons: cc.Vec2[][] = [];
        for (const e of bounds) {
            polygons.push(this._polygons[e.uid]);
        }
        return polygons;
    }

    private _getBound(points: cc.Vec2[]) {
        let point = points[0];
        let xMin = point.x;
        let xMax = point.x;
        let yMin = point.y;
        let yMax = point.y;
        for (let i = 0; i < points.length; i++) {
            if (points[i].x < xMin) xMin = points[i].x;
            if (points[i].x > xMax) xMax = points[i].x;
            if (points[i].y < yMin) yMin = points[i].y;
            if (points[i].y > yMax) yMax = points[i].y;
        }
        return new QTBox(xMin, yMin, xMax - xMin, yMax - yMin);
    }

    public clear() {
        this._quadtree.clear();
        this._polygons = {};
    }

}