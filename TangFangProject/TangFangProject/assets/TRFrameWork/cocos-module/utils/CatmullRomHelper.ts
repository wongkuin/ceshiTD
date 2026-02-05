//Catmull-Rom 差值算法
export default class CatmullRomHelper {

    public static interp(points: Array<cc.Vec2>, t: number): cc.Vec2 {
        const numSections = points.length - 3;
        const currPt = Math.min(Math.floor(t * numSections), numSections - 1);
        const u = t * numSections - currPt;
        const a = points[currPt];
        const b = points[currPt + 1];
        const c = points[currPt + 2];
        const d = points[currPt + 3];

        /*
        return  .5f * (
            (-a + 3f * b - 3f * c + d) * (u * u * u)
            + (2f * a - 5f * b + 4f * c - d) * (u * u)
            + (-a + c) * u
            + 2f * b
        );
        */
        const a1 = a.mul(-1).add(b.mul(3)).sub(c.mul(3)).add(d).mul(u * u * u);
        const b1 = a.mul(2).sub(b.mul(5)).add(c.mul(4)).sub(d).mul(u * u);
        const c1 = a.mul(-1).add(c).mul(u);
        const d1 = b.mul(2);

        return cc.v2(a1.add(b1).add(c1).add(d1).mul(0.5));
    }


    public static generatePath(wayPoints: Array<cc.Vec2>, smoothAmount = 20): Array<cc.Vec2> {
        if (!wayPoints || wayPoints.length < 2) return [];

        const points: Array<cc.Vec2> = [].concat(wayPoints);

        points.unshift(points[0].add(points[0].sub(points[1])));
        points.push(
            points[points.length - 1].add(
                points[points.length - 1].sub(points[points.length - 2])
            )
        );

        //is this a closed, continuous loop? yes? well then so let's make a continuous Catmull-Rom spline!
        if (points[1].equals(points[points.length - 2])) {
            points[0] = points[points.length - 3];
            points[points.length - 1] = points[2];
        }

        const list = [];
        const amount = wayPoints.length * smoothAmount;

        for (let i = 0; i <= amount; i++) {

            let pm = i / amount;
            const currPt = CatmullRomHelper.interp(points, pm);

            list.push(currPt);
        }

        return list;
    }


}